import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  KeyRound,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { accessRequestsAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const statusIcon = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

const statusVariant = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const RequestAccess = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await accessRequestsAPI.getAll();
        setRequests(data.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await accessRequestsAPI.create({ message });
      setRequests((prev) => [data.data, ...prev]);
      setMessage("");
      setSuccess("Your access request has been submitted. You'll be notified when it's reviewed.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasPendingRequest = requests.some((r) => r.status === "pending");

  if (user?.hasPublishAccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 font-heading text-xl font-semibold text-surface-900">
              You Have Publish Access
            </h2>
            <p className="mt-2 text-sm text-surface-500">
              You can create and manage auto-publish schedules.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl space-y-6"
    >
      <div>
        <h1 className="font-heading text-2xl font-bold text-surface-900">Request Publish Access</h1>
        <p className="mt-1 text-sm text-surface-500">
          To create auto-publish schedules, you need publish access. Submit a request to an admin.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {success}
        </div>
      )}

      {/* Submit form */}
      {!hasPendingRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary-600" />
              New Request
            </CardTitle>
            <CardDescription>Tell the admin why you need publish access.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="I'd like to use auto-publish to schedule my weekly video uploads..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Previous requests */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((req) => {
                const Icon = statusIcon[req.status];
                return (
                  <div
                    key={req._id}
                    className="flex items-start gap-4 rounded-lg border border-surface-200 p-4"
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      req.status === "approved" ? "bg-emerald-100" :
                      req.status === "rejected" ? "bg-red-100" : "bg-amber-100"
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        req.status === "approved" ? "text-emerald-600" :
                        req.status === "rejected" ? "text-red-600" : "text-amber-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant[req.status]}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-surface-400">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {req.message && (
                        <p className="mt-2 text-sm text-surface-600">{req.message}</p>
                      )}
                      {req.adminNote && (
                        <p className="mt-1 text-sm text-surface-500 italic">
                          Admin: {req.adminNote}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default RequestAccess;
