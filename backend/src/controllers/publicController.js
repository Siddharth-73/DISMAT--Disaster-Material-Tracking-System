import ActivityLog from "../models/ActivityLog.js";
import EmergencyReport from "../models/EmergencyReport.js";
import Dispatch from "../models/Dispatch.js";
import Material from "../models/Material.js";
import Delivery from "../models/Delivery.js";

// GET PUBLIC STATS
export const getStats = async (req, res) => {
  try {
    const materialsReceived = await Material.countDocuments();
    const materialsDispatched = await Dispatch.countDocuments();
    const materialsDelivered = await Delivery.countDocuments();
    const peopleHelped = await Delivery.aggregate([{ $group: { _id: null, total: { $sum: "$peopleHelped" } } }]);
    
    res.json({
      materialsReceived,
      materialsDispatched,
      materialsDelivered,
      peopleHelped: peopleHelped[0]?.total || 0,
      activeZones: 3 // dynamic later
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// GET RECENT ACTIVITY LOGS
export const getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(10);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs" });
  }
};

// SUBMIT EMERGENCY REPORT
export const submitEmergencyReport = async (req, res) => {
  try {
    const report = await EmergencyReport.create(req.body);
    res.json({ message: "Emergency report submitted", id: report._id });
  } catch (error) {
    res.status(500).json({ message: "Error submitting report" });
  }
};
