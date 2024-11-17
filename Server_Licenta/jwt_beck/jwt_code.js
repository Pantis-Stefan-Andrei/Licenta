
require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined. Please check your environment variables.");
}

const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
        expiresIn: '1h'
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};

module.exports = { generateToken, verifyToken };
