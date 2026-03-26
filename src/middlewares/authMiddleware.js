const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Access attempted without a valid token");
    return res.status(401).json({
      successs: false,
      message: "Authentication required",
    });
  }
  // decode token if error handle it
  try {
    const userPayload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = userPayload;
    next();
  } catch (error) {
    logger.warn(error.message);
    res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = { validateToken };
