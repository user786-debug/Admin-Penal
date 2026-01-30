const express = require('express');
const { addVersion,getIosVersions,getAndroidVersions,updateVersionStatus } = require('../controllers/versionControlController');
const {authenticate} = require('../middlewares/middleware');

const multer = require('multer');  
const upload = multer(); 

const router = express.Router();
router.post('/add',authenticate, upload.none(), addVersion);
router.get('/android',authenticate, upload.none(), getAndroidVersions);
router.get('/ios',authenticate, upload.none(), getIosVersions);
router.put('/update',authenticate, upload.none(), updateVersionStatus);

module.exports = router;