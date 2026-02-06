const express = require('express');
const {
    validateSupportManager,
    handleValidationErrors,
} = require('../middlewares/managersValidation'); // Correct path to middleware
const {authenticate} = require('../middlewares/middleware');

const {upload,uploadImage,createSupportManager,getSupportManagers,
    updateSupportManager,deleteSupportManager,supportManagerCount } = require('../controllers/supportManagersController');
const multer = require('multer');  
const uploade = multer(); 

const router = express.Router();

router.post('/image',authenticate,upload.single('image'), uploadImage);  
router.post('/addnew',authenticate,uploade.none(),validateSupportManager,handleValidationErrors, createSupportManager);  
router.get('/all', getSupportManagers);  
router.get('/count',authenticate, supportManagerCount);  
router.put('/update',authenticate,upload.none(), updateSupportManager);  
router.delete('/delete/:id',authenticate, deleteSupportManager);  

module.exports = router;
