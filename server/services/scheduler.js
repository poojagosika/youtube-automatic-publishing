import cron from "node-cron";
import Video from "../models/Video.js";
import Log from "../models/Log.js";
import { getConnectedUsers, getUserOAuth2Client } from "../config/google.js";
import { fetchPendingEntries } from "./sheetsService.js";
import { processVideo } from "./processingService.js";

let isPolling = false;

/**
 * Poll all connected users' sheets and process their pending videos.
 */
export const pollAndProcess = async () => {
  if (isPolling) {
    console.log("Poll already in progress, skipping");
    return { skipped: true };
  }

  isPolling = true;
  let totalNew = 0;
  let totalProcessed = 0;

  try {
    await Log.create({ level: "info", message: "Starting poll cycle" });

    const connectedUsers = await getConnectedUsers();
    console.log(`Polling ${connectedUsers.length} connected user(s)`);

    for (const user of connectedUsers) {
      const { sheetId, sheetName, driveFolderId } = user.googleConfig || {};
      if (!sheetId || !driveFolderId) {
        console.log(`Skipping user ${user.email}: missing Sheet or Drive config`);
        continue;
      }

      try {
        const authClient = await getUserOAuth2Client(user._id);
        const entries = await fetchPendingEntries(authClient, sheetId, sheetName || "Sheet1");
        console.log(`[${user.email}] Found ${entries.length} pending entries`);

        // Create Video documents for new entries
        for (const entry of entries) {
          const exists = await Video.findOne({
            user: user._id,
            videoTitle: entry.videoTitle,
            sheetRowIndex: entry.sheetRowIndex,
          });

          if (!exists) {
            await Video.create({
              user: user._id,
              videoName: entry.videoName,
              videoTitle: entry.videoTitle,
              thumbnailName: entry.thumbnailName,
              description: entry.description,
              tags: entry.tags,
              scheduledDate: entry.scheduledDate,
              sheetRowIndex: entry.sheetRowIndex,
              status: "pending",
            });
            totalNew++;
          }
        }

        // Process pending videos for this user
        const pendingVideos = await Video.find({ user: user._id, status: "pending" }).sort({ detectedAt: 1 });
        for (const video of pendingVideos) {
          try {
            await processVideo(video, user);
            totalProcessed++;
          } catch (err) {
            console.error(`[${user.email}] Failed to process "${video.videoName}": ${err.message}`);
          }
        }

        // Retry failed videos (retryCount < 3)
        const failedVideos = await Video.find({
          user: user._id,
          status: "failed",
          retryCount: { $lt: 3 },
        }).sort({ updatedAt: 1 });

        for (const video of failedVideos) {
          try {
            video.status = "pending";
            await video.save();
            await processVideo(video, user);
            totalProcessed++;
          } catch (err) {
            console.error(`[${user.email}] Retry failed for "${video.videoName}": ${err.message}`);
          }
        }
      } catch (err) {
        console.error(`[${user.email}] Poll error: ${err.message}`);
        await Log.create({
          level: "error",
          message: `Poll failed for ${user.email}: ${err.message}`,
        });
      }
    }

    await Log.create({
      level: "info",
      message: `Poll cycle complete: ${totalNew} new, ${totalProcessed} processed across ${connectedUsers.length} user(s)`,
    });

    return { totalNew, totalProcessed };
  } catch (error) {
    await Log.create({
      level: "error",
      message: `Poll cycle failed: ${error.message}`,
      metadata: { stack: error.stack },
    });
    throw error;
  } finally {
    isPolling = false;
  }
};

export const startScheduler = () => {
  const interval = process.env.POLL_INTERVAL_MINUTES || 5;
  console.log(`Scheduler started: polling every ${interval} minutes`);

  cron.schedule(`*/${interval} * * * *`, async () => {
    try {
      await pollAndProcess();
    } catch (err) {
      console.error("Scheduler error:", err.message);
    }
  });
};
