module.exports = app => {
  const controller = require("../../controllers/user/user.controller")

  const router = require("express").Router()

  const passport = require('passport');
  const passportJWT = passport.authenticate('jwt', { session: false });
  const requireMinAccessLevel = require("../../middlewares/passport").requireMinAccessLevel
  const config = require("../../config/config")

  /* ==========================================================================
    STRIPE RELATED ROUTES
    ========================================================================== */

  // POST: Create Stripe Account
  router.post("/createStripeAccount", passportJWT, controller.createStripeAccount)
  // POST: A route to just let know the server that we have updates on our Stripe Account so update the server data.
  router.post("/updateUserStripeAccount", passportJWT, controller.updateUserStripeAccount)
  // POST: Generate a login link for Stripe.
  router.post("/createStripeLoginLink", passportJWT, controller.createStripeLoginLink)

  /* ==========================================================================
    SCOUTD RELATED ROUTES
    ========================================================================== */

  // GET: my profile.
  router.get("/me", passportJWT, controller.getme)

  // GET: Search for an object.
  router.get("/search", passportJWT, requireMinAccessLevel(config.accessLevels.admin, controller.search))

  // GET: Retrieve a single object with id
  router.get("/:id", passportJWT, requireMinAccessLevel(config.accessLevels.admin, controller.findOne))

  // POST: Add a new push token.
  router.post("/me/addPushToken", passportJWT, controller.addPushToken)

  // POST: Logout
  router.post("/logout", passportJWT, controller.logout)

  // Create a new object
  // See auth.routes.js for creation of user.
  router.post("/", passportJWT, requireMinAccessLevel(config.accessLevels.admin, controller.create))

  // GET: get all the users, can be used with query params and pagination
  router.get("/", passportJWT, requireMinAccessLevel(config.accessLevels.admin, controller.getAllUsers))

  // DELETE: delete al lthe data. This is requested by Brandon.
  // Only allow if we have set the env var `SUPER_ADMIN_ENV` to `staging`.
  router.delete("/nukeAllData", passportJWT, requireMinAccessLevel(config.accessLevels.admin, controller.nukeAllData))

  app.use("/api/users", router)
}