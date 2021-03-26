/**
 * APP ---> ROUTER
 * ROUTER ---> CONTROLLER
 * 
 * Params = url path -> url.com/api/user/param
 * Query = url query -> url.com/api/user/search?q="someq"
 * Body = data from the body.
 * 
 */

const db = require("../../models")
const op = db.Sequelize.Op
const myUtil = require("../../utilities")

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const stripeService = require('../../services/stripeservice');
const userService = require('../../services/userservice');

const config = require("../../config/config");
const adminService = require("../../services/adminservice");
const stripe = require('stripe')(config.stripeSK)

/* ==========================================================================
  STRIPE RELATED FUNCTIONS
  ========================================================================== */

// Create Stripe Account
// If there's no stripeAccount connected to the current user,
// only then will we attempt to call stripe's create.
const createStripeAccount = async (req, res) => {
  console.log('createStripeAccount...');

  try {
    const userData = await userService.getme(req.user.id);

    const userDataStringified = JSON.stringify(userData);
    console.log('Called getme from createStripeAccount. UserData: ', userDataStringified);

    if (userData.stripeAccount) {
      const accountId = userData.stripeAccount.stripeAccountId;

      console.log('Found userData for createStripeAccount. The accountId for Stripe is: ', accountId);

      const accountLinks = await stripeService.createStripeAccountLink(accountId);
      return res.send(accountLinks);

    } else {
      console.log('No user data found from createStripeAccount + getme. Creating a new stripeAccount on Stripe and User Stripe Account in DB.');

      const account = await stripeService.createStripeAccount(req.user.email);
      const accountId = account.id;

      // Before we continue, save the account details to our db first.
      const newUserStripeAccount = {
        stripeAccountId: accountId,
        balanceOnhold: 0,
        currency: 'USD',
        payoutsEnabled: account.payouts_enabled,
        userId: req.user.id
      };

      await userService.createOrUpdateUserStripeAccount(newUserStripeAccount);

      const accountLinks = await stripeService.createStripeAccountLink(accountId);
      return res.send(accountLinks);
    }
  } catch (err) {
    console.log('Error createStripeAccount: ', err.message);
    return res.status(500).send({ message: err.message });
  }
};

// This function basically means the client wants us to know that
// there's a new update with the stripe details on stripe server.
// And so we need to update our DB.
// This fetches the stripe details from the stripe server and then update the db.
const updateUserStripeAccount = async (req, res) => {
  try {
    const user = req.user;
    const userId = user.id;
    const accountId = user.stripeAccount.stripeAccountId;

    const stripeAccount = await stripeService.getStripeAccountDetails(accountId);

    console.log('Got stripe details on UpdateUserStripeAccount: ', stripeAccount);

    const payoutsEnabled = stripeAccount.payouts_enabled;

    const newUserStripeAccount = {
      stripeAccountId: accountId,
      payoutsEnabled: payoutsEnabled,
      userId: req.user.id
    }

    const userStripeAccountResult = await userService.createOrUpdateUserStripeAccount(newUserStripeAccount);
    return res.send(userStripeAccountResult);
  } catch (err) {
    console.log('Error updateUserStripeAccount: ', err.message);
    return res.status(500).send({ message: err.message });
  }
};

const createStripeLoginLink = async (req, res) => {
  try {
    const user = req.user;
    const accountId = user.stripeAccount.stripeAccountId;

    const loginLink = await stripeService.createLoginLink(accountId);

    console.log('Got stripe login link: ', loginLink);

    return res.send(loginLink);
  } catch (err) {
    console.log('Error updateUserStripeAccount: ', err.message);
    return res.status(500).send({ message: err.message });
  }
};

/* ==========================================================================
  SCOUTD RELATED FUNCTIONS
  ========================================================================== */

