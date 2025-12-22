import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailService.js";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email, isDeleted: false });
    if (existingUser) {
      return res.status(409).json({ message: "Email already used" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "public",
      requestedRole: role,
      status: "pending",
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send Verification Email
    try {
        await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // We still allow signup, but let user know? Or fail? 
        // Best practice: cleanup user or allow resend. For now, allow but log.
    }

    res.status(201).json({
      message: "Signup successful. Please verify your email.",
      userId: user._id
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // CHECK EMAIL VERIFICATION
    if (!user.emailVerified && !user.isRootSuperAdmin) {
        return res.status(403).json({ message: "Please verify your email first." });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked. Contact support."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        status: user.status,
        isRootSuperAdmin: user.isRootSuperAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name, // Explicitly from DB
        role: user.role,
        status: user.status,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if(!token) return res.status(400).json({message: "Token is required"});

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email, isDeleted: false });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (!user.emailVerified) {
             return res.status(403).json({ message: "Email not verified. Cannot reset password." });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        await sendPasswordResetEmail(email, resetToken);

        res.json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful. Please login." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
