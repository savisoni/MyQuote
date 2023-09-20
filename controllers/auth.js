const User = require("../models/user");
const md5 = require("md5");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const {validationResult}= require("express-validator");
// const smtpTransport = require("nodemailer-smtp-transport");
const { Op } = require("sequelize");

// let mailTransporter = nodemailer.createTransport(smtpTransport({
//   service:"gmail",
//   auth:{
//     user:"sonisavi75@gmail.com",
//     pass:"********"
//   }
// })
// //  auth:" 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"

// )

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.postSignUP = async (req, res, next) => {
  try {


    const { username, email, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors:errors.array()})
    }
    // const findUser = await User.findAll({ where: { email: email } });
    // if (findUser.length>0) {
    //   const error = new Error("Oops ! email already exists. Please choose different one");
    //   error.statusCode = 401;
    //   return next(error);
    // }

    
   
    // if (password !== confirmPassword) {
    //   const error = new Error("Passwords should match");
    //   error.statusCode = 401;
    //   return next(error);

    // }
    const verificationToken = crypto.randomBytes(16).toString("hex");



    const user = await User.create({
      username: username,
      email: email,
      password: md5(password),
      verificationToken,
    });

    transporter.sendMail({
      to: email,
      from: "sonisavi3901@gmail.com",
      subject: "Email Verification",
      html: `<h5>click this <a href="http://localhost:4000/auth/verify-user/${verificationToken}">link</a> to verify your email address</h5>`,
    });

    res
      .status(201)
      .json({
        message: "please check your email to verify your email address",
      });
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ where: { verificationToken: token } });
// console.log(user);
//     if (!user) {
//       const error = new Error("Invalid verification token");
//       error.statusCode = 401;
//       return next(error);
//     }

    user.isValid = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = md5(req.body.password);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({errors:errors.array()})
    }
    const user = await User.findOne({ where: { email: email } });
    // if (!user) {
    //   const error = new Error("A user with this email cannot be found");
    //   error.statusCode = 401;
    //   console.log("error message", error.stack);
    //   return next(error);
    // }
    // if (password !== user.password) {
    //   const error = new Error("Wrong Password");
    //   error.statusCode = 401;
    //   return next(error);
    // }
    const token = jwt.sign({ id: user.id }, "somesecretkey", {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "User loggedIn successfully",
      token: token,
      user: user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let tokenBlacklist = [];
exports.postLogout = async(req,res,next)=>{

  console.log("request---------->",req.headers);
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    // return res.status(401).json({ message: 'Token not provided' });
    const error = new Error("Token not provided");
      error.statusCode = 401;
      return next(error);
  }
  if (tokenBlacklist.includes(token)) {
    // return res.status(401).json({ message: 'Token is already invalidated' });
    const error = new Error("Token is already invalidated");
      error.statusCode = 401;
      return next(error);
  }

  tokenBlacklist.push(token);
  console.log("blacklist---->", tokenBlacklist);

  res.json({ message: 'Logout successfully' });
}

exports.postResetPassword = (req, res, next) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.error(err);
        // return res.status(500).json({ message: "Token generation failed" });
        const error = new Error("Token generation failed");
      error.statusCode = 401;
      return next(error);
      }

      const resetToken = buffer.toString("hex");

      let user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
        // return res.status(401).json({ message: "No user with this email" });
        const error = new Error("No user with this email");
      error.statusCode = 401;
      return next(error);
      }

      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();
      console.log("resettoken=====>", user.resetToken);
      transporter.sendMail(
        {
          from: "sonisavi3901@gmail.com",
          to: req.body.email,
          subject: "test email",
          text: "hello",
          html: `<p>click this <a href="http://localhost:4000/auth/reset-pwd/${resetToken}">link</a>to set new password</p>`,
        },
        (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Email could not be sent" });
          } else {
            console.log("Email sent successfully", data);
            return res
              .status(200)
              .json({
                message: "Password reset email sent successfully",
                resetToken: user.resetToken,
                user: user,
              });
          }
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createNewPassword = async (req, res, next) => {
  try {
    const password = req.body.password;
    const token = req.params.token;
    const hashedpassword = md5(password);
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: new Date() },
      },
    });
    if (!user) {
      // return res.status(401).json({ message: "User not found" });
      const error = new Error("User not found");
      error.statusCode = 401;
      return next(error);
    }

    user.password = hashedpassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    return res
      .status(200)
      .json({ message: "password reset successfully", user: user });
  } catch (error) {
    console.log(error);
    return res.json({ message: error.message });
  }
};
