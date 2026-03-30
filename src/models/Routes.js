const mongoose = require("mongoose");
const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
      trim: true,
    },
    startStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    endStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    stops: [ // stops is an array of objectIDs that reference stop documents
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stop",
        required: true,
      },
    ],
    distanceKm: {
      type: Number,
      default: 0,
    },
    isActive: { // enable disable route
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
const Route = mongoose.model("Route", routeSchema);
module.exports = Route;
