const express = require('express');
const homeController = require('../controllers/home');

const router = express.Router();

module.exports = router;

router.get('/newgames', homeController.getNewGames);

router.get('/upcomingGames', homeController.getUpcomingGames);

router.get('/recenttopgames', homeController.getRecentTopGames);

router.get('/bestgames', homeController.getBestGames);