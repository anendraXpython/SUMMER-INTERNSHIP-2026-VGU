const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "email is not valid"],
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["buyer", "agent"],
    default: "buyer",
  },
  // plan is only meaningful when role === "agent". Buyers just carry the
  // default and it's ignored everywhere else in the app.
  plan: {
    type: String,
    enum: ["basic", "pro", "premium"],
    default: "basic",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
