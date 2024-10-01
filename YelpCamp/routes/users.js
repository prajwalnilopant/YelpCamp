const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)//user.renderRegister refers to the controller in the controllers directory.
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout);

/*The below routes are the original ones before using router.route funtion 

router.get('/register', users.renderRegister); //user.renderRegister refers to the controller in the controllers directory.
router.post('/register', catchAsync(users.register));
router.get('/login', users.renderLogin);
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

*/

module.exports = router;