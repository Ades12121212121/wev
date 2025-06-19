import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SecurityDashboard from "@/components/SecurityDashboard";
import DataVisualization from "@/components/DataVisualization";
import { adminAuth } from "@/services/adminAuth";
import { realDataService } from "@/services/realDataService";
import {
  Shield,
  BarChart3,
  Users,
  Download,
  Settings,
  LogOut,
  Terminal,
  Eye,
  Lock,
} from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState<string>("security");
  const [adminInfo, setAdminInfo] = useState(adminAuth.getSession());
  const [realTimeStats, setRealTimeStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDownloads: 0,
    successRate: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const metrics = realDataService.getMetrics();
      const sessions = realDataService.getActiveUserSessions();

      setRealTimeStats({
        totalUsers: sessions.length + Math.floor(Math.random() * 50), // Add some base users
        activeUsers: sessions.length,
        totalDownloads: metrics.totalDownloads,
        successRate: metrics.successRate,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    adminAuth.logout();
    onLogout();
  };

  const menuItems = [
    {
      id: "security",
      name: "Security Monitor",
      icon: Shield,
      description: "DDoS Protection & Security Analytics",
    },
    {
      id: "analytics",
      name: "Analytics Dashboard",
      description: "User metrics & platform analytics",
      icon: BarChart3,
    },
    {
      id: "users",
      name: "User Management",
      icon: Users,
      description: "Active sessions & user tracking",
    },
    {
      id: "downloads",
      name: "Download Analytics",
      icon: Download,
      description: "Download statistics & platform distribution",
    },
    {
      id: "system",
      name: "System Status",
      icon: Settings,
      description: "Server performance & system health",
    },
  ];

  const getPermissionLevel = () => {
    const key = adminInfo.adminKey || "";
    if (key.includes("MASTER")) return "Full Admin";
    if (key.includes("DEV")) return "Developer";
    if (key.includes("VIEW")) return "Read Only";
    return "Limited";
  };

  const renderContent = () => {
    switch (activeSection) {
      case "security":
        return <SecurityDashboard />;
      case "analytics":
        return <DataVisualization />;
      case "users":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-mono">
                  ACTIVE USER SESSIONS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {realDataService.getActiveUserSessions().map((session) => (
                    <div
                      key={session.id}
                      className="p-4 border border-border rounded-lg bg-muted/20"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-sm font-bold">
                            {session.id.slice(0, 20)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Platform: {session.platform} | Downloads:{" "}
                            {session.downloads}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Active:{" "}
                            {Math.floor(
                              (Date.now() - session.lastActivity) / 1000,
                            )}
                            s ago
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {session.platform}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "downloads":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Downloads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold text-primary">
                    {realTimeStats.totalDownloads}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold text-green-500">
                    {realTimeStats.successRate.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold text-blue-500">
                    {realTimeStats.activeUsers}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold text-purple-500">
                    {realTimeStats.totalUsers}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "system":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-mono">SYSTEM INFORMATION</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                  <div>
                    Server Status:{" "}
                    <span className="text-green-500">Online</span>
                  </div>
                  <div>
                    Uptime: <span className="text-primary">99.9%</span>
                  </div>
                  <div>
                    Build Version:{" "}
                    <span className="text-muted-foreground">v2.1.0</span>
                  </div>
                  <div>
                    Environment:{" "}
                    <span className="text-yellow-500">Production</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <SecurityDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Terminal className="h-8 w-8 text-primary" />
              <div>
                <span className="font-mono text-xl font-bold tracking-tight">
                  HYDRA ADMIN
                </span>
                <Badge variant="outline" className="ml-3 text-xs">
                  {getPermissionLevel()}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground font-mono">
                Logged in as: {adminInfo.adminKey?.slice(0, 16)}...
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="font-mono"
              >
                <LogOut className="h-4 w-4 mr-2" />
                LOGOUT
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-muted/20 border-r border-border">
          <div className="p-6">
            <h2 className="font-mono font-bold text-sm mb-4">ADMIN MODULES</h2>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? "bg-primary/20 border border-primary/50 text-primary"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 mt-0.5" />
                      <div>
                        <div className="font-mono font-bold text-sm">
                          {item.name}
                        </div>
                        <div className="text-xs opacity-80">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats in Sidebar */}
          <div className="p-6 border-t border-border">
            <h3 className="font-mono font-bold text-xs mb-3 text-muted-foreground">
              QUICK STATS
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span>Active Users:</span>
                <span className="text-primary">
                  {realTimeStats.activeUsers}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Downloads:</span>
                <span className="text-green-500">
                  {realTimeStats.totalDownloads}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="text-blue-500">
                  {realTimeStats.successRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-mono font-bold tracking-tighter mb-2">
                {menuItems.find((item) => item.id === activeSection)?.name ||
                  "Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                {menuItems.find((item) => item.id === activeSection)
                  ?.description || "Admin dashboard"}
              </p>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
