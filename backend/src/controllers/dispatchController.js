import Dispatch from "../models/Dispatch.js";
import Request from "../models/Request.js";

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

    if (!requestId || !items || !warehouse || !vehicleNo || !destinationRegion) {
      return res.status(400).json({
        message: "requestId, items, warehouse, vehicleNo, destinationRegion are required"
      });
    }

    // Ensure request exists & is approved
    const reqData = await Request.findById(requestId);
    if (!reqData) return res.status(404).json({ message: "Request not found" });

    if (reqData.status !== "approved") {
      return res.status(400).json({ message: "Request is not approved yet" });
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
export const getDispatches = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "fieldworker") {
      filter.assignedTo = req.user.id;
    }

    const dispatches = await Dispatch.find(filter)
      .populate("request", "region requester items status")
      .populate("assignedTo", "name email");

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
