'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    role: DataTypes.ENUM(["user", "admin"])
  }, {
  });
  Role.associate = function (models) {
    Role.belongsTo(models.User, { as: "user" })
  }
  return Role;
};