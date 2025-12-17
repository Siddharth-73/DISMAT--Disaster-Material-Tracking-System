import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import {
  createZone,
  getPublicZones,
  toggleZone
} from "../controllers/disasterZoneController.js";

const router = express.Router();

// Public
router.get("/public", getPublicZones);

// SuperAdmin
router.post("/", auth, allowRoles("superadmin"), createZone);
router.patch("/toggle/:id", auth, allowRoles("superadmin"), toggleZone);

export default router;
