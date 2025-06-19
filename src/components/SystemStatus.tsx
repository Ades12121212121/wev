import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wifi,
  Shield,
  Download,
  Server,
} from "lucide-react";

interface SystemService {
  id: string;
  name: string;
  status: "online" | "warning" | "offline";
  latency?: number;
  uptime?: number;
  icon: React.ReactNode;
}

const SystemStatus = () => {
  const [services, setServices] = useState<SystemService[]>([
    {
      id: "ddos-protection",
      name: "DDoS Protection",
      status: "online",
      latency: 0,
      uptime: 99.9,
      icon: <Shield className="h-3 w-3" />,
    },
    {
      id: "download-service",
      name: "Download Service",
      status: "online",
      latency: 0,
      uptime: 99.8,
      icon: <Download className="h-3 w-3" />,
    },
    {
      id: "github-api",
      name: "GitHub API",
      status: "online",
      latency: 0,
      uptime: 99.5,
      icon: <Server className="h-3 w-3" />,
    },
    {
      id: "connectivity",
      name: "Network",
      status: "online",
      latency: 0,
      uptime: 100,
      icon: <Wifi className="h-3 w-3" />,
    },
  ]);

  const [overallStatus, setOverallStatus] = useState<
    "operational" | "degraded" | "outage"
  >("operational");

  // Simular monitoreo de servicios
  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((service) => {
          // Simular latencia y estado
          const randomLatency = Math.floor(Math.random() * 100) + 10;
          const randomStatus =
            Math.random() > 0.95
              ? "warning"
              : Math.random() > 0.99
                ? "offline"
                : "online";

          return {
            ...service,
            latency: randomLatency,
            status: randomStatus as "online" | "warning" | "offline",
            uptime: service.uptime! - (randomStatus === "offline" ? 0.1 : 0),
          };
        }),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Determinar estado general
  useEffect(() => {
    const offlineServices = services.filter(
      (s) => s.status === "offline",
    ).length;
    const warningServices = services.filter(
      (s) => s.status === "warning",
    ).length;

    if (offlineServices > 0) {
      setOverallStatus("outage");
    } else if (warningServices > 0) {
      setOverallStatus("degraded");
    } else {
      setOverallStatus("operational");
    }
  }, [services]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
      case "operational":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case "offline":
      case "outage":
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <CheckCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "operational":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "warning":
      case "degraded":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "offline":
      case "outage":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
        return "All Systems Operational";
      case "degraded":
        return "Degraded Performance";
      case "outage":
        return "Service Outage";
      default:
        return "Unknown Status";
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        {/* Status Indicator compacto */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1">
              {getStatusIcon(overallStatus)}
              <span className="text-xs font-mono hidden sm:inline">
                {overallStatus.toUpperCase()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" className="w-80">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono font-bold text-sm">SYSTEM STATUS</h3>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(overallStatus)}`}
                  >
                    {getStatusText(overallStatus)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-2 rounded bg-muted/30"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-muted-foreground">
                          {service.icon}
                        </div>
                        <span className="text-xs font-mono">
                          {service.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {service.latency !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {service.latency}ms
                          </span>
                        )}
                        {getStatusIcon(service.status)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Average Uptime</span>
                    <span className="font-mono">
                      {(
                        services.reduce((acc, s) => acc + (s.uptime || 0), 0) /
                        services.length
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default SystemStatus;
