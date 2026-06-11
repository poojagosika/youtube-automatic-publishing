import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { accessRequestsAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const AccessRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [noteMap, setNoteMap] = useState({});
  const [processingMap, setProcessingMap] = useState({});

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await accessRequestsAPI.getAll(params);
      setRequests(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleApprove = async (id) => {
    setProcessingMap((prev) => ({ ...prev, [id]: "approving" }));
    try {
      await accessRequestsAPI.approve(id, { adminNote: noteMap[id] || "" });
      fetchRequests();
    } catch (err) {
      console.error("Failed to approve:", err);
    } finally {
      setProcessingMap((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    setProcessingMap((prev) => ({ ...prev, [id]: "rejecting" }));
    try {
      await accessRequestsAPI.reject(id, { adminNote: noteMap[id] || "" });
      fetchRequests();
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setProcessingMap((prev) => ({ ...prev, [id]: null }));
    }
  };

  const statusVariant = { pending: "warning", approved: "success", rejected: "danger" };
  const statusIcon = { pending: Clock, approved: CheckCircle2, rejected: XCircle };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-heading text-2xl font-bold text-surface-900">Access Requests</h1>
        <p className="mt-1 text-sm text-surface-500">Review and manage publish access requests from users.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary-600" />
            All Requests
            {pagination && (
              <span className="text-sm font-normal text-surface-400">({pagination.total} total)</span>
            )}
          </CardTitle>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-surface-300 bg-white px-3 py-1.5 text-sm text-surface-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center">
              <FileCheck className="mx-auto h-12 w-12 text-surface-300" />
              <p className="mt-4 text-sm text-surface-500">No access requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const Icon = statusIcon[req.status];
                const isProcessing = processingMap[req._id];
                return (
                  <div
                    key={req._id}
                    className="rounded-xl border border-surface-200 p-5 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                          {req.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-900">{req.user?.name}</p>
                          <p className="text-xs text-surface-500">{req.user?.email}</p>
                          <p className="mt-1 text-xs text-surface-400">
                            {new Date(req.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusVariant[req.status]}>
                        <Icon className="mr-1 h-3 w-3" />
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </Badge>
                    </div>

                    {req.message && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface-50 p-3">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
                        <p className="text-sm text-surface-600">{req.message}</p>
                      </div>
                    )}

                    {req.status === "pending" && (
                      <div className="mt-4 space-y-3">
                        <Textarea
                          placeholder="Admin note (optional)..."
                          value={noteMap[req._id] || ""}
                          onChange={(e) =>
                            setNoteMap((prev) => ({ ...prev, [req._id]: e.target.value }))
                          }
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(req._id)}
                            disabled={!!isProcessing}
                          >
                            {isProcessing === "approving" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(req._id)}
                            disabled={!!isProcessing}
                          >
                            {isProcessing === "rejecting" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {req.adminNote && req.status !== "pending" && (
                      <p className="mt-3 text-sm text-surface-500 italic">
                        Admin note: {req.adminNote}
                      </p>
                    )}
                  </div>
                );
              })}

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
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AccessRequestsPage;
