# AutoPublish - YouTube Auto Publishing Platform

A full-stack web application that automatically publishes videos to YouTube from Google Drive, scheduled via Google Sheets.

## Features

- **Per-User Google OAuth** - Each user connects their own Google account (Drive, Sheets, YouTube)
- **Auto Publishing** - Videos are automatically downloaded from Drive and uploaded to YouTube on schedule
- **Google Sheets Integration** - Manage your video queue directly from a Google Sheet
- **Thumbnail Support** - Automatically sets thumbnails from a designated Drive folder
- **Role-Based Access** - Super Admin and User roles with publish access control
- **Access Request System** - Users request publish access, admins approve or reject
- **In-App Notifications** - Real-time notification system for access updates and video status
- **Secure Auth** - HTTP-only cookie authentication with JWT

## Tech Stack

**Frontend**
- React 19, Vite 8, Tailwind CSS 4
- Framer Motion, Lucide Icons
- Axios with cookie-based auth

**Backend**
- Express 5, MongoDB (Mongoose 9)
- Per-user Google OAuth2 (Drive, Sheets, YouTube APIs)
- Node-Cron scheduler for automated polling
- JWT with HTTP-only cookies

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project with OAuth 2.0 credentials
- Enable these APIs: Google Drive, Google Sheets, YouTube Data API v3

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/poojagosika/youtube-automatic-publishing.git
   cd youtube-automatic-publishing
   ```

2. **Install dependencies**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Create `.env`** in the project root
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   CLIENT_URL=http://localhost:5173
   PORT=5000
   POLL_INTERVAL_MINUTES=5
   ```

4. **Run the app**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

5. Open `http://localhost:5173` - The first user to register becomes the Super Admin.

## How It Works

1. **Register & Request Access** - New users sign up and request publish access from the admin
2. **Connect Google** - Once approved, connect your Google account in Settings
3. **Configure Resources** - Add your Google Sheet ID, Drive folder IDs in Settings
4. **Manage via Sheets** - Add video entries to your Google Sheet with title, description, tags, and schedule date
5. **Auto Publish** - The scheduler polls your sheet, downloads videos from Drive, and uploads them to YouTube

## Google Sheet Format

| Video Name | Video Title | Thumbnail | Description | Tags | Schedule Date | Status | YouTube URL |
|------------|------------|-----------|-------------|------|---------------|--------|-------------|
| video.mp4 | My Video | thumb.jpg | Description | tag1,tag2 | 2025-01-15 | pending | |

## Project Structure

```
youtube-automatic-publishing/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components & layout
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── lib/             # Utilities
│   └── vite.config.js
├── server/                  # Express backend
│   ├── config/              # DB & Google OAuth config
│   ├── middleware/           # Auth middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── services/            # Business logic & scheduler
│   └── server.js
└── .env                     # Environment variables
```

## License

MIT
