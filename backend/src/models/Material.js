import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    quantity: { type: Number, required: true, min: 1 },
    source: { type: String },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    remarks: { type: String },
    receivedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String },
    unit: { type: String, default: "units" },
    warehouse: { type: String, required: true },

    totalReceived: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    lastReceiptAt: { type: Date },

    receipts: [receiptSchema]
  },
  { timestamps: true }
);

materialSchema.index({ name: 1, warehouse: 1 }, { unique: true });

export default mongoose.model("Material", materialSchema);
