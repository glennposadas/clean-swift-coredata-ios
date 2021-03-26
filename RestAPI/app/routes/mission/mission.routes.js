const passport = require("passport")
const passportJWT = passport.authenticate('jwt', { session: false })
const requireMinAccessLevel = require("../../middlewares/passport").requireMinAccessLevel
const config = require("../../config/config")

const multer = require('multer')

const AWS = require('aws-sdk')

// Creating a new instance of S3:
const s3 = new AWS.S3()

// Setting the credentials
// The region should be the region of the bucket that you created
// Visit this if you have any confusion - https://docs.aws.amazon.com/general/latest/gr/rande.html
AWS.config.update({
  accessKeyId: config.awsAccessKeyId,
  secretAccessKey: config.awsSecret,
  region: 'us-west-2',
})

const multerS3 = require('multer-s3')

const storage = multerS3({
  acl: "public-read",
  s3: s3,
  bucket: 'scoutd',
  key: function (req, file, cb) {
    console.log(file);
    cb(null, "public/uploads/" + new Date().toISOString() + file.originalname)
  }
})

/*
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}*/

const uploadS3 = multer({
  storage: storage,
  limits: { fieldSize: 100 * 1024 * 1024 }
})

module.exports = app => {
  const controller = require("../../controllers/mission/mission.controller")
  const router = require("express").Router()

  // GET: all objects for admin.
  router.get("/all", passportJWT, requireMinAccessLevel(config.accessLevels.admin, controller.getAllMissions))
  // GET: all available missions for user.
  router.get("/available", passportJWT, requireMinAccessLevel(config.accessLevels.user, controller.getAvailableMissions))
  // GET: all missions owned by the photographer. The client will be the one to sort and separate the data by statuses.
  router.get("/", passportJWT, requireMinAccessLevel(config.accessLevels.user, controller.getMyMissions))

  // POST: accept an available mission.
  router.post("/:missionId/accept", passportJWT, requireMinAccessLevel(config.accessLevels.user, controller.acceptMission))
  // POST: attempt to complete an active mission provided that the assets are all uploaded
  router.post("/:missionId/complete", passportJWT, requireMinAccessLevel(config.accessLevels.user, controller.completeMission))
  // POST: upload an asset
  router.post("/:missionId/upload", passportJWT, uploadS3.any(), requireMinAccessLevel(config.accessLevels.user, controller.uploadAsset))
  // POST: Admin route, to pay the photographer for the mission.
  router.post("/:missionId/payPhotographer", passportJWT, requireMinAccessLevel(config.accessLevels.admin, controller.payPhotographerForMission))
  app.use("/api/missions", router)
}