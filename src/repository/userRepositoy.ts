import { eq } from "drizzle-orm";
import * as userSchema from "../models/userSchema.js";
import bcrypt from "bcrypt";
import { db } from "./index.js";
import { SQLError, ApiError } from "../utils/errorHandler.js";
import { error } from "console";

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
    throw error;
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

export const userForgotPassword = async (email: string) => {
  try {
    const user = await db
      .select()
      .from(userSchema.usersTable)
      .where(eq(userSchema.usersTable.email, email))
      .limit(1);

    if (!user[0]) {
      throw new ApiError(
        `User with this email does not exist`,
        404,
        "api_error"
      );
    }
  } catch (error) {
    throw error;
  }
};
