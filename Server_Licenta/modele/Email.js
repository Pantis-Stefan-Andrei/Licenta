
const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    senderEmail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    body: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Email', emailSchema);
