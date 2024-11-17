const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userProfile = new mongoose.Schema({
  nameCampain: {
    type: String,
    required: true,
    unique: true, 
  },
  host: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  senderAdress: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  

});

userProfile.methods.verifyPassword = async function (password) {
  const user = this;
  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch;
};

const SendingProfile = mongoose.model("SendingProfile", userProfile);

module.exports = SendingProfile;