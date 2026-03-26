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
        message: "Ivalid Credentials",
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

module.exports = { registerUser, loginUser };
