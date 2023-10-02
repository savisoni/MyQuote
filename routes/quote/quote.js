const express = require("express");
const router = express.Router();
const quoteController = require("../../controllers/quote/quote");
const { body } = require("express-validator");
const passport = require("passport");

const Auth = passport.authenticate("jwt", { session: false });

router.get("/all/:quoteId?",Auth, quoteController.getQuotes);


router.post(
  "/create",
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("title must be of length 5 or more than that"),
    body("content")
      .trim()
      .isLength({ min: 7 })
      .withMessage("content must be of length 7 or more than that"),
  ],
  Auth,
  quoteController.createQuote
);

router.put("/update-quote/:quoteId",[
    body("title").trim().isLength({min:5}).withMessage("title must be of length 5 or more than that"),
    body("content").trim().isLength({min:7}).withMessage("content must be of length 7 or more than that"),

],Auth,quoteController.updateQuote);

router.delete("/delete-quote/:quoteId",Auth,quoteController.deleteQuote);

router.post("/collaboration-req", Auth, quoteController.requestCollabPermission);

router.put("/grant-permission", Auth, quoteController.grantPermission);

module.exports = router;
