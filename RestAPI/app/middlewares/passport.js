const passport = require('passport')
const util = require('util')
const UUID = require('uuid-int')

const FacebookTokenStrategy = require('passport-facebook-token')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const config = require("../config/config")
const db = require("../models")

const stripe = require('stripe')(config.stripeSK)

// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET
}, async (payload, done) => {

  console.log("Find by pk, JWT strategy:", payload.sub)

  const defaultAttributes = ["id", "fbid", "email", "firstName", "lastName", "photoUrl", "createdAt", "updatedAt"]

  db.User.findByPk(payload.sub, {
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
      },
      {
        model: db.StripeAccount,
        as: "stripeAccount"
      }
    ],
    attributes: defaultAttributes
  })
    .then(data => {
      if (!data) {
        console.log("No user found!")
        return done(null, false)
      }

      console.log("Found user in passport.js 🎉 " + JSON.stringify(data))

      return done(null, data)
    })
    .catch(err => {
      console.log("No user found! Error. " + err)
      return done(err, false)
    })
}))

let clientID = {}
let clientSecret = {}

if (process.env.NODE_ENV === "production") {
  clientID = process.env.LIVE_FACEBOOK_CLIENT_ID
  clientSecret = process.env.LIVE_FACEBOOK_CLIENT_SECRET
} else {
  // clientID = process.env.DEV_FACEBOOK_CLIENT_ID
  // clientSecret = process.env.DEV_FACEBOOK_CLIENT_SECRET
  // For now, May 31st, 2020, we use the same env.
  clientID = process.env.LIVE_FACEBOOK_CLIENT_ID
  clientSecret = process.env.LIVE_FACEBOOK_CLIENT_SECRET
}

// Facebook strategy.
// If need local auth or google oauth,
// then check the comments from commit be37a5f.
passport.use('facebookToken', new FacebookTokenStrategy({
  clientID: clientID,
  clientSecret: clientSecret
}, async (accessToken, refreshToken, profile, done) => {
  console.log("profile", profile)
  console.log("accessToken", accessToken)
  console.log("refreshToken", refreshToken)
  console.log("profile_pic", profile)

  console.log(util.inspect(profile, { showHidden: false, depth: null }))

  const id = profile.id
  const email = profile.emails[0].value
  const firstName = profile.name.givenName
  const lastName = profile.name.familyName
  const photo_url = profile.photos[0].value

  // See the documentation in auth.controller.js
  db.User.findOne({
    where: { fbid: id }
  })
    .then(data => {
      if (data) {
        console.log("Got data! ✅")
        return done(null, data)
      } else {
        // Create a new user...
        // Create Stripe customer data
        stripe.customers.create({
          email: email,
        })
          .then(customer => {
            const customerId = customer.id
            const uuid = UUID(0).uuid()

            // If the user first name is Brandon or Glenn
            // Make them admin.
            const role = {
              role: (firstName == "Brandon" || firstName == "Glenn") ? "admin" : "user",
              userId: uuid
            }

            const stripeUser = {
              stripeCustomerId: customerId
            }

            const newUser = {
              id: uuid,
              fbId: id,
              email: email,
              firstName: firstName,
              lastName: lastName,
              photoUrl: photo_url,
              role: role,
              stripeUser: stripeUser
            }

            db.User.create(newUser, {
              include: [
                {
                  model: db.StripeUser,
                  as: "stripeUser"
                },
                {
                  model: db.Role,
                  as: "role"
                }
              ]
            })
              .then(user => {
                return done(null, user)
              })
              .catch(err => {
                console.log("Error creating a new fb user" + err)
                done(err, null, err.message)
              })
          })
          .catch(err => {
            console.log("Error creating a stripe customer for fb user" + err)
            done(err, null, err.message)
          })
      }
    }).catch(err => {
      console.log("Error find by pk user in passport.js")
      done(err, null, err.message)
    })
}))

// Require minimum access.
// user => for both user and admin.
// admin => for admin only.
const requireMinAccessLevel = (accessLevel, callback) => {
  function checkUserRole(req, res) {
    // Get the role title from the Role object
    // that is associated with the user object
    console.log('Require min access level request.user: ', JSON.stringify(req.user));
    const role = req.user.role.role

    if (accessLevel == config.accessLevels.admin) {
      if (role == accessLevel) {
        console.log("Hey admin! ✅")
        return callback(req, res)
      } else {
        console.log("This route is only for admins! 😩")
        return res.status(200).send({
          errorCode: 403,
          message: "This route is only for admins!"
        })
      }
    } else {
      console.log("Hello authenticated user! ✅")
      return callback(req, res)
    }
  }

  return checkUserRole
};

/* ==========================================================================
    Exports
    ========================================================================== */

module.exports = {
  requireMinAccessLevel
};