import Request from "../models/Request.js";
import Dispatch from "../models/Dispatch.js";
import Material from "../models/Material.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res) => {
  try {
    // 1. Request Status Distribution
    const requestStats = await Request.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 2. Dispatch Status Distribution
    const dispatchStats = await Dispatch.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 3. User Role Distribution
    const userStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // 4. Request Trends (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const requestTrends = await Request.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 5. Stock Value (Total Items) per Warehouse
    // Needs lookup since Material refs Warehouse ObjectId
    const stockStats = await Material.aggregate([
      {
        $group: {
          _id: "$warehouse",
          totalStock: { $sum: "$currentStock" }
        }
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "_id",
          foreignField: "_id",
          as: "warehouseInfo"
        }
      },
      {
        $project: {
          name: { 
            $ifNull: [
              { $arrayElemAt: ["$warehouseInfo.name", 0] }, 
              "Unknown Warehouse" 
            ] 
          },
          totalStock: 1
        }
      }
    ]);

    res.json({
      requestStats,
      dispatchStats,
      userStats,
      requestTrends,
      stockStats
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
