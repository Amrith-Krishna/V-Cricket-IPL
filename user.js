import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  points: { type: Number, default: 0 },
  loginCount: { type: Number, default: 0 }, // New field for login count
  lastLogin: { type: Date }, // New field for last login time
  accuracy: { type: Number, default: 0.0 },
});

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

export const User = mongoose.model("User", userSchema);
