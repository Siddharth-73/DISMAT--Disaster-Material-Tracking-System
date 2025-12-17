import DisasterZone from "../models/DisasterZone.js";

export const expireDisasterZones = async () => {
  const now = new Date();

  await DisasterZone.updateMany(
    {
      source: "api:usgs",
      createdAt: { $lt: new Date(now - 24 * 60 * 60 * 1000) },
    },
    { isActive: false }
  );

  await DisasterZone.updateMany(
    {
      source: "api:eonet",
      createdAt: { $lt: new Date(now - 7 * 24 * 60 * 60 * 1000) },
    },
    { isActive: false }
  );

  console.log("🧹 Old disaster zones expired");
};
