import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import {
  createZone,
  getPublicZones,
  getAllZones,
  toggleZone,
  updateZone,
  deleteZone
} from "../controllers/disasterZoneController.js";

const router = express.Router();

// Public
router.get("/public", getPublicZones);

// SuperAdmin
router.get("/", auth, allowRoles("superadmin"), getAllZones);
router.post("/", auth, allowRoles("superadmin"), createZone);
router.patch("/toggle/:id", auth, allowRoles("superadmin"), toggleZone);
router.patch("/:id", auth, allowRoles("superadmin"), updateZone);
router.delete("/:id", auth, allowRoles("superadmin"), deleteZone);

export default router;
