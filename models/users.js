const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Sequelize instance
// const Review = require('./reviews'); // Ensure review is correctly imported

// Define the User model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Default to 'active' (true)

    },
    authToken: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user", 

    },
    dob: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    catId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    audioCallPrice: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    videoCallPrice: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    videoPrice: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    audioPrice: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    about: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    keyword: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    paranoid: true, // Enables soft delete
    tableName: 'users', // Explicit table name
});

// Correct association setup
// User.hasMany(Review, { foreignKey: 'uId', as: 'reviews' });

module.exports = User;
