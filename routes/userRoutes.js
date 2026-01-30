const express = require('express');
const {getAllUsers,toggleUserStatus,getUserCount,countUsersByYearAndMonth,getAllStars } = require('../controllers/userController');
const {authenticate} = require('../middlewares/middleware');

const multer = require('multer');  
const upload = multer(); 

const router = express.Router();
router.get('/allUsers',authenticate, getAllUsers);  
router.get('/allStars',authenticate, getAllStars);  
router.put('/:id',authenticate, toggleUserStatus);
router.get('/count',authenticate, getUserCount);
router.get('/byYear',authenticate,upload.none(), countUsersByYearAndMonth);

module.exports = router;
