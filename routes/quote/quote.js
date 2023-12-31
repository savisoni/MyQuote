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


// router.get("/messages",quoteController.getChatForm);

// router.post("/collaboration-req", Auth, quoteController.requestCollabPermission);

router.put("/collaboration", Auth, quoteController.collaborationCreateUpdate);

router.delete("/delete-collaboration", Auth, quoteController.deleteCollaboration);

router.get("/all-collaborations",Auth,quoteController.getCollaboration);

router.post("/approve-collab",Auth,quoteController.approveCollaboration);

router.get("/checkout-session", Auth, quoteController.createCheckout);

router.get("/checkout/success",quoteController.checkoutSuccess);

module.exports = router;
