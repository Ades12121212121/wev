interface SecurityHeaders {
  "User-Agent": string;
  Accept: string;
  "Accept-Language": string;
  "Accept-Encoding": string;
  Referer?: string;
}

interface RequestValidationResult {
  isValid: boolean;
  reason?: string;
  riskScore: number; // 0-100, donde 100 es más riesgoso
}

class RequestValidator {
  private suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /python/i,
    /curl/i,
    /wget/i,
    /httpclient/i,
  ];

  private blockedUserAgents = ["", "null", "undefined"];

  private validReferers = [
    window.location.origin,
    "https://github.com",
    "https://google.com",
    "https://bing.com",
    "https://duckduckgo.com",
  ];

  public validateRequest(
    headers: Partial<SecurityHeaders> = {},
  ): RequestValidationResult {
    let riskScore = 0;
    const reasons: string[] = [];

    // Validar User-Agent
    const userAgent = headers["User-Agent"] || navigator.userAgent;
    if (
      !userAgent ||
      this.blockedUserAgents.includes(userAgent.toLowerCase())
    ) {
      riskScore += 40;
      reasons.push("Invalid or missing User-Agent");
    }

    // Detectar patrones sospechosos en User-Agent
    if (this.suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
      riskScore += 30;
      reasons.push("Suspicious User-Agent pattern detected");
    }

    // Validar Accept headers
    const accept = headers["Accept"] || "";
    if (!accept.includes("text/html") && !accept.includes("*/*")) {
      riskScore += 20;
      reasons.push("Suspicious Accept header");
    }

    // Validar Referer si está presente
    const referer = headers["Referer"] || document.referrer;
    if (referer && !this.isValidReferer(referer)) {
      riskScore += 15;
      reasons.push("Suspicious referer");
    }

    // Verificar características del navegador
    if (typeof window !== "undefined") {
      // Verificar si JavaScript está habilitado (obvio que sí si llegamos aquí)
      if (!window.navigator) {
        riskScore += 50;
        reasons.push("Invalid browser environment");
      }

      // Verificar resolución de pantalla de forma segura
      try {
        if (
          window.screen &&
          (window.screen.width < 800 || window.screen.height < 600)
        ) {
          riskScore += 10;
          reasons.push("Unusual screen resolution");
        }
      } catch (e) {
        // Ignorar errores de screen si no está disponible
      }

      // Verificar timezone
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!timezone) {
          riskScore += 15;
          reasons.push("Missing timezone information");
        }
      } catch (e) {
        riskScore += 20;
        reasons.push("Invalid timezone configuration");
      }
    }

    return {
      isValid: riskScore < 50, // Si el score es menor a 50, consideramos válida la request
      reason: reasons.join("; "),
      riskScore,
    };
  }

  private isValidReferer(referer: string): boolean {
    try {
      const url = new URL(referer);
      return this.validReferers.some((validReferer) => {
        if (validReferer === window.location.origin) {
          return url.origin === validReferer;
        }
        return url.hostname.includes(validReferer.replace("https://", ""));
      });
    } catch {
      return false;
    }
  }

  public validateDownloadRequest(): RequestValidationResult {
    const baseValidation = this.validateRequest();

    // Validaciones adicionales para descargas
    let additionalRisk = 0;
    const additionalReasons: string[] = [];

    // Verificar si es la primera visita (más riesgoso)
    if (!document.referrer && !sessionStorage.getItem("hydra-visited")) {
      additionalRisk += 25;
      additionalReasons.push("Direct access to download");
    }

    // Marcar que el usuario ha visitado el sitio
    sessionStorage.setItem("hydra-visited", "true");

    // Verificar tiempo en la página (muy rápido = sospechoso)
    const pageLoadTime =
      Date.now() - (window.performance?.timing?.navigationStart || Date.now());
    if (pageLoadTime < 5000) {
      // Menos de 5 segundos
      additionalRisk += 15;
      additionalReasons.push("Too quick download attempt");
    }

    return {
      isValid:
        baseValidation.isValid &&
        baseValidation.riskScore + additionalRisk < 60,
      reason: [baseValidation.reason, ...additionalReasons]
        .filter(Boolean)
        .join("; "),
      riskScore: baseValidation.riskScore + additionalRisk,
    };
  }

  public validateDonationRequest(amount: string): RequestValidationResult {
    const baseValidation = this.validateRequest();

    let additionalRisk = 0;
    const additionalReasons: string[] = [];

    // Validar cantidad
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      additionalRisk += 30;
      additionalReasons.push("Invalid donation amount");
    }

    // Cantidades sospechosamente altas
    if (numAmount > 1000) {
      additionalRisk += 20;
      additionalReasons.push("Unusually high donation amount");
    }

    // Verificar intentos previos de donación
    const donationAttempts = parseInt(
      sessionStorage.getItem("donation-attempts") || "0",
    );
    if (donationAttempts > 5) {
      additionalRisk += 40;
      additionalReasons.push("Too many donation attempts");
    }

    return {
      isValid:
        baseValidation.isValid &&
        baseValidation.riskScore + additionalRisk < 70,
      reason: [baseValidation.reason, ...additionalReasons]
        .filter(Boolean)
        .join("; "),
      riskScore: baseValidation.riskScore + additionalRisk,
    };
  }
}

export const requestValidator = new RequestValidator();

// Función para registrar intentos de donación
export const incrementDonationAttempts = (): void => {
  const attempts =
    parseInt(sessionStorage.getItem("donation-attempts") || "0") + 1;
  sessionStorage.setItem("donation-attempts", attempts.toString());
};

// Función para verificar la integridad del cliente
export const performClientIntegrityCheck = (): boolean => {
  // Verificar que estamos en un navegador real
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  // Verificar que tenemos acceso a APIs básicas del navegador
  const requiredAPIs = [
    "localStorage",
    "sessionStorage",
    "navigator",
    "screen",
    "location",
  ];

  for (const api of requiredAPIs) {
    if (!(api in window)) {
      return false;
    }
  }

  // Verificar que no estamos en un headless browser (detección básica)
  if (navigator.webdriver) {
    return false;
  }

  // Verificar que tenemos plugins típicos de navegadores reales
  try {
    if (
      navigator.plugins.length === 0 &&
      !navigator.userAgent.includes("Mobile")
    ) {
      return false;
    }
  } catch (e) {
    // Algunos navegadores pueden bloquear el acceso a plugins
    // No es crítico para la verificación
  }

  return true;
};
