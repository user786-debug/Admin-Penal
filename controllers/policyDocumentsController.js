const fs = require('fs');
const path = require('path');
const multer = require('multer');
const PolicyDocument  = require('../models/policyDocuments');
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/middleware'); // Your authentication middleware

// Configure multer storage for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'policyDocuments');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath); // Set destination folder
    },
    filename: (req, file, cb) => {
        // Replace spaces with underscores and sanitize the file name
        const sanitizedFileName = file.originalname.replace(/\s+/g, '_');
        const uniqueName = `${Date.now()}-${sanitizedFileName}`;
        cb(null, uniqueName);
    },
    
});

// File filter to accept only PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept PDF files
    } else {
        cb(new Error('Only PDF files are allowed.')); // Reject non-PDF files
    }
};

// Create multer instance
const upload = multer({
    storage,
    fileFilter,
}).single('document'); // Expecting the file field name to be 'document'

// PDF Upload Controller
exports.uploadPolicyDocument = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Failed to upload PDF.',
            });
        }

        try {
            const filePath = `/uploads/policyDocuments/${req.file.filename}`;
            res.status(200).json({
                success: true,
                message: 'PDF uploaded successfully.',
                data: {
                    documentPath: `${req.protocol}://${req.get('host')}${filePath}`, // Full URL to the uploaded file
                },
            });
        } catch (error) {
            console.error('[ERROR] Uploading PDF:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error while uploading PDF.',
            });
        }
    });
};


// API to update a policy document
exports.updatePolicyDocument = async (req, res) => {
    const { type, documentPath } = req.body;
    // console.log(type, documentPath)
    // Validate input
    if (!type || !documentPath) {
        return res.status(400).json({
            success: false,
            message: 'Policy type and document path are required.',
        });
    }

    try {
        // Find the policy document by type
        const policyDocument = await PolicyDocument.findOne({ where: { type } });

        if (!policyDocument) {
            return res.status(404).json({
                success: false,
                message: 'Policy document not found.',
            });
        }

        // Update the document path
        policyDocument.document = documentPath;
        await policyDocument.save();

        res.status(200).json({
            success: true,
            message: 'Policy document updated successfully.',
            data: {
                id: policyDocument.id,
                type: policyDocument.type,
                document: documentPath, // Full URL to the document
            },
        });
    } catch (error) {
        console.error('[ERROR] Updating Policy Document:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};


exports.getAllPolicyDocuments = async (req, res) => {
    try {
        // Fetch all policy documents
        const policyDocuments = await PolicyDocument.findAll();

        // Return the data as a response
        res.status(200).json({
            success: true,
            message: "all policy documents are retrieved successfully",
            data: policyDocuments,
        });
    } catch (error) {
        console.error('Error fetching policy documents:', error);

        // Handle any errors
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve policy documents.',
            error: error.message,
        });
    }
};

