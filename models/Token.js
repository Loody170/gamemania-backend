const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    expires_in: {
        type: Number,
        required: true
    },
    expiry_date: {
        type: Date,
        required: true
    }
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;