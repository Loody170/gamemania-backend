const express = require('express');
const authMiddleware = require('../auth-middleware'); 
const usersController = require('../controllers/users');

const router = express.Router();

router.use(authMiddleware.authMiddleware);

router.post("/lists", usersController.addList);

module.exports = router;