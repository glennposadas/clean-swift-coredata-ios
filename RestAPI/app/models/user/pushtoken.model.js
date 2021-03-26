'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserType = sequelize.define('PushToken', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    pushToken: DataTypes.STRING
  }, {
  });
  UserType.associate = function (models) {
    UserType.belongsTo(models.User, { as: "user" })
  }
  return UserType;
};