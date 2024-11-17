
const mongoose = require('mongoose');

const cmapaineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    group: {
        type: String,
        required: true,
    },
    page: {
        type: String,
        required: true,
        unique: true,
    },
    profile: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('campaine', cmapaineSchema);
