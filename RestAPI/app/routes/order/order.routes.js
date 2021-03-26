const passport = require("passport")
const passportJWT = passport.authenticate('jwt', { session: false })
const requireMinAccessLevel = require("../../middlewares/passport").requireMinAccessLevel

const config = require("../../config/config")

// Contains all the auth related enpoints
module.exports = app => {
  const controller = require("../../controllers/order/order.controller")
  const router = require("express").Router()
  // POST Create charge
  router.post("/pay", passportJWT, requireMinAccessLevel(config.accessLevels.user, controller.pay))
  // POST request ephemeral key
  router.post("/stripekey", passportJWT, requireMinAccessLevel(config.accessLevels.user, controller.getStripeKey))
  // POST save order
  router.post("/save", passportJWT, requireMinAccessLevel(config.accessLevels.user, controller.saveOrder))

  app.use("/api/orders", router)
}