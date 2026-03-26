const logger = require("../utils/logger");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const RefreshToken = require("../models/RefreshToken");
const { validateRegistration, validateLogin } = require("../utils/validation");

// User Registration
const registerUser = async (req, res) => {
  try {
    logger.info("Registration enpoint hit....");
    //validate the schema
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation errror", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // check if user exists
    const { username, email, password } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("Sorry user already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    //create new user
    user = new User({
      username,
      email,
      password,
    });
    await user.save(); // password hashing will happen in pre save in user model
    logger.info("User saved successfully", user._id);

    // generateToken
    const { accessToken, refreshToken } = await generateToken(user);
    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error("Registration error occurred", error);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

//User Login
const loginUser = async (req, res) => {
  try {
    logger.info("Login endpoint hit...");
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    // check if user
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Login Failed... User with the given email not found");
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const isValidPassword = user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Password do not match!!");
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    // generate Access and RefreshToken
    const { accessToken, refreshToken } = await generateToken(user);
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error("Login error occurred please try Again!!", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Refresh Token Creation Endpoint
const refreshTokenCreationEndpoint = async (req, res) => {
  try {
    logger.info("Refresh Token endpoint hit...");
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh Token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh Token missing",
      });
    }
    // check for expiration with the one in db
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired Refresh Token");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Refresh Token",
      });
    }
    // get user associated with the token
    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("User not found");
      return res.status(400).json({
        succes: false,
        message: "User not found",
      });
    }
    // generate new access and RefreshToken and delete the Old one
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    // delete old token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    // return the new access and refresh tokens
    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh Token Error Occurred", error);
    res.status(500).json({
      success: false,
      message: "Invalid Credentials",
    });
  }
};

// Logout Endpoint
const logOut = async (req, res) => {
  try {
    logger.info("Logout endpoint hit.....");
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid  token",
      });
    }
    // delete the token
    await RefreshToken.findOneAndDelete({ token: refreshToken });
    logger.info("Refresh Token deleted for logout");
    res.status(200).json({
      success: true,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    logger.error("Error while logging out", error);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokenCreationEndpoint,
  logOut,
};
