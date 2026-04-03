const logger = require("../utils/logger");
const Stop = require("../models/Stops");
const {
  validateCreateStop,
  updateStopValidation,
} = require("../utils/validation");

// Create Stop (Admin Only)
const createStop = async (req, res) => {
  try {
    logger.info("Create stop endpoint hit....");

    const { error } = validateCreateStop(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { name, latitude, longitude, area } = req.body;

    // prevent duplicates check if stop already exists
    const existingStop = await Stop.findOne({ name });
    if (existingStop) {
      return res.status(400).json({
        success: false,
        message: "Stop already exists",
      });
    }
    // create stop
    const stop = await Stop.create({
      name,
      latitude,
      longitude,
      area,
    });
    logger.info(`Stop created ${stop.name}`);
    res.status(201).json({
      success: true,
      message: "Stop Created Successfully",
      stop: stop,
    });
  } catch (error) {
    logger.error("Error creating stops", error);
    res.status(500).json({
      success: false,
      message: "Failed to create stop",
    });
  }
};

// get all stops

const getAllStops = async (req, res) => {
  try {
    logger.info("Get all stops endpoint hit....");

    //pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    //sorting
    const sortBy = req.query.sortBy || "name";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    // fetch stops
    const stops = await Stop.find({}).sort(sortObj).skip(skip).limit(limit);
    // count total
    const totalStops = await Stop.countDocuments();
    const totalPages = Math.ceil(totalStops / limit);

    // if (!stops) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No stops found",
    //   });
    // }
    const result = {
      success: true,
      stops: stops,
      currentPage: page,
      totalPages: totalPages,
      totalStops: totalStops,
    };
    res.status(200).json(result);
  } catch (error) {
    logger.error("Error getting stops", error);
    res.status(500).json({
      success: false,
      message: "Error getting stops",
    });
  }
};

// get single stop
const getSingleStopById = async (req, res) => {
  try {
    logger.info("Get single stop endpoint hit......");

    const stopId = req.params.id;
    const singleStopById = await Stop.findById(stopId);

    if (!singleStopById) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }
    const result = {
      success: true,
      stop: singleStopById,
      message: "Stop retrieved successfully",
    };
    res.status(200).json(result);
  } catch (error) {
    logger.error("Error Fetching Stop", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stop",
    });
  }
};

// delete a stop (Admin Only)
const deleteStop = async (req, res) => {
  try {
    logger.info("Delete stop endpoint hit....")
    const stopId = req.params.id;
    // Validate ObjectId
    // if (!mongoose.Types.ObjectId.isValid(stopId)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid stop ID",
    //   });
    // }
    const stopToDelete = await Stop.findByIdAndDelete(stopId);

    if (!stopToDelete) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }
    logger.info(`Stop deleted: ${stopToDelete.name}`);

    res.status(200).json({
      success: true,
      message: "Stop deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting stop", error);
    res.status(500).json({
      success: false,
      message: "Error deleting stop",
    });
  }
};

// updateStop (Admin Only)
const updateStop = async (req, res) => {
  try {
    logger.info("Update stop endpoint hit....");

    const { error } = updateStopValidation(req.body);

    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const stopId = req.params.id;
    const updateStopForm = req.body;
    const updatedStop = await Stop.findByIdAndUpdate(stopId, updateStopForm, {
      new: true,
      runValidators: true,
    });

    if (!updatedStop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }
    logger.info(`Stop updated: ${updatedStop._id}`);
    res.status(200).json({
      success: true,
      message: "Stop updated Successfully",
      stop: updatedStop,
    });
  } catch (error) {
    logger.error("Error updating stop", error);
    res.status(500).json({
      success: false,
      message: "Error updating stop",
    });
  }
};

module.exports = {
  createStop,
  getAllStops,
  getSingleStopById,
  deleteStop,
  updateStop,
};
