import { google } from "googleapis";
import User from "../models/User.js";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

/**
 * Create a fresh OAuth2 client for a specific user.
 * Attaches a "tokens" listener to auto-save refreshed tokens to the user doc.
 */
export const createOAuth2Client = (userId) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Auto-persist refreshed tokens back to the user document
  client.on("tokens", async (tokens) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.googleTokens = { ...user.googleTokens, ...tokens };
        await user.save();
        console.log(`Google tokens refreshed for user ${user.email}`);
      }
    } catch (err) {
      console.error("Failed to persist refreshed tokens:", err.message);
    }
  });

  return client;
};

/**
 * Get a ready-to-use OAuth2 client for a user (tokens loaded).
 */
export const getUserOAuth2Client = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.googleTokens) {
    throw new Error("User has no Google account connected");
  }

  const client = createOAuth2Client(userId);
  client.setCredentials(user.googleTokens);
  return client;
};

/**
 * Generate Google OAuth consent URL, encoding the userId in the state param.
 */
export const getAuthUrl = (userId) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state: userId.toString(),
  });
};

/**
 * Exchange auth code for tokens and save them to the user.
 */
export const getTokensForUser = async (code, userId) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await client.getToken(code);

  await User.findByIdAndUpdate(userId, {
    googleTokens: tokens,
    googleConnected: true,
  });

  return tokens;
};

/**
 * Check if a user has Google connected.
 */
export const isUserAuthenticated = async (userId) => {
  const user = await User.findById(userId);
  return !!(user?.googleTokens?.access_token || user?.googleTokens?.refresh_token);
};

/**
 * Disconnect a user's Google account.
 */
export const disconnectUserAccount = async (userId) => {
  const user = await User.findById(userId);
  if (user?.googleTokens) {
    try {
      const client = createOAuth2Client(userId);
      client.setCredentials(user.googleTokens);
      await client.revokeCredentials();
    } catch {
      // Ignore — token may already be invalid
    }
  }

  await User.findByIdAndUpdate(userId, {
    googleTokens: null,
    googleConnected: false,
  });

  console.log(`Google account disconnected for user ${user?.email}`);
};

/**
 * Get all users who have Google connected and publish access.
 */
export const getConnectedUsers = async () => {
  return User.find({
    googleConnected: true,
    googleTokens: { $ne: null },
    hasPublishAccess: true,
  });
};

export { SCOPES };
