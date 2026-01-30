const User = require('../models/users'); 
const formatCount = require('../middlewares/formatCount'); 
const { Op, Sequelize } = require('sequelize');

exports.getAllUsers = async (req, res) => {
    const { page = 1 } = req.query; 
    const limit = 20; 
    const offset = (page - 1) * limit;

    try {
        const { rows: users, count: totalRecords } = await User.findAndCountAll({
            where: {
                userType: 'user',
            },
            attributes: [
                'id', 
                'dp', 
                'name', 
                'phone', 
                'gender', 
                'country', 
                'city', 
                'status' 
            ],
            limit,
            offset,
            order: [['id', 'ASC']], 
        });

        const transformedUsers = users.map(user => ({
            ...user.toJSON(), 
            status: user.status ? 'unblocked' : 'blocked', 
        }));

        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users: transformedUsers,
                pagination: {
                    currentPage: parseInt(page, 10),
                    totalPages,
                    totalRecords,
                },
            },
        });
    } catch (error) {
        console.error('[ERROR] Fetching Users Failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

exports.getAllStars = async (req, res) => {
    const { page = 1 } = req.query; 1
    const limit = 20; 
    const offset = (page - 1) * limit;

    try {
        const { rows: stars, count: totalRecords } = await User.findAndCountAll({
            where: {
                userType: 'star', 
            },
            attributes: [
                'id', 
                'dp', 
                'name', 
                'userId', 
                'gender', 
                'country', 
                'city', 
                'status' 
            ],
            limit,
            offset,
            order: [['id', 'ASC']], 
        });

        const transformedStars = stars.map(star => ({
            ...star.toJSON(), 
            status: star.status ? 'unblocked' : 'blocked', 
        }));

        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            message: 'Stars retrieved successfully',
            data: {
                stars: transformedStars,
                pagination: {
                    currentPage: parseInt(page, 10),
                    totalPages,
                    totalRecords,
                },
            },
        });
    } catch (error) {
        console.error('[ERROR] Fetching Stars Failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

exports.toggleUserStatus = async (req, res) => {
    const { id } = req.params; 

    try {
        const user = await User.findOne({ where: { id: id } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        user.status = !user.status;  
        await user.save();

        const statusMessage = user.status ? 'unblocked' : 'blocked';

        res.status(200).json({
            success: true,
            message: `User ${statusMessage} successfully.`,
            data: {
                id: user.id,
                name: user.name,
                status: statusMessage,  
            },
        });
    } catch (error) {
        console.error('[ERROR] Toggling User Status Failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

exports.getUserCount = async (req, res) => {
    try {
        // Count total users where userType is 'user'
        const totalUsers = await User.count({
            where: {
                userType: 'user',
            },
        });

        // Count total users where userType is 'star'
        const totalStars = await User.count({
            where: {
                userType: 'star',
            },
        });

        // Count total active users (status = true)
        const activeUsers = await User.count({
            where: {
                status: true, // true for active users
            },
        });

        // Count total blocked users (status = false)
        const blockedUsers = await User.count({
            where: {
                status: false, // false for blocked users
            },
        });

        // Respond with formatted counts
        res.status(200).json({
            success: true,
            message: 'User counts retrieved successfully',
            data: {
                totalUsers: formatCount(totalUsers),     // Total users with userType = 'user'
                totalStars: formatCount(totalStars),     // Total users with userType = 'star'
                activeUsers: formatCount(activeUsers),   // Total active users (status = true)
                blockedUsers: formatCount(blockedUsers), // Total blocked users (status = false)
            },
        });
    } catch (error) {
        console.error('[ERROR] Fetching User Counts Failed:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch user counts. Please try again later.',
            error: error.message,
        });
    }
};

exports.countUsersByYearAndMonth = async (req, res) => {
    try {
        const { year } = req.body;

        // Validate the provided year
        if (!year || isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year provided.',
            });
        }

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];

        const startOfYear = `${year}-01-01 00:00:00`;
        const endOfYear = `${year}-12-31 23:59:59`;

        // Total signups for the year
        const totalSignups = await User.count({
            where: {
                createdAt: {
                    [Op.between]: [startOfYear, endOfYear],
                },
            },
        });

        // Signups grouped by month
        const monthlySignups = await User.findAll({
            attributes: [
                [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            ],
            where: {
                createdAt: {
                    [Op.between]: [startOfYear, endOfYear],
                },
            },
            group: ['month'],
            order: [['month', 'ASC']],
        });

        const monthData = {};

        // Initialize months with default value "{0}"
        monthNames.forEach((month) => {
            monthData[month] = '{0}';
        });

        // Update months with actual counts
        monthlySignups.forEach((signup) => {
            const monthIndex = signup.dataValues.month - 1; 
            const monthName = monthNames[monthIndex];
            monthData[monthName] = `{${formatCount(signup.dataValues.count)}}`; // Format count here
        });

        res.status(200).json({
            success: true,
            message: 'Signup data fetched successfully',
            data: {
                totalSignups: formatCount(totalSignups), // Format total signup count
                year,
                months: monthData, // Month-wise formatted signup data
            },
        });
    } catch (error) {
        console.error('[ERROR] Fetching Signup Data Failed:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch signup data',
            error: error.message,
        });
    }
};
