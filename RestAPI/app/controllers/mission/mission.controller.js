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
const userService = require("../../services/userservice");
const adminService = require("../../services/adminservice");

const apn = require("apn")
const path = require("path")

var GeoPoint = require('geopoint');
const stripeservice = require("../../services/stripeservice");

// Get all the categories including the associated models.
// This is for the admin users.
// It includes the order and the mission.
const getAllMissions = async (req, res) => {
  const page = myUtil.parser.tryParseInt(req.query.page, 0);
  const limit = myUtil.parser.tryParseInt(req.query.limit, 10);

  try {
    const data = await db.Mission.findAndCountAll({
      where: null,
      include: [
        {
          model: db.Order,
          as: "order"
        },
        {
          model: db.PropertyAsset,
          as: "propertyAsset"
        },
        {
          model: db.Property,
          as: "property",
          include: [
            {
              model: db.PropertyAddress,
              as: "propertyAddress"
            }
          ]
        }
      ],
      offset: limit * page,
      limit: limit,
      order: [["id", "ASC"]],
    });

    return res.json(myUtil.response.paging(data, page, limit));

  } catch(err) {
    console.log("Error get all missions: " + err.message);
    return res.status(500).send({
      message: "An error has occured while retrieving all missions." 
    });
  }
};

// Get all the available missions.
// We are not using pagination here...
// Makes our lives easier.
// Requirements:
// 1. It accepts the coordinate from the client.
// 2. The client's coordinate must be <= N-Kilometer straight distance.
// 3. Return the missions WITH ORDER and WITHOUT USER.
const getAvailableMissions = async (req, res) => {
  const latitude = parseFloat(req.query.latitude)
  const longitude = parseFloat(req.query.longitude)

  if (!longitude || !latitude) {
    return res.status(200).send({
      errorCode: 101,
      message: "Error! Required parameters are: {longitude} and {latitude}."
    })
  }

  try {
    // Proceed with searching...
    // user id must equal to null. - means unassigned.
    // order must not be equal to null. - means paid.
    // the order condition is in the promise.
    const condition = { userId: { [op.is]: null } }

    // Begin query...
    const data = await db.Mission.findAndCountAll({
      where: condition,
      include: [
        {
          model: db.Order,
          as: "order"
        },
        {
          model: db.PropertyAsset,
          as: "propertyAsset"
        },
        {
          model: db.Property,
          as: "property",
          include: [
            {
              model: db.PropertyAddress,
              as: "propertyAddress"
            }
          ]
        }
      ],
      limit: 10,
      order: [["id", "ASC"]],
    });

    let newData = JSON.parse(JSON.stringify(data))
    const missions = newData.rows
    let newRows = []

    for (let mission of missions) {
      const property = mission.property
      const address = property.propertyAddress
      const pLat = address.latitude
      const pLong = address.longitude

      const point1 = new GeoPoint(latitude, longitude)
      const point2 = new GeoPoint(pLat, pLong)

      const distance = point1.distanceTo(point2, true)
      const distanceInMiles = distance * 0.621371

      console.log("Computing distance (" + latitude + ", " + longitude + ") --- to (" + pLat + ", " + pLong + ")")
      console.log("Miles: distance: ", distanceInMiles)

      // 10 miles max straight distance.
      const maxDistance = 10

      if (distanceInMiles <= maxDistance) {
        mission.distanceFromMeInMiles = parseFloat(distanceInMiles)
        newRows.push(mission)
      }
    }

    // Apply the new rows.
    delete newData.rows
    delete newData.count
    newData.total = newRows.length
    newData.data = newRows

    return res.json(newData)
  } catch (err) {
    console.log("Error get all missions: " + err.message)
    return res.status(500).send({
      message: "An error has occured while retrieving data."
    })
  }
};