// Get the profile of the current user through JWT.
const getme = async (req, res) => {
  try {
    const data = await userService.getme(req.user.id);
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// Retrieve all the data from the database.
const getAllUsers = async (req, res) => {
  const page = myUtil.parser.tryParseInt(req.query.page, 0);
  const limit = myUtil.parser.tryParseInt(req.query.limit, 10);

  try {
    const data = await db.Question.findAndCountAll({
      where: {},
      offset: limit * page,
      limit: limit,
      order: [["id", "ASC"]],
    });

    return res.json(myUtil.response.paging(data, page, limit));

  } catch (err) {
    console.log("Error get questions: " + err.message);
    return res.status(500).send({
      message: "An error has occured while retrieving data."
    });
  }
};

// Find an object with a user Id.
const findOne = async (req, res) => {
  try {
    // The the id from the url path. (params)
    const userId = req.params.id
    const foundUser = await adminService.getSpecificUser(userId);
    return res.send(foundUser);

  } catch (err) {
    return res.status(500).send({
      message: err.message || "Error searching for data."
    });
  }
}

// Add a new push token.
const addPushToken = async (req, res) => {
  const userId = req.user.id;
  const pushToken = req.body.pushToken;

  if (!pushToken) {
    return res.status(200).send({
      errorCode: 101,
      message: "Error! `pushToken` is required.`"
    })
  };

  const newPushToken = {
    pushToken: pushToken,
    userId: userId
  };

  try {
    const data = await db.PushToken.findOne({ where: { pushToken: pushToken } });

    if (data) {
      return res.send({
        message: "This push token is already stored."
      })
    } else {
      const data2 = await db.PushToken.create(newPushToken);
      if (data2) {
        res.send({
          message: "Added new push token!"
        });
      } else {
        res.send({
          message: "Failed adding push token."
        });
      }
    }

  } catch (err) {
    return res.status(500).send({
      message: "Error adding new push token."
    });
  }
}

// Logout
// - Delete all the push token
const logout = async (req, res) => {
  const userId = req.user.id;

  try {
    const num = await db.PushToken.destroy({ where: { userId: userId } });

    if (num >= 1) {
      return res.send({
        message: "Removed all push tokens!"
      });
    } else {
      return res.send({
        message: "Push tokens with userId: " + id + " Couldn't be deleted."
      });
    }

  } catch (err) {
    return res.status(500).send({
      message: "Error DELETING push tokens with userId " + id
    });
  }
}

// Search for object, by specific params.
const search = async (req, res) => {
  const q = req.query.q;

  // Validate
  if (!q) {
    return res.status(400).send({
      message: "Need a query."
    });
  }

  try {
    // Proceed with searching...
    const like1 = { firstName: { [op.like]: `%${q}%` } };
    const like2 = { lastName: { [op.like]: `%${q}%` } };
    const like3 = { email: { [op.like]: `%${q}%` } };

    // WHERE name LIKE q OR email LIKE q
    const condition = q ? { [op.or]: [like1, like2, like3] } : null;

    const data = await db.User.findAll({ where: condition });

    return res.send(data);

  } catch (err) {
    return res.status(500).send({
      message: err.message || "An error has occured while doing search."
    });
  }
};

// Nuke all the data.
const nukeAllData = async (req, res) => {
  const superAdminIsOn = process.env.SUPER_ADMIN_ENV;

  if (!superAdminIsOn) {
    console.log("nukeAllData - failed. Super Admis NOT ON");
    return res.status(500).send({
      message: "Invalid request."
    });
  }

  // Proceed to deleting all the data.
  // Except the migration table. 
  try {
    await db.Mission.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy Mission success!");
    await db.Order.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy Order success!");
    await db.PropertyAddress.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy PropertyAddress success!");
    await db.PropertyAsset.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy PropertyAsset success!");
    await db.PushToken.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy PushToken success!");
    await db.Role.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy Role success!");
    await db.StripeUser.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy StripeUser success!");
    await db.StripeAccount.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy StripeAccount success!");
    await db.User.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy User success!");
    await db.UserType.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy UserType success!");
    await db.User.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy User success!");
    await db.Property.destroy({ where: {}, truncate: false });
    console.log("nukeAllData - destroy Property success!");
    return res.status(200).send({
      message: "Success deleting all records from all tables!"
    })
  } catch (err) {
    console.log('Error nuking all the data: ', err)
    return res.status(500).send({
      message: "Error DELETING ALL RECORDS!"
    });
  }
};

/* ==========================================================================
    Exports
    ========================================================================== */

exports.getme = getme;
exports.getAllUsers = getAllUsers;
exports.findOne = findOne;
exports.addPushToken = addPushToken;
exports.updateUserStripeAccount = updateUserStripeAccount;
exports.createStripeAccount = createStripeAccount;
exports.createStripeLoginLink = createStripeLoginLink;
exports.search = search;
exports.nukeAllData = nukeAllData;
exports.logout = logout;