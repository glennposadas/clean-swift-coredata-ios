'use strict';
module.exports = (sequelize, DataTypes) => {
  const PropertyAddress = sequelize.define('PropertyAddress', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    zipCode: DataTypes.STRING,
    instructions: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT
  }, {
  });
  PropertyAddress.associate = function (models) {
    PropertyAddress.belongsTo(models.Property, { as: "property" })
  }
  return PropertyAddress;
};