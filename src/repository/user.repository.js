import { userModel } from "../models/userModel.js";
import { DatabaseError } from "../utils/errorHandler.js";

export const findUserById = async (id) => {
    try {
        const user = await userModel.findById(id).select("+passwordResetToken +passwordResetExpires");
        if (!user) {
            throw new DatabaseError("User not found", 404);
        }
        return user;
    } catch (error) {
        throw new DatabaseError("Error finding user", 500);
    }
}


export const findUserByEmail = async (email) => {
    try {
        const user = await userModel.findOne({ email }).select("+passwordResetToken +passwordResetExpires");
        if (!user) {
            throw new DatabaseError("User not found", 404);
        }
        return user;
    } catch (error) {
        throw new DatabaseError("Error finding user", 500);
    }
}


export const create = async (userData) => {
    try {
        const user = await userModel.create(userData);
        if (!user) {
            throw new DatabaseError("User creation failed", 500);
        }
        return user;
    } catch (error) {
        throw new DatabaseError("Error creating user", 500);
    }
};

export const findByIdAndUpdate = async (id, updateData) => {
    try {
        const user = await userModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!user) {
            throw new DatabaseError("User not found", 404);
        }
        return user;
    } catch (error) {
        throw new DatabaseError("Error updating user", 500);
    }
};

export const findByIdAndDelete = async (id) => {
    try {
        const user = await userModel.findByIdAndDelete(id);
        if (!user) {
            throw new DatabaseError("User not found", 404);
        }
        return user;
    } catch (error) {
        throw new DatabaseError("Error deleting user", 500);
    }
};