const mongoose = require("mongoose");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  // pre runs before document is saved
  if (this.isModified("password")) {
    //this refers to the document
    try {
      this.password = await argon2.hash(this.password);
    } catch (error) {
      return next(error); // jumps to error handling middleware if there is error
    }
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  // methods adds a function that runs on the document
  try {
    return await argon2.verify(this.password, candidatePassword); // true if password matches false otherwise
  } catch (error) {
    throw error;
  }
};

userSchema.index({ username: "text" });

const User = mongoose.model("User", userSchema);
module.exports = User;
