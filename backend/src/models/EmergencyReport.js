import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema(
  {
    name: String,
    contact: String,
    location: String,
    description: String
  },
  { timestamps: true }
);

export default mongoose.model("EmergencyReport", emergencySchema);
