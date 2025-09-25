import express from "express";
import { Request, Response, NextFunction } from "express";

import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import rateLimit from "express-rate-limit"; // To avoid brute force attacks
import helmet from "helmet"; // To set security-related HTTP headers
import MongoSanitize from "express-mongo-sanitize"; // To sanitize user input against NoSQL query injection
// import xss from "xss-clean"; // To sanitize user input against XSS attacks
import hpp from "hpp"; // To protect against HTTP Parameter Pollution attacks

import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import receptionRoutes from './routes/receptionRoutes.js';
import webhookRouter from "./routes/webhookRoutes.js";
import mongoose from "mongoose";
import { handleError } from "./utils/errorHandler.js";


// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const PORT = process.env.PORT || 3000;


// Helmet, to be put before any routes to set security-related HTTP headers
app.use(helmet());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour window
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Enable CORS for all origins and allow Authorization header
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// Must be before express.json() to parse raw body for Stripe webhook
app.use("/stripe", webhookRouter);


// Reading and parsing JSON and URL-encoded data from req.body
app.use(express.json({ limit: '10kb' })); // Limit the amount of data, to protect from DOS attacks
// Serving static files from the 'public' directory
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL query injection
app.use(MongoSanitize());

// Data sanitization against XSS attacks
// app.use(xss());

// Prevent HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: ["seats", "showtimes"],
  })
);



// Middleware to log the request time
app.use((req: Request, res: Response, next: NextFunction) => {
  // req.timestamp = new Date().toISOString();
  next();
});

app.use('/auth', loginRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/reception', receptionRoutes);

// API error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  handleError(err, req, res, next);
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

