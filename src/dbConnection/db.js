const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    logger.info("MongoDb connected successfully");
  } catch (error) {
    logger.error("Could not connect to MongoDb");
    process.exit(1);
  }
};

module.exports = connectToDb;
