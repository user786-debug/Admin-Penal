const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Import your Sequelize instance

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING,
        unique: true,  
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true  
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    otp: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    otpExpiry: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // created_at: {
    //     type: DataTypes.TIMESTAMP,
    //     defaultValue: DataTypes.NOW
    // },
    // updated_at: {
    //     type: DataTypes.TIMESTAMP,
    //     defaultValue: DataTypes.NOW,
    //     onUpdate: DataTypes.NOW
    // }
}, {
    tableName: 'admins',
    timestamps: true, // Disable automatic timestamp fields
    paranoid: true // Enable paranoid for soft delete
});

module.exports = Admin;
