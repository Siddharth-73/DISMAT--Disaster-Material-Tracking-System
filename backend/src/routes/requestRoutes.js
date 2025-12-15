import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest
} from "../controllers/requestController.js";

const router = express.Router();

router.use(auth);

// Create a request → NGO or Fieldworker
router.post(
  "/",
  allowRoles("ngo", "fieldworker"),
  createRequest
);

// List requests
router.get(
  "/",
  allowRoles("admin", "warehouse", "ngo", "fieldworker"),
  getRequests
);

// Approve or Reject → admin only
router.patch(
  "/:id/approve",
  allowRoles("admin"),
  approveRequest
);

router.patch(
  "/:id/reject",
  allowRoles("admin"),
  rejectRequest
);

export default router;
