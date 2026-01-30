const { check, validationResult } = require('express-validator'); // Import required functions

// Validation middleware for creating a Support Manager
exports.validateSupportManager = [
    check('name').notEmpty().withMessage('Name is required.'),
    check('email')
        .isEmail()
        .withMessage('Valid email is required.')
        .notEmpty()
        .withMessage('Email is required.'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.')
        .notEmpty()
        .withMessage('Password is required.'),
];

// Middleware to handle validation errors
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
};
