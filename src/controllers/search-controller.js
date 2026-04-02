const logger = require("../utils/logger");
const Stop = require("../models/Stops");
const Route = require("../models/Routes");
const Fare = require("../models/Fare");
const calculateFare = require("../utils/fareCalculator");

const searchRoute = async (req, res) => {
  try {
    logger.info("Search route endpoint hit.....");

    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        successs: false,
        message: "From and To are required",
      });
    }

    // find stop IDs
    const fromStop = await Stop.findOne({ name: from });
    const toStop = await Stop.findOne({ name: to });

    if (!fromStop || !toStop) {
      return res.status(404).json({
        success: false,
        message: "Invalid Stops",
      });
    }

    // find Routes containing both from and to stops
    const Routes = await Route.find({
      stops: { $all: [fromStop._id, toStop._id] },
      isActive: true,
    }).populate("stops");

    const validRoutes = [];

    for (let route of Routes) {
      const stopIds = route.stops.map((s) => s._id.toString());

      const fromIndex = stopIds.indexOf(fromStop._id.toString());
      const toIndex = stopIds.indexOf(fromStop._id.toString());

      // ensure correct order
      if (fromIndex < toIndex) {
        // getFare
        const fare = await Fare.findOne({ route: route._id });

        let fareResult = null;
        if (fare) {
          fareResult = calculateFare({ fare });
        }
        validRoutes.push({
          routeId: route._id,
          routeNumber: route.routeNumber,
          stops: route.stops.map((s) => ({
            name: s.name,
            lat: s.latitude,
            lng: s.longitude,
          })),
          fare: fareResult,
        });
      }
    }
    res.status(200).json({
      success: true,
      count: validRoutes.length,
      routes: validRoutes,
    });
  } catch (error) {
    logger.error("Search error", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};

module.exports = { searchRoute };
