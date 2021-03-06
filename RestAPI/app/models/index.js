'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config')[env];
const db = {};
const glob = require("glob")

let sequelize;
sequelize = new Sequelize(config.database, config.username, config.password, config);

// Use glob to access model files inside subfolders.
const files = glob.sync(__dirname + "/*/*.js")

files.forEach(file => {
  const model = sequelize['import'](file);
  db[model.name] = model;
})

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;