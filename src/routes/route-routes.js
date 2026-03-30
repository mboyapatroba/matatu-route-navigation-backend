const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/authMiddleware");
const adminPageProtection = require("../middlewares/adminProtection");
const {
  createRoute,
  getAllRoutes,
  getSingleRouteById,
  deleteRouteById,
  toggleRouteActiveStatus,
  updateRoute,
} = require("../controllers/route-controllers");

// Public routes
router.get("/get-routes", validateToken, getAllRoutes);
router.get("/get-single-route/:id", validateToken, getSingleRouteById);

// Admin Only
router.post("/create-route", validateToken, adminPageProtection, createRoute);
router.put("/update-route/:id", validateToken, adminPageProtection, updateRoute);
router.delete("/delete-route/:id", validateToken, adminPageProtection, deleteRouteById);
router.put("/toggle-route/:id", validateToken, adminPageProtection, toggleRouteActiveStatus);

module.exports = router;
