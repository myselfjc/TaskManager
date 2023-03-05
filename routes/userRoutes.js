const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');

router.route('/signUp').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/verifyOtp').patch(authController.verifyOtp);


module.exports = router;