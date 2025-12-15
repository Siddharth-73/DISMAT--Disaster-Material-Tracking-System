import mongoose from "mongoose";

const dispatchItemSchema = new mongoose.Schema(
  {
    materialName: { type: String, required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false }
);

const dispatchSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true
    },

    items: [dispatchItemSchema],

    warehouse: { type: String, required: true },

    vehicleNo: { type: String, required: true },
    driverName: { type: String },
    driverPhone: { type: String },

    destinationRegion: { type: String, required: true },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" // fieldworker who will receive it
    },

    status: {
      type: String,
      enum: [
        "pending",
        "packed",
        "in_transit",
        "delivered_to_hub",
        "awaiting_fieldworker",
        "completed"
      ],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Dispatch", dispatchSchema);
