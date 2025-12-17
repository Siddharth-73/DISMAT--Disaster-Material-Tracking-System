import DisasterZone from "../models/DisasterZone.js";
import DisasterCategory from "../models/DisasterCategory.js";
import { isInsideIndia } from "../utils/geoUtils.js";

export const normalizeEONETEvent = async (event) => {


  if (!event.geometry || event.geometry.length === 0) return;

  const latest = event.geometry[event.geometry.length - 1];
  const [lng, lat] = latest.coordinates;

  if (!isInsideIndia(lat, lng)) return;

  const categoryName = event.categories[0]?.title || "Other";
  const category = await DisasterCategory.findOne({
    name: new RegExp(categoryName, "i"),
  });

  if (!category) return;

  await DisasterZone.findOneAndUpdate(
    { externalId: event.id, source: "api:eonet" },
    {
      name: event.title,
      category: category._id,
      geometryType: "circle",
      center: { lat, lng },
      radiusKm: 50,
      severity: "medium",
      source: "api:eonet",
      description: event.description || "",
      isActive: true,
    },
    { upsert: true, new: true }
  );
};
