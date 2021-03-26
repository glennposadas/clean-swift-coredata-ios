const bcrypt = require('bcryptjs')

'use strict';
module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define('Property', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    completeAddress: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {

  });

  // Association
  Property.associate = function (models) {
    Property.belongsTo(models.User, { as: "user" }),
    Property.hasOne(models.PropertyAddress, {
      foreignKey: "propertyId",
      sourceKey: "id",
      as: "propertyAddress"
    }),
    Property.hasMany(models.Mission, {
      foreignKey: "propertyId",
      sourceKey: "id",
      as: "mission"
    })
  }
  return Property
}