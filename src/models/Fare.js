const mongoose = require("mongoose");

const fareSchema = new mongoose.Schema(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
      unique: true, // one fare per route
    },
    baseFare: {
      type: Number,
      required: true,
    },
    peakFare: {
      type: Number,
      required: true,
    },
    maxFare: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "KES",
    },
  },
  { timestamps: true },
);

const Fare = mongoose.model("Fare", fareSchema);
module.exports = Fare;
