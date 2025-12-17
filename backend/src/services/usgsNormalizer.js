import DisasterZone from "../models/DisasterZone.js";
import DisasterCategory from "../models/DisasterCategory.js";

export async function normalizeUSGSQuake(quake) {
  const lat = quake.geometry.coordinates[1];
  const lng = quake.geometry.coordinates[0];
  const magnitude = quake.properties.mag || 0;

  // 🔹 Determine severity
  let severity = "low";
  if (magnitude >= 6) severity = "critical";
  else if (magnitude >= 5) severity = "high";
  else if (magnitude >= 4) severity = "medium";

  // 🔹 Fetch Earthquake category ONCE
  const category = await DisasterCategory.findOne({
    name: /earthquake/i,
  });

  if (!category) {
    console.warn("⚠️ Earthquake category not found, skipping quake");
    return;
  }

  await DisasterZone.findOneAndUpdate(
    { externalId: quake.id, source: "api:usgs" },
    {
      $set: {
        name: quake.properties.title,
        category: category._id,
        geometryType: "circle",
        center: { lat, lng },
        radiusKm: magnitude * 10,
        severity,
        source: "api:usgs",
        description: `Magnitude ${magnitude}`,
        isActive: true,
      },
      // 🔥 CRITICAL: remove polygon for circles
      $unset: {
        polygon: "",
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}
