'use strict';
module.exports = (sequelize, DataTypes) => {
  const PropertyAsset = sequelize.define('PropertyAsset', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    url: DataTypes.STRING,
    title: DataTypes.STRING,
    caption: DataTypes.STRING,
    part: DataTypes.ENUM(["neighborhoodVideo", "frontExterior", "nextDoorNeighborLeft", "nextDoorNeighborRight", "backExterior"]),
  }, {
  });
  PropertyAsset.associate = function (models) {
    PropertyAsset.belongsTo(models.Mission, { as: "mission" })
  }
  return PropertyAsset;
};