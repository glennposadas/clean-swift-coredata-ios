const db = require("../models")
const op = db.Sequelize.Op
const myUtil = require("../utilities")
const config = require("../config/config")

const stripe = require('stripe')(config.stripeSK)

const defaultAttributes = ["id", "fbid", "email", "firstName", "lastName", "photoUrl", "createdAt", "updatedAt"]

const getSpecificUser = async (userId) => {
  try {
    const userData = await db.User.findByPk(userId, {
      include: [
        {
          model: db.Role,
          as: "role"
        },
        {
          model: db.UserType,
          as: "userType"
        },
        {
          model: db.PushToken,
          as: "pushToken"
        },
        {
          model: db.StripeAccount,
          as: "stripeAccount"
        }
      ],
      attributes: defaultAttributes
    });

    return userData;
  } catch(err) {
    throw new Error(err.message || "Error searching for data.");
  }
};

const payPhotographerForMission = async (accountId) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    console.log('Account: ', JSON.stringify(account))
    return account;
  } catch(err) {
    console.log('Error fetching Stripe details for accountId: ', accountId);
    throw new Error(err.message || "An error has occured while fetching stripe account");
  }
};

/* ==========================================================================
    Exports
    ========================================================================== */

module.exports = {
  getSpecificUser,
  payPhotographerForMission
};