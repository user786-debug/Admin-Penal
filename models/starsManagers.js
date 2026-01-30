const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import your Sequelize instance

const manager = sequelize.define('manager', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    uId: {
        type: DataTypes.STRING(11),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true, 
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    otp: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
    },
    otpExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // createdAt: {
    //     type: DataTypes.DATE,
    //     allowNull: false,
    //     defaultValue: DataTypes.NOW, 
    // },
    // updatedAt: {
    //     type: DataTypes.DATE,
    //     allowNull: false,
    //     defaultValue: DataTypes.NOW,
    //     onUpdate: DataTypes.NOW, 
    // },
    // deletedAt: {
    //     type: DataTypes.DATE,
    //     allowNull: true,
    // },
}, {
    tableName: 'managers', 
    timestamps: true, 
    paranoid: true, 
});

module.exports = manager;