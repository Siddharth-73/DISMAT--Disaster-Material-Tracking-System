import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { confirmDelivery } from "../controllers/deliveryController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(auth);

// Fieldworker confirms delivery
router.post(
  "/confirm",
  allowRoles("fieldworker"),
  upload.fields([
    { name: "proofImage", maxCount: 1 },
    { name: "signature", maxCount: 1 }
  ]),
  confirmDelivery
);
router.post(
  "/debug",
  upload.fields([
    { name: "proofImage", maxCount: 1 },
    { name: "signature", maxCount: 1 }
  ]),
  (req, res) => {
    return res.json({
      body: req.body,
      files: req.files
    });
  }
);


export default router;
