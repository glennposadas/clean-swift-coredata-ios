const bcrypt = require('bcryptjs')

'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.BIGINT.ZEROFILL.UNSIGNED, allowNull: false, autoIncrement: true, unique: true, primaryKey: true },
    fbId: DataTypes.BIGINT.ZEROFILL.UNSIGNED,
    googleid: DataTypes.STRING,
    email: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    password: DataTypes.STRING,
    photoUrl: DataTypes.STRING
  }, {

  });

  User.prototype.validatePassword = function (password) {
    return bcrypt.compare(password, this.password)
  }

  User.beforeCreate(async (user, options) => {
    console.log("User before create: " + user.email + " " + user.password)      
    return bcrypt.hash(user.password, 10)
      .then(hash => {
        user.password = hash
      })
      .catch(err => {
        if (user.fbId != null || user.googleid != null) {
          return
        }

        console.log("error beforeCreate: " + err)
        throw new Error();
      })
  })

  // Association
  User.associate = function (models) {
    User.hasOne(models.StripeUser, {
      foreignKey: "userId",
      sourceKey: "id",
      as: "stripeUser"
    }),
    User.hasOne(models.StripeAccount, {
      foreignKey: "userId",
      sourceKey: "id",
      as: "stripeAccount"
    }),
    User.hasOne(models.Role, {
      foreignKey: "userId",
      sourceKey: "id",
      as: "role"
    }),
    User.hasOne(models.UserType, {
      foreignKey: "userId",
      sourceKey: "id",
      as: "userType"
    }),
    User.hasMany(models.PushToken, {
      foreignKey: "userId",
      sourceKey: "id",
      as: "pushToken"
    }),
    User.hasMany(models.Property, {
      foreignKey: "userId",
      sourceKey: "id",
      as: "property"
    }),
    User.hasMany(models.Order, {
      foreignKey: "userId",
      sourceKey: "id",
      as: "order"
    })
  }
  return User
}