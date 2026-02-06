const express = require('express');
const bcrypt = require('bcrypt');  
const { blacklistToken } = require('../middlewares/middleware');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admins');
const axios = require('axios'); 

const OTP_EXPIRY_TIME = 10 * 60 * 1000; 


exports.signup = async (req, res) => {
    const { userId, name, email, password } = req.body;

    try {
        // Check if email already exists
        const existingEmail = await Admin.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered. Please choose a different email.'
            });
        }

        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new Admin (user) in the database
        const newAdmin = await Admin.create({
            userId,   // This is optional
            name,     // Name is required
            email,
            password: hashedPassword
        });

        // Generate JWT token for the new user
        const token = jwt.sign({ id: newAdmin.id, userId: newAdmin.userId },process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Signup successful!',
            data: {
                id: newAdmin.id,
                userId: newAdmin.userId,
                name: newAdmin.name,  // Include name in the response
                email: newAdmin.email,
            },
            token  // Return the token for future requests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
             error: error.message,
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;  


    
    if (!email || !password) {
        return res.status(404).json({
            success: false,
            message: 'Email and password are required.'
        });
    }

    try {
        const admin = await Admin.findOne({ where: { email } });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found with this email'
            });
        }

        // Compare password (assuming password is hashed in DB)
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Please try again.'
            });
        }

        // Create JWT token for the logged-in admin
        const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
            expiresIn: '1d'  
        });

        // Successful login response
        res.status(200).json({
            success: true,
            message: 'Login successful!',
            // Return token for future requests
            data: {
                id: admin.id,
                email: admin.email,
                name: admin.name,  // Include name in the response
                token
            },
            
        });

    } catch (error) {
        console.error('[ERROR] Login Failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error', 
             error: error.message,
        });
    }
};

exports.logout = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    try {
        // Verify the token before blacklisting it
        jwt.verify(token, process.env.JWT_SECRET);

        // Blacklist the token
        blacklistToken(token);  // Add the token to the blacklist

        return res.status(200).json({
            success: true,
            message: 'Logout successful, token blacklisted.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'An error occurred during logout.',
            error: error.message,
        });
    }
};

exports.changePassword = async (req, res) => {
      const { id, oldPassword, newPassword, confirmPassword } = req.body;
  
      // Validate required fields
      if (!id || !oldPassword || !newPassword || !confirmPassword) {
          return res.status(400).json({
              success: false,
              message: 'All fields (id, oldPassword, newPassword, confirmPassword) are required.',
          });
      }
  
      if (newPassword !== confirmPassword) {
          return res.status(400).json({
              success: false,
              message: 'New password and confirm password do not match.',
          });
      }
  
      try {
          // Find the admin by ID
          const admin = await Admin.findOne({ where: { id } });
  
          if (!admin) {
              return res.status(404).json({
                  success: false,
                  message: 'Admin not found with the provided ID.',
              });
          }
  
          // Verify the old password
          const isMatch = await bcrypt.compare(oldPassword, admin.password);
          if (!isMatch) {
              return res.status(401).json({
                  success: false,
                  message: 'Old password is incorrect.',
              });
          }
  
          // Check if the new password is the same as the old password
          const isSameAsOld = await bcrypt.compare(newPassword, admin.password);
          if (isSameAsOld) {
              return res.status(400).json({
                  success: false,
                  message: 'New password cannot be the same as the old password.',
              });
          }
  
          // Hash the new password before saving
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
          // Update the password in the database
          admin.password = hashedNewPassword;
          await admin.save();
  
          return res.status(200).json({
              success: true,
              message: 'Password changed successfully!',
          });
      } catch (error) {
          console.error('[ERROR] Change Password Failed:', error.message);
          return res.status(500).json({
              success: false,
              message: 'An error occurred while changing the password.',
               error: error.message,
          });
      }
};
  
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Find the admin by email
        const admin = await Admin.findOne({ where: { email } });

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Email not registered' });
        }

        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
        const otpExpiry = new Date(Date.now() + OTP_EXPIRY_TIME); // OTP expiry time

        // Save OTP and expiry to DB
        await admin.update({ otp, otpExpiry });

        // Prepare email data to send OTP
        const emailData = {
            title: "Forgot password OTP",
            email: admin.email,
            description: `Your OTP is ${otp}. It will expire in 10 minutes.`
        };

        try {
            // Send OTP via external email API
            const response = await axios.post('https://appistanapis.appistansoft.com/api/starafa/send-email', emailData);

            if (response.status === 200) {
                return res.json({ success: true, message: 'OTP sent to email' });
            } else {
                return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error sending OTP email' });
        }
    } catch (error) {
        console.error('[ERROR] Error generating OTP:', error.message);
        return res.status(500).json({ success: false, message: 'Error generating OTP',  error: error.message, });
    }
};
// 2. Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const admin = await Admin.findOne({ where: { email } });

        if (!admin) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentTime = new Date();
        const expiryTime = new Date(admin.otpExpiry);

        // Check if OTP is valid
        if (admin.otp !== parseInt(otp, 10)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Check if OTP has expired
        if (currentTime > expiryTime) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        // Generate JWT Token with 1 day expiry
        const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.json({ success: true, message: 'OTP verified', token });
    } catch (error) {
        console.error('[ERROR] OTP Verification Failed:', error.message);
        return res.status(500).json({ success: false, message: 'Verification failed',  error: error.message, });
    }
};

exports.resetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body; // Accept confirmPassword field
    const authHeader = req.header('Authorization');

    // Check for authorization token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify and decode JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await Admin.findOne({ where: { email: decoded.email } });

        if (!admin) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Password and confirm Password do not match' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update Admin record with new password and clear OTP
        await admin.update({ password: hashedPassword, otp: null, otpExpiry: null });

        return res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token has expired' });
        }
        console.error('[ERROR] Password Reset Failed:', error.message);
        return res.status(500).json({ success: false, message: 'Reset failed',  error: error.message, });
    }
};

