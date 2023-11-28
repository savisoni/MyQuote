const express = require("express");

const router = express.Router();

const chatRouter = require("./auth/chat")
const authRouter = require("./auth/auth");
const likeRouter = require("./quote/like")
const commentRouter = require("./quote/comment");
const quoteRouter = require("./quote/quote")
router.use("/auth", authRouter);
router.use("/like",likeRouter);
router.use("/comment",commentRouter);
router.use("/quote",quoteRouter);
router.use("/chat",chatRouter)
module.exports = router;