const logger = require("../utils/logger");
const Route = require("../models/Routes");
const Stop = require("../models/Stops");
const {
  validateCreateRoute,
  validateUpdateRoute,
} = require("../utils/validation");

// CREATE ROUTE

const createRoute = async (req, res) => {
  try {
    logger.info("Create route endpoint hit....");

    // validate request
    const { error } = validateCreateRoute(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { routeNumber, startStop, endStop, stops, distanceKm, isActive } =
      req.body;

    // ensure no duplicate route creation
    const existingRoute = await Route.findOne({
      startStop,
      endStop,
    });
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: "Route with same  start-stop and end-stop exists",
      });
    }

    //Ensure all stops exist in Db
    const stopsExist = await Stop.find({ _id: { $in: stops } }); //It checks if the field _id is included in the array stops
    if (stopsExist.length !== stops.length) {
      return res.status(400).json({
        success: false,
        message: "Some Stops do not exist",
      });
    }

    // Ensure startStop and endStop exist
    const startStopExist = await Stop.findById(startStop);
    const endStopExist = await Stop.findById(endStop);

    if (!startStopExist || !endStopExist) {
      return res.status(400).json({
        success: false,
        message: "Start or end Stop don't exist",
      });
    }
    const route = await Route.create({
      routeNumber,
      startStop,
      endStop,
      stops,
      distanceKm,
      isActive,
    });

    logger.info(`Route Created:${route._id}`);

    res.status(201).json({
      success: true,
      message: "Route Created Successfully",
      route,
    });
  } catch (error) {
    logger.error("Error creating route", error);
    res.status(500).json({
      success: false,
      message: "Failed to create routes",
    });
  }
};

const getAllRoutes = async (req, res) => {
  try {
    logger.info("Get all routes endpoint hit...");

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const routes = await Route.find({ isActive: true })
      .populate("startStop endStop stops")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const totalActiveRoutes = await Route.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalActiveRoutes / limit);

    const result = {
      success: true,
      count: routes.length,
      currentPage: page,
      totalPages,
      totalActiveRoutes,
      routes,
    };
    res.status(200).json(result);
  } catch (error) {
    logger.error("Error Fetching routes", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
    });
  }
};

const getSingleRouteById = async (req, res) => {
  try {
    logger.info(`Get Route by ID endpoint hit...${req.params.id}`);

    const routeId = req.params.id;
    const route = await Route.findById(routeId).populate(
      "startStop endStop stops",
    );

    if (!route) {
      return res.status(400).json({
        success: false,
        message: "Route not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Route fetched successfully",
      route,
    });
  } catch (error) {
    logger.error("Error fetching route by Id");
    res.status(500).json({
      success: false,
      message: "Failed to fetch Route",
    });
  }
};

const deleteRouteById = async (req, res) => {
  try {
    logger.info("Delete Route endpoint hit....");

    const routeId = req.params.id;
    const routeToDelete = await Route.findByIdAndDelete(routeId);

    if (!routeToDelete) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    logger.info(`Route deleted: ${routeToDelete.routeNumber}`);

    res.status(200).json({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting route", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete route",
    });
  }
};

const updateRoute = async (req, res) => {
  try {
    logger.info("Update route endpoint hit....");

    // Validate request body
    const { error } = validateUpdateRoute(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const routeId = req.params.id;
    const updateData = { ...req.body };

    //  check that provided stops exist optional
    if (updateData.startStop) {
      const startStopExist = await Stop.findById(updateData.startStop);
      if (!startStopExist) {
        return res.status(400).json({
          success: false,
          message: "Start stop does not exist",
        });
      }
    }

    if (updateData.endStop) {
      const endStopExist = await Stop.findById(updateData.endStop);
      if (!endStopExist) {
        return res.status(400).json({
          success: false,
          message: "End stop does not exist",
        });
      }
    }

    if (updateData.stops) {
      const stopsExist = await Stop.find({ _id: { $in: updateData.stops } });
      if (stopsExist.length !== updateData.stops.length) {
        return res.status(400).json({
          success: false,
          message: "Some stops do not exist",
        });
      }
    }

    // Perform update
    const updatedRoute = await Route.findByIdAndUpdate(routeId, updateData, {
      new: true,
      runValidators: true,
    }).populate("startStop endStop stops");

    if (!updatedRoute) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    logger.info(`Route updated: ${updatedRoute._id}`);
    res.status(200).json({
      success: true,
      message: "Route updated successfully",
      route: updatedRoute,
    });
  } catch (error) {
    logger.error("Error updating route", error);
    res.status(500).json({
      success: false,
      message: "Failed to update route",
    });
  }
};

const toggleRouteActiveStatus = async (req, res) => {
  try {
    logger.info(`Toggle route status endpoint hit .... ${req.params.id}`);
    const routeId = req.params.id;

    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route Not found",
      });
    }
    // toggle it
    route.isActive = !route.isActive;
    await route.save();

    res.status(200).json({
      success: true,
      message: `Route status toggled to ${route.isActive}`,
    });
  } catch (error) {
    logger.error("Error toggling route", error);
    res.status(500).json({
      success: false,
      message: "Failed to Update route",
    });
  }
};

const getRouteWithCoordinates = async (req, res) => {
  try {
    logger.info("Get route with coordinates endpoint hit...");

    const routeId = req.params.id;

    const route = await Route.findById(routeId).populate("stops");

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    // format stops for map
    const formattedStops = route.stops.map((stop) => ({
      name: stop.name,
      lat: stop.latitude,
      lng: stop.longitude,
    }));

    res.status(200).json({
      success: true,
      route: {
        routeId: route._id,
        routeNumber: route.routeNumber,
        stops: formattedStops,
      },
    });
  } catch (error) {
    logger.error("Error fetching routes with coordinates", error);
    res.status(500).json({
      success: false,
      message: "Failed to fecth route",
    });
  }
};

module.exports = {
  createRoute,
  getAllRoutes,
  getSingleRouteById,
  deleteRouteById,
  toggleRouteActiveStatus,
  updateRoute,
  getRouteWithCoordinates,
};
