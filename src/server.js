require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./utils/logger");
const connectToDb = require("./dbConnection/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth-routes");

const app = express();
const PORT = process.env.PORT || 3000;

// connectToDb
connectToDb();


// Rate Limiting with redis
//middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

//main routes
app.use("/api/auth", authRoutes);
//errorHandler
app.use(errorHandler);

//start server
app.listen(PORT, () => {
  logger.info(`Matatu Route Navigation backend running on port ${PORT}`);
});
