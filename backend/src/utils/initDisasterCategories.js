import DisasterCategory from "../models/DisasterCategory.js";

const defaultCategories = [
  {
    name: "Flood",
    code: "FLOOD",
    color: "#1e90ff",
    icon: "🌊"
  },
  {
    name: "Earthquake",
    code: "EARTHQUAKE",
    color: "#8b4513",
    icon: "🌍"
  },
  {
    name: "Cyclone",
    code: "CYCLONE",
    color: "#9932cc",
    icon: "🌀"
  },
  {
    name: "Wildfire",
    code: "WILDFIRE",
    color: "#ff4500",
    icon: "🔥"
  },
  {
    name: "Landslide",
    code: "LANDSLIDE",
    color: "#556b2f",
    icon: "⛰️"
  }
];

const initDisasterCategories = async () => {
  for (const cat of defaultCategories) {
    const exists = await DisasterCategory.findOne({ code: cat.code });
    if (!exists) {
      await DisasterCategory.create({
        ...cat,
        source: "system"
      });
      console.log(`🌐 Disaster category created: ${cat.name}`);
    }
  }
};

export default initDisasterCategories;
