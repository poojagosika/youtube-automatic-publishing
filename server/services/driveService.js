import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const findFileByName = async (authClient, folderId, fileName) => {
  const drive = google.drive({ version: "v3", auth: authClient });

  const res = await drive.files.list({
    q: `name contains '${fileName.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, size)",
    pageSize: 10,
  });

  const files = res.data.files || [];
  if (files.length === 0) return null;

  const exactMatch = files.find((f) => {
    const nameWithoutExt = f.name.replace(/\.[^.]+$/, "");
    return nameWithoutExt.toLowerCase() === fileName.toLowerCase();
  });

  return exactMatch || files[0];
};

export const downloadFile = async (authClient, fileId, originalName) => {
  const drive = google.drive({ version: "v3", auth: authClient });
  const tempDir = path.join(__dirname, "..", "temp");
  const destPath = path.join(tempDir, `${Date.now()}-${originalName}`);

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(destPath);
    res.data
      .on("error", reject)
      .pipe(dest)
      .on("error", reject)
      .on("finish", () => resolve(destPath));
  });
};
