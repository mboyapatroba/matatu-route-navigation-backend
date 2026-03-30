const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/authMiddleware");
const adminPageProtection = require("../middlewares/adminProtection");

const {
  createStop,
  getAllStops,
  getSingleStopById,
  deleteStop,
  updateStop,
} = require("../controllers/stop-controller");

// Public
// these two validate token was not included
router.get("/get-stops", validateToken, getAllStops);
router.get("/get-single-stop/:id", validateToken, getSingleStopById);

//Admin Only
router.post("/create-stop", validateToken, adminPageProtection, createStop);
router.put("/update-stop", validateToken, adminPageProtection, updateStop);
router.delete("/delete-post", validateToken, adminPageProtection, deleteStop);

module.exports = router;
