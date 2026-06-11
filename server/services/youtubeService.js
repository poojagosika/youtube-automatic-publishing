import { google } from "googleapis";
import fs from "fs";

export const uploadVideo = async (authClient, filePath, metadata, scheduledDate) => {
  const youtube = google.youtube({ version: "v3", auth: authClient });
  const isScheduled = scheduledDate && new Date(scheduledDate) > new Date();

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: metadata.videoTitle,
        description: metadata.description || "",
        tags: metadata.tags || [],
        categoryId: "22",
      },
      status: {
        privacyStatus: isScheduled ? "private" : "public",
        publishAt: isScheduled
          ? new Date(scheduledDate).toISOString()
          : undefined,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  });

  return {
    videoId: res.data.id,
    youtubeUrl: `https://www.youtube.com/watch?v=${res.data.id}`,
    isScheduled,
  };
};

export const setThumbnail = async (authClient, videoId, thumbnailPath) => {
  const youtube = google.youtube({ version: "v3", auth: authClient });

  await youtube.thumbnails.set({
    videoId,
    media: {
      mimeType: "image/jpeg",
      body: fs.createReadStream(thumbnailPath),
    },
  });
};
