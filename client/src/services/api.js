import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname.startsWith("/app")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  getGoogleAuthUrl: () => api.get("/auth/google"),
  getGoogleStatus: () => api.get("/auth/google/status"),
  disconnectGoogle: () => api.post("/auth/google/disconnect"),
  saveGoogleConfig: (data) => api.put("/auth/google/config", data),
};

// ─── Videos ────────────────────────────────────────────────

export const videosAPI = {
  getAll: (params) => api.get("/videos", { params }),
  getStats: () => api.get("/videos/stats"),
  getById: (id) => api.get(`/videos/${id}`),
  trigger: (id) => api.post(`/videos/${id}/trigger`),
  retry: (id) => api.post(`/videos/${id}/retry`),
  poll: () => api.post("/videos/poll"),
};

// ─── Access Requests ───────────────────────────────────────

export const accessRequestsAPI = {
  create: (data) => api.post("/access-requests", data),
  getAll: (params) => api.get("/access-requests", { params }),
  approve: (id, data) => api.put(`/access-requests/${id}/approve`, data),
  reject: (id, data) => api.put(`/access-requests/${id}/reject`, data),
};

// ─── Notifications ─────────────────────────────────────────

export const notificationsAPI = {
  getAll: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

// ─── Users (Admin) ─────────────────────────────────────────

export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getStats: () => api.get("/users/stats"),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updatePublishAccess: (id, hasPublishAccess) =>
    api.put(`/users/${id}/publish-access`, { hasPublishAccess }),
};

// ─── Logs ──────────────────────────────────────────────────

export const logsAPI = {
  getAll: (params) => api.get("/logs", { params }),
};

export default api;
