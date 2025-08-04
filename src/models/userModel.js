import crypto from "crypto";
import mongoose, { Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

export const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    format: "email",
    unique: true,
    trim: true,
    lowercase: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // Do not return password in queries
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "user", "receptionist"],
    default: "user",
  },
  phone: {
    type: String,
    required: false,
    validate(val) {
      if (!validator.isMobilePhone(val, "any", { strictMode: false })) {
        throw new Error("Phone number is invalid");
      }
    },
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now,
  },
  passwordResetToken: {
    type: String,
    select: false, 
  },
  passwordResetExpires: {
    type: Date,
    select: false, 
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  }
});

userSchema.pre("save", async function (next) {
  // This function will run if password is modified or created
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  console.log("User password hashed successfully", user.password);
  next();
});

// Middleware 
userSchema.pre("save", function (next) { 
  // Check if password is modified
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure the password changed time is before the JWT issued time
  // Sometimes the saving of the user document takes some time, so we subtract 1 second to ensure that the password changed time is before the JWT issued time
  // OR else the user will not be able to log in after changing their password
  // console.log("Password changed at:", this.passwordChangedAt);

  next();
});

// query middleware to set user inactive
// "/^find/" is a mongoose middleware that runs before any find operation
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }); // Only return active users, not equal to false
  next();
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    const user = this;
    return await bcrypt.compare(candidatePassword, user.password);
};
// userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
//     return await bcrypt.compare(candidatePassword, userPassword);
// };



userSchema.methods.hasPasswordChangedAfterTokenIssued = function (JWTTimeStamp) { 
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); // Convert to seconds

    // console.log("JWT Timestamp:", JWTTimeStamp);
    // console.log("Password Changed At:", changedTimestamp);

    return JWTTimeStamp < changedTimestamp;
  }
  return false;
}


// Password reset token generation
// Token is to be used for the user to be able to just reset their password
userSchema.methods.generatePasswordResetToken = function () { 
  const resetToken = crypto.randomBytes(64).toString("hex");
  
  // Hash the token before saving it to the database
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

  // console.log(`Password reset token generated { token: ${resetToken}, hashed: ${this.passwordResetToken} }`); 

  // return what you want to send to the user's email
  // we send the non-hashed token to the user, or else it will not be able to be used
  return resetToken;
}

export const userModel = mongoose.model("User", userSchema);
