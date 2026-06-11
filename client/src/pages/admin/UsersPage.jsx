import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Loader2,
  Search,
  Shield,
  ShieldCheck,
  ShieldOff,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usersAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const [usersRes, statsRes] = await Promise.all([
        usersAPI.getAll(params),
        usersAPI.getStats(),
      ]);
      setUsers(usersRes.data.data);
      setPagination(usersRes.data.pagination);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleToggleAccess = async (userId, currentAccess) => {
    try {
      await usersAPI.updatePublishAccess(userId, !currentAccess);
      fetchUsers();
    } catch (err) {
      console.error("Failed to toggle access:", err);
    }
  };

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, color: "text-primary-600", bg: "bg-primary-50" },
        { label: "Admins", value: stats.admins, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "With Access", value: stats.usersWithAccess, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Regular Users", value: stats.regularUsers, color: "text-surface-600", bg: "bg-surface-100" },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-heading text-2xl font-bold text-surface-900">User Management</h1>
        <p className="mt-1 text-sm text-surface-500">Manage users, roles, and publish access.</p>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-5">
                <p className="text-sm font-medium text-surface-500">{label}</p>
                <p className={`mt-1 font-heading text-3xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600" />
            All Users
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-100">
                      {["User", "Role", "Publish Access", "Joined", "Actions"].map((h) => (
                        <th key={h} className={`pb-3 text-xs font-semibold uppercase tracking-wider text-surface-400 ${h === "Actions" ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {users.map((u) => (
                      <tr key={u._id} className="transition-colors hover:bg-surface-50">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-surface-900">{u.name}</p>
                              <p className="text-xs text-surface-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <Badge variant={u.role === "superadmin" ? "default" : "secondary"}>
                            <Shield className="mr-1 h-3 w-3" />
                            {u.role === "superadmin" ? "Super Admin" : "User"}
                          </Badge>
                        </td>
                        <td className="py-3.5 pr-4">
                          {u.hasPublishAccess ? (
                            <Badge variant="success">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Granted
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="mr-1 h-3 w-3" /> None
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 pr-4 text-sm text-surface-600">
                          {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.role !== "superadmin" ? (
                              <Button size="sm" variant="ghost" onClick={() => handleRoleChange(u._id, "superadmin")}>
                                <ShieldCheck className="h-3.5 w-3.5" /> Make Admin
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => handleRoleChange(u._id, "user")}>
                                <ShieldOff className="h-3.5 w-3.5" /> Remove Admin
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={u.hasPublishAccess ? "destructive" : "success"}
                              onClick={() => handleToggleAccess(u._id, u.hasPublishAccess)}
                            >
                              {u.hasPublishAccess ? "Revoke Access" : "Grant Access"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-surface-500">Page {pagination.page} of {pagination.pages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UsersPage;
