require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./utils/logger");
const connectToDb = require("./dbConnection/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth-routes");
const stopRoutes = require("./routes/stop-routes");
const routeRoutes = require("./routes/route-routes");
const fareRoutes = require("./routes/fare-routes");
const searchRoute = require("./routes/search-routes");

const app = express();
const PORT = process.env.PORT || 3000;

// connectToDb
connectToDb();

// Rate Limiting with redis
//middlewares
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

//main routes
app.use("/api/auth", authRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/fares", fareRoutes);
app.use("/api/search", searchRoute);
//errorHandler
app.use(errorHandler);

//start server
app.listen(PORT, () => {
  logger.info(`Matatu Route Navigation backend running on port ${PORT}`);
});
