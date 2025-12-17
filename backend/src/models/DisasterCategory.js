import mongoose from "mongoose";

const disasterCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    code: {
      type: String,
      required: true,
      unique: true
      // e.g. FLOOD, EQ, CYCLONE
    },

    color: {
      type: String,
      default: "#ff0000"
      // used later on map
    },

    icon: {
      type: String,
      default: "⚠️"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    source: {
      type: String,
      enum: ["system", "manual"],
      default: "system"
    }
  },
  { timestamps: true }
);

const DisasterCategory = mongoose.model(
  "DisasterCategory",
  disasterCategorySchema
);

export default DisasterCategory;
