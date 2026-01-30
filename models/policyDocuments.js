const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PolicyDocument = sequelize.define('PolicyDocument', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    document: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'policydocuments', // Matches the database table name
    timestamps: true, // Enable createdAt and updatedAt
});

module.exports = PolicyDocument;
