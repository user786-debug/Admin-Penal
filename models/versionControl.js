// models/versionControl.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Importing the Sequelize instance from db.js

const VersionControl = sequelize.define('VersionControl', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  deviceType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  releaseDate: {
    type: DataTypes.STRING,  // You can change this to DATE if your releaseDate is a date field
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'version_control',
  timestamps: true,
});

module.exports = VersionControl;
