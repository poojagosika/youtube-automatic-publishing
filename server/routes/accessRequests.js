import { Router } from "express";
import AccessRequest from "../models/AccessRequest.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// POST /api/access-requests
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (req.user.hasPublishAccess) {
      return res.status(400).json({ success: false, error: "You already have publish access" });
    }

    const existing = await AccessRequest.findOne({
      user: req.user._id,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({ success: false, error: "You already have a pending request" });
    }

    const request = await AccessRequest.create({
      user: req.user._id,
      message: message || "",
    });

    const admins = await User.find({ role: "superadmin" });
    const notifications = admins.map((admin) => ({
      user: admin._id,
      type: "access_request",
      title: "New Access Request",
      message: `${req.user.name} has requested publish access.`,
      relatedId: request._id,
    }));
    await Notification.insertMany(notifications);

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/access-requests
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = req.user.role === "superadmin" ? {} : { user: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [requests, total] = await Promise.all([
      AccessRequest.find(query)
        .populate("user", "name email avatar")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AccessRequest.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/access-requests/:id/approve
router.put("/:id/approve", requireRole("superadmin"), async (req, res) => {
  try {
    const { adminNote } = req.body;
    const request = await AccessRequest.findById(req.params.id).populate("user", "name email");

    if (!request) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ success: false, error: "Request already reviewed" });
    }

    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (adminNote) request.adminNote = adminNote;
    await request.save();

    await User.findByIdAndUpdate(request.user._id, { hasPublishAccess: true });

    await Notification.create({
      user: request.user._id,
      type: "access_approved",
      title: "Access Request Approved",
      message: "Your publish access request has been approved. You can now create auto-publish schedules.",
      relatedId: request._id,
    });

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/access-requests/:id/reject
router.put("/:id/reject", requireRole("superadmin"), async (req, res) => {
  try {
    const { adminNote } = req.body;
    const request = await AccessRequest.findById(req.params.id).populate("user", "name email");

    if (!request) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ success: false, error: "Request already reviewed" });
    }

    request.status = "rejected";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (adminNote) request.adminNote = adminNote;
    await request.save();

    await Notification.create({
      user: request.user._id,
      type: "access_rejected",
      title: "Access Request Rejected",
      message: adminNote
        ? `Your publish access request was rejected. Reason: ${adminNote}`
        : "Your publish access request was rejected.",
      relatedId: request._id,
    });

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
