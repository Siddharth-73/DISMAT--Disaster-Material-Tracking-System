import DisasterZone from "../models/DisasterZone.js";

// CREATE zone (SuperAdmin)
export const createZone = async (req, res) => {
  try {
    const {
      name,
      category,
      severity,
      geometryType,
      polygon,
      center,
      radiusKm,
      description,
      source,
    } = req.body;

    if (!name || !category || !geometryType) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const zoneData = {
      name,
      category,
      severity,
      geometryType,
      description,
      source,
      country: "India", // 🔒 enforced
    };

    if (geometryType === "polygon") {
      if (!polygon || !polygon.coordinates) {
        return res.status(400).json({ message: "Polygon coordinates required" });
      }

      zoneData.polygon = {
        type: "Polygon",
        coordinates: polygon.coordinates,
      };
    }

    if (geometryType === "circle") {
      if (!center || !radiusKm) {
        return res.status(400).json({ message: "Center and radius required" });
      }

      zoneData.center = center;
      zoneData.radiusKm = radiusKm;
    }

    const zone = await DisasterZone.create(zoneData);

    return res.status(201).json({
      zone,
    });
  } catch (error) {
    console.error("Create zone error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET all zones (SuperAdmin) - includes inactive
export const getAllZones = async (req, res) => {
  try {
    const zones = await DisasterZone.find({}).populate("category", "name color icon");
    return res.json(zones);
  } catch (error) {
    console.error("Fetch all zones error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET public zones (India only)
export const getPublicZones = async (req, res) => {
  try {
    const zones = await DisasterZone.find({
      isActive: true,
      country: "India",
    }).populate("category", "name color icon");

    return res.json(zones);
  } catch (error) {
    console.error("Fetch public zones error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// TOGGLE zone (SuperAdmin)
export const toggleZone = async (req, res) => {
  try {
    const zone = await DisasterZone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    zone.isActive = !zone.isActive;
    await zone.save();

    return res.json({
      message: "Zone status updated",
      isActive: zone.isActive,
    });
  } catch (error) {
    console.error("Toggle zone error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// UPDATE zone (SuperAdmin)
export const updateZone = async (req, res) => {
  try {
    const { name, severity, description, isActive } = req.body;
    const zone = await DisasterZone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    if (name) zone.name = name;
    if (severity) zone.severity = severity;
    if (description) zone.description = description;
    if (typeof isActive === "boolean") zone.isActive = isActive;
    
    // Manual geometry updates
    if (zone.source === "manual") {
      if (req.body.center && req.body.radiusKm) {
        zone.center = req.body.center;
        zone.radiusKm = req.body.radiusKm;
        zone.geometryType = "circle";
      }
      if (req.body.polygon) {
        zone.polygon = { type: "Polygon", coordinates: req.body.polygon.coordinates };
        zone.geometryType = "polygon";
      }
    }

    await zone.save();
    return res.json({ message: "Zone updated", zone });
  } catch (error) {
    console.error("Update zone error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE zone (SuperAdmin)
export const deleteZone = async (req, res) => {
  try {
    const zone = await DisasterZone.findById(req.params.id);
    if (!zone) return res.status(404).json({ message: "Zone not found" });

    await zone.deleteOne();
    return res.json({ message: "Zone deleted" });
  } catch (error) {
    console.error("Delete zone error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
