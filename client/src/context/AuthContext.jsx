import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // logout even if the API call fails
    }
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const isSuperAdmin = user?.role === "superadmin";

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isSuperAdmin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
