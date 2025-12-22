import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  getCategories,
  toggleCategory,
  createCategory,
  deleteCategory
} from "../controllers/disasterCategoryController.js";

const router = express.Router();

router.use(auth);
router.use(allowRoles("superadmin"));

router.get("/", getCategories);
router.post("/", createCategory);
router.patch("/toggle/:id", toggleCategory);
router.delete("/:id", deleteCategory);

export default router;
