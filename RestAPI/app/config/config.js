// config.js
const dotenv = require("dotenv")
dotenv.config()

function getStripeSK() {
  if (process.env.PAYMENT_ENV === "production") {
    return process.env.LIVE_STRIPE_SK
  } else {
    return process.env.DEV_STRIPE_SK
  }
}

module.exports = {
  use_env_variable: false,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecret: process.env.AWS_SECRET,
  bucketName: process.env.AWS_BUCKET_NAME,
  stripeSK: getStripeSK(),
  accessLevels: {
    user: "user",
    admin: "admin"
  },
  pushNotification: {
    authKeyP8Path: "config/AuthKey_RR9S782N93.p8",
    keyId: "RR9S782N93",
    teamId: "62PKH2BT5L"
  },
  JWT_SECRET: "gvcp+2020Scoutd#@!#@!$@!aaa",
  port: process.env.PORT,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  "development": {
    "username": process.env.DEV_DB_USERNAME,
    "password": process.env.DEV_DB_PASSWORD,
    "database": process.env.DEV_DB_DATABASE,
    "host": process.env.DEV_DB_HOST,
    "dialect": process.env.DEV_DB_DIALECT,
    "operatorsAliases": 0,
    "dialectOptions": {
      "charset": 'utf8mb4',
      "supportBigNumbers": true
    }
  },
  "test": {
    "username": process.env.LIVE_DB_USERNAME,
    "password": process.env.LIVE_DB_PASSWORD,
    "database": process.env.LIVE_DB_DATABASE,
    "host": process.env.LIVE_DB_HOST,
    "dialect": process.env.LIVE_DB_DIALECT,
    "operatorsAliases": 0,
    "dialectOptions": {
      "charset": 'utf8mb4',
      "supportBigNumbers": true
    }
  },
  "production": {
    "username": process.env.LIVE_DB_USERNAME,
    "password": process.env.LIVE_DB_PASSWORD,
    "database": process.env.LIVE_DB_DATABASE,
    "host": process.env.LIVE_DB_HOST,
    "dialect": process.env.LIVE_DB_DIALECT,
    "operatorsAliases": 0,
    "dialectOptions": {
      "charset": 'utf8mb4',
      "supportBigNumbers": true
    }
  }
}