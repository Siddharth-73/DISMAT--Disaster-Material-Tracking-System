import express from "express";
import { getStats, getLogs, submitEmergencyReport } from "../controllers/publicController.js";

const router = express.Router();

router.get("/stats", getStats);
router.get("/logs", getLogs);
router.post("/emergency-report", submitEmergencyReport);

export default router;
