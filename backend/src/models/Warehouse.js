import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    address: {
      type: String,
      required: true
    },

    location: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },

    capacity: {
      type: Number,
      required: true // max storage capacity
    },

    isActive: {
      type: Boolean,
      default: true
    },

    // later used to associate with disaster zones
    linkedDisasterZones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DisasterZone"
      }
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const Warehouse = mongoose.model("Warehouse", warehouseSchema);
export default Warehouse;
