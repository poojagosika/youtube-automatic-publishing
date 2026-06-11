import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Calendar,
  RefreshCw,
  Play,
  RotateCcw,
  ExternalLink,
  TrendingUp,
  KeyRound,
  Link2,
} from "lucide-react";
import { videosAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  downloading: { label: "Downloading", variant: "info", icon: Loader2 },
  uploading: { label: "Uploading", variant: "info", icon: Upload },
  setting_thumbnail: { label: "Setting Thumbnail", variant: "info", icon: Loader2 },
  scheduled: { label: "Scheduled", variant: "default", icon: Calendar },
  published: { label: "Published", variant: "success", icon: CheckCircle2 },
  failed: { label: "Failed", variant: "danger", icon: AlertCircle },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05 },
  }),
};

const Dashboard = () => {
  const { user, isSuperAdmin } = useAuth();
  const hasAccess = user?.hasPublishAccess || isSuperAdmin;
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    try {
      const [statsRes, videosRes] = await Promise.all([
        videosAPI.getStats(),
        videosAPI.getAll({ limit: 10 }),
      ]);
      setStats(statsRes.data.data);
      setVideos(videosRes.data.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [hasAccess]);

  useEffect(() => {
    fetchData();
    if (!hasAccess) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData, hasAccess]);

  const handlePoll = async () => {
    setRefreshing(true);
    try {
      await videosAPI.poll();
      setTimeout(fetchData, 3000);
    } catch (err) {
      console.error("Poll failed:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 3000);
    }
  };

  const handleTrigger = async (id) => {
    try {
      await videosAPI.trigger(id);
      fetchData();
    } catch (err) {
      console.error("Trigger failed:", err);
    }
  };

  const handleRetry = async (id) => {
    try {
      await videosAPI.retry(id);
      fetchData();
    } catch (err) {
      console.error("Retry failed:", err);
    }
  };

  const statCards = stats
    ? [
        { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Processing", value: stats.processing, icon: Loader2, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Scheduled", value: stats.scheduled, icon: Calendar, color: "text-primary-600", bg: "bg-primary-50" },
        { label: "Published", value: stats.published, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Failed", value: stats.failed, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Users without publish access see an onboarding view
  if (!hasAccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div>
          <h1 className="font-heading text-2xl font-bold text-surface-900">
            Welcome, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Get started with AutoPublish in a few simple steps.
          </p>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                <KeyRound className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="mt-5 font-heading text-xl font-semibold text-surface-900">
                Publish Access Required
              </h2>
              <p className="mt-3 text-sm text-surface-500 leading-relaxed">
                To start auto-publishing videos to YouTube, you need publish access.
                Once approved, you'll be able to connect your Google account, configure
                your Drive & Sheets, and start publishing automatically.
              </p>
              <div className="mt-8">
                <a href="/app/request-access">
                  <Button>
                    <KeyRound className="h-4 w-4" />
                    Request Publish Access
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Get Access",
                  description: "Request publish access and wait for admin approval.",
                  icon: KeyRound,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
                {
                  step: "2",
                  title: "Connect Google",
                  description: "Link your Google account for Drive, Sheets & YouTube.",
                  icon: Link2,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  step: "3",
                  title: "Auto Publish",
                  description: "Add videos to your Sheet and we'll handle the rest.",
                  icon: CheckCircle2,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
              ].map(({ step, title, description, icon: Icon, color, bg }) => (
                <div key={step} className="rounded-lg border border-surface-200 p-5 text-center">
                  <div className={cn("mx-auto flex h-11 w-11 items-center justify-center rounded-xl", bg)}>
                    <Icon className={cn("h-5 w-5", color)} />
                  </div>
                  <h3 className="mt-3 font-heading text-sm font-semibold text-surface-900">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-xs text-surface-500">{description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-surface-900">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Here's what's happening with your videos today.
          </p>
        </div>
        <Button onClick={handlePoll} disabled={refreshing} variant="outline">
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          {refreshing ? "Syncing..." : "Sync from Sheets"}
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">{label}</p>
                  <p className="mt-1 font-heading text-3xl font-bold text-surface-900">{value}</p>
                </div>
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", bg)}>
                  <Icon className={cn("h-5 w-5", color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              Recent Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="py-12 text-center">
                <Upload className="mx-auto h-12 w-12 text-surface-300" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-surface-900">No videos yet</h3>
                <p className="mt-2 text-sm text-surface-500">Add video entries to your Google Sheet and sync to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-100">
                      {["Title", "Status", "Scheduled", "YouTube", "Actions"].map((h) => (
                        <th key={h} className={cn("pb-3 text-xs font-semibold uppercase tracking-wider text-surface-400", h === "Actions" ? "text-right" : "text-left")}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {videos.map((video) => {
                      const config = statusConfig[video.status];
                      const StatusIcon = config?.icon;
                      return (
                        <tr key={video._id} className="group transition-colors hover:bg-surface-50">
                          <td className="py-3.5 pr-4">
                            <p className="text-sm font-medium text-surface-900">{video.videoTitle}</p>
                            <p className="text-xs text-surface-400">{video.videoName}</p>
                          </td>
                          <td className="py-3.5 pr-4">
                            <Badge variant={config?.variant} className="gap-1">
                              {StatusIcon && (
                                <StatusIcon className={cn("h-3 w-3", ["downloading", "uploading", "setting_thumbnail"].includes(video.status) && "animate-spin")} />
                              )}
                              {config?.label}
                            </Badge>
                          </td>
                          <td className="py-3.5 pr-4 text-sm text-surface-600">
                            {video.scheduledDate ? new Date(video.scheduledDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                          </td>
                          <td className="py-3.5 pr-4">
                            {video.youtubeUrl ? (
                              <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
                                View <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-sm text-surface-400">-</span>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {video.status === "pending" && (
                                <Button size="sm" variant="ghost" onClick={() => handleTrigger(video._id)}>
                                  <Play className="h-3.5 w-3.5" /> Trigger
                                </Button>
                              )}
                              {video.status === "failed" && (
                                <Button size="sm" variant="ghost" onClick={() => handleRetry(video._id)}>
                                  <RotateCcw className="h-3.5 w-3.5" /> Retry
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
