const express = require('express');
const {upload,uploadPolicyDocument,updatePolicyDocument,getAllPolicyDocuments } = require('../controllers/policyDocumentsController');
const {authenticate} = require('../middlewares/middleware');

const multer = require('multer');  
const uploade = multer(); 

const router = express.Router();
router.post('/upload',authenticate, uploadPolicyDocument); 
router.put('/update',authenticate, uploade.none(), updatePolicyDocument); 
router.get('/all',  getAllPolicyDocuments); 

module.exports = router;