// GET MY MISSIONS.
// Get all missions.
// And let the client do the filtering for `ACTIVE` and `COMPLETED` missions through query
// Requirements:
// 1. Just get the mission with userId of the current user and add status `inProgress` and `done`
const getMyMissions = async (req, res) => {
  const status = req.query.status
  const userId = req.user.id

  try {
    const page = myUtil.parser.tryParseInt(req.query.page, 0)
    const limit = myUtil.parser.tryParseInt(req.query.limit, 10)

    const eq1 = { userId: userId }
    const eq2 = { status: status }

    console.log("User Id: " + userId + " | Status: " + status)

    const condition = { [op.and]: [eq1, eq2] }

    const data = await db.Mission.findAndCountAll({
      where: condition,
      include: [
        {
          model: db.Order,
          as: "order"
        },
        {
          model: db.PropertyAsset,
          as: "propertyAsset"
        },
        {
          model: db.Property,
          as: "property",
          include: [
            {
              model: db.PropertyAddress,
              as: "propertyAddress"
            }
          ]
        }
      ],
      offset: limit * page,
      limit: limit,
      order: [["id", "ASC"]],
    });

    return res.json(myUtil.response.paging(data, page, limit))
  } catch (err) {
    console.log("Error get user missions: " + err.message)
    return res.status(500).send({
      message: "An error has occured while retrieving data."
    });
  }
}

// ACCEPT MISSION
// Accept the mission.
// Restricted to photographers userType
const acceptMission = async (req, res) => {
  const missionId = req.params.missionId
  const userType = req.user.userType
  const userId = req.user.id

  console.log("Mission Id: ", missionId)

  if (userType.type == "customer") {
    return res.status(200).send({
      errorCode: 402,
      message: "Error! This route is only for photographers."
    })
  }

  try {
    const data = await db.Mission.findByPk(missionId);

    const missionData = JSON.parse(JSON.stringify(data))
    if (!missionData) {
      return res.status(200).send({
        errorCode: 105,
        message: "Error! MissionId " + missionId + " not found!"
      })
    }

    if (missionData.userId != null) {
      if (missionData.userId == userId) {
        return res.status(200).send({
          errorCode: 104,
          message: "Error! MissionId " + missionId + " is already your mission."
        })
      } else {
        return res.status(200).send({
          errorCode: 104,
          message: "Error! MissionId " + missionId + " has already been assigned to a photographer before."
        })
      }
    }

    missionData.userId = userId

    // Proceed to updating the mission object's userId.
    // Assign the user.
    const data2 = await db.Mission.update(missionData, {
      where: { id: missionId }
    });

    if (data2 == 1) {
      return res.send(missionData)
    } else {
      return res.status(200).send({
        errorCode: 104,
        message: "Error updating mission with id " + missionId
      })
    }
  } catch(err) {
    console.log("Error accept mission: " + err.message)
    return res.status(500).send({
      message: "An error has occured while accepting mission."
    })
  }
}

// ---------------

// UPLOAD AN ASSET:
const uploadAsset = async (req, res) => {
  const missionId = req.params.missionId;
  const userType = req.user.userType;
  const userId = req.user.id;
  const parts = req.body.parts;

  console.log("<--------- Upload Asset -------->");

  try {
    if (req.files) {
      console.log("New mission-property mapped: ", req.files);
      console.log("New mission-property parts: ", parts);
  
      if (req.files.length == 0) {
        return res.status(200).send({
          errorCode: 102,
          message: "An error has occured during the upload."
        });
      }
  
    } else {
      return res.status(200).send({
        errorCode: 101,
        message: "Error! Image or video is required."
      });
    }
  
    const fileLocations = req.files.map(file => { return file.location });
  
    if (userType.type == "customer") {
      return res.status(200).send({
        errorCode: 402,
        message: "Error! This route is only for photographers."
      });
    }
  
    // Success!
    // Store the assets to db
    // and return OK.
    let newPropertyAssets = [];
  
    for (let i = 0; i < fileLocations.length; i++) {
      const file = fileLocations[i];
      const part = parts[i];
  
      console.log("<--------- Creating Property Assets -------->");
      console.log("FILE: ", file);
      console.log("PART: ", part);
  
      const newPropertyAsset = {
        url: file,
        part: part,
        missionId: missionId,
        title: "",
        caption: ""
      };
  
      newPropertyAssets.push(newPropertyAsset);
    }
  
    console.log('BULK CREATE: ', newPropertyAssets)
    const data = await db.PropertyAsset.bulkCreate(newPropertyAssets);
  
    let newData = JSON.parse(JSON.stringify(data));

    console.log('POST: BULK CREATE-->: ', newData)

    return res.send(newData);
    
  } catch(err) {
    console.log("Error creating bulk property assets" + err);
    return res.status(500).send({
      message: err.message
    });
  }
};

