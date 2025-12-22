import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  createWarehouse,
  getWarehouses,
  toggleWarehouseStatus,
  updateWarehouse,
  deleteWarehouse
} from "../controllers/warehouseController.js";

const router = express.Router();

router.use(auth);
// Public-ish (Authenticated) - View Warehouses
router.get("/", allowRoles("superadmin", "admin", "warehouse", "ngo", "fieldworker"), getWarehouses);

// SuperAdmin Only - Manage Warehouses
router.post("/", allowRoles("superadmin"), createWarehouse);
router.patch("/toggle/:id", allowRoles("superadmin"), toggleWarehouseStatus);
router.patch("/:id", allowRoles("superadmin"), updateWarehouse);
router.delete("/:id", allowRoles("superadmin"), deleteWarehouse);

export default router;
