
const mongoose = require('mongoose');

const sendingUsersSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true,
    },
    position: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('SendingUsers', sendingUsersSchema);
