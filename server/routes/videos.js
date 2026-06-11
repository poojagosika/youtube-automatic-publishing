import { Router } from "express";
import Video from "../models/Video.js";
import User from "../models/User.js";
import { processVideo } from "../services/processingService.js";
import { pollAndProcess } from "../services/scheduler.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// GET /api/videos — scoped to current user (admin sees all)
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = req.user.role === "superadmin" ? {} : { user: req.user._id };
    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Video.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: videos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/videos/stats
router.get("/stats", async (req, res) => {
  try {
    const match = req.user.role === "superadmin" ? {} : { user: req.user._id };
    const stats = await Video.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const result = {
      pending: 0,
      downloading: 0,
      uploading: 0,
      setting_thumbnail: 0,
      scheduled: 0,
      published: 0,
      failed: 0,
    };

    stats.forEach((s) => {
      result[s._id] = s.count;
    });

    result.processing =
      result.downloading + result.uploading + result.setting_thumbnail;

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/videos/:id
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/videos/:id/trigger
router.post("/:id/trigger", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    if (!["pending", "failed"].includes(video.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot trigger video with status "${video.status}"`,
      });
    }

    video.status = "pending";
    video.errorMessage = null;
    await video.save();

    const userDoc = await User.findById(video.user);
    processVideo(video, userDoc).catch((err) => {
      console.error(`Manual trigger failed for ${video._id}:`, err.message);
    });

    res.json({ success: true, message: "Processing started", data: video });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/videos/:id/retry
router.post("/:id/retry", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    if (video.status !== "failed") {
      return res.status(400).json({
        success: false,
        error: "Only failed videos can be retried",
      });
    }

    video.status = "pending";
    video.errorMessage = null;
    await video.save();

    const userDoc = await User.findById(video.user);
    processVideo(video, userDoc).catch((err) => {
      console.error(`Retry failed for ${video._id}:`, err.message);
    });

    res.json({ success: true, message: "Retry started", data: video });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/videos/poll
router.post("/poll", async (req, res) => {
  try {
    pollAndProcess().catch((err) => {
      console.error("Manual poll failed:", err.message);
    });

    res.json({ success: true, message: "Poll cycle started" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
