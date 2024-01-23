const express = require('express');
const authMiddleware = require('../auth-middleware'); 
const usersController = require('../controllers/users');

const router = express.Router();

router.use(authMiddleware.authMiddleware);

router.post("/lists", usersController.addList);

router.get("/lists", usersController.getLists);

router.get("/lists/:listId", usersController.getListGames);

router.put("/lists/:listId", usersController.editList);

router.delete("/lists/:listId", usersController.deleteList);

router.post("/lists/:listId/games", usersController.addGame);

router.delete("/lists/:listId/games/:gameId", usersController.deleteGame);



module.exports = router;