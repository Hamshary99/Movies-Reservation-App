import { userModel } from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const postSignup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, phone } = req.body;

    if (!name || !email || !password || !confirmPassword || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    let userRole = role;
    if (!userRole) {
      userRole = "user"; // Default role if not provided
    }

    // even if we used unique: true in the schema, we still need to check for existing users
    // or else the handling of the error will not be as clean as this one and less user-friendly
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await userModel.create({
      name,
      email,
      password,
      role: userRole,
      phone,
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
    user.token = token;
    await user.save();

    res.status(201).json({
      message: "Signup successful",
      user,
      token
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email }).select("+password"); // Include password field for comparison

    // If the user doesn't exist, the compare password method will not work if it's in a declared constant so we put it in the if statement if user exists

    // if (!user || !(await user.comparePassword(password, user.password))) {
    //   return res.status(401).json({ message: "Invalid email or password" });
    // }
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    console.log("User logged in:", user.email);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
