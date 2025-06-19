import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { realDataService } from "@/services/realDataService";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  X,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { generateUUID } from "@/lib/utils";

interface DownloadItem {
  id: string;
  name: string;
  platform: "windows" | "linux" | "mac";
  url: string;
  status: "pending" | "downloading" | "completed" | "error" | "paused";
  progress: number;
  size: string;
  speed?: string;
  eta?: string;
  error?: string;
}

interface DownloadManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadManager = ({ isOpen, onClose }: DownloadManagerProps) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  const addDownload = (platform: "windows" | "linux" | "mac") => {
    const urls = {
      windows:
        "https://github.com/Ades12121212121/HydraTools/releases/download/spoofingg/hydratools-windows.exe",
      linux:
        "https://github.com/Ades12121212121/HydraTools/releases/download/spoofingg/hydratools-linux",
      mac: "#", // Mac not available yet
    };

    const sizes = {
      windows: "2.4 MB",
      linux: "1.8 MB",
      mac: "N/A",
    };

    if (platform === "mac") {
      // Show coming soon message
      return;
    }

    const newDownload: DownloadItem = {
      id: generateUUID(),
      name: `Hydra Tools ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      platform,
      url: urls[platform],
      status: "pending",
      progress: 0,
      size: sizes[platform],
    };

    setDownloads((prev) => [newDownload, ...prev]);

    // Start download simulation
    setTimeout(() => {
      startDownload(newDownload.id);
    }, 500);

    // Track download in real data service
    realDataService.recordDownload(platform);

    // Actually trigger the real download
    const link = document.createElement("a");
    link.href = urls[platform];
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startDownload = (id: string) => {
    setDownloads((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "downloading" as const,
              speed: "0 KB/s",
              eta: "Calculating...",
            }
          : item,
      ),
    );

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloads((prev) =>
        prev.map((item) => {
          if (item.id === id && item.status === "downloading") {
            const newProgress = Math.min(
              item.progress + Math.random() * 15,
              100,
            );
            const speed = `${(Math.random() * 500 + 100).toFixed(0)} KB/s`;
            const remainingTime = ((100 - newProgress) / 10).toFixed(0);
            const eta = `${remainingTime}s`;

            if (newProgress >= 100) {
              clearInterval(interval);
              return {
                ...item,
                progress: 100,
                status: "completed" as const,
                speed: undefined,
                eta: undefined,
              };
            }

            return {
              ...item,
              progress: newProgress,
              speed,
              eta,
            };
          }
          return item;
        }),
      );
    }, 500);
  };

  const pauseDownload = (id: string) => {
    setDownloads((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "paused" as const } : item,
      ),
    );
  };

  const resumeDownload = (id: string) => {
    setDownloads((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "downloading" as const } : item,
      ),
    );
    startDownload(id);
  };

  const retryDownload = (id: string) => {
    setDownloads((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "pending" as const,
              progress: 0,
              error: undefined,
            }
          : item,
      ),
    );
    setTimeout(() => startDownload(id), 500);
  };

  const removeDownload = (id: string) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
  };

  const getStatusIcon = (status: DownloadItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "downloading":
        return <Download className="h-4 w-4 text-primary animate-bounce" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Download className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: DownloadItem["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "error":
        return "text-red-500 bg-red-500/10";
      case "downloading":
        return "text-primary bg-primary/10";
      case "paused":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-muted-foreground bg-muted/10";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "windows":
        return "🪟";
      case "linux":
        return "🐧";
      case "mac":
        return "🍎";
      default:
        return "💻";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono">DOWNLOAD MANAGER</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Download Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => addDownload("windows")}
              className="font-mono"
            >
              🪟 Windows
            </Button>
            <Button
              size="sm"
              onClick={() => addDownload("linux")}
              className="font-mono"
            >
              🐧 Linux
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled
              className="font-mono opacity-50"
            >
              🍎 Mac (Soon)
            </Button>
          </div>

          {/* Downloads List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {downloads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No downloads yet</p>
                <p className="text-xs">
                  Click a platform button to start downloading
                </p>
              </div>
            ) : (
              downloads.map((download) => (
                <div
                  key={download.id}
                  className="p-4 border border-border rounded-lg bg-card/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {getPlatformIcon(download.platform)}
                      </span>
                      <div>
                        <h4 className="font-mono font-bold text-sm">
                          {download.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {download.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`text-xs ${getStatusColor(download.status)}`}
                      >
                        {download.status.toUpperCase()}
                      </Badge>
                      {getStatusIcon(download.status)}
                    </div>
                  </div>

                  {download.status === "downloading" && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{Math.round(download.progress)}%</span>
                        <span>
                          {download.speed} • ETA: {download.eta}
                        </span>
                      </div>
                      <Progress value={download.progress} className="h-2" />
                    </div>
                  )}

                  {download.status === "error" && download.error && (
                    <p className="text-xs text-red-500 mb-3">
                      {download.error}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {download.status === "completed" &&
                        "✅ Download completed"}
                      {download.status === "paused" && "⏸️ Download paused"}
                      {download.status === "pending" &&
                        "⏳ Starting download..."}
                    </div>
                    <div className="flex space-x-1">
                      {download.status === "downloading" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pauseDownload(download.id)}
                          className="h-6 px-2"
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      {download.status === "paused" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resumeDownload(download.id)}
                          className="h-6 px-2"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {download.status === "error" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryDownload(download.id)}
                          className="h-6 px-2"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeDownload(download.id)}
                        className="h-6 px-2 text-red-500 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadManager;
