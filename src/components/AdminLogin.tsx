import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminAuth } from "@/services/adminAuth";
import { Shield, Eye, EyeOff, Key, Lock } from "lucide-react";

interface AdminLoginProps {
  onAuthSuccess: () => void;
  onClose: () => void;
}

const AdminLogin = ({ onAuthSuccess, onClose }: AdminLoginProps) => {
  const [adminKey, setAdminKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await adminAuth.authenticate(adminKey);

      if (success) {
        onAuthSuccess();
        onClose();
      } else {
        setAttempts((prev) => prev + 1);
        setError("Invalid admin key. Access denied.");
        setAdminKey("");

        // Lock out after 3 failed attempts
        if (attempts >= 2) {
          setError("Too many failed attempts. Access temporarily locked.");
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      }
    } catch (error) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-mono text-xl">ADMIN ACCESS</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your admin key to access real analytics data
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-mono font-bold">ADMIN KEY</label>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key..."
                  className="font-mono pr-12"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm font-mono">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!adminKey || isLoading || attempts >= 3}
                className="flex-1 font-mono"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    ACCESS
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">
                SECURITY FEATURES
              </span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• Session expires after 2 hours</p>
              <p>• All access attempts are logged via webhook</p>
              <p>• Browser fingerprinting for security</p>
              <p>• Auto-logout on tab close</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Attempts: {attempts}/3
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
