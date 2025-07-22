import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
// import visitorRoutes from './routes/visitorRoutes.js';
// import receptionRoutes from './routes/receptionRoutes.js';
import mongoose from "mongoose";
import { handleError } from "./utils/errorHandler.js";
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins and allow Authorization header
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use(loginRoutes);
// app.use('/', visitorRoutes);
// app.use('/reception', receptionRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

// API error handling
app.use((err, req, res, next) => {
  handleError(err, req, res, next);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
