const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
const {body,param } = require("express-validator");
const User = require("../models/user");

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("please enter valid email address")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ where: { email: value } });
        if (user) {
          return Promise.reject(
            "Email already exists. Please choose different one"
          );
        }
      })
      .normalizeEmail(),
    body(
      "password",
      "please enter passowrd with only text and numbers having atleast 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to be matched");
        }
        return true;
      }),
  ],
  authController.postSignUP
);
router.post("/login", [
  body("email").isEmail().withMessage("Please enter a valid email address.").custom(async(value,{req})=>{
    const user = await User.findOne({ where: { email: req.body.email } });
    if (! user) {
      return Promise.reject(
        "No user with this email"
      );
    }
  }),
  body("password", "Wrong Password.")
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
], authController.postLogin);

router.post("/reset-pwd", authController.postResetPassword);
router.post("/reset-pwd/:token", authController.createNewPassword);

router.post("/logout", authController.postLogout);
router.get("/verify-user/:token",[
  param('token').notEmpty().withMessage('Token is required').custom(async(value,{req})=>{
    const user = await User.findOne({ where: { verificationToken: req.params.token } });
    if (! user) {
      return Promise.reject(
        "Invalid verification token"
      );
    }
  })
],authController.verifyUser);
module.exports = router;
