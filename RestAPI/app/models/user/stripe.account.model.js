'use strict';
module.exports = (sequelize, DataTypes) => {
  const StripeAccount = sequelize.define('StripeAccount', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    stripeAccountId: DataTypes.STRING,
    balanceOnhold: DataTypes.INTEGER,
    currency: DataTypes.STRING,
    payoutsEnabled: DataTypes.BOOLEAN
  }, {
  });
  StripeAccount.associate = function (models) {
    StripeAccount.belongsTo(models.User, { as: "user" })
  }
  return StripeAccount;
};