const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authMiddleware = (req, res, next) => {
    const secret = process.env.JWT_SECRET;

    const authHeader = req.get('Authorization');
    console.log("auth header is", authHeader);
    if (!authHeader) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        return next(error);
    }
    const token = authHeader.split(' ')[1];
    console.log("token is", token);
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, secret);
    } catch (err) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        return next(error);
    }
    console.log("decoded token is", decodedToken);
    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        return next(error);
    }
    req.userId = decodedToken.userId;
    console.log("req.userId is", req.userId);
    next();
};
