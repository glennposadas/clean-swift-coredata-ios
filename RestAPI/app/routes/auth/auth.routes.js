const passport = require("passport")
const passportConf = require("../../middlewares/passport")
const controller = require("../../controllers/auth/auth.controller")
const router = require("express").Router()

// Contains all the auth related enpoints
module.exports = app => {
  // POST facebook token
  router.post("/facebook",
    passport.authenticate('facebookToken', { session: false }),
    controller.facebookOAuth
  )

  // POST google token
  router.post("/google", controller.googleOAuth)

  app.use("/api/oauth", router)
}