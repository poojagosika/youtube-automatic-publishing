import { Router } from "express";
import Log from "../models/Log.js";

const router = Router();

// GET /api/logs
router.get("/", async (req, res) => {
  try {
    const { videoId, level, page = 1, limit = 50 } = req.query;
    const query = {};

    if (videoId) query.videoId = videoId;
    if (level) query.level = level;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      Log.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Log.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
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

export default router;
