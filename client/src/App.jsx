import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

// Public pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// App pages
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import RequestAccess from "@/pages/RequestAccess";

// Admin pages
import UsersPage from "@/pages/admin/UsersPage";
import AccessRequestsPage from "@/pages/admin/AccessRequestsPage";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected app routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
            <Route path="request-access" element={<RequestAccess />} />

            {/* Admin routes */}
            <Route
              path="admin/users"
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/access-requests"
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <AccessRequestsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
