interface AdminSession {
  isAuthenticated: boolean;
  adminKey: string | null;
  sessionExpiry: number;
  permissions: string[];
}

interface WebhookPayload {
  key: string;
  timestamp: number;
  action: "validate" | "revoke" | "refresh";
  userAgent: string;
  fingerprint: string;
}

class AdminAuthService {
  private session: AdminSession = {
    isAuthenticated: false,
    adminKey: null,
    sessionExpiry: 0,
    permissions: [],
  };

  private webhookUrl = ""; // Disabled to avoid CORS - logs to console instead
  private validAdminKeys = [
    "HYDRA_ADMIN_2024_MASTER",
    "HYDRA_DEV_ADMIN_KEY",
    "HYDRA_ANALYTICS_VIEW",
  ];

  constructor() {
    this.loadSession();
    this.setupSessionRefresh();
  }

  private loadSession(): void {
    try {
      const stored = localStorage.getItem("hydra-admin-session");
      if (stored) {
        const session = JSON.parse(stored);
        if (session.sessionExpiry > Date.now()) {
          this.session = session;
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.warn("Failed to load admin session:", error);
      this.clearSession();
    }
  }

  private saveSession(): void {
    try {
      localStorage.setItem("hydra-admin-session", JSON.stringify(this.session));
    } catch (error) {
      console.warn("Failed to save admin session:", error);
    }
  }

  private clearSession(): void {
    this.session = {
      isAuthenticated: false,
      adminKey: null,
      sessionExpiry: 0,
      permissions: [],
    };
    localStorage.removeItem("hydra-admin-session");
  }

  private getFingerprint(): string {
    // Simple browser fingerprint
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx?.fillText("Hydra Admin", 10, 10);
    const canvasData = canvas.toDataURL();

    const fingerprint = btoa(
      `${navigator.userAgent}-${screen.width}x${screen.height}-${navigator.language}-${canvasData.slice(-20)}`,
    ).slice(0, 32);

    return fingerprint;
  }

  private async sendWebhook(payload: WebhookPayload): Promise<boolean> {
    try {
      const webhookData = {
        ...payload,
        source: "hydra-tools",
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      // Log to console for debugging (replace with actual webhook in production)
      console.log("🔒 Admin Auth Event:", webhookData);

      // Store in localStorage for admin tracking
      const events = JSON.parse(
        localStorage.getItem("hydra-admin-events") || "[]",
      );
      events.push(webhookData);
      localStorage.setItem(
        "hydra-admin-events",
        JSON.stringify(events.slice(-50)),
      );

      // If webhook URL is provided, try to send (with CORS handling)
      if (this.webhookUrl) {
        // Use img element for simple GET request to avoid CORS
        const img = new Image();
        const params = new URLSearchParams(webhookData as any).toString();
        img.src = `${this.webhookUrl}?${params}`;
      }

      return true;
    } catch (error) {
      console.warn("Webhook logging failed:", error);
      return false;
    }
  }

  async authenticate(adminKey: string): Promise<boolean> {
    if (!adminKey || typeof adminKey !== "string") {
      return false;
    }

    const isValidKey = this.validAdminKeys.includes(adminKey);

    if (isValidKey) {
      const fingerprint = this.getFingerprint();

      // Send webhook for validation
      await this.sendWebhook({
        key: adminKey,
        timestamp: Date.now(),
        action: "validate",
        userAgent: navigator.userAgent,
        fingerprint,
      });

      // Set session
      this.session = {
        isAuthenticated: true,
        adminKey,
        sessionExpiry: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
        permissions: this.getPermissions(adminKey),
      };

      this.saveSession();
      return true;
    }

    return false;
  }

  logout(): void {
    if (this.session.isAuthenticated) {
      // Send revoke webhook
      this.sendWebhook({
        key: this.session.adminKey || "",
        timestamp: Date.now(),
        action: "revoke",
        userAgent: navigator.userAgent,
        fingerprint: this.getFingerprint(),
      });
    }

    this.clearSession();
  }

  isAuthenticated(): boolean {
    if (this.session.sessionExpiry <= Date.now()) {
      this.clearSession();
      return false;
    }
    return this.session.isAuthenticated;
  }

  hasPermission(permission: string): boolean {
    return (
      this.isAuthenticated() && this.session.permissions.includes(permission)
    );
  }

  getPermissions(adminKey: string): string[] {
    switch (adminKey) {
      case "HYDRA_ADMIN_2024_MASTER":
        return [
          "analytics.view",
          "analytics.admin",
          "system.admin",
          "users.admin",
        ];
      case "HYDRA_DEV_ADMIN_KEY":
        return ["analytics.view", "system.admin"];
      case "HYDRA_ANALYTICS_VIEW":
        return ["analytics.view"];
      default:
        return [];
    }
  }

  private setupSessionRefresh(): void {
    setInterval(
      () => {
        if (
          this.isAuthenticated() &&
          this.session.sessionExpiry - Date.now() < 30 * 60 * 1000
        ) {
          // Refresh session if less than 30 minutes remaining
          this.refreshSession();
        }
      },
      5 * 60 * 1000,
    ); // Check every 5 minutes
  }

  private async refreshSession(): Promise<void> {
    if (!this.session.adminKey) return;

    await this.sendWebhook({
      key: this.session.adminKey,
      timestamp: Date.now(),
      action: "refresh",
      userAgent: navigator.userAgent,
      fingerprint: this.getFingerprint(),
    });

    // Extend session
    this.session.sessionExpiry = Date.now() + 2 * 60 * 60 * 1000;
    this.saveSession();
  }

  getSession(): AdminSession {
    return { ...this.session };
  }
}

export const adminAuth = new AdminAuthService();
export type { AdminSession };
