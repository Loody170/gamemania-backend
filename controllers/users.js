const User = require('../models/user');

exports.addList = async (req, res, next) => {
    const { userId } = req;
    const { name, description } = req.body;

    if (!name || !description || typeof name !== 'string' || typeof description !== 'string') {
        return res.status(400).json({ message: 'Invalid name or description' });
    }

    try{
        const user = await User.findById(userId);
        if(!user){
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
    catch(error){
        next(error);
    }
};