const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authMiddleware = (req, res, next) => {
    const secret = process.env.JWT_SECRET;

    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        return next(error);
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, secret);
    } catch (err) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        return next(error);
    }
    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        return next(error);
    }
    req.userId = decodedToken.userId;
    next();
};
