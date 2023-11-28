const express = require("express");
const chatController = require("../../controllers/auth/chat");
const router = express.Router();
const passport = require("passport")
const Auth = passport.authenticate("jwt", { session: false });
// console.log("Auth--------------", Auth());

module.exports=router;

