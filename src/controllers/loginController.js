import crypto from "crypto";
// import { userModel } from "../models/userModel.js";
import { ApiError, SQLError } from "../utils/errorHandler.js";
import { sendEmail } from "../utils/email.js";
// import * as userRepo from "../repository/userRepositoryButGayer.js";
import jwt from "jsonwebtoken";

import * as signupRepository from "../repository/userRepositoy.js";
import * as userSchema from "../models/userSchema.js";

const tokenCookieCreator = (res, token) => {
  let cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    sameSite: "strict", // Helps prevent CSRF attacks
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true; // Ensures the cookie is sent over HTTPS only
  }
  res.cookie("jwt", token, cookieOptions);
};

export const postSignup = async (req, res, next) => {
  try {
    const parsedData = userSchema.userSignUpSchema.safeParse(req.body);

    if (!parsedData.success) {
      // console.log(parsedData.error);
      const flat = parsedData.error.flatten();

      let message = `Validation failed`;

      if (flat.fieldErrors && Object.keys(flat.fieldErrors).length > 0) {
        const missingFields = Object.keys(flat.fieldErrors);
        message = `Validation failed: ${missingFields.join(", ")} field/s are missing or invalid`;
      }
      
      throw new SQLError(message, 400, "SQL_error", flat.fieldErrors);
    }

    const user = await signupRepository.createUser(parsedData.data);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION,
      }
    );

    tokenCookieCreator(res, token);

    res.status(201).json({
      message: "Signup successful",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const postLogin = async (req, res, next) => {
  try {
    const parsedBody = userSchema.userLoginSchema.safeParse(req.body);

    if (!parsedBody.success) {
      // console.log(parsedBody.error.flatten());
      const flat = parsedBody.error.flatten();
      let message = `Validation failed`
      if (flat.fieldErrors && Object.keys(flat.fieldErrors).length > 0) {
        const missingFields = Object.keys(flat.fieldErrors);
        message = `Validation failed: ${missingFields.join(", ")} field/s are missing or invalid`;
      }
      throw new SQLError(message, 400, "SQL_error", flat.fieldErrors);
    }
    const user = await signupRepository.getUserByEmail(
      req.body.email,
      req.body.password
    );

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION,
      }
    );
    tokenCookieCreator(res, token);

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    // console.warn("The said ERROR: ", error);
    next(error);
  }
};

export const postForgotPassword = async (req, res, next) => {
  try {
    const message = await signupRepository.userForgotPassword(req, res);

    return res.status(200).json({
      message
    });
  } catch (error) {
    next(error);
  }
};

export const ResetPassword = async (req, res, next) => {
  try {
    const user = await signupRepository.userResetPassword(req);

    // Log the user in
    const loginToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    tokenCookieCreator(res, loginToken);

    res.status(200).json({
      message: "Password reset successful",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const patchPassword = async (req, res, next) => {
  try {
    const user = await signupRepository.userPatchPassword(req);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION,
      }
    );

    // Send token to cookie
    tokenCookieCreator(res, token);

    res.status(200).json({
      message: "Password updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

