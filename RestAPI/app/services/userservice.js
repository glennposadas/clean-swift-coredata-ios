const db = require("../models")
const op = db.Sequelize.Op
const myUtil = require("../utilities")
const config = require("../config/config")

const defaultAttributes = ["id", "fbid", "googleid", "email", "firstName", "lastName", "photoUrl", "createdAt", "updatedAt"]

const getme = async (userId) => {
  try {
    const data = await db.User.findOne({
      where: { id: userId },
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
    
    return data;
  } catch(err) {
    throw new Error(err.message || "An error has occured while fetching current user profile.");
  }
}
 
const createOrUpdateUserStripeAccount = async (object) => {
  
  try {
    const userStripeAccount = await db.StripeAccount.findOne({ where: 
      {
        userId: object.userId
      }
    });

    if (!userStripeAccount) {
      console.log('UserService createOrUpdateUserStripeAccount: found no record (user stripe account).');

      const newUserStripeAccount = await db.StripeAccount.create(object);

      return newUserStripeAccount;

    } else {
      console.log('UserService createOrUpdateUserStripeAccount: will update the user stripe account record.');
      const updatedRecord = await userStripeAccount.update(object)
      return updatedRecord;
    }

  } catch(err) {
    console.log('UserService createOrUpdateUserStripeAccount error: ', err.message);
    throw new Error(err.message || "An error has occured while updating user stripe account.");
  }
}

// Accepts signed integer value.
const addBalanceOnhold = async (userId, balanceToBeAdded) => {
  try {
    const userStripeAccount = await db.StripeAccount.findOne({ where: 
      {
        userId: userId
      }
    });

    if (!userStripeAccount) {
      console.log('UserService addBalanceOnhold: found no record (user stripe account).');
      throw new Error('Found no record.');
    } else {
      const currentOnholdBalance = parseInt(userStripeAccount.balanceOnhold);
      const balanceToBeAddedInt = parseInt(balanceToBeAdded);

      const sum = currentOnholdBalance + balanceToBeAddedInt;

      const update = {
        balanceOnhold: sum
      };

      console.log('UserService addBalanceOnhold: attempting to update the onhold balance: ', update);

      const updatedRecord = await userStripeAccount.update(update)
      
      return updatedRecord;
    }
  } catch(err) {
    throw new Error(err.message || "An error has occured while updating photographers onhold balance.");
  }
}

/* ==========================================================================
    Exports
    ========================================================================== */

module.exports = {
  getme,
  createOrUpdateUserStripeAccount,
  addBalanceOnhold
};