const express = require('express');
const gamesController = require('../controllers/games');

const router = express.Router();

module.exports = router;

router.get('/similargames', gamesController.getSimilarGames);

router.get('/search', gamesController.getSearchResults);

router.get('/results', gamesController.getAllSearchResults);

// router.get("/coverimage/:id", gamesController.getCoverImage);


router.get('/:id', gamesController.getGameDetails);
