import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.use(auth);
router.use(allowRoles("superadmin", "admin"));

router.get("/", getAnalytics);

export default router;
