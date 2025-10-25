import winston from "winston";
import fs from "fs";

if (!fs.existsSync("logs")) fs.mkdirSync("logs");

const { combine, timestamp, errors, json, colorize, printf } = winston.format;


const consoleFormat = printf(
  ({ level, message, timestamp, stack, ...meta }) => {
    return `[${timestamp}] ${level}: ${message}${
      stack ? `\n${stack}` : ""
    } ${Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ""}`;
  }
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        json()
      ),
    }),

    new winston.transports.File({
      filename: "logs/combined.log",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        json()
      ),
    }),

    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        consoleFormat
      ),
    }),
  ],
});

export default logger;
