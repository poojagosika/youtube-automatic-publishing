import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["superadmin", "user"],
      default: "user",
    },
    hasPublishAccess: { type: Boolean, default: false },
    avatar: { type: String, default: null },
    lastLogin: { type: Date, default: null },

    // Per-user Google integration
    googleTokens: { type: mongoose.Schema.Types.Mixed, default: null },
    googleConnected: { type: Boolean, default: false },
    googleConfig: {
      driveFolderId: { type: String, default: "" },
      thumbnailsFolderId: { type: String, default: "" },
      sheetId: { type: String, default: "" },
      sheetName: { type: String, default: "Sheet1" },
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleTokens;
  return obj;
};

export default mongoose.model("User", userSchema);
