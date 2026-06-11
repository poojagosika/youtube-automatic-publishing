import { google } from "googleapis";

export const fetchPendingEntries = async (authClient, sheetId, sheetName = "Sheet1") => {
  const sheets = google.sheets({ version: "v4", auth: authClient });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${sheetName}'!A2:I`,
  });

  const rows = res.data.values || [];
  const entries = [];

  rows.forEach((row, index) => {
    const videoName = (row[0] || "").trim();
    const status = (row[7] || "").trim().toLowerCase();

    if (!videoName) return;
    if (["published", "processing", "scheduled"].includes(status)) return;

    const dateStr = (row[5] || "").trim();
    const timeStr = (row[6] || "").trim();
    let scheduledDate = null;
    if (dateStr) {
      const parts = dateStr.split(/[\/\-]/);
      const isoDate =
        parts.length === 3 && parts[0].length <= 2
          ? `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
          : dateStr;
      scheduledDate = timeStr
        ? new Date(`${isoDate}T${timeStr}`)
        : new Date(isoDate);
    }

    entries.push({
      videoName,
      videoTitle: (row[1] || videoName).trim(),
      thumbnailName: (row[2] || "").trim(),
      description: (row[3] || "").trim(),
      tags: (row[4] || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      scheduledDate,
      currentStatus: status,
      sheetRowIndex: index + 2,
    });
  });

  return entries;
};

export const updateRowStatus = async (authClient, sheetId, sheetName, rowIndex, status, youtubeUrl = "") => {
  const sheets = google.sheets({ version: "v4", auth: authClient });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `'${sheetName}'!H${rowIndex}:I${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[status, youtubeUrl]],
    },
  });
};
