/**
 * The controller for all property related routes.
 * Params = url path -> url.com/api/user/param
 * Query = url query -> url.com/api/user/search?q="someq"
 * Body = data from the body.
 */

const db = require("../../models")
const op = db.Sequelize.Op
const myUtil = require("../../utilities")
const config = require("../../config/config")
const stripe = require('stripe')(config.stripeSK)

const apn = require("apn")
const path = require("path")

// The current price of Scoutd. 3000 cents = 30usd.
const constantAmountToPay = (30 * 100);

// Post a new payment intent.
// https://stripe.com/docs/api/payment_intents/create
// https://stripe.com/docs/payments/payment-intents/ios
const pay = async (req, res) => {
  const customerId = req.user.stripeUser.stripeCustomerId;
  const amount = req.body.amount;
  const description = req.body.description;
  const currency = "usd";

  if (amount != constantAmountToPay) {
    return res.status(200).send({
      errorCode: 120,
      message: "Invalid amount from client."
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      amount: constantAmountToPay,
      currency: currency,
      description: description
    });

    return res.status(200)
      .json({
        intent: paymentIntent.id,
        secret: paymentIntent.client_secret,
        status: paymentIntent.status
      });

  } catch (err) {
    console.log("Payment error: ", err.message)
    return res.status(500).send({
      message: err.message || "Error payment."
    })
  }
};

// Post a new property.
const getStripeKey = async (req, res) => {
  const customerId = req.user.stripeUser.stripeCustomerId;
  const stripeAPIVersion = req.body.stripeAPIVersion;

  console.log("Customer Id: ", customerId);
  console.log("Stripe API Version: ", stripeAPIVersion);

  try {
    const key = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: stripeAPIVersion }
    );
  
    return res.send(key);
    
  } catch(err) {
    console.log("Error creating ephemeral key: ", err.message);
    return res.status(500).send({
      message: err.message || "Error get ephemeral key from Stripe."
    });
  }
};

// Post save order
const saveOrder = async (req, res) => {
  const userId = req.user.id;
  const missionId = req.body.missionId;
  const amount = req.body.amount;
  const paymentOption = req.body.paymentOption;
  const currency = req.body.currency;

  const newOrder = {
    userId: userId,
    missionId: missionId,
    amount: amount,
    paymentOption: paymentOption,
    currency: currency
  };

  try {
    const data = await db.Order.create(newOrder);
    // Get all the photographers.
    // And send them push notifications.
    // For now, no filtering of distances yet.
    const photographersData = await db.User.findAll({
      include: [
        {
          model: db.PushToken,
          as: "pushToken"
        },
        {
          model: db.UserType,
          as: "userType",
          where: {
            type: "photographer"
          }
        }
      ]
    });

    console.log("photographersData: ", photographersData);

    // Start push config
    const pushEnv = process.env.PUSH_NOTIFICATION_ENV;
    const isProduction = pushEnv == "production";

    const options = {
      token: {
        key: path.resolve("app/", config.pushNotification.authKeyP8Path),
        keyId: config.pushNotification.keyId,
        teamId: config.pushNotification.teamId
      },
      production: isProduction
    };

    const apnProvider = new apn.Provider(options);
    const notification = new apn.Notification({
      badge: 1,
      topic: "com.scoutdtechnologies.scoutd",
      expiry: Math.floor(Date.now() / 1000) + (3600 * 24 * 7),
      title: "A new property has been created 🤩",
      body: "Check out the new property near in your area by opening the app.",
      sound: 1,
      mutableContent: 1,
      payload: {
        "content-available": 1
      },
    });

    for (let photog of photographersData) {
      // Look for the push token of the photographer.
      const pushTokens = photog.pushToken
      console.log("Photographer " + photog.firstName + "'s push token objects: ", pushTokens)

      for (let pushTokenObject of pushTokens) {
        const pushToken = pushTokenObject.pushToken;
        const result = await apnProvider.send(notification, pushToken);
        console.log("push----> ", pushToken);
        console.log(result);
        console.log(result.failed);
        apnProvider.shutdown();
      }
    }
    
    return res.send(data);

  } catch (err) {
    console.log("Save order error: ", err.message);
    return res.status(500).send({
      message: err.message || "Error save order."
    });
  }

};

/* ==========================================================================
    Exports
    ========================================================================== */

exports.pay = pay;
exports.getStripeKey = getStripeKey;
exports.saveOrder = saveOrder;