// -------------

// COMPLETE MISSION:
// Completes the mission after uploading all the assets.
const completeMission = async (req, res) => {
  const missionId = req.params.missionId
  const userType = req.user.userType
  const userId = req.user.id

  console.log("Mission Id: ", missionId)

  // Check if the user type calling this route is Photographer.
  if (userType.type == "customer") {
    return res.status(200).send({
      errorCode: 402,
      message: "Error! This route is only for photographers."
    })
  };

  try {
    // Verify first if the assets are all complete.
    const missionData = await getMissionData(missionId);

    if (!missionData) {
      return res.status(200).send({
        errorCode: 105,
        message: "Error! MissionId " + missionId + " not found!"
      });
    }

    console.log("Number of property assets ---> ", JSON.stringify(missionData.propertyAsset))

    // Check now the propertyAssets
    if (!propertyAssetPartsAreComplete(missionData)) {
      return res.status(200).send({
        errorCode: 106,
        message: "Error! Complete all the required assets before completing."
      });
    }

    // Continue completing the mission
    const newMissionData = {
      status: "submitted"
    };

    // Conditions for updating mission.
    // We must have  the constraints userId and missionId.
    const eq1 = { userId: userId }
    const eq2 = { id: missionId }
    const condition = { [op.and]: [eq1, eq2] }

    // Proceed to updating the mission object's userId.
    // Assign the user.
    const updatedMissionCount = await db.Mission.update(newMissionData, {
      where: condition
    });

    if (updatedMissionCount == 1) {
      // Send push to the customer!
      const pushEnv = process.env.PUSH_NOTIFICATION_ENV
      const isProduction = pushEnv == "production"
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
        title: "Your property is complete! 🎉🏡",
        body: "Open the app to view the video and photos of your property.",
        sound: 1,
        mutableContent: 1,
        payload: {
          "content-available": 1
        },
      });

      // Look for the push token of the customer.
      const pushTokens = missionData.property.user.pushToken;
      console.log("Completed mission's property+user push token objects: ", pushTokens)

      for (let pushTokenObject of pushTokens) {
        const pushToken = pushTokenObject.pushToken;
        const result = await apnProvider.send(notification, pushToken);
        console.log("push----> ", pushToken);
        console.log(result);
        console.log(result.failed);
        apnProvider.shutdown();
      }

      // Lastly, add balance to stripe user account.
      const addBalanceOnholdResult = await userService.addBalanceOnhold(userId, (25 * 100));

      console.log('addBalanceOnholdResult: ', addBalanceOnholdResult);

      // Success!
      return res.status(200).send({
        message: "Success completing mission!"
      })

    } else {
      return res.status(200).send({
        errorCode: 104,
        message: "Error completing mission with id " + missionId
      })
    }

  } catch (err) {
    console.log("Error completing mission: " + err.message)
    return res.status(500).send({
      message: "An error has occured while completing the mission."
    })
  }
};

const getMissionData = async (missionId) => {
  try {
    const data = await db.Mission.findByPk(missionId, {
      include: [
        {
          model: db.PropertyAsset,
          as: "propertyAsset"
        },
        {
          model: db.Property,
          as: "property",
          include: [
            {
              model: db.User,
              as: "user",
              include: [
                {
                  model: db.PushToken,
                  as: "pushToken"
                }
              ]
            }
          ]
        }
      ]
    });

    const missionData = JSON.parse(JSON.stringify(data));
    return missionData;

  } catch (err) {
    console.log("Error extracting mission: " + err.message)
    throw new Error("An error has occured while fetching mission data.");
  }
}

