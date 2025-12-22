import Dispatch from "../models/Dispatch.js";
import Request from "../models/Request.js";
import Material from "../models/Material.js";

// POST /dispatch
export const createDispatch = async (req, res) => {
  try {
    const {
      requestId,
      items,
      warehouse,
      vehicleNo,
      driverName,
      driverPhone,
      destinationRegion,
      assignedTo
    } = req.body;

    // requestId is optional for manual dispatches
    if (!items || !warehouse || !vehicleNo || !destinationRegion) {
      return res.status(400).json({
        message: "items, warehouse, vehicleNo, destinationRegion are required"
      });
    }

    // 🔒 Enforce Warehouse Access Logic
    if (req.user.role === "warehouse") {
      // Must fetch fresh user to get assigned warehouses
      // (assuming token only has id/role)
      const { default: User } = await import("../models/User.js"); 
      const userDoc = await User.findById(req.user.id);
      
      const assigned = userDoc.warehouses.map(id => id.toString());
      if (!assigned.includes(warehouse)) {
        return res.status(403).json({ message: "You are not authorized to dispatch from this warehouse" });
      }
    }

    // Only check request status IF requestId is provided
    if (requestId) {
        const reqData = await Request.findById(requestId);
        if (!reqData) return res.status(404).json({ message: "Request not found" });
    
        if (reqData.status !== "approved") {
          return res.status(400).json({ message: "Request is not approved yet" });
        }
    }

    // CHECK & DEDUCT STOCK
    for (const item of items) {
      const materialNameClean = item.materialName.trim();
      
      const material = await Material.findOne({
        name: new RegExp(`^${materialNameClean}$`, 'i'), // Case-sensitive exact match
        warehouse: warehouse
      });

      if (!material) {
        const similar = await Material.find({ warehouse: warehouse }).select("name");
        
        return res.status(404).json({ 
            message: `Material '${materialNameClean}' not found in selected warehouse.`,
            availableMaterials: similar.map(s => s.name)
        });
      }

      const deductQty = Number(item.quantity);
      if (material.currentStock < deductQty) {
        return res.status(400).json({ message: `Insufficient stock for ${materialNameClean}. Available: ${material.currentStock}` });
      }

      material.currentStock -= deductQty;
      await material.save();
    }

    const dispatch = await Dispatch.create({
      request: requestId,
      items,
      warehouse,
      vehicleNo,
      driverName,
      driverPhone,
      destinationRegion,
      assignedTo
    });

    // Update Request Status to Fulfilled
    if (requestId) {
        await Request.findByIdAndUpdate(requestId, { status: 'fulfilled' });
    }

    res.status(201).json({
      message: "Dispatch created successfully",
      dispatch
    });
  } catch (error) {
    console.log("Create Dispatch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /dispatches
// GET /dispatches
export const getDispatches = async (req, res) => {
  try {
    let filter = {};

    // 🔒 Fieldworker: Assigned to them or unassigned
    if (req.user.role === "fieldworker") {
      filter.$or = [
        { assignedTo: req.user.id },
        { assignedTo: null },
        { assignedTo: { $exists: false } }
      ];
    }
    
    // 🔒 Warehouse Admin: Assigned warehouses only
    if (req.user.role === "warehouse") {
        const { default: User } = await import("../models/User.js"); 
        const userDoc = await User.findById(req.user.id);
        const assigned = userDoc.warehouses || [];
        
        if (assigned.length > 0) {
             // Filter: Dispatch warehouse must be IN assigned list
             filter.warehouse = { $in: assigned };
        } else {
            // Optionally: filter.warehouse = null; // matching nothing?
            // For now, let them see everything to diagnose "disappeared" issue
        }
    }

    // 🔍 Query Params (e.g. for switching tabs in frontend)
    if (req.query.warehouse) {
       // If user is restricted, ensure query param is allowed
       if (req.user.role === "warehouse" && filter.warehouse && filter.warehouse.$in) {
           const requested = req.query.warehouse;
           const allowed = filter.warehouse.$in.map(id => id.toString());
           if (allowed.includes(requested)) {
               filter.warehouse = requested; // Narrow down
           } else {
               // Malicious attempt? Return empty
               // filter.warehouse = "000000000000000000000000"; 
           }
       } else {
           // Admin / Fieldworker (maybe fieldworker cares?)
           filter.warehouse = req.query.warehouse;
       }
    }

    const dispatches = await Dispatch.find(filter)
      .populate("request", "region requester items status")
      .populate("assignedTo", "name email")
      .populate("warehouse", "name location") // Useful to show source
      .sort({ createdAt: -1 });

    if (req.user.role === "fieldworker") {
    }

    res.json({ count: dispatches.length, dispatches });
  } catch (error) {
    console.log("Get Dispatch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /dispatch/:id/status
export const updateDispatchStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updated = await Dispatch.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Dispatch not found" });

    res.json({
      message: "Dispatch status updated",
      dispatch: updated
    });
  } catch (error) {
    console.log("Status Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
