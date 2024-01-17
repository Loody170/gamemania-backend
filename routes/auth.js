const express = require('express');
const {body} = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');


const router = express.Router();

router.put('/signup', [
    body("email").isEmail().withMessage("Please enter a valid email")
    .normalizeEmail()
    .custom((value, {req}) => {
        console.log("value is", value);
        return User.findOne({email: value}).then(userDoc => {
            if (userDoc) {
                return Promise.reject("Email address already exists!");
            }
        });
    }),
    body("password").trim().isLength({min: 5}),
    body("confirmPassword").trim().custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match!");
        }
        return true;
    }),
    body("username").isLength({min: 3})
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter a valid username")
], authController.signup);

router.post('/signin', [
    body("email").normalizeEmail()
], authController.signin);

module.exports = router;