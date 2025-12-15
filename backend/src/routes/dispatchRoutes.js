import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import {
  createDispatch,
  getDispatches,
  updateDispatchStatus
} from "../controllers/dispatchController.js";

const router = express.Router();

router.use(auth);

// Create dispatch → only warehouse
router.post(
  "/",
  allowRoles("warehouse", "admin"),
  createDispatch
);

// List dispatches
router.get(
  "/",
  allowRoles("admin", "warehouse", "ngo", "fieldworker"),
  getDispatches
);

// Update status → warehouse or fieldworker
router.patch(
  "/:id/status",
  allowRoles("warehouse", "fieldworker", "admin"),
  updateDispatchStatus
);

export default router;