/* ==========================================================================
    Pay photographer
    ========================================================================== */
// This is an admin route.
const payPhotographerForMission = async (req, res) => {
  const missionId = req.params.missionId
  const userId = req.user.id

  try {
    // Verify first if the assets are all complete.
    const missionData = await getMissionData(missionId);

    const photographerId = missionData.userId;
    const photographer = await adminService.getSpecificUser(photographerId);

    const userStripeAccount = photographer.stripeAccount;
    const balanceOnhold = parseInt(userStripeAccount.balanceOnhold);

    if (!missionData) {
      return res.status(200).send({
        errorCode: 105,
        message: "Error! MissionId " + missionId + " not found!"
      });
    }

    if (balanceOnhold <= 0) {
      return res.status(200).send({
        errorCode: 130,
        message: "Warning to the admin! The photographer: " + photographerId + " has no balance onhold. Balance is: " + balanceOnhold
      });
    }

    // Update the mission status to `paid`.
    const newMissionData = {
      status: "paid"
    };

    // Conditions for updating mission.
    // We must have  the constraints userId and missionId.
    const eq1 = { userId: userId }
    const eq2 = { id: missionId }
    const condition = { [op.and]: [eq1, eq2] }

    // Proceed to updating the mission object's userId.
    // Assign the user.
    const updatedMissionCount = await db.Mission.update(newMissionData, {
      where: condition
    });

    if (updatedMissionCount == 1) {
      // Send push to the Photographer!
      const pushEnv = process.env.PUSH_NOTIFICATION_ENV
      const isProduction = pushEnv == "production"
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
        title: "Awesome! You just got paid!🎉",
        body: "Visit your Stripe account on the app to check your balance.",
        sound: 1,
        mutableContent: 1,
        payload: {
          "content-available": 1
        },
      });

      // Look for the push token of the customer.
      const pushTokens = photographer.pushToken;
      console.log("Pay photographer mission's photographer push token objects: ", pushTokens)

      for (let pushTokenObject of pushTokens) {
        const pushToken = pushTokenObject.pushToken;
        const result = await apnProvider.send(notification, pushToken);
        console.log("push----> ", pushToken);
        console.log(result);
        console.log(result.failed);
        apnProvider.shutdown();
      }

      const transferResult = await stripeservice.createTransferForPhotographer(missionId, 25 * 100, userStripeAccount.stripeAccountId);

      console.log('Payouts Result: ', transferResult);

      // Success!
      const fullName = photographer.firstName + " " + photographer.lastName;

      // Lastly, add balance to stripe user account, a negative balance, since we're paying now.
      await userService.addBalanceOnhold(userId, -1 * (25 * 100));

      return res.status(200).send({
        message: "Success paying photographer with Id " + photographerId + " and name " + fullName
      })

    } else {
      return res.status(200).send({
        errorCode: 104,
        message: "Error paying photographer with id " + photographerId + " for missionId " + missionId
      })
    }

  } catch (err) {
    console.log("Error paying photographer error: " + err.message);
    return res.status(500).send({
      message: "An error has occured while paying the photographer." + err.message
    })
  }
};

function propertyAssetPartsAreComplete(missionData) {
  const parts = missionData.propertyAsset.map(asset => {
    return asset.part
  })
  const requiredParts = [
    "neighborhoodVideo",
    "frontExterior",
    "nextDoorNeighborLeft",
    "nextDoorNeighborRight",
    "backExterior"
  ]

  const checker = (arr, target) => target.every(v => arr.includes(v))
  return checker(parts, requiredParts)
}

/* ==========================================================================
    Exports
    ========================================================================== */

module.exports = {
  getAllMissions,
  acceptMission,
  getAvailableMissions,
  getMyMissions,
  completeMission,
  getMissionData,
  payPhotographerForMission,
  uploadAsset
};
