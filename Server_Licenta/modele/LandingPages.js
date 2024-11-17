const mongoose = require('mongoose');

const pagesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    html: {
        type: String,
        required: true,
    },
    capture_credentials: {
        type: Boolean,
        default: false,
    },
    capture_passwords: {
        type: Boolean,
        default: false,
    },
    redirect_url: {
        type: String,
        default: '',
    },
    modified_date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('pages', pagesSchema);
