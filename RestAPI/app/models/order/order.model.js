'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    paymentOption: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    currency: DataTypes.STRING
  }, {
  });
  Order.associate = function (models) {
    Order.belongsTo(models.User, { as: "user" }),
    Order.belongsTo(models.Mission, { as: "mission" })
  }
  return Order;
};