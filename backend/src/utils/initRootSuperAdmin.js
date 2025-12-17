import bcrypt from "bcryptjs";
import User from "../models/User.js";

const initRootSuperAdmin = async () => {
  try {
    const email = process.env.ROOT_SUPERADMIN_EMAIL;
    const password = process.env.ROOT_SUPERADMIN_PASSWORD;

    if (!email || !password) {
      console.warn("⚠️ Root SuperAdmin env vars not set");
      return;
    }

    const existingRoot = await User.findOne({
      email,
      isRootSuperAdmin: true
    });

    if (existingRoot) {
      console.log("✅ Root SuperAdmin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: "Root SuperAdmin",
      email,
      password: hashedPassword,
      role: "superadmin",
      status: "active",
      isRootSuperAdmin: true
    });

    console.log("🚀 Root SuperAdmin created successfully");

  } catch (error) {
    console.error("❌ Failed to create Root SuperAdmin:", error);
  }
};

export default initRootSuperAdmin;
