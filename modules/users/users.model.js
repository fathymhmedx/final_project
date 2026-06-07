const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema =  mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "email is required"],
      unique: [true, 'Email must be unique'],
      index: true,

    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
    },
    bikeType: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },
    profileCompleted: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // Child reference - USER <-> PRODUCTS
    wishlist: [{
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 8);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;