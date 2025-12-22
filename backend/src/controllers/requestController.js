import Request from "../models/Request.js";
import EmergencyReport from "../models/EmergencyReport.js";

// POST /requests (NGO or Fieldworker)
export const createRequest = async (req, res) => {
  try {
    const { items, region, remarks } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    if (!region) {
      return res.status(400).json({ message: "Region is required" });
    }

    const request = await Request.create({
      requester: req.user.id,
      role: req.user.role,
      items,
      region,
      remarks
    });

    res.status(201).json({
      message: "Request submitted successfully",
      request
    });
  } catch (error) {
    console.log("Create Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /requests (Admin can see all, NGO sees own)
export const getRequests = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "ngo" || req.user.role === "fieldworker") {
      filter.requester = req.user.id;
    }

    const requests = await Request.find(filter)
      .populate("requester", "name email role")
      .populate("approvedBy", "name email");

    res.json({ count: requests.length, requests });
  } catch (error) {
    console.log("Get Requests Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /requests/:id/approve
export const approveRequest = async (req, res) => {
  try {
    const reqId = req.params.id;

    const updated = await Request.findByIdAndUpdate(
      reqId,
      {
        status: "approved",
        approvedBy: req.user.id
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      message: "Request approved",
      request: updated
    });
  } catch (error) {
    console.log("Approve Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /requests/:id/reject
export const rejectRequest = async (req, res) => {
  try {
    const reqId = req.params.id;

    const updated = await Request.findByIdAndUpdate(
      reqId,
      {
        status: "rejected",
        approvedBy: req.user.id
      },
      { new: true }
    );

    res.json({
      message: "Request rejected",
      request: updated
    });
  } catch (error) {
    console.log("Reject Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /requests/emergency (Public Reports)
export const getEmergencyReports = async (req, res) => {
  try {
    const reports = await EmergencyReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error("Get Emergency Reports Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
