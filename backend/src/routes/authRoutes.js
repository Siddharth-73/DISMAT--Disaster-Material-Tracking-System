import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";




const router = express.Router();

// Register Route
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/protected", auth, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

router.get("/admin-only", auth, allowRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin, you have access!" });
});


export default router;
