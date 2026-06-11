import { Router } from "express";
import User from "../models/User.js";
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
  authenticate,
} from "../middleware/auth.js";
import {
  getAuthUrl,
  getTokensForUser,
  isUserAuthenticated,
  disconnectUserAccount,
} from "../config/google.js";
import { startScheduler } from "../services/scheduler.js";

const router = Router();

// ─── User Auth ──────────────────────────────────────────────

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "superadmin" : "user";
    const hasPublishAccess = userCount === 0;

    const user = await User.create({ name, email, password, role, hasPublishAccess });
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: "Logged out" });
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// PUT /api/auth/profile
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password -googleTokens");
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Per-user Google OAuth ──────────────────────────────────

// GET /api/auth/google — Get OAuth URL for the logged-in user
router.get("/google", authenticate, (req, res) => {
  const url = getAuthUrl(req.user._id);
  res.json({ url });
});

// GET /api/auth/google/callback — Handle OAuth callback (state = userId)
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state: userId } = req.query;
    if (!code || !userId) {
      return res.status(400).json({ success: false, error: "Missing code or user state" });
    }

    await getTokensForUser(code, userId);

    // Start scheduler if not already running
    if (!req.app.get("schedulerStarted")) {
      startScheduler();
      req.app.set("schedulerStarted", true);
    }

    res.redirect(`${process.env.CLIENT_URL}/app/settings?auth=success`);
  } catch (error) {
    res.redirect(
      `${process.env.CLIENT_URL}/app/settings?auth=error&message=${encodeURIComponent(error.message)}`
    );
  }
});

// GET /api/auth/google/status — Check if current user has Google connected
router.get("/google/status", authenticate, async (req, res) => {
  const authenticated = await isUserAuthenticated(req.user._id);
  res.json({ authenticated });
});

// POST /api/auth/google/disconnect — Disconnect current user's Google
router.post("/google/disconnect", authenticate, async (req, res) => {
  try {
    await disconnectUserAccount(req.user._id);
    res.json({ success: true, message: "Google account disconnected" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/auth/google/config — Save user's Google resource IDs
router.put("/google/config", authenticate, async (req, res) => {
  try {
    const { driveFolderId, thumbnailsFolderId, sheetId, sheetName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        "googleConfig.driveFolderId": driveFolderId || "",
        "googleConfig.thumbnailsFolderId": thumbnailsFolderId || "",
        "googleConfig.sheetId": sheetId || "",
        "googleConfig.sheetName": sheetName || "Sheet1",
      },
      { new: true }
    ).select("-password -googleTokens");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
