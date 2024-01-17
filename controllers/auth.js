const User = require('../models/user');
const { validationResult } = require('express-validator');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed.");
        error.statusCode = 422;
        error.data = errors.array();
        // throw error;
        return next(error);
    }

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log("data in backend are", username, email, password, hashedPassword);
        const user = new User({
            username: username,
            email: email,
            password: hashedPassword
        });
        const result = await user.save();
        res.status(201).json({
            message: 'User created!',
            userId: result._id
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
    
    // const username = req.body.username;
    // const email = req.body.email;
    // const password = req.body.password;
    // // const confirmPassword = req.body.confirmPassword;
    // const hashedPassword = bcrypt.hash(password, 12)
    // .then(hashedPassword => {
    //     const user = new User({
    //         username: username,
    //         email: email,
    //         password: hashedPassword
    //     });
    //     return user.save();

    // }).then(result => {
    //     res.status(201).json({
    //         message: 'User created!',
    //         userId: result._id
    //     });
    // })
    //     .catch(err => {
    //         if (!err.statusCode) {
    //             err.statusCode = 500;
    //         }
    //         next(err);
    //     });



    // try {
    //     const user = new User({
    //         username: username,
    //         email: email,
    //         password: password
    //     });
    //     await user.save();
    //     res.status(201).json({
    //         message: 'User created!',
    //         user: user
    //     });
    // } catch (err) {
    //     if (!err.statusCode) {
    //         err.statusCode = 500;
    //     }
    //     next(err);
    // }
};

exports.signin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log("email and password are", email, password);
    let loadedUser;
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            const error = new Error("A user with this email could not be found.");
            error.statusCode = 401;
            // throw error;
            return next(error);
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
        if (!isEqual) {
            const error = new Error("Wrong password!");
            error.statusCode = 401;
            throw error;
        }
        const jwtSecret = process.env.JWT_SECRET;
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()

        }, jwtSecret, {expiresIn: '1h'});
        res.status(200).json({
            token: token,
            message: "Login successful!",
            userId: loadedUser._id.toString(),
            username: loadedUser.username
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};