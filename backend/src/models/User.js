import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    // ACTUAL granted role
    role: {
      type: String,
      enum: [
        "superadmin",
        "admin",
        "warehouse",
        "ngo",
        "fieldworker",
        "public"
      ],
      default: "public"
    },

    // Role requested during signup
    requestedRole: {
      type: String,
      enum: ["admin", "warehouse", "ngo", "fieldworker"],
      default: null
    },

    // Approval & access control
    status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending"
    },

    // Root superadmin protection
    isRootSuperAdmin: {
      type: Boolean,
      default: false
    },

    // Soft delete support
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
