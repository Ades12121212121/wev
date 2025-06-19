interface OnlineUser {
  id: string;
  encryptedIP: string;
  realIP: string; // Solo para admin, no se muestra en frontend público
  userAgent: string;
  platform: string;
  location: string;
  connectTime: number;
  lastActivity: number;
  requestCount: number;
  isBlocked: boolean;
  isSuspicious: boolean;
  threatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requestsPerMinute: number;
  downloads: number;
  country: string;
  city: string;
}

interface DDoSActivity {
  id: string;
  encryptedIP: string;
  attackType: string;
  requestCount: number;
  startTime: number;
  endTime?: number;
  isActive: boolean;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

interface BlockedIP {
  encryptedIP: string;
  realIP: string;
  reason: string;
  blockTime: number;
  blockedBy: string;
  isTemporary: boolean;
  unblockTime?: number;
}

class IPTrackingService {
  private onlineUsers: Map<string, OnlineUser> = new Map();
  private ddosActivities: DDoSActivity[] = [];
  private blockedIPs: Map<string, BlockedIP> = new Map();
  private requestHistory: Map<string, number[]> = new Map();

  constructor() {
    this.initializeTracking();
    this.startMonitoring();
    this.loadBlockedIPs();
  }

  private initializeTracking(): void {
    // Generar algunos usuarios ficticios para demostración
    this.generateMockUsers();

    // Rastrear usuario actual
    this.trackCurrentUser();
  }

  private generateMockUsers(): void {
    const mockUsers = [
      {
        platform: "windows",
        country: "US",
        city: "New York",
        suspicious: false,
        requestsPerMinute: 5,
      },
      {
        platform: "linux",
        country: "DE",
        city: "Berlin",
        suspicious: false,
        requestsPerMinute: 3,
      },
      {
        platform: "windows",
        country: "CN",
        city: "Beijing",
        suspicious: true,
        requestsPerMinute: 45, // Sospechoso
      },
      {
        platform: "mac",
        country: "JP",
        city: "Tokyo",
        suspicious: false,
        requestsPerMinute: 7,
      },
      {
        platform: "linux",
        country: "RU",
        city: "Moscow",
        suspicious: true,
        requestsPerMinute: 67, // DDoS
      },
    ];

    mockUsers.forEach((mock, index) => {
      const userId = `user_${Date.now()}_${index}`;
      const realIP = this.generateMockIP();
      const encryptedIP = this.encryptIP(realIP);

      const user: OnlineUser = {
        id: userId,
        encryptedIP,
        realIP,
        userAgent: this.generateMockUserAgent(mock.platform),
        platform: mock.platform,
        location: `${mock.city}, ${mock.country}`,
        connectTime: Date.now() - Math.random() * 300000, // Conectado en últimos 5 min
        lastActivity: Date.now() - Math.random() * 60000, // Actividad en último minuto
        requestCount: Math.floor(Math.random() * 100) + 20,
        isBlocked: false,
        isSuspicious: mock.suspicious,
        threatLevel: mock.suspicious
          ? mock.requestsPerMinute > 50
            ? "CRITICAL"
            : "HIGH"
          : "LOW",
        requestsPerMinute: mock.requestsPerMinute,
        downloads: Math.floor(Math.random() * 5),
        country: mock.country,
        city: mock.city,
      };

      this.onlineUsers.set(userId, user);

      // Generar actividad DDoS para usuarios sospechosos
      if (mock.suspicious && mock.requestsPerMinute > 40) {
        this.ddosActivities.push({
          id: `ddos_${Date.now()}_${index}`,
          encryptedIP,
          attackType:
            mock.requestsPerMinute > 60
              ? "Volume Attack"
              : "Rate Limiting Abuse",
          requestCount: mock.requestsPerMinute * 3,
          startTime: Date.now() - Math.random() * 120000,
          isActive: true,
          severity: mock.requestsPerMinute > 60 ? "CRITICAL" : "HIGH",
        });
      }
    });
  }

