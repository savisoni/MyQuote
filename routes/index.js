const express = require("express");

const router = express.Router();


const authRouter = require("./auth/auth");
const likeRouter = require("./quote/like")
const commentRouter = require("./quote/comment");
const quoteRouter = require("./quote/quote")
router.use("/auth", authRouter);
router.use("/like",likeRouter);
router.use("/comment",commentRouter);
router.use("/quote",quoteRouter);
module.exports = router;