const express = require("express");
const commentController = require("../controllers/comment");
const passport = require("passport");
const { body } = require("express-validator");
const router = express.Router();
const Auth = passport.authenticate("jwt", { session: false });

router.post(
  "/create",
  [
    body("comment")
      .trim()
      .isLength({ min: 3,max:20})
      .withMessage("comment must be of length between 3 to 20"),
  ],
  Auth,
  commentController.createComment
);


router.delete("/delete/:commentId", Auth,commentController.deleteComment);
module.exports = router;
