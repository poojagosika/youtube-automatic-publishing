import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoName: { type: String, required: true },
    videoTitle: { type: String, required: true },
    thumbnailName: { type: String, default: "" },
    description: { type: String, default: "" },
    tags: [String],
    scheduledDate: { type: Date, default: null },

    sheetRowIndex: { type: Number, required: true },
    driveVideoFileId: { type: String, default: null },
    driveThumbnailFileId: { type: String, default: null },

    youtubeVideoId: { type: String, default: null },
    youtubeUrl: { type: String, default: null },

    status: {
      type: String,
      enum: [
        "pending",
        "downloading",
        "uploading",
        "setting_thumbnail",
        "scheduled",
        "published",
        "failed",
      ],
      default: "pending",
    },
    errorMessage: { type: String, default: null },
    retryCount: { type: Number, default: 0 },

    detectedAt: { type: Date, default: Date.now },
    downloadStartedAt: { type: Date, default: null },
    uploadStartedAt: { type: Date, default: null },
    uploadCompletedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

videoSchema.index({ status: 1 });
videoSchema.index({ scheduledDate: 1 });
videoSchema.index({ user: 1, videoTitle: 1, sheetRowIndex: 1 }, { unique: true });

export default mongoose.model("Video", videoSchema);
