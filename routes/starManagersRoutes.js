const express = require('express');
const {upload,uploadImage,createStarManager,getstarManagers,updateManager,deleteManager,starManagerCount } = require('../controllers/starsManagerController');
const {validateSupportManager,handleValidationErrors,} = require('../middlewares/managersValidation'); 
const {authenticate} = require('../middlewares/middleware');
const multer = require('multer');  
const uploade = multer(); 
const router = express.Router();

router.post('/image',authenticate,upload.single('image'), uploadImage);  
router.post('/addnew',authenticate,uploade.none(),validateSupportManager,handleValidationErrors, createStarManager);  

router.get('/all',authenticate, getstarManagers);  
router.get('/count',authenticate, starManagerCount);  
router.put('/update',authenticate,upload.none(), updateManager);  
router.delete('/delete/:id',authenticate, deleteManager);  

module.exports = router;
