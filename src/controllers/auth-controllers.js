const logger = require("../utils/logger");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const RefreshToken = require("../models/RefreshToken");
const { validateRegistration, validateLogin } = require("../utils/validation");

// User Registration
const registerUser = async (req, res) => {
  try {
    logger.info("Registration enpoint hit");
  } catch (error) {
    logger.error("Registration error occurred", error);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

//User Login
const loginUser = async (req, res) => {};
