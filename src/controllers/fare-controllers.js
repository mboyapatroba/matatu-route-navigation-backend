const logger = require("../utils/logger");
const Fare = require("../models/Fare");
const Route = require("../models/Routes");
const {
  validateCreateFare,
  validateUpdateFare,
} = require("../utils/validation");

// CREATE FARE
const createFare = async (req, res) => {
  try {
    logger.info("Create fare endpoint hit....");

    // validate request
    const { error } = validateCreateFare(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { route, baseFare, peakFare, maxFare, currency } = req.body;
    // check if route exists
    const routeExists = await Route.findById(route);
    if (!routeExists) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    // Ensure fare does not already exist for this route since it's unique per route
    const existingFare = await Fare.findOne({ route });
    if (existingFare) {
      return res.status(400).json({
        success: false,
        message: "Fare already exists for this Route",
      });
    }

    const fare = await Fare.create({
      route,
      baseFare,
      maxFare,
      peakFare,
      currency,
    });

    logger.info(`Fare created:${fare._id}`);

    res.status(201).json({
      success: true,
      message: "Fare created successfully",
      fare,
    });
  } catch (error) {
    logger.error("Error creating fare", error);
    res.status(500).json({
      success: false,
      message: "Failed to create fare",
    });
  }
};

//UPDATE FARE
const updateFare = async (req, res) => {
  try {
    logger.info("Update fare endpoint hit...");

    // Validate request body
    const { error } = validateUpdateFare(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const fareId = req.params.id;
    const updateData = { ...req.body };

    // Check if fare exists first
    const existingFareById = await Fare.findById(fareId);
    if (!existingFareById) {
      return res.status(404).json({
        success: false,
        message: "Fare not found",
      });
    }

    // If route is being updated → validate it
    if (updateData.route) {
      const routeExists = await Route.findById(updateData.route);
      if (!routeExists) {
        return res.status(400).json({
          success: false,
          message: "Route does not exist",
        });
      }

      // Ensure no duplicate fare for same route
      const duplicateFare = await Fare.findOne({
        route: updateData.route,
      });

      if (duplicateFare && duplicateFare._id.toString() !== fareId) {
        return res.status(400).json({
          success: false,
          message: "Another fare already exists for this route",
        });
      }
    }

    // Perform update
    const updatedFare = await Fare.findByIdAndUpdate(fareId, updateData, {
      new: true,
      runValidators: true,
    }).populate("route");

    logger.info(`Fare updated: ${updatedFare._id}`);

    res.status(200).json({
      success: true,
      message: "Fare updated successfully",
      fare: updatedFare,
    });
  } catch (error) {
    logger.error("Error updating fare", error);
    res.status(500).json({
      success: false,
      message: "Failed to update fare",
    });
  }
};
// GET ALL FARES
const getAllFares = async (req, res) => {
  try {
    logger.info("Get all fares endpoint hit....");

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const fares = await Fare.find()
      .populate("route")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const totalFares = await Fare.countDocuments();
    const totalPages = Math.ceil(totalFares / limit);

    const result = {
      success: true,
      currentPage: page,
      totalPages,
      totalFares,
      fares,
    };
    res.status(200).json(result);
  } catch (error) {
    logger.error("Error fetching fares", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fares",
    });
  }
};

// GET FARE BY ROUTE
const getFareByRoute = async (req, res) => {
  try {
    logger.info("Getting fare by route endpoint hit....");

    const routeId = req.params.routeId;
    const fare = await Fare.findOne({
      route: routeId,
    }).populate("route");

    if (!fare) {
      return res.status(404).json({
        success: false,
        message: "Fare not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fare fetched successfully",
      fare,
    });
  } catch (error) {
    logger.error("Error fetching fare by route", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fare",
    });
  }
};

// DELETE FARE
const deleteFare = async (req, res) => {
  try {
    logger.info("Delete fare  endpoint hit .....");

    const fareId = req.params.id;
    const fareToDelete = await Fare.findByIdAndDelete(fareId);

    if (!fareToDelete) {
      return res.status(404).json({
        success: false,
        message: "Fare not found",
      });
    }

    logger.info(`Fare delete:${fareToDelete._id}`);

    res.status(200).json({
      success: true,
      message: "Fare deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting route", error);
    res.status(500).json({
      success: false,
      message: "Failed to deleting route",
    });
  }
};
module.exports = {
  createFare,
  updateFare,
  getAllFares,
  getFareByRoute,
  deleteFare,
};
