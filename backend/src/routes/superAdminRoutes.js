import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import protectRootSuperAdmin from "../middleware/protectRootSuperAdmin.js";

import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  blockUser,
  unblockUser,
  updateUserRole,
  assignWarehouses
} from "../controllers/superAdminController.js";

const router = express.Router();

// All superadmin routes
router.use(auth);
router.use(allowRoles("superadmin"));

router.get("/pending-users", getPendingUsers);
router.get("/users", getAllUsers);


router.patch("/approve/:id", protectRootSuperAdmin, approveUser);
router.patch("/reject/:id", protectRootSuperAdmin, rejectUser);

router.patch("/block/:id", protectRootSuperAdmin, blockUser);
router.patch("/unblock/:id", protectRootSuperAdmin, unblockUser);

router.patch("/role/:id", protectRootSuperAdmin, updateUserRole);
router.patch("/assign-warehouses/:id", protectRootSuperAdmin, assignWarehouses);

export default router;
