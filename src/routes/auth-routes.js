const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshTokenCreationEndpoint,
  logOut,
} = require("../controllers/auth-controllers");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenCreationEndpoint);
router.post("/logout", logOut);

module.exports = router;
