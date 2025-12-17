import mongoose from "mongoose";

const disasterZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisasterCategory",
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    geometryType: {
      type: String,
      enum: ["polygon", "circle"],
      required: true,
    },

    // 🟦 POLYGON (GeoJSON) — ONLY for geometryType === "polygon"
    polygon: {
      type: {
        type: String,
        enum: ["Polygon"],
      },
      coordinates: {
        type: [[[Number]]], // [ [ [lng, lat] ] ]
      },
    },

    // 🔵 CIRCLE
    center: {
      lat: Number,
      lng: Number,
    },
    radiusKm: Number,

    country: {
      type: String,
      default: "India",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    externalId: {
      type: String,
      index: true,
    },

    source: {
      type: String,
      enum: ["manual", "api:eonet", "api:usgs"],
      default: "manual",
    },

    description: String,
  },
  {
    timestamps: true,
    minimize: true, // ⭐ THIS is the key
  }
);

// Only index polygon for real polygons
disasterZoneSchema.index(
  { polygon: "2dsphere" },
  { partialFilterExpression: { geometryType: "polygon" } }
);

export default mongoose.model("DisasterZone", disasterZoneSchema);
