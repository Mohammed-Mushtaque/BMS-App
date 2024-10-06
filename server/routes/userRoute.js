const express = require("express");

const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");
const UserModel = require("../model/userModel");
const bcrypt = require('bcrypt');
const EmailHelper = require("../utils/emailHelper");

const userRouter = express.Router();

// register a user
userRouter.post("/register", register);

// login for user
userRouter.post("/login", login);

userRouter.get("/get-current-user", auth, getCurrentUser);

// function to generate token

const otpGenerator = () => {
  return Math.floor(100000 + Math.random() * 900000); // six digit otp: 0 -> 899999 + 100000 => ( 100000 - 999999)
};

userRouter.patch("/forgetpassword", async (req, res) => {
//   /**
//    *1. ask for email
//    2. check if the email exists in the database
//    3. if email is present, generate otp
//     4. save otp in the database
//     5. send otp to the email 
//    */
  try {
    if (req.body.email === undefined) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const user = await UserModel.findOne({ email: req.body.email }); // AYush
    if (user === null) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = otpGenerator(); // give me a six digit otp
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    // sending email
    await EmailHelper("otp.html", user.email, { name: user.name, otp: otp });
    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (err) {
    console.log(err);
  }
});

userRouter.patch("/resetpassword/:email", async (req, res) => {
  try {
      const resetDetails = req.body;
      const { password, otp } = resetDetails;
      const { email } = req.params;

      if (!password || !otp) {
          return res.status(400).json({
              success: false,
              message: "Password and OTP are required",
          });
      }

      const user = await UserModel.findOne({ email: email });

      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found",
          });
      }

      if (user.otp !== otp || new Date() > user.otpExpiry) {
          return res.status(400).json({
              success: false,
              message: "Invalid or expired OTP",
          });
      }

      user.password = await bcrypt.hash(password, 10);
      user.otp = undefined;
      user.otpExpiry = undefined;

      await user.save();

      res.status(200).json({
          success: true,
          message: "Password has been reset successfully",
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({
          success: false,
          message: "An error occurred",
      });
  }
});

module.exports = userRouter;