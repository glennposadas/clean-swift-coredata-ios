'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserType = sequelize.define('UserType', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    type: DataTypes.ENUM(["customer", "photographer"])
  }, {
  });
  UserType.associate = function (models) {
    UserType.belongsTo(models.User, { as: "user" })
  }
  return UserType;
};