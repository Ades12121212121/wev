import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SecurityDashboard from "@/components/SecurityDashboard";
import { adminAuth } from "@/services/adminAuth";
import { Terminal, LogOut, ArrowLeft } from "lucide-react";

interface SecurityPageProps {
  onLogout: () => void;
  onBack: () => void;
}

const SecurityPage = ({ onLogout, onBack }: SecurityPageProps) => {
  const [adminInfo, setAdminInfo] = useState(adminAuth.getSession());

  useEffect(() => {
    // Redirect if not authenticated
    if (!adminAuth.isAuthenticated()) {
      onBack();
    }
  }, [onBack]);

  const handleLogout = () => {
    adminAuth.logout();
    onLogout();
  };

  const getPermissionLevel = () => {
    const key = adminInfo.adminKey || "";
    if (key.includes("MASTER")) return "Full Admin";
    if (key.includes("DEV")) return "Developer";
    if (key.includes("VIEW")) return "Read Only";
    return "Limited";
  };

  if (!adminAuth.isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Security Page Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="font-mono"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                BACK
              </Button>
              <Terminal className="h-8 w-8 text-primary" />
              <div>
                <span className="font-mono text-xl font-bold tracking-tight">
                  HYDRA SECURITY
                </span>
                <Badge variant="outline" className="ml-3 text-xs">
                  {getPermissionLevel()}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground font-mono">
                Admin: {adminInfo.adminKey?.slice(0, 16)}...
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

      {/* Security Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter mb-4">
            SECURITY MONITOR
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Advanced DDoS protection system with real-time threat monitoring and
            analysis
          </p>
        </div>

        <SecurityDashboard />
      </div>
    </div>
  );
};

export default SecurityPage;
