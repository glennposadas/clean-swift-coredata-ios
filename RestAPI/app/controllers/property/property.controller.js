/**
 * The controller for all property related routes.
 * Params = url path -> url.com/api/user/param
 * Query = url query -> url.com/api/user/search?q="someq"
 * Body = data from the body.
 */

const db = require("../../models");
const op = db.Sequelize.Op;
const myUtil = require("../../utilities");
const config = require("../../config/config");

// Get all the categories including the associated models.
// This is for the admin users.
// It includes the order and the mission.
const getAllProperties = async (req, res) => {
  const page = myUtil.parser.tryParseInt(req.query.page, 0);
  const limit = myUtil.parser.tryParseInt(req.query.limit, 10);

  try {
    const data = await db.Property.findAndCountAll({
      where: null,
      include: [
        {
          model: db.Mission,
          as: "mission",
          include: [
            {
              model: db.PropertyAsset,
              as: "propertyAsset"
            }
          ]
        },
        {
          model: db.PropertyAddress,
          as: "propertyAddress"
        }
      ],
      offset: limit * page,
      limit: limit,
      order: [["id", "ASC"]],
    });

    let newData = JSON.parse(JSON.stringify(data));
    const properties = newData.rows;

    for (let property of properties) {
      property.status = "done";

      const missions = property.mission;
      for (let mission of missions) {
        if (mission.status == "inProgress") {
          property.status = "inProgress";
          break;
        }
      }
    }

    return res.json(myUtil.response.paging(newData, page, limit));

  } catch(err) {
    console.log("Error get properties: " + err.message);
    return res.status(500).send({
      message: "An error has occured while retrieving data."
    });
  }
}

const getMyProperties = async (req, res) => {
  const page = myUtil.parser.tryParseInt(req.query.page, 0);
  const limit = myUtil.parser.tryParseInt(req.query.limit, 10);

  console.log("Get My properties.......", req.user.firstName);

  try {
    const data = await db.Property.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: db.Mission,
          as: "mission",
          include: [
            {
              model: db.PropertyAsset,
              as: "propertyAsset"
            }
          ]
        },
        {
          model: db.PropertyAddress,
          as: "propertyAddress"
        }
      ],
      offset: limit * page,
      limit: limit,
      order: [["id", "ASC"]],
    });

    let newData = JSON.parse(JSON.stringify(data));
    const properties = newData.rows;

    for (let property of properties) {
      property.status = "done";

      const missions = property.mission;
      for (let mission of missions) {
        if (mission.status == "inProgress") {
          property.status = "inProgress";
          break;
        }
      }
    }

    return res.json(myUtil.response.paging(newData, page, limit));

  } catch(err) {
    console.log("Error get properties: " + err.message);
    return res.status(500).send({
      message: "An error has occured while retrieving data."
    });
  }
};

// Post a new property.
const newProperty = async (req, res) => {
  const address = {
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    zipCode: req.body.zipCode,
    instructions: req.body.instructions,
    latitude: req.body.latitude,
    longitude: req.body.longitude
  };

  // When creating a new property,
  // create a new mission as well.
  const newMission = {
    shortDescription: req.body.missionDescription
  };

  const newProperty = {
    completeAddress: req.body.completeAddress,
    status: "inProgress",
    isActive: true,
    propertyAddress: address,
    mission: newMission,
    userId: req.user.id
  };

  try {
    // Create a new property
    const data = await db.Property.create(newProperty, {
      include: [
        {
          model: db.PropertyAddress,
          as: "propertyAddress"
        },
        {
          model: db.Mission,
          as: "mission"
        }
      ]
    });

    let newData = data.toJSON();
    newData.status = "inProgress";
    return res.send(newData);

  } catch (err) {
    return res.status(500).send({
      message: err.message || "An error has occured while creating a new property."
    });
  }
};

/* ==========================================================================
    Exports
    ========================================================================== */

exports.getAllProperties = getAllProperties;
exports.getMyProperties = getMyProperties;
exports.newProperty = newProperty;