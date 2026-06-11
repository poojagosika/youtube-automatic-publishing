import { Router } from "express";
import User from "../models/User.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.use(requireRole("superadmin"));

// GET /api/users/stats
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, admins, withAccess] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "superadmin" }),
      User.countDocuments({ hasPublishAccess: true }),
    ]);

    res.json({
      success: true,
      data: { totalUsers, admins, usersWithAccess: withAccess, regularUsers: totalUsers - admins },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/role
router.put("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["superadmin", "user"].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/publish-access
router.put("/:id/publish-access", async (req, res) => {
  try {
    const { hasPublishAccess } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { hasPublishAccess },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
