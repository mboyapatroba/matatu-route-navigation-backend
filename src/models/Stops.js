const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    area: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);
// indexing for faster search
stopSchema.index({ name: "text", area: "text" });
const Stop = mongoose.model("Stop", stopSchema);
module.exports = Stop;
