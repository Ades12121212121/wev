import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ipTrackingService,
  type OnlineUser,
  type BlockedIP,
} from "@/services/ipTrackingService";
import { adminAuth } from "@/services/adminAuth";
import {
  Users,
  Shield,
  Ban,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Laptop,
} from "lucide-react";

const OnlineUsersMonitor = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [threatStats, setThreatStats] = useState({
    total: 0,
    suspicious: 0,
    blocked: 0,
    critical: 0,
    high: 0,
    activeDDoS: 0,
  });

  useEffect(() => {
    const updateData = () => {
      setOnlineUsers(ipTrackingService.getOnlineUsers());
      setBlockedIPs(ipTrackingService.getBlockedIPs());
      setThreatStats(ipTrackingService.getThreatStats());
    };

    updateData();
    const interval = setInterval(updateData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBlockIP = async (encryptedIP: string, reason: string) => {
    const adminKey = adminAuth.getSession().adminKey || "";
    const success = ipTrackingService.blockIP(
      encryptedIP,
      reason,
      true,
      adminKey,
    );

    if (success) {
      // Actualizar datos inmediatamente
      setOnlineUsers(ipTrackingService.getOnlineUsers());
      setBlockedIPs(ipTrackingService.getBlockedIPs());
      setThreatStats(ipTrackingService.getThreatStats());
    }
  };

  const handleUnblockIP = (encryptedIP: string) => {
    const success = ipTrackingService.unblockIP(encryptedIP);

    if (success) {
      setOnlineUsers(ipTrackingService.getOnlineUsers());
      setBlockedIPs(ipTrackingService.getBlockedIPs());
      setThreatStats(ipTrackingService.getThreatStats());
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "HIGH":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-green-500 bg-green-500/10 border-green-500/20";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "windows":
        return <Monitor className="h-4 w-4" />;
      case "mac":
        return <Laptop className="h-4 w-4" />;
      case "linux":
        return <Monitor className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-mono font-bold">
                  {threatStats.total}
                </p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-mono font-bold text-yellow-500">
                  {threatStats.suspicious}
                </p>
                <p className="text-xs text-muted-foreground">Suspicious</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Ban className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-mono font-bold text-red-500">
                  {threatStats.blocked}
                </p>
                <p className="text-xs text-muted-foreground">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-red-400" />
              <div>
                <p className="text-2xl font-mono font-bold text-red-400">
                  {threatStats.critical}
                </p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-mono font-bold text-orange-500">
                  {threatStats.high}
                </p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-mono font-bold text-red-600">
                  {threatStats.activeDDoS}
                </p>
                <p className="text-xs text-muted-foreground">DDoS</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Online Users */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="font-mono flex items-center">
              <Users className="h-5 w-5 mr-2" />
              ONLINE USERS ({onlineUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      user.isBlocked
                        ? "bg-red-500/10 border-red-500/20"
                        : user.threatLevel === "CRITICAL"
                          ? "bg-red-500/5 border-red-500/10"
                          : user.isSuspicious
                            ? "bg-yellow-500/5 border-yellow-500/10"
                            : "bg-muted/20 border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getPlatformIcon(user.platform)}
                          <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                            {user.encryptedIP}
                          </code>
                          <Badge
                            className={`text-xs ${getThreatColor(user.threatLevel)}`}
                          >
                            {user.threatLevel}
                          </Badge>
                          {user.isBlocked && (
                            <Badge variant="destructive" className="text-xs">
                              BLOCKED
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>Platform: {user.platform}</div>
                          <div>Location: {user.location}</div>
                          <div>RPM: {user.requestsPerMinute}</div>
                          <div>Downloads: {user.downloads}</div>
                          <div>
                            Connected: {formatTimeAgo(user.connectTime)}
                          </div>
                          <div>
                            Last seen: {formatTimeAgo(user.lastActivity)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1">
                        {!user.isBlocked ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 px-2 text-xs"
                                disabled={user.threatLevel === "LOW"}
                              >
                                <Ban className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Block IP Address
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to block{" "}
                                  {user.encryptedIP}? This will prevent them
                                  from accessing the site.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleBlockIP(
                                      user.encryptedIP,
                                      "Manual Admin Block",
                                    )
                                  }
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Block IP
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnblockIP(user.encryptedIP)}
                            className="h-6 px-2 text-xs"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Blocked IPs */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="font-mono flex items-center">
              <Ban className="h-5 w-5 mr-2" />
              BLOCKED IPs ({blockedIPs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {blockedIPs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No blocked IPs</p>
                  </div>
                ) : (
                  blockedIPs.map((blocked) => (
                    <div
                      key={blocked.encryptedIP}
                      className="p-3 rounded-lg border border-red-500/20 bg-red-500/5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="text-sm font-mono bg-red-500/10 px-2 py-1 rounded">
                              {blocked.encryptedIP}
                            </code>
                            {blocked.isTemporary && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                TEMP
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>Reason: {blocked.reason}</div>
                            <div>Blocked by: {blocked.blockedBy}</div>
                            <div>Time: {formatTimeAgo(blocked.blockTime)}</div>
                            {blocked.unblockTime && (
                              <div>
                                Unblocks in:{" "}
                                {Math.max(
                                  0,
                                  Math.ceil(
                                    (blocked.unblockTime - Date.now()) / 60000,
                                  ),
                                )}
                                m
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnblockIP(blocked.encryptedIP)}
                          className="h-6 px-2 text-xs"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnlineUsersMonitor;
