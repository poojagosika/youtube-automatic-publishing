import fs from "fs";
import Video from "../models/Video.js";
import Log from "../models/Log.js";
import { getUserOAuth2Client } from "../config/google.js";
import { findFileByName, downloadFile } from "./driveService.js";
import { uploadVideo, setThumbnail } from "./youtubeService.js";
import { updateRowStatus } from "./sheetsService.js";

const log = async (videoId, level, message, metadata = null) => {
  await Log.create({ videoId, level, message, metadata });
  console.log(`[${level.toUpperCase()}] ${message}`);
};

const cleanupFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Failed to cleanup ${filePath}:`, err.message);
  }
};

/**
 * Process a single video using its owner's Google credentials.
 */
export const processVideo = async (video, userDoc) => {
  let videoPath = null;
  let thumbnailPath = null;

  const authClient = await getUserOAuth2Client(video.user);
  const { driveFolderId, thumbnailsFolderId, sheetId, sheetName } =
    userDoc?.googleConfig || {};

  if (!driveFolderId || !sheetId) {
    throw new Error("User has not configured Google Drive/Sheets IDs");
  }

  try {
    // Step 1: Download video
    video.status = "downloading";
    video.downloadStartedAt = new Date();
    await video.save();
    await log(video._id, "info", `Downloading video: "${video.videoName}"`);

    const videoFile = await findFileByName(authClient, driveFolderId, video.videoName);
    if (!videoFile) {
      throw new Error(`Video file "${video.videoName}" not found in Google Drive`);
    }
    video.driveVideoFileId = videoFile.id;
    await video.save();

    videoPath = await downloadFile(authClient, videoFile.id, videoFile.name);
    await log(video._id, "info", `Video downloaded: ${videoFile.name}`);

    // Step 2: Download thumbnail
    if (video.thumbnailName && thumbnailsFolderId) {
      const thumbFile = await findFileByName(authClient, thumbnailsFolderId, video.thumbnailName);
      if (thumbFile) {
        video.driveThumbnailFileId = thumbFile.id;
        await video.save();
        thumbnailPath = await downloadFile(authClient, thumbFile.id, thumbFile.name);
        await log(video._id, "info", `Thumbnail downloaded: ${thumbFile.name}`);
      } else {
        await log(video._id, "warn", `Thumbnail "${video.thumbnailName}" not found, skipping`);
      }
    }

    // Step 3: Upload to YouTube
    video.status = "uploading";
    video.uploadStartedAt = new Date();
    await video.save();
    await log(video._id, "info", `Uploading to YouTube: "${video.videoTitle}"`);

    const result = await uploadVideo(
      authClient,
      videoPath,
      { videoTitle: video.videoTitle, description: video.description, tags: video.tags },
      video.scheduledDate
    );

    video.youtubeVideoId = result.videoId;
    video.youtubeUrl = result.youtubeUrl;
    video.uploadCompletedAt = new Date();
    await video.save();
    await log(video._id, "info", `Upload complete: ${result.youtubeUrl}`);

    // Step 4: Set thumbnail
    if (thumbnailPath) {
      video.status = "setting_thumbnail";
      await video.save();
      await log(video._id, "info", "Setting custom thumbnail");
      await setThumbnail(authClient, result.videoId, thumbnailPath);
      await log(video._id, "info", "Thumbnail set successfully");
    }

    // Step 5: Finalize
    video.status = result.isScheduled ? "scheduled" : "published";
    video.publishedAt = new Date();
    video.errorMessage = null;
    await video.save();

    const sheetStatus = result.isScheduled ? "Scheduled" : "Published";
    await updateRowStatus(authClient, sheetId, sheetName || "Sheet1", video.sheetRowIndex, sheetStatus, result.youtubeUrl);
    await log(video._id, "info", `Video ${sheetStatus.toLowerCase()}: ${result.youtubeUrl}`);

    cleanupFile(videoPath);
    cleanupFile(thumbnailPath);

    return video;
  } catch (error) {
    video.status = "failed";
    video.errorMessage = error.message;
    video.retryCount = (video.retryCount || 0) + 1;
    await video.save();

    await log(video._id, "error", `Processing failed: ${error.message}`, { stack: error.stack });

    try {
      if (sheetId) {
        await updateRowStatus(authClient, sheetId, sheetName || "Sheet1", video.sheetRowIndex, "Failed");
      }
    } catch (sheetErr) {
      await log(video._id, "error", `Failed to update sheet: ${sheetErr.message}`);
    }

    cleanupFile(videoPath);
    cleanupFile(thumbnailPath);
    throw error;
  }
};
