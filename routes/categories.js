const express = require('express');
const categoriesController = require('../controllers/categories');

const router = express.Router();

module.exports = router;

router.get('/:type/:slug', categoriesController.getCategoryGames);

