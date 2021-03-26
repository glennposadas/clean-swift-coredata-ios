'use strict';
module.exports = (sequelize, DataTypes) => {
  const StripeUser = sequelize.define('StripeUser', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    stripeCustomerId: DataTypes.STRING
  }, {
  });
  StripeUser.associate = function (models) {
    StripeUser.belongsTo(models.User, { as: "user" })
  }
  return StripeUser;
};