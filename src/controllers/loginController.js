import crypto from "crypto";
import { userModel } from "../models/userModel.js";
import { ApiError } from "../utils/errorHandler.js";
import { sendEmail } from "../utils/email.js";
import jwt from "jsonwebtoken";

export const postSignup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;
    let { role } = req.body; // Role can be provided in the request body

    if (!name || !email || !password || !confirmPassword) {
      throw new ApiError("All fields are required", 400);
    }

    if (password !== confirmPassword) {
      throw new ApiError("Passwords do not match", 400);
    }

    if (!role) {
      role = "user"; // Default role if not provided
    }

    // even if we used unique: true in the schema, we still need to check for existing users
    // or else the handling of the error will not be as clean as this one and less user-friendly
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new ApiError("User already exists", 400);
    }

    const user = await userModel.create({
      name,
      email,
      password,
      role,
      phone: phone ? phone : undefined, // Only include phone if provided
    });

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION,
      }
    );
    console.log("User signed up:", user.email);

    // Token storing in MongoDB for the sake of development purposes
    // user.token = token;

    console.log("Stripe secret: ", process.env.STRIPE_SECRET_KEY);

    res.status(201).json({
      message: "Signup successful",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError("Email and password are required", 400);
    }

    const user = await userModel.findOne({ email }).select("+password"); // Include password field for comparison

    // If the user doesn't exist, the compare password method will not work if it's in a declared constant so we put it in the if statement if user exists

    // if (!user || !(await user.comparePassword(password, user.password))) {
    //   return res.status(401).json({ message: "Invalid email or password" });
    // }
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError("Invalid email or password", 401);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const postForgotPassword = async (req, res, next) => {
  try {
    // Get user's email from the request body
    const { email } = req.body;
    if (!email) {
      throw new ApiError("Email is required", 400);
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new ApiError("User with this email does not exist", 404);
    }

    // Generate a password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Save the user with the reset token without validation
    

    // Create reset URL and send it via email
    // ${req.protocol} means http or https depending on the request
    // req.get("host") gets the host from the request, e.g., localhost:3000
    const resetURL = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

    const message = `Forgot your password?\n
    Click on the link below to reset your password:\n\n${resetURL}\n\n
    If you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message,
      });

      res.status(200).json({
        message: "Password reset link sent to your email",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(`There was an error sending the email. Try again later. ${error.message}`, 500);
    }
  } catch (error) {
    next(error);
  }
};

export const postResetPassword = async (req, res, next) => {
  try {
    // Get user by reset token
    const { token } = req.params;
    if (!token) {
      throw new ApiError("Reset token is required", 400);
    }
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      throw new ApiError("Password and confirm password are required", 400);
    }
    if( password !== confirmPassword) {
      throw new ApiError("Passwords do not match", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // If token isn't expired, find the user
    const user = await userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check if the token is not expired, by greater operator gt
    });

    if (!user) {
      throw new ApiError("User not found or token is invalid", 404);
    }

    // Update the user's password
    user.password = password;
    user.passwordResetToken = undefined; // Clear the reset token
    user.passwordResetExpires = undefined; // Clear the reset expiration date
    await user.save();

    // Check if password changed after token was issued

    // Log the user in
    const loginToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    res.status(200).json({
      message: "Password reset successful",
      user,
      token: loginToken,
    });
  } catch (error) {
    next(error);
  }
};
