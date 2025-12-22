import express from "express";
import { getStats, submitEmergencyReport } from "../controllers/publicController.js";

const router = express.Router();

router.get("/stats", getStats);
router.post("/emergency-report", submitEmergencyReport);

export default router;
