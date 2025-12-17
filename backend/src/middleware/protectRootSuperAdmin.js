import User from "../models/User.js";

const protectRootSuperAdmin = async (req, res, next) => {
  const targetUserId = req.params.id;

  if (!targetUserId) return next();

  const targetUser = await User.findById(targetUserId);

  if (targetUser?.isRootSuperAdmin) {
    return res.status(403).json({
      message: "Root SuperAdmin cannot be modified"
    });
  }

  next();
};

export default protectRootSuperAdmin;
