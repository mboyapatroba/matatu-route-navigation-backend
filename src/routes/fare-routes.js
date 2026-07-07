const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/authMiddleware");
const adminPageProtection = require("../middlewares/adminProtection");
const {
  createFare,
  updateFare,
  getAllFares,
  getFareByRoute,
  deleteFare,
} = require("../controllers/fare-controllers");

// public routes
router.get("/get-fares", validateToken, getAllFares);
router.get("/get-fare-by-route/:routeId", validateToken, getFareByRoute);

//Admin routes
router.post("/create-fare", validateToken, adminPageProtection, createFare);
router.put("/update-fare/:id", validateToken, adminPageProtection, updateFare);
router.delete(
  "/delete-fare/:id", 
  validateToken,
  adminPageProtection,
  deleteFare,
);

module.exports = router;
