import Delivery from "../models/Delivery.js";
import Dispatch from "../models/Dispatch.js";
import multer from "multer";

export const confirmDelivery = async (req, res) => {
  try {
    const { dispatchId, peopleHelped } = req.body;

    if (!dispatchId || !peopleHelped) {
      return res.status(400).json({ message: "dispatchId and peopleHelped are required" });
    }

    const dispatch = await Dispatch.findById(dispatchId);
    if (!dispatch) return res.status(404).json({ message: "Dispatch not found" });

    // Ensure fieldworker owns this dispatch OR claim it if unassigned
    if (dispatch.assignedTo && dispatch.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your dispatch to confirm" });
    }
    
    // Auto-assign if not assigned
    if (!dispatch.assignedTo) {
        dispatch.assignedTo = req.user.id;
    }

    // Handle uploaded files
    const proof = req.files?.proofImage?.[0]?.filename;
    const signature = req.files?.signature?.[0]?.filename;

    const delivery = await Delivery.create({
      dispatch: dispatchId,
      deliveredBy: req.user.id,
      peopleHelped,
      proofImage: proof,
      signature
    });

    // Update dispatch status
    dispatch.status = "completed";
    await dispatch.save();

    res.status(201).json({
      message: "Delivery confirmed",
      delivery
    });
  } catch (error) {
    console.log("Delivery Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
