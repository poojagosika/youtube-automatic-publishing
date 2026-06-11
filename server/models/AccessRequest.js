import mongoose from "mongoose";

const accessRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["publish_access"],
      default: "publish_access",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    message: { type: String, default: "" },
    adminNote: { type: String, default: "" },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

accessRequestSchema.index({ user: 1, status: 1 });
accessRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("AccessRequest", accessRequestSchema);
