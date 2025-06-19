interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en millisegundos
  maxRequests: number; // Máximo número de requests permitidos
}

interface RequestRecord {
  count: number;
  windowStart: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Limpiar registros antiguos cada minuto
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  public isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record) {
      // Primera request de este identificador
      this.requests.set(identifier, {
        count: 1,
        windowStart: now,
      });
      return true;
    }

    // Verificar si estamos en una nueva ventana de tiempo
    if (now - record.windowStart >= this.config.windowMs) {
      // Nueva ventana, resetear contador
      this.requests.set(identifier, {
        count: 1,
        windowStart: now,
      });
      return true;
    }

    // Misma ventana, verificar límite
    if (record.count >= this.config.maxRequests) {
      return false; // Rate limit excedido
    }

    // Incrementar contador
    record.count++;
    return true;
  }

  public getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) {
      return this.config.maxRequests;
    }

    const now = Date.now();
    if (now - record.windowStart >= this.config.windowMs) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - record.count);
  }

  public getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) {
      return 0;
    }

    return record.windowStart + this.config.windowMs;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, record] of this.requests.entries()) {
      if (now - record.windowStart >= this.config.windowMs * 2) {
        this.requests.delete(identifier);
      }
    }
  }
}

// Rate limiters para diferentes tipos de requests
export const downloadRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minuto
  maxRequests: 5, // Máximo 5 descargas por minuto
});

export const generalRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minuto
  maxRequests: 100, // Máximo 100 requests por minuto
});

export const donationRateLimiter = new RateLimiter({
  windowMs: 300000, // 5 minutos
  maxRequests: 3, // Máximo 3 intentos de donación cada 5 minutos
});

// Utilidad para obtener identificador único del cliente
export const getClientIdentifier = (): string => {
  // En un entorno real, usarías la IP del cliente
  // Para el frontend, usamos una combinación de factores
  try {
    const userAgent = navigator?.userAgent || "unknown";
    const screenInfo =
      typeof window !== "undefined" && window.screen
        ? `${window.screen.width}x${window.screen.height}`
        : "1920x1080";
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const language = navigator?.language || "en";

    // Crear un hash simple basado en estas características
    let hash = 0;
    const str = `${userAgent}-${screenInfo}-${timezone}-${language}`;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convertir a 32bit integer
    }

    return Math.abs(hash).toString();
  } catch (error) {
    // Fallback si hay algún error
    return "fallback-" + Math.random().toString(36).substr(2, 9);
  }
};

// Hook para usar rate limiting en componentes React
export const useRateLimit = (limiter: RateLimiter) => {
  // Obtener clientId de forma segura después de que el componente se monte
  const getClientId = (): string => {
    if (typeof window === "undefined") {
      return "ssr-fallback";
    }
    return getClientIdentifier();
  };

  const checkLimit = (): boolean => {
    const clientId = getClientId();
    return limiter.isAllowed(clientId);
  };

  const getRemainingRequests = (): number => {
    const clientId = getClientId();
    return limiter.getRemainingRequests(clientId);
  };

  const getResetTime = (): number => {
    const clientId = getClientId();
    return limiter.getResetTime(clientId);
  };

  return {
    checkLimit,
    getRemainingRequests,
    getResetTime,
  };
};
