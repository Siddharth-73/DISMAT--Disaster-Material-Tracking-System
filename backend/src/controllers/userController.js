import User from "../models/User.js";

// GET /users/role/:role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Safety check: only allow listing certain roles to prevent leaking admin data if needed
    // But since this is protected middleware for admin/warehouse/superadmin, it should be fine.
    
    const users = await User.find({ 
      role: new RegExp(`^${role}$`, 'i'), 
      isDeleted: { $ne: true }, // Match false or missing
      status: 'active' 
    }).select("name email _id");

    res.json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
