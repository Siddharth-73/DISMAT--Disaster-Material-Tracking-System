import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  createWarehouse,
  getWarehouses,
  toggleWarehouseStatus
} from "../controllers/warehouseController.js";

const router = express.Router();

router.use(auth);
router.use(allowRoles("superadmin")); 

router.post("/", createWarehouse);
router.get("/", getWarehouses);
router.patch("/toggle/:id", toggleWarehouseStatus);

export default router;
