const passport = require("passport")
const passportJWT = passport.authenticate('jwt', { session: false })
const requireMinAccessLevel = require("../../middlewares/passport").requireMinAccessLevel
const config = require("../../config/config")

module.exports = app => {
  const controller = require("../../controllers/property/property.controller")
  const router = require("express").Router()

  // GET: all objects for admin.
  router.get("/all", passportJWT, requireMinAccessLevel(config.accessLevels.admin, controller.getAllProperties))
  // GET: all objects for user.
  router.get("/", passportJWT, requireMinAccessLevel(config.accessLevels.user, controller.getMyProperties))
  // POST: create a new property
  router.post("/new", passportJWT, requireMinAccessLevel(config.accessLevels.user, controller.newProperty))

  app.use("/api/properties", router)
}