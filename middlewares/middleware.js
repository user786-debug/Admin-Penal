const jwt = require('jsonwebtoken');

// Centralized blacklist storage
const blacklistedTokens = new Set(); // Shared Set for blacklisted tokens

/**
 * Middleware to authenticate user and validate JWT
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header missing or malformed.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Check if the token is blacklisted
    if (blacklistedTokens.has(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or blacklisted.',
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user payload to the request object
    req.user = decoded;

    next(); // Allow the request to proceed
  } catch (error) {
    console.error('JWT Authentication Error:', error.message);

    const errorMessage =
      error.name === 'TokenExpiredError'
        ? 'Token has expired.'
        : 'Invalid or malformed token.';

    return res.status(401).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Utility to blacklist a token (e.g., during logout)
 * @param {string} token - The token to blacklist
 */
const blacklistToken = (token) => {
  blacklistedTokens.add(token);
  // Set a cleanup mechanism for expired tokens in memory (optional for in-memory storage)
  setTimeout(() => blacklistedTokens.delete(token), 24 * 60 * 60 * 1000); // 1-day timeout
};

module.exports = { authenticate, blacklistToken, blacklistedTokens };
