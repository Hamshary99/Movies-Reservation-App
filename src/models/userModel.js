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
  token: {
    type: String,
    select: false, // Do not return token in queries
  }
});

userSchema.pre("save", async function (next) {
  // This function will run if password is modified or created
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

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

export const userModel = mongoose.model("User", userSchema);
