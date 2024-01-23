const User = require('../models/user');
const { getGames } = require('../http');
exports.addList = async (req, res, next) => {
    const { userId } = req;
    const { name, description } = req.body;

    if (!name || !description || typeof name !== 'string' || typeof description !== 'string') {
        return res.status(400).json({ message: 'Invalid name or description' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.lists.push({
            name: name,
            description: description,
        });
        await user.save();

        res.status(201).json({
            message: 'List added!',
            user: user
        });
    }
    catch (error) {
        next(error);
    }
};


exports.editList = async (req, res, next) => {
    const { userId } = req;
    const { listId } = req.params;
    const { name, description } = req.body;
console.log(req.params);
    try {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const list = user.lists.find(list => list._id.toString() === listId);
        if (!list) {
            const error = new Error('List not found');
            error.statusCode = 404;
            throw error;
        }

        list.name = name;
        list.description = description;

        await user.save();

        res.status(200).json({ message: 'List updated successfully', list });
    } catch (error) {
        next(error);
    }
};

exports.getLists = async (req, res, next) => {
    const { userId } = req;
    try {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const lists = await Promise.all(user.lists.map(async list => {
            const latestGameId = list.games[list.games.length - 1];
            let coverImage = null;

            if (latestGameId) {
               coverImage = await getCoverImage(latestGameId);
            }

            return {
                ...list._doc,
                latestCoverImage: coverImage
            };
        }));

        res.status(200).json({ lists });
    } catch (error) {
        next(error);
    }
};

exports.deleteList = async (req, res, next) => {
    const { userId } = req;
    const { listId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const list = user.lists.find(list => list._id.toString() === listId);
        if (!list) {
            const error = new Error('List not found');
            error.statusCode = 404;
            throw error;
        }

        user.lists = user.lists.filter(list => list._id.toString() !== listId);

        await user.save();

        res.status(200).json({ message: 'List deleted successfully' });
    } catch (error) {
        next(error);
    }
};


exports.addGame = async (req, res, next) => {
    const { userId } = req;
    const { listId } = req.params;
    console.log(req.params);
    const { game } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const list = user.lists.id(listId);
        if (!list) {
            const error = new Error('List not found');
            error.statusCode = 404;
            throw error;
        }

        list.games.push(game);
        await user.save();

        res.status(201).json({ message: 'Game added' });
        console.log("game added");
    } catch (error) {
        next(error);
    }
};

exports.deleteGame = async (req, res, next) => {
    const { userId } = req;
    const { listId, gameId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const list = user.lists.id(listId);
        if (!list) {
            const error = new Error('List not found');
            error.statusCode = 404;
            throw error;
        }
        list.games.pull(gameId);
        await user.save();

        res.status(200).json({ message: 'Game deleted' });
    } catch (error) {
        next(error);
    }
};



const getCoverImage = async (id) => {
    console.log("id is for cover", id);
    const queryBody = `
fields cover.image_id;
where id=${id};    
`;

    try {
        const gameCoverId = await getGames(queryBody);
        let coverImage = "";
        if( gameCoverId[0].cover.image_id){
            coverImage = `https://images.igdb.com/igdb/image/upload/t_1080p/${gameCoverId[0].cover.image_id}.jpg`;
        }
        return coverImage;
    }//try block
    catch (e) {
        console.log("error is", e.message);
        res.status(500).send('Error');
    }//catch
}