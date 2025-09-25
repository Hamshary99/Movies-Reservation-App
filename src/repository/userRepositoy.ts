import { Request, Response } from "express";
import { eq, gt, gte, and, SQL } from "drizzle-orm";
import * as userSchema from "../models/userSchema.js";
import bcrypt from "bcrypt";
import { db } from "./dbConfig.js";
import { SQLError, ApiError } from "../utils/errorHandler.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

export const createUser = async (
  newUser: userSchema.NewUser
): Promise<userSchema.UserWithoutPassword> => {
  try {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const [user] = await db
      .insert(userSchema.usersTable)
      .values({
        ...newUser,
        password: hashedPassword,
        phone: newUser.phone || null,
      })
      .returning({
        id: userSchema.usersTable.id,
        name: userSchema.usersTable.name,
        email: userSchema.usersTable.email,
        role: userSchema.usersTable.role,
        phone: userSchema.usersTable.phone || null,
        active: userSchema.usersTable.active,
      });
    if (!user) {
      throw new SQLError(`Signup failed`, 400, "SQL_error");
    }

    return user;
  } catch (error: any) {
    // console.warn("The said ERROR: ", error.cause);
    if (error.cause?.code === "23505")
      throw new SQLError(`User already exists`, 400, "SQL_error");
    else if (error.cause?.code === "23502")
      throw new SQLError(`Missing required fields`, 400, "SQL_error");
    else throw error;
  }
};

export const getUserByEmail = async (
  email: string,
  password: string
): Promise<userSchema.UserWithoutPassword> => {
  try {
    const user = await db
      .select()
      .from(userSchema.usersTable)
      .where(eq(userSchema.usersTable.email, email))
      .limit(1);

    const isValidPassword = user[0]
      ? await bcrypt.compare(password, user[0].password)
      : false;
    if (!isValidPassword) {
      throw new ApiError(`Incorrect email or password`, 401, "api_error");
    }

    const {
      password: _password, // Exclude password from returned user, named as _password because password is a reserved word
      passwordChangedAt,
      passwordResetExpires,
      passwordResetToken,
      createdAt,
      updatedAt,
      ...userWithoutPassword
    } = user[0]; // Exclude password from returned user
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response
  // email: string
): Promise<{ message: string }> => {
  try {
    const email = req.body.email;

    // Generate reset token
    const resetToken = crypto.randomBytes(64).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await db
      .update(userSchema.usersTable)
      .set({
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      })
      .where(eq(userSchema.usersTable.email, email))
      .returning({
        id: userSchema.usersTable.id,
        name: userSchema.usersTable.name,
        email: userSchema.usersTable.email,
        role: userSchema.usersTable.role,
        phone: userSchema.usersTable.phone || null,
        active: userSchema.usersTable.active,
      });

    if (!user[0]) {
      throw new ApiError(
        `User with this email does not exist`,
        404,
        "api_error"
      );
    }

    const resetURL = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${hashedToken}`;

    const message = `
Forgot your password?

Click the link below to reset it:
${resetURL}

If you did not request this, you can safely ignore this email.
`;

    // console.log(resetToken);
    // console.log(user);

    try {
      await sendEmail({
        email: user[0].email,
        subject: "Password Reset Request",
        message,
      });
    } catch (error: any) {
      await db
        .update(userSchema.usersTable)
        .set({ passwordResetToken: null, passwordResetExpires: null })
        .where(eq(userSchema.usersTable.email, user[0].email));
      throw new ApiError(
        `There was an error sending the email. Try again later. ${error.message}`,
        500
      );
    }

    return { message };
  } catch (error: any) {
    if (error.cause?.code === "23502")
      throw new SQLError(`Missing required fields`, 400, "SQL_error");
    throw error;
  }
};

export const userResetPassword = async (
  req: Request
): Promise<userSchema.UserWithoutPassword> => {
  try {
    const token = req.params.token;

    if (!token) {
      throw new ApiError("Reset token is required", 400);
    }

    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      throw new ApiError("Password and confirm password are required", 400);
    }

    if (password !== confirmPassword) {
      throw new ApiError("Passwords do not match", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check token expiration
    const user = await db
      .select()
      .from(userSchema.usersTable)
      .where(
        and(
          eq(userSchema.usersTable.passwordResetToken, token),
          gte(userSchema.usersTable.passwordResetExpires, new Date(Date.now()))
        )
      )
      .limit(1);

    if (!user[0]) {
      throw new ApiError("User not found or token is invalid", 404);
    }

    // To avoid showing the hashed password to the user, which shouldn't since we are returning typeof UserWithoutPassword
    // Yet it showed the password key?????????
    const updatedUser = await db
      .update(userSchema.usersTable)
      .set({
        password: hashedPassword,
        passwordChangedAt: new Date(Date.now()),
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(userSchema.usersTable.email, user[0].email))
      .returning({
        id: userSchema.usersTable.id,
        name: userSchema.usersTable.name,
        email: userSchema.usersTable.email,
        role: userSchema.usersTable.role,
        phone: userSchema.usersTable.phone || null,
        active: userSchema.usersTable.active,
      });

    console.log("New password hashed successfully", updatedUser[0]);

    return updatedUser[0];
  } catch (error) {
    throw error;
  }
};

export const userPatchPassword = async (
  req: Request
): Promise<userSchema.UserWithoutPassword> => {
  try {
    const { userID, currentPassword, newPassword, confirmPassword } = req.body;
    console.log("Request body:", req.body);

    if (!userID || !currentPassword || !newPassword || !confirmPassword) {
      throw new ApiError("All fields are required", 400);
    }

    const fetchedUser = await db
      .select()
      .from(userSchema.usersTable)
      .where(eq(userSchema.usersTable.id, userID))
      .limit(1);

    if (!fetchedUser[0]) {
      throw new ApiError("User not found", 404);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      fetchedUser[0].password
    );

    if (!isPasswordValid) {
      throw new ApiError("Current password is incorrect", 400);
    }

    if (newPassword !== confirmPassword) {
      throw new ApiError("New passwords do not match", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await db
      .update(userSchema.usersTable)
      .set({
        password: hashedPassword,
        passwordChangedAt: new Date(Date.now()),
      })
      .where(eq(userSchema.usersTable.id, userID))
      .returning({
        id: userSchema.usersTable.id,
        name: userSchema.usersTable.name,
        email: userSchema.usersTable.email,
        role: userSchema.usersTable.role,
        phone: userSchema.usersTable.phone || null,
        active: userSchema.usersTable.active,
      });

    if (!user[0]) {
      throw new SQLError("Failed to update password", 500, "SQL_error");
    }

    return user[0];
  } catch (error) {
    throw error;
  }
};
