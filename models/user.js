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
    
    // games: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Game'
    //     }
    // ],
    // categories: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Category'
    //     }
    // ]
});

module.exports = mongoose.model('User', userSchema);