const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    lists: [
        {
            name: { type: String, required: true },
            description: { type: String, required: true },
            games: [String]
        }
    ]
});

module.exports = mongoose.model('User', userSchema);