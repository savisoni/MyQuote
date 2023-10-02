const express = require("express");
const likeController = require("../../controllers/quote/like");
const passport = require("passport");
const { body } = require("express-validator");
const router = express.Router();
const Auth = passport.authenticate("jwt", { session: false });


router.post("/create",Auth,likeController.createLike);

module.exports=router;