const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path to your Sequelize instance
const { supportManagerCount } = require('../controllers/supportManagersController');

const SupportManager = sequelize.define(
    'SupportManager',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true, // Image URL can be optional
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false, // Name is required
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Ensure email is unique
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Ensure userId is unique
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false, // Password is required
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true, // Default status to active (true)
        },
        otp: {
            type: DataTypes.INTEGER,
            allowNull: true, // OTP can be optional
        },
        otpExpiry: {
            type: DataTypes.DATE,
            allowNull: true, // OTP expiry can be optional
        },
    },
    {
        tableName:'supportmanagers',
        timestamps: true, // Adds createdAt and updatedAt fields
        paranoid: true, // Adds deletedAt field for soft deletes
    }
);

module.exports = SupportManager;
