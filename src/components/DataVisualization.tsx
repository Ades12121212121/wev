import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminAuth } from "@/services/adminAuth";
import { realDataService, type RealMetrics } from "@/services/realDataService";
import AdminLogin from "./AdminLogin";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Shield, Lock } from "lucide-react";

// Animated Counter Component
const AnimatedCounter = ({
  value,
  duration = 2000,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * easeOutCubic);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="font-mono">
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// Glowing Progress Bar
const GlowingProgress = ({
  value,
  className = "",
  color = "primary",
  animated = true,
}: {
  value: number;
  className?: string;
  color?: string;
  animated?: boolean;
}) => {
  return (
    <div className={`relative ${className}`}>
      <Progress value={value} className="h-3" />
      {animated && (
        <motion.div
          className="absolute inset-0 h-3 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(0, 195, 255, 0.5), transparent)`,
            width: "20px",
          }}
          animate={{
            x: ["0%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
      <div
        className="absolute inset-0 h-3 rounded-full animate-pulse"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.2) ${value}%, transparent ${value + 10}%)`,
          boxShadow: `0 0 10px rgba(0, 195, 255, 0.3)`,
        }}
      />
    </div>
  );
};

// 3D Metric Card
const MetricCard = ({
  title,
  value,
  change,
  icon,
  color = "primary",
  trend = "up",
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: "up" | "down" | "stable";
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ perspective: "1000px" }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border-border/50 backdrop-blur-sm">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono text-muted-foreground">
              {title}
            </CardTitle>
            <motion.div
              animate={{
                rotate: isHovered ? 360 : 0,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.5 }}
              className="text-primary"
            >
              {icon}
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-mono font-bold text-primary mb-2">
            <AnimatedCounter value={typeof value === "number" ? value : 0} />
            {typeof value === "string" && value}
          </div>
          {change && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center text-sm ${
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                    ? "text-red-500"
                    : "text-yellow-500"
              }`}
            >
              <motion.span
                animate={{ y: trend === "up" ? [-2, 2, -2] : [2, -2, 2] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
              </motion.span>
              <span className="ml-1 font-mono">{change}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Animated Chart Container
const AnimatedChart = ({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader>
        <CardTitle className="font-mono text-lg flex items-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-2 h-2 bg-primary rounded-full mr-3"
          />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

// Main Data Visualization Component
const DataVisualization = () => {
  const [realTimeData, setRealTimeData] = useState<RealMetrics | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    setIsAuthenticated(adminAuth.isAuthenticated());
  }, []);

  // Update real-time data from service
  useEffect(() => {
    const updateData = () => {
      if (isAuthenticated) {
        const metrics = realDataService.getMetrics();
        setRealTimeData(metrics);
      }
    };

    updateData(); // Initial load
    const interval = setInterval(updateData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAdminLogin(false);
  };

  const handleLogout = () => {
    adminAuth.logout();
    setIsAuthenticated(false);
    setRealTimeData(null);
  };

  // Show admin login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <Card className="p-8 text-center bg-muted/20 border-border">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-mono font-bold mb-4">
            RESTRICTED ACCESS
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Real analytics data is restricted to administrators only. Please
            authenticate with your admin key to view live metrics.
          </p>
          <Button onClick={() => setShowAdminLogin(true)} className="font-mono">
            <Shield className="h-4 w-4 mr-2" />
            ADMIN LOGIN
          </Button>
        </Card>

        {showAdminLogin && (
          <AdminLogin
            onAuthSuccess={handleAuthSuccess}
            onClose={() => setShowAdminLogin(false)}
          />
        )}
      </div>
    );
  }

  if (!realTimeData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <span className="ml-3 font-mono">Loading real data...</span>
      </div>
    );
  }

  const pieData = [
    {
      name: "Windows",
      value: realTimeData.platformDistribution.windows,
      fill: "#00C3FF",
    },
    {
      name: "Linux",
      value: realTimeData.platformDistribution.linux,
      fill: "#00FF41",
    },
    {
      name: "Mac",
      value: realTimeData.platformDistribution.mac,
      fill: "#FF6B35",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Badge variant="outline" className="mb-2 font-mono text-xs">
            ADMIN MODE - REAL DATA
          </Badge>
          <p className="text-sm text-muted-foreground">
            Authenticated as: {adminAuth.getSession().adminKey?.slice(0, 16)}...
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="font-mono">
          <Lock className="h-4 w-4 mr-2" />
          LOGOUT
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          title="TOTAL DOWNLOADS"
          value={realTimeData.totalDownloads}
          change="+12.5%"
          trend="up"
          icon={
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📥
            </motion.div>
          }
        />
        <MetricCard
          title="ACTIVE USERS"
          value={realTimeData.activeUsers}
          change="+8.3%"
          trend="up"
          icon={
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              👥
            </motion.div>
          }
        />
        <MetricCard
          title="SUCCESS RATE"
          value={`${realTimeData.successRate.toFixed(1)}%`}
          change="stable"
          trend="stable"
          icon={
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✅
            </motion.div>
          }
        />
        <MetricCard
          title="SYSTEM LOAD"
          value={`${realTimeData.systemLoad.toFixed(1)}%`}
          change={realTimeData.systemLoad > 50 ? "high" : "normal"}
          trend={realTimeData.systemLoad > 50 ? "up" : "stable"}
          icon={
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              ⚙️
            </motion.div>
          }
        />
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <AnimatedChart title="ACTIVITY TIMELINE">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={realTimeData.hourlyData}>
              <defs>
                <linearGradient
                  id="downloadGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#00C3FF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00C3FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF41" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00FF41" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Area
                type="monotone"
                dataKey="downloads"
                stroke="#00C3FF"
                fillOpacity={1}
                fill="url(#downloadGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#00FF41"
                fillOpacity={1}
                fill="url(#userGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </AnimatedChart>

        {/* Platform Distribution */}
        <AnimatedChart title="PLATFORM DISTRIBUTION">
          <div className="flex items-center justify-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {pieData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center space-x-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm font-mono">{item.name}</span>
                <Badge variant="outline" className="text-xs">
                  {item.value}%
                </Badge>
              </motion.div>
            ))}
          </div>
        </AnimatedChart>
      </div>

      {/* System Status Bars */}
      <Card className="p-6">
        <CardTitle className="font-mono text-lg mb-6">
          SYSTEM PERFORMANCE
        </CardTitle>
        <div className="space-y-6">
          {[
            {
              label: "CPU Usage",
              value: realTimeData.cpuUsage,
              color: "#00C3FF",
            },
            {
              label: "Memory",
              value: realTimeData.memoryUsage,
              color: "#00FF41",
            },
            {
              label: "Network",
              value: realTimeData.networkUsage,
              color: "#FF6B35",
            },
            {
              label: "Storage",
              value: realTimeData.storageUsage,
              color: "#9945FF",
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm">{metric.label}</span>
                <span className="font-mono text-sm text-primary">
                  <AnimatedCounter value={metric.value} suffix="%" />
                </span>
              </div>
              <GlowingProgress value={metric.value} />
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DataVisualization;
