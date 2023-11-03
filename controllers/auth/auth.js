const md5 = require("md5");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const transporter = require("../../helpers/utility");
const { Op } = require("sequelize");
const sequelize = require("../../util/database");

const readModels = require("../../models/index");

console.log("readmodels====>", readModels);
const User = readModels.user;

const {comment}=readModels;
console.log("comment====>", comment);

console.log("seq=========>", readModels);



exports.postSignUP = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } =
      req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   
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

    res.status(201).json({
      message: "please check your email to verify your email address",
    });
  } catch (error) {
    next(error);

  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ where: { verificationToken: token } });
        if (!user) {
          const error = new Error("Invalid verification token");
          error.statusCode = 401;
          throw error;
        }

    user.isValid = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = md5(req.body.password);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      const error = new Error("A user with this email cannot be found");
      error.statusCode = 401;
      throw error;
    }
    if (user.isValid !== true) {
      const error = new Error("User not verified");
      error.statusCode = 401;
      console.log("error message", error.stack);
      throw error;
    }
    if (password !== user.password) {
      const error = new Error("Wrong Password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign({ id: user.id }, "somesecretkey", {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "User loggedIn successfully",
      token: token,
      user: user,
    });
  } catch (error) {
    next(error);
  }
};

let tokenBlacklist = [];
exports.postLogout = async (req, res, next) => {
  try {
    console.log("request---------->", req.headers);
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      // return res.status(401).json({ message: 'Token not provided' });
      const error = new Error("Token not provided");
      error.statusCode = 401;
      throw error;
    }

    if (tokenBlacklist.includes(token)) {
      // return res.status(401).json({ message: 'Token is already invalidated' });
      const error = new Error("Token is already invalidated");
      error.statusCode = 401;
      throw error;
    }

    tokenBlacklist.push(token);
    console.log("blacklist---->", tokenBlacklist);

    res.json({ message: "Logout successfully" });
  } catch (error) {
    next(error);
  }
};
exports.postResetPassword = async (req, res, next) => {
  try {
    let user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      // return res.status(401).json({ message: "No user with this email" });
      const error = new Error("No user with this email");
      error.statusCode = 401;
      throw error;
    }
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.error(err);
        // return res.status(500).json({ message: "Token generation failed" });
        const error = new Error("Token generation failed");
        error.statusCode = 401;
        throw error;
      }

      const resetToken = buffer.toString("hex");

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
            return res.status(200).json({
              message: "Password reset email sent successfully",
              resetToken: user.resetToken,
              user: user,
            });
          }
        }
      );
    });
  } catch (error) {
    next(error);
  }
};

exports.createNewPassword = async (req, res, next) => {
  try {
    const password = md5(req.body.password);
    const token = req.params.token;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: new Date() },
      },
    });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    return res
      .status(200)
      .json({ message: "password reset successfully", user: user });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


