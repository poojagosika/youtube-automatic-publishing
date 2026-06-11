import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Link2,
  Unlink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  User,
  FolderOpen,
  FileSpreadsheet,
  Save,
} from "lucide-react";
import { authAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const { user, isSuperAdmin, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);

  // Profile
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  // Google config
  const [googleConfig, setGoogleConfig] = useState({
    driveFolderId: user?.googleConfig?.driveFolderId || "",
    thumbnailsFolderId: user?.googleConfig?.thumbnailsFolderId || "",
    sheetId: user?.googleConfig?.sheetId || "",
    sheetName: user?.googleConfig?.sheetName || "Sheet1",
  });
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "success") {
      setAuthMessage({ type: "success", text: "Google account connected successfully!" });
      setGoogleConnected(true);
    } else if (auth === "error") {
      setAuthMessage({ type: "error", text: searchParams.get("message") || "Failed to connect." });
    }

    const checkStatus = async () => {
      try {
        const { data } = await authAPI.getGoogleStatus();
        setGoogleConnected(data.authenticated);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [searchParams]);

  useEffect(() => {
    if (user?.googleConfig) {
      setGoogleConfig({
        driveFolderId: user.googleConfig.driveFolderId || "",
        thumbnailsFolderId: user.googleConfig.thumbnailsFolderId || "",
        sheetId: user.googleConfig.sheetId || "",
        sheetName: user.googleConfig.sheetName || "Sheet1",
      });
    }
  }, [user]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { data } = await authAPI.getGoogleAuthUrl();
      window.location.href = data.url;
    } catch {
      setAuthMessage({ type: "error", text: "Failed to initiate Google OAuth." });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await authAPI.disconnectGoogle();
      setGoogleConnected(false);
      setAuthMessage({ type: "success", text: "Google account disconnected." });
    } catch {
      setAuthMessage({ type: "error", text: "Failed to disconnect." });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({ name });
      updateUser(data.data);
      setAuthMessage({ type: "success", text: "Profile updated." });
    } catch {
      setAuthMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGoogleConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const { data } = await authAPI.saveGoogleConfig(googleConfig);
      updateUser(data.data);
      setAuthMessage({ type: "success", text: "Google configuration saved." });
    } catch {
      setAuthMessage({ type: "error", text: "Failed to save configuration." });
    } finally {
      setSavingConfig(false);
    }
  };

  const canShowGoogle = user?.hasPublishAccess || isSuperAdmin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl space-y-6"
    >
      <div>
        <h1 className="font-heading text-2xl font-bold text-surface-900">Settings</h1>
        <p className="mt-1 text-sm text-surface-500">Manage your account and integrations.</p>
      </div>

      {authMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border p-3 text-sm ${
            authMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {authMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {authMessage.text}
          </div>
        </motion.div>
      )}

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={user?.role === "superadmin" ? "default" : "secondary"}>
                <Shield className="mr-1 h-3 w-3" />
                {user?.role === "superadmin" ? "Super Admin" : "User"}
              </Badge>
              {user?.hasPublishAccess && (
                <Badge variant="success">Publish Access</Badge>
              )}
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Google Integration - users with publish access */}
      {canShowGoogle && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary-600" />
                Google Account
              </CardTitle>
              <CardDescription>
                Connect your Google account to access your Drive, Sheets, and YouTube channel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      googleConnected ? "bg-emerald-100" : "bg-surface-200"
                    }`}
                  >
                    {googleConnected ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Unlink className="h-5 w-5 text-surface-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">
                      {googleConnected ? "Google Account Connected" : "Not Connected"}
                    </p>
                    <p className="text-xs text-surface-500">
                      {googleConnected
                        ? "Drive, Sheets, and YouTube access is active."
                        : "Connect to enable automatic publishing to your YouTube channel."}
                    </p>
                  </div>
                </div>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-surface-400" />
                ) : googleConnected ? (
                  <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={disconnecting}>
                    {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleConnect} disabled={connecting}>
                    {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                    Connect Google
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Google Resource Configuration */}
          <Card className={!googleConnected ? "opacity-60" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary-600" />
                Google Resources
              </CardTitle>
              <CardDescription>
                {googleConnected
                  ? "Configure your Google Drive folder IDs and Sheet ID. These are found in the URLs of your Google resources."
                  : "Connect your Google account above to configure these settings."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGoogleConfig} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sheetId">
                    <FileSpreadsheet className="mr-1 inline h-3.5 w-3.5" />
                    Google Sheet ID
                  </Label>
                  <Input
                    id="sheetId"
                    placeholder="e.g. 1FqrkwSZqFKekgDBDIBkpMWtDZPfb83VknR7CAd1tfiE"
                    value={googleConfig.sheetId}
                    onChange={(e) => setGoogleConfig((c) => ({ ...c, sheetId: e.target.value }))}
                    disabled={!googleConnected}
                  />
                  <p className="text-xs text-surface-400">
                    Found in your Google Sheet URL: docs.google.com/spreadsheets/d/<strong>SHEET_ID</strong>/edit
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sheetName">Sheet Tab Name</Label>
                  <Input
                    id="sheetName"
                    placeholder="Sheet1"
                    value={googleConfig.sheetName}
                    onChange={(e) => setGoogleConfig((c) => ({ ...c, sheetName: e.target.value }))}
                    disabled={!googleConnected}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driveFolderId">
                    <FolderOpen className="mr-1 inline h-3.5 w-3.5" />
                    Videos Folder ID (Google Drive)
                  </Label>
                  <Input
                    id="driveFolderId"
                    placeholder="e.g. 1w_NxgD4ETRRN-0ggIK1xYR9kbrO0_nnJ"
                    value={googleConfig.driveFolderId}
                    onChange={(e) => setGoogleConfig((c) => ({ ...c, driveFolderId: e.target.value }))}
                    disabled={!googleConnected}
                  />
                  <p className="text-xs text-surface-400">
                    Found in your Drive folder URL: drive.google.com/drive/folders/<strong>FOLDER_ID</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailsFolderId">
                    <FolderOpen className="mr-1 inline h-3.5 w-3.5" />
                    Thumbnails Folder ID (Google Drive)
                  </Label>
                  <Input
                    id="thumbnailsFolderId"
                    placeholder="e.g. 1N8ofVnRymlFG5NYyIUz8AUyMcwcVqAVQ"
                    value={googleConfig.thumbnailsFolderId}
                    onChange={(e) => setGoogleConfig((c) => ({ ...c, thumbnailsFolderId: e.target.value }))}
                    disabled={!googleConnected}
                  />
                  <p className="text-xs text-surface-400">Optional — folder containing thumbnail images.</p>
                </div>

                <Button type="submit" disabled={savingConfig || !googleConnected}>
                  {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savingConfig ? "Saving..." : "Save Configuration"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}

      {/* No publish access message */}
      {!canShowGoogle && (
        <Card>
          <CardContent className="py-8 text-center">
            <Link2 className="mx-auto h-10 w-10 text-surface-300" />
            <h3 className="mt-3 font-heading text-lg font-semibold text-surface-900">
              Google Integration Locked
            </h3>
            <p className="mt-2 text-sm text-surface-500">
              You need publish access to connect your Google account. Go to{" "}
              <a href="/app/request-access" className="text-primary-600 hover:text-primary-700 font-medium">
                Request Access
              </a>{" "}
              to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default Settings;
