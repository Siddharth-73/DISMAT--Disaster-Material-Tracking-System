import User from "../models/User.js";

/**
 * 1️⃣ Get pending signup requests
 */
export const getPendingUsers = async (req, res) => {
  const users = await User.find({
    status: "pending",
    isDeleted: false
  }).select("-password");

  res.json(users);
};

/**
 * 2️⃣ Approve user signup
 */
export const approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.isDeleted) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.requestedRole) {
    return res.status(400).json({ message: "No role requested" });
  }

  user.role = user.requestedRole;
  user.status = "active";
  user.requestedRole = null;

  await user.save();

  res.json({ message: "User approved", user });
};

/**
 * 3️⃣ Reject signup (soft delete)
 */
export const rejectUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.status = "blocked";
  user.isDeleted = true;

  await user.save();

  res.json({ message: "User rejected and blocked" });
};

/**
 * 4️⃣ Get all users
 */
export const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
};

/**
 * 5️⃣ Block user
 */
export const blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.status = "blocked";
  await user.save();

  res.json({ message: "User blocked" });
};

/**
 * 6️⃣ Unblock user
 */
export const unblockUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.status = "active";
  await user.save();

  res.json({ message: "User unblocked" });
};

/**
 * 7️⃣ Update user role
 */
export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  const allowedRoles = [
    "admin",
    "warehouse",
    "ngo",
    "fieldworker"
  ];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = role;
  user.status = "active";

  await user.save();

  res.json({ message: "User role updated", user });
};



/**
 * 8️⃣ Assign warehouses to user
 */
export const assignWarehouses = async (req, res) => {
  try {
    const { warehouses } = req.body; // Array of Warehouse IDs

    if (!Array.isArray(warehouses)) {
      return res.status(400).json({ message: "Warehouses must be an array" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure user has warehouse role (optional strictly, but good practice)
    if (user.role !== "warehouse" && user.role !== "admin") {
      // Allow admin to theoretically oversee specific warehouses too?
      // For now, let's just warn or allow it. User asked for "Warehouse Admins are assigned"
    }

    user.warehouses = warehouses;
    await user.save();

    res.json({ message: "Warehouses assigned successfully", user });
  } catch (error) {
    console.error("Assign Warehouse Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
