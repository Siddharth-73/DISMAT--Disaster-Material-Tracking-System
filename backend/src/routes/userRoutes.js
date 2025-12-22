import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { getUsersByRole } from "../controllers/userController.js";

const router = express.Router();

router.use(auth);

// Allow Admin, Warehouse, Superadmin, NGO to fetch user lists (e.g. for assignment)
// Restricting Public or Fieldworker (unless they need it)
router.get("/role/:role", allowRoles("superadmin", "admin", "warehouse", "ngo"), getUsersByRole);

export default router;
