// Local -> Console + Files
//Render -> Console Only
const winston = require("winston");

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),
];
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () =>
        new Date().toLocaleString("en-KE", {
          timeZone: "Africa/Nairobi",
          hour12: false,
        }),
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(), //enables message templating
    winston.format.json(),
  ),
  defaultMeta: { service: "matatu-route-navigation-service" },
  transports,
});

module.exports = logger;
