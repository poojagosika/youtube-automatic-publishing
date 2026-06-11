import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  History as HistoryIcon,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Upload,
  Filter,
} from "lucide-react";
import { videosAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pending", variant: "warning" },
  downloading: { label: "Downloading", variant: "info" },
  uploading: { label: "Uploading", variant: "info" },
  setting_thumbnail: { label: "Setting Thumbnail", variant: "info" },
  scheduled: { label: "Scheduled", variant: "default" },
  published: { label: "Published", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
};

const History = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 15;

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (statusFilter) params.status = statusFilter;
        const { data } = await videosAPI.getAll(params);
        setVideos(data.data);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [page, statusFilter]);

  const statuses = ["", "pending", "downloading", "uploading", "scheduled", "published", "failed"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-surface-900">Video History</h1>
          <p className="mt-1 text-sm text-surface-500">Browse all your video publishing history.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-primary-600" />
            All Videos
            {pagination && (
              <span className="text-sm font-normal text-surface-400">
                ({pagination.total} total)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-surface-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-surface-300 bg-white px-3 py-1.5 text-sm text-surface-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Statuses</option>
              {statuses
                .filter(Boolean)
                .map((s) => (
                  <option key={s} value={s}>
                    {statusConfig[s]?.label || s}
                  </option>
                ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : videos.length === 0 ? (
            <div className="py-12 text-center">
              <HistoryIcon className="mx-auto h-12 w-12 text-surface-300" />
              <p className="mt-4 text-sm text-surface-500">No videos found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-100">
                      {["Title", "Status", "Scheduled", "Published", "YouTube"].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {videos.map((video) => {
                      const config = statusConfig[video.status];
                      return (
                        <tr key={video._id} className="transition-colors hover:bg-surface-50">
                          <td className="py-3.5 pr-4">
                            <p className="text-sm font-medium text-surface-900">{video.videoTitle}</p>
                            <p className="text-xs text-surface-400">{video.videoName}</p>
                          </td>
                          <td className="py-3.5 pr-4">
                            <Badge variant={config?.variant}>{config?.label}</Badge>
                          </td>
                          <td className="py-3.5 pr-4 text-sm text-surface-600">
                            {video.scheduledDate
                              ? new Date(video.scheduledDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                              : "-"}
                          </td>
                          <td className="py-3.5 pr-4 text-sm text-surface-600">
                            {video.publishedAt
                              ? new Date(video.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                              : "-"}
                          </td>
                          <td className="py-3.5">
                            {video.youtubeUrl ? (
                              <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
                                View <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-sm text-surface-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-surface-500">
                    Page {pagination.page} of {pagination.pages}
                  </p>
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

export default History;
