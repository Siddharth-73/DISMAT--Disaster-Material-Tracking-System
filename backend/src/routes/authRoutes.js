import express from "express";
import { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword } from "../controllers/authController.js";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Register/Login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Verification & Password Reset
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/protected", auth, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

router.get("/admin-only", auth, allowRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin, you have access!" });
});

export default router;
