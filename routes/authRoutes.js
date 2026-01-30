const express = require('express');
const {signup,login,logout,authenticateToken, isTokenBlacklisted,changePassword, forgotPassword, verifyOtp, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middlewares/middleware');
const multer = require('multer');  
const upload = multer(); 

const router = express.Router();

router.post('/signup', upload.none(), signup);  
router.post('/login', upload.none(), login); 
router.post('/logout', authenticate, upload.none(), logout);
router.post('/changePassword',authenticate, upload.none(), changePassword);
router.post('/forgot-password',upload.none(), forgotPassword);
router.post('/verify-otp', upload.none(), verifyOtp);
router.post('/reset-password',authenticate,upload.none(), resetPassword);

module.exports = router;
