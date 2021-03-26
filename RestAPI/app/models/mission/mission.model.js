'use strict';
module.exports = (sequelize, DataTypes) => {
  const Mission = sequelize.define('Mission', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    shortDescription: DataTypes.STRING,
    status: {
      // The status inProgress and submitted are for the customer side. These are included in /getProperty.
      // On the other hand, the paid and submitted shows to the photographer side. 
      type: DataTypes.ENUM(["inProgress", "paid", "submitted"]),
      allowNull: false,
      defaultValue: "inProgress"
    },
  }, {
    instanceMethods: {
      getDistance: function(latitude, longitude) {
        const lat = parseFloat(latitude)
        const long = parseFloat(longitude)
        return 1
      }
    }
  });
  Mission.associate = function (models) {
    Mission.belongsTo(models.User, { as: "user" }),
    Mission.belongsTo(models.Property, { as: "property" }),
    Mission.hasOne(models.Order, {
      foreignKey: "missionId",
      sourceKey: "id",
      as: "order"
    }),
    Mission.hasMany(models.PropertyAsset, {
      foreignKey: "missionId",
      sourceKey: "id",
      as: "propertyAsset"
    })
  }
  return Mission;
};