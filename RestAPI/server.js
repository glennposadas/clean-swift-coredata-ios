const bodyParser = require("body-parser")
const config = require("./app/config/config")
const cors = require("cors")
const express = require("express")
const helmet = require("helmet")
const morgan = require("morgan")
const passport = require("passport")
const apn = require("apn")
var path = require("path")

const app = express()

var corsOptions = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}

// Disable the powered by header result.
app.disable('x-powered-by');

// morgan
app.use(morgan("dev"))

// body parser - parse requests of content-type - application/json
app.use(bodyParser.json())

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// cors
app.use(cors(corsOptions))

// helmet
app.use(helmet())

// passport
app.use(passport.initialize())
app.use(passport.session())

// simple route
app.get("/", (req, res) => {
  res.send("Scoutd rest-api. Contact: hello@glennvon.com for technical support.")
});

const db = require("./app/models")

if (process.env.NODE_ENV === "production") {
  db.sequelize.sync().then(() => {
    useRoutes()
  })
} else {
  db.sequelize.sync({ force: false }).then(() => {
    console.log("Drop and re-sync db.")
    useRoutes()
  })
}

testSomething()

function testSomething() {
  const stripeService = require('./app/services/stripeservice');
  stripeService.getBalance('acct_1HVeDEBugas0ikO2').then(balance => {
    console.log('BALANCE ==> ', JSON.stringify(balance));
  }).catch(err => {
    console.log('BALANCE ==> err: ', err.message);
  });
}

function useRoutes() {
  console.log("Use routes...")
  console.log("Current NODE_ENV: ", process.env.NODE_ENV)
  console.log("Current PUSH_ENV: ", process.env.PUSH_NOTIFICATION_ENV)
  console.log("Current PAYMENT_ENV: ", process.env.PAYMENT_ENV)
  require("./app/routes/auth/auth.routes")(app)
  require("./app/routes/mission/mission.routes")(app)
  require("./app/routes/order/order.routes")(app)
  require("./app/routes/property/property.routes")(app)
  require("./app/routes/user/user.routes")(app)
}

// set port, listen for requests
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)

  if (process.env.NODE_ENV != "production") {
    const options = {
      token: {
        key: path.resolve("app/", config.pushNotification.authKeyP8Path),
        keyId: config.pushNotification.keyId,
        teamId: config.pushNotification.teamId
      },
      production: false
    }

    const deviceToken = "88453a4a9e8a2ec8c64fdcec78e1078eeda62ddd8b4385bb6f654802b4bbd604 "
    const apnProvider = new apn.Provider(options)

    const notification = new apn.Notification({
      badge: 1,
      topic: "com.scoutdtechnologies.scoutd",
      expiry: Math.floor(Date.now() / 1000) + (3600 * 24 * 7),
      title: "[TEST PUSH] Hello, Scoutd user! 🏡",
      body: "This is a test push notification!",
      sound: 1,
      mutableContent: 1,
      payload: {
        "content-available": 1
      },
    })

    apnProvider.send(notification, deviceToken).then((result) => {
      console.log("push---->")
      console.log(result)
      console.log(result.failed)
    })
  }
})