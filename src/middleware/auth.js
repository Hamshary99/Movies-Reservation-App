import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Your authentication logic here
    console.log("After Bearer: ", req.headers.authorization.split(" ")[1]);
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log("Token:", token);

    if (!token) {
      return res.status(401).json({ message: "You're not logged in" });
    }

    // Verify the token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    // Check if the user exists in the database (or changed password after token was issued)
    const currentUser = await userModel.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: "The user belonging to this token does no longer exist" });
    }

    // If the user has changed their password after the token was issued, invalidate the token
    if (currentUser.hasPasswordChangedAfterTokenIssued(decoded.iat)) {
      return res.status(401).json({ message: "User recently changed password; please log in again." });
    }

    // Attach the user to the request object for further use in the application
    req.user = currentUser;
    console.log("User:", req.user);
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
  // This can access to roles passed to it
  return (req, res, next) => {
    // Check if the user has one of the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
    next(); // Proceed to the next middleware or route handler
  };
}