  private trackCurrentUser(): void {
    const userId =
      sessionStorage.getItem("hydra-session-id") ||
      `user_${Date.now()}_current`;
    const realIP = this.getCurrentUserIP();
    const encryptedIP = this.encryptIP(realIP);

    const currentUser: OnlineUser = {
      id: userId,
      encryptedIP,
      realIP,
      userAgent: navigator.userAgent,
      platform: this.detectPlatform(),
      location: "Unknown", // En producción usar geolocation API
      connectTime: Date.now(),
      lastActivity: Date.now(),
      requestCount: 1,
      isBlocked: false,
      isSuspicious: false,
      threatLevel: "LOW",
      requestsPerMinute: 1,
      downloads: 0,
      country: "XX",
      city: "Unknown",
    };

    this.onlineUsers.set(userId, currentUser);
  }

  private generateMockIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  private getCurrentUserIP(): string {
    // En desarrollo, usar IP mock. En producción usar servicio real
    return this.generateMockIP();
  }

  private encryptIP(ip: string): string {
    // Simple encryption para mostrar (en producción usar crypto real)
    const encoded = btoa(ip + Date.now().toString()).slice(0, 12);
    return `IP_${encoded}`;
  }

  private generateMockUserAgent(platform: string): string {
    const userAgents = {
      windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    };
    return (
      userAgents[platform as keyof typeof userAgents] || userAgents.windows
    );
  }

  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("win")) return "windows";
    if (userAgent.includes("mac")) return "mac";
    if (userAgent.includes("linux")) return "linux";
    return "unknown";
  }

  private startMonitoring(): void {
    // Monitoreo cada 5 segundos
    setInterval(() => {
      this.updateUserActivity();
      this.detectDDoSPatterns();
      this.cleanupInactiveUsers();
    }, 5000);

    // Cleanup cada minuto
    setInterval(() => {
      this.cleanupOldData();
    }, 60000);
  }

  private updateUserActivity(): void {
    // Simular actividad de usuarios
    this.onlineUsers.forEach((user, id) => {
      if (Math.random() > 0.7) {
        // 30% chance de actividad
        user.lastActivity = Date.now();
        user.requestCount++;

        // Simular patrones de requests
        if (user.isSuspicious) {
          user.requestsPerMinute = Math.min(
            100,
            user.requestsPerMinute + Math.random() * 10,
          );
        } else {
          user.requestsPerMinute = Math.max(
            1,
            user.requestsPerMinute + (Math.random() - 0.5) * 2,
          );
        }
      }
    });
  }

  private detectDDoSPatterns(): void {
    this.onlineUsers.forEach((user, id) => {
      // Detectar patrones sospechosos
      if (user.requestsPerMinute > 30 && !user.isSuspicious) {
        user.isSuspicious = true;
        user.threatLevel = "MEDIUM";
      }

      if (user.requestsPerMinute > 50) {
        user.threatLevel = "HIGH";

        // Auto-bloquear ataques críticos
        if (user.requestsPerMinute > 80) {
          user.threatLevel = "CRITICAL";
          this.autoBlockUser(user, "DDoS Attack Detected");
        }
      }
    });
  }

  private autoBlockUser(user: OnlineUser, reason: string): void {
    if (!user.isBlocked) {
      user.isBlocked = true;

      const blockedIP: BlockedIP = {
        encryptedIP: user.encryptedIP,
        realIP: user.realIP,
        reason,
        blockTime: Date.now(),
        blockedBy: "Auto-System",
        isTemporary: true,
        unblockTime: Date.now() + 30 * 60 * 1000, // 30 minutos
      };

      this.blockedIPs.set(user.encryptedIP, blockedIP);
      this.saveBlockedIPs();
    }
  }

  private cleanupInactiveUsers(): void {
    const inactiveThreshold = Date.now() - 10 * 60 * 1000; // 10 minutos

    this.onlineUsers.forEach((user, id) => {
      if (user.lastActivity < inactiveThreshold) {
        this.onlineUsers.delete(id);
      }
    });
  }

  private cleanupOldData(): void {
    // Limpiar actividades DDoS antiguas
    this.ddosActivities = this.ddosActivities.filter(
      (activity) => Date.now() - activity.startTime < 60 * 60 * 1000, // 1 hora
    );

    // Desbloquear IPs temporales
    this.blockedIPs.forEach((blocked, ip) => {
      if (
        blocked.isTemporary &&
        blocked.unblockTime &&
        Date.now() > blocked.unblockTime
      ) {
        this.blockedIPs.delete(ip);
      }
    });
  }

  private loadBlockedIPs(): void {
    try {
      const stored = localStorage.getItem("hydra-blocked-ips");
      if (stored) {
        const blocked = JSON.parse(stored);
        blocked.forEach((item: BlockedIP) => {
          this.blockedIPs.set(item.encryptedIP, item);
        });
      }
    } catch (error) {
      console.warn("Failed to load blocked IPs:", error);
    }
  }

  private saveBlockedIPs(): void {
    try {
      const blocked = Array.from(this.blockedIPs.values());
      localStorage.setItem("hydra-blocked-ips", JSON.stringify(blocked));
    } catch (error) {
      console.warn("Failed to save blocked IPs:", error);
    }
  }

  // Public methods
  getOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.values());
  }

  getDDoSActivities(): DDoSActivity[] {
    return this.ddosActivities.filter((activity) => activity.isActive);
  }

  getBlockedIPs(): BlockedIP[] {
    return Array.from(this.blockedIPs.values());
  }

  blockIP(
    encryptedIP: string,
    reason: string,
    isTemporary: boolean = true,
    adminKey: string,
  ): boolean {
    const user = Array.from(this.onlineUsers.values()).find(
      (u) => u.encryptedIP === encryptedIP,
    );

    if (user) {
      user.isBlocked = true;

      const blockedIP: BlockedIP = {
        encryptedIP,
        realIP: user.realIP,
        reason,
        blockTime: Date.now(),
        blockedBy: adminKey.slice(0, 16),
        isTemporary,
        unblockTime: isTemporary ? Date.now() + 60 * 60 * 1000 : undefined, // 1 hora
      };

      this.blockedIPs.set(encryptedIP, blockedIP);
      this.saveBlockedIPs();
      return true;
    }

    return false;
  }

  unblockIP(encryptedIP: string): boolean {
    if (this.blockedIPs.has(encryptedIP)) {
      this.blockedIPs.delete(encryptedIP);

      // Desbloquear usuario si está online
      const user = Array.from(this.onlineUsers.values()).find(
        (u) => u.encryptedIP === encryptedIP,
      );
      if (user) {
        user.isBlocked = false;
        user.threatLevel = "LOW";
      }

      this.saveBlockedIPs();
      return true;
    }

    return false;
  }

  isIPBlocked(encryptedIP: string): boolean {
    return this.blockedIPs.has(encryptedIP);
  }

  getThreatStats() {
    const users = this.getOnlineUsers();
    return {
      total: users.length,
      suspicious: users.filter((u) => u.isSuspicious).length,
      blocked: users.filter((u) => u.isBlocked).length,
      critical: users.filter((u) => u.threatLevel === "CRITICAL").length,
      high: users.filter((u) => u.threatLevel === "HIGH").length,
      activeDDoS: this.getDDoSActivities().length,
    };
  }

  recordUserRequest(userId: string): void {
    const user = this.onlineUsers.get(userId);
    if (user) {
      user.requestCount++;
      user.lastActivity = Date.now();

      // Actualizar RPM
      const currentMinute = Math.floor(Date.now() / 60000);
      const history = this.requestHistory.get(userId) || [];
      history.push(currentMinute);

      // Mantener solo último minuto
      const validHistory = history.filter((time) => time === currentMinute);
      this.requestHistory.set(userId, validHistory);

      user.requestsPerMinute = validHistory.length;
    }
  }
}

export const ipTrackingService = new IPTrackingService();
export type { OnlineUser, DDoSActivity, BlockedIP };
