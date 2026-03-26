const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshTokenCreationEndpoint,
} = require("../controllers/auth-controllers");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenCreationEndpoint);

module.exports = router;
