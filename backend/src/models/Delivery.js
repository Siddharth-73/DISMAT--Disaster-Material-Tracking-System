import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    dispatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dispatch",
      required: true
    },

    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    peopleHelped: {
      type: Number,
      required: true,
      min: 1
    },

    proofImage: {
      type: String // URL or filename
    },

    signature: {
      type: String // URL or filename
    },

    deliveredAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Delivery", deliverySchema);
