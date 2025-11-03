import crypto from "crypto";
import { ApiError } from "../utils/errorHandler.js";
import { sendEmail } from "../utils/email.js";
import jwt from "jsonwebtoken";
import * as signupRepository from "../repository/userRepository.js";
import * as userSchema from "../models/userSchema.js";
import * as tokenUtils from "../utils/tokenUtils.js";
import path from "path";

const tokenCookieCreator = (res, token) => {
  let cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_REFRESH_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    // sameSite: "strict", // Helps prevent CSRF attacks
    secure: false, // Set to true if using HTTPS
    sameSite: "none", // Allows cross-site cookies
    path: '/', // Cookie is accessible across the entire site
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true; // Ensures the cookie is sent over HTTPS only
  }
  res.cookie("refreshToken", token, cookieOptions);
};

export const postSignup = async (req, res, next) => {
  try {

    const user = await signupRepository.createUser(req.body);
    const accessToken = tokenUtils.generateAccessToken(user);
    const refreshToken = tokenUtils.generateRefreshToken(user);

    await signupRepository.saveRefreshToken(user.id, refreshToken);

    tokenCookieCreator(res, refreshToken);

    const { refresh_token, ...userWithoutRefreshToken } = user;

    res.status(201).json({
      message: "Signup successful",
      user: userWithoutRefreshToken,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const postLogin = async (req, res, next) => {
  try {

    const user = await signupRepository.getUserByEmail(
      req.body.email,
      req.body.password
    );


    const accessToken = tokenUtils.generateAccessToken(user);
    const refreshToken = tokenUtils.generateRefreshToken(user);

    await signupRepository.saveRefreshToken(user.id, refreshToken);

    tokenCookieCreator(res, refreshToken);

    const { refresh_token, ...userWithoutRefreshToken } = user; 

    res.status(200).json({
      message: "Login successful",
      user: userWithoutRefreshToken,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const postForgotPassword = async (req, res, next) => {
  try {
    const message = await signupRepository.userForgotPassword(req, res);

    return res.status(200).json({
      message,
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

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new ApiError("Refresh token not found", 401);
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await signupRepository.getUserRefreshToken(payload.id);
    if (!user || user.refresh_token !== refreshToken) {
      throw new ApiError("User not found or refresh token is invalid", 401);
    }

    const accessToken = tokenUtils.generateAccessToken(user);
    const newRefreshToken = tokenUtils.generateRefreshToken(user);

    await signupRepository.saveRefreshToken(user.id, newRefreshToken);

    tokenCookieCreator(res, newRefreshToken);

    const { refresh_token, ...userWithoutRefreshToken } = user;

    res.status(200).json({
      message: "Token refreshed successfully",
      user: userWithoutRefreshToken,
      accessToken,
    });

  } catch (error) {
    next(error);
  }
};


export const postLogout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ApiError("Refresh token not found", 401);
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await signupRepository.getUserById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError("User not found or refresh token is invalid", 401);
    }

    await signupRepository.removeRefreshToken(user.id);

    res.clearCookie("refreshToken");
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
}