import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { logReceipt, getStock } from "../controllers/materialController.js";

const router = express.Router();

// All material routes require auth
router.use(auth);

// Receipt logging → only admin + warehouse
router.post(
  "/receipt",
  allowRoles("admin", "warehouse"),
  logReceipt
);

// Stock listing → all internal users
router.get(
  "/stock",
  allowRoles("admin", "warehouse", "ngo", "fieldworker"),
  getStock
);

export default router;
