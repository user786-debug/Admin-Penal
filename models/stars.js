const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
// const StarPlatform = require('./starPlatforms'); 
// const Review = require('./reviews');

const Star = sequelize.define('Star', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    image: {
        type: DataTypes.STRING, 
        allowNull: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique
        : true,
    },
    phonecode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
    },
    majorCategory: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    otherCategories: {
        type: DataTypes.STRING, 
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    language: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    about: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    keywords: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    audioCallPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    videoCallPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    recordedAudioPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    recordedVideoPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Default to 'active' (true)

    },
    // deletedAt: {
    //     type: DataTypes.DATE,
    //     allowNull: true, // Paranoid delete, null = not deleted
    // },
}, {
    timestamps: true,
    paranoid: true, // Enable soft deletes
    tableName: 'stars', // Optional: Explicit table name
});

// Star.hasMany(StarPlatform, { foreignKey: 'userId', sourceKey: 'userId' });
// StarPlatform.belongsTo(Star, { foreignKey: 'userId', targetKey: 'userId' });
// Star.hasMany(Review, { foreignKey: 'uId', sourceKey: 'userId' });
// Review.belongsTo(Star, { foreignKey: 'uId', targetKey: 'userId' });


module.exports = Star;
