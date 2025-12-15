import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: String,
    user: String,
    details: Object
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
