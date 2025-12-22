import mongoose from "mongoose";

const requestItemSchema = new mongoose.Schema(
  {
    materialName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    role: {
      type: String,
      enum: ["ngo", "fieldworker"],
      required: true
    },

    items: [requestItemSchema],

    region: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "fulfilled"],
      default: "pending"
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    remarks: String
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);
