const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/authMiddleware");
const adminPageProtection = require("../middlewares/adminProtection");

const { searchRoute } = require("../controllers/search-controller");

// Public endpoint
router.get("/route-with-fare", validateToken, searchRoute);
module.exports = router;
