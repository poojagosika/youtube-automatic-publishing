import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { startScheduler } from "./services/scheduler.js";

import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/videos.js";
import logRoutes from "./routes/logs.js";
import accessRequestRoutes from "./routes/accessRequests.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/access-requests", accessRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const clientDist = join(__dirname, "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// Start server
const start = async () => {
  await connectDB();

  // Start the scheduler — it will poll all connected users' sheets
  startScheduler();
  app.set("schedulerStarted", true);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
