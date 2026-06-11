import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    default: null,
  },
  level: { type: String, enum: ["info", "warn", "error"], default: "info" },
  message: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
});

logSchema.index({ videoId: 1 });
logSchema.index({ createdAt: -1 });

export default mongoose.model("Log", logSchema);
