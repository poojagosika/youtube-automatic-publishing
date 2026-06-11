import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  History,
  Settings,
  ShieldCheck,
  Users,
  FileCheck,
  PlayCircle,
  KeyRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const Sidebar = ({ collapsed, onToggle }) => {
  const { isSuperAdmin, user } = useAuth();

  const navItems = [
    { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/app/history", icon: History, label: "History" },
    { to: "/app/settings", icon: Settings, label: "Settings" },
  ];

  const userItems = [
    ...(!user?.hasPublishAccess && !isSuperAdmin
      ? [{ to: "/app/request-access", icon: KeyRound, label: "Request Access" }]
      : []),
  ];

  const adminItems = isSuperAdmin
    ? [
        { to: "/app/admin/users", icon: Users, label: "Users" },
        { to: "/app/admin/access-requests", icon: FileCheck, label: "Access Requests" },
      ]
    : [];

  const linkClass = ({ isActive }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-primary-50 text-primary-700"
        : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
    );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-surface-200 bg-white"
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-surface-100 px-3">
        <div className="flex flex-1 items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
            <PlayCircle className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-heading text-lg font-bold text-surface-900 whitespace-nowrap"
            >
              AutoPublish
            </motion.span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-md text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
              Menu
            </p>
          )}
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={linkClass} title={label}>
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </div>

        {userItems.length > 0 && (
          <div className="mt-6 space-y-1">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
                Access
              </p>
            )}
            {userItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={linkClass} title={label}>
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        )}

        {adminItems.length > 0 && (
          <div className="mt-6 space-y-1">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
                Admin
              </p>
            )}
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={linkClass} title={label}>
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User info at bottom */}
      {!collapsed && user && (
        <div className="border-t border-surface-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-surface-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-surface-500">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
