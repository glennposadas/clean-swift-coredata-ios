const db = require("../../models")
const express = require("express")
const router = express.Router()
const util = require("util")
const UUID = require('uuid-int')

const config = require("../../config/config")
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const { userInfo } = require("os")
const googleClient = new OAuth2Client(process.env.LIVE_GOOGLE_CLIENT_ID)

const stripe = require('stripe')(config.stripeSK)

signToken = user => {
  return jwt.sign({
    iss: 'scoutd2020!@#$#@!+gvcp+iss',
    sub: user.id,
    iat: new Date().getTime(), // current time
    exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day ahead
  }, config.JWT_SECRET)
}

const facebookOAuth = async (req, res) => {
  // Update user, such as create a user type.
  // The reason why we are creating the userType
  // in this function is because the userType comes from the 
  // request body. And we can't get the requested userType 
  // from the passport.js.
  // There we make the new user data.
  const user = req.user;
  const userType = req.body.userType;

  const type = {
    type: userType,
    userId: user.id
  };

  try {
    const data = await db.UserType.findOne({
      where: { userId: user.id }
    });

    if (data) {
      const token = signToken(user);
      return res.status(200).json({ token });
    }

    const d3 = await db.UserType.create(type);

    console.log("New FB User Attempt " + JSON.stringify(user));
    const token = signToken(user);
    return res.status(200).json({ token });

  } catch (err) {
    console.log("Error facebookOAuth" + err);
    return res.status(500).send({
      message: err.message
    });
  }
}

exports.googleOAuth = async (req, res) => {
  // Get the token from the client.
  // And then verify the client token through google-auth-library.

  const token = req.body.access_token;
  const userType = req.body.userType;

  try {
    const login = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.LIVE_GOOGLE_AUDIENCE_ID
    });

    const payload = login.getPayload();

    console.log(util.inspect(payload, { showHidden: false, depth: null }));

    const id = payload.sub;
    const email = payload.email;
    const firstName = payload.given_name;
    const lastName = payload.family_name;
    const photo_url = payload.picture;

    console.log("Google Id Big Int: ", id);

    const data = await db.User.findOne({
      where: { googleid: id }
    });

    if (data) {
      console.log("Got data! ✅");
      const token = signToken(data);
      return res.status(200).json({ token });
    } else {
      // Create a new user...
      // Create Stripe customer data
      const customer = await stripe.customers.create({
        email: email,
      });

      const customerId = customer.id;
      const uuid = UUID(0).uuid();

      // If the user first name is Brandon or Glenn
      // Make them admin.
      const role = {
        role: (firstName == "Brandon" || firstName == "Glenn") ? "admin" : "user",
        userId: uuid
      };

      const type = {
        type: userType,
        userId: uuid
      };

      const stripeUser = {
        stripeCustomerId: customerId
      };

      const newUser = {
        id: uuid,
        googleid: id,
        email: email,
        firstName: firstName,
        lastName: lastName,
        photoUrl: photo_url,
        role: role,
        userType: type,
        stripeUser: stripeUser
      };

      const user = await db.User.create(newUser, {
        include: [
          {
            model: db.StripeUser,
            as: "stripeUser"
          },
          {
            model: db.Role,
            as: "role"
          },
          {
            model: db.UserType,
            as: "userType"
          }
        ]
      });

      const token = signToken(user);
      return res.status(200).json({ token });
    }

  } catch (err) {
    console.log("Error google oauth: " + err.message);
    return res.status(500).send({
      message: "Error google oauth" + err.message
    });
  }
};

 const signin= async (req, res, next) => {
  // Generate token
  const token = signToken(req.user);
  return res.status(200).json({ token });
};

/* ==========================================================================
    Exports
    ========================================================================== */

exports.facebookOAuth = facebookOAuth;
exports.signin = signin;