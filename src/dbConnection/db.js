const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL2);
    logger.info("MongoDb connected successfully");
  } catch (error) {
    logger.error("Could not connect to MongoDb", error);
    process.exit(1);
  }
};

module.exports = connectToDb;
