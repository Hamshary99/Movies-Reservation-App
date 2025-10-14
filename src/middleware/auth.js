import jwt from "jsonwebtoken";
import * as userSchema from "../models/userSchema.js";
import * as userRepository from "../repository/userRepository.js";
import { eq } from "drizzle-orm";
import { db } from "../repository/dbConfig.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "You're not logged in" });
    }

    // Verify the token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await userRepository.getUserById(decoded.id);

    if (currentUser.passwordChangedAt) {
      const passwordChangedTimestamp = parseInt(
        new Date(currentUser.passwordChangedAt).getTime() / 1000,
        10
      );
      if (decoded.iat < passwordChangedTimestamp) {
        return res.status(401).json({
          message: "Password was changed recently. Please log in again.",
        });
      }
    }

    req.user = currentUser;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      message: "Invalid token",
      error: error,
    });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
};
