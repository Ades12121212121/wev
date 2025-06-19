import { useState, useEffect, useCallback } from "react";
import {
  useRateLimit,
  downloadRateLimiter,
  generalRateLimiter,
  donationRateLimiter,
} from "@/lib/rateLimiter";
import {
  requestValidator,
  performClientIntegrityCheck,
  incrementDonationAttempts,
} from "@/lib/requestValidator";

interface DDoSProtectionStatus {
  isProtected: boolean;
  canDownload: boolean;
  canDonate: boolean;
  requestsRemaining: number;
  nextResetTime: number;
  riskScore: number;
  blockedReason?: string;
}

interface ProtectedRequestOptions {
  type: "download" | "donation" | "general";
  data?: any;
}

export const useDDoSProtection = () => {
  const [status, setStatus] = useState<DDoSProtectionStatus>({
    isProtected: true,
    canDownload: true,
    canDonate: true,
    requestsRemaining: 100,
    nextResetTime: 0,
    riskScore: 0,
  });

  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>("");

  const downloadLimiter = useRateLimit(downloadRateLimiter);
  const generalLimiter = useRateLimit(generalRateLimiter);
  const donationLimiter = useRateLimit(donationRateLimiter);

  // Verificación inicial de integridad del cliente
  useEffect(() => {
    const integrityCheck = performClientIntegrityCheck();
    if (!integrityCheck) {
      setIsBlocked(true);
      setBlockReason("Client integrity check failed");
      return;
    }

    // Verificar validación básica de request
    const validation = requestValidator.validateRequest();
    if (!validation.isValid) {
      setIsBlocked(true);
      setBlockReason(validation.reason || "Request validation failed");
      return;
    }

    setStatus((prev) => ({
      ...prev,
      riskScore: validation.riskScore,
    }));
  }, []);

  // Actualizar estado de protección periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (isBlocked) return;

      setStatus((prev) => ({
        ...prev,
        canDownload: downloadLimiter.checkLimit(),
        canDonate: donationLimiter.checkLimit(),
        requestsRemaining: generalLimiter.getRemainingRequests(),
        nextResetTime: generalLimiter.getResetTime(),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [downloadLimiter, donationLimiter, generalLimiter, isBlocked]);

  const executeProtectedRequest = useCallback(
    async (
      options: ProtectedRequestOptions,
      callback: () => Promise<void> | void,
    ): Promise<boolean> => {
      if (isBlocked) {
        throw new Error(`Request blocked: ${blockReason}`);
      }

      let limiter;
      let validator;

      switch (options.type) {
        case "download":
          limiter = downloadLimiter;
          validator = () => requestValidator.validateDownloadRequest();
          break;
        case "donation":
          limiter = donationLimiter;
          validator = () =>
            requestValidator.validateDonationRequest(
              options.data?.amount || "0",
            );
          break;
        case "general":
        default:
          limiter = generalLimiter;
          validator = () => requestValidator.validateRequest();
          break;
      }

      // Verificar rate limit
      if (!limiter.checkLimit()) {
        const resetTime = new Date(limiter.getResetTime()).toLocaleTimeString();
        throw new Error(`Rate limit exceeded. Try again at ${resetTime}`);
      }

      // Validar request
      const validation = validator();
      if (!validation.isValid) {
        // Bloquear temporalmente si el risk score es muy alto
        if (validation.riskScore > 80) {
          setIsBlocked(true);
          setBlockReason(validation.reason || "High risk request detected");

          // Desbloquear después de 5 minutos
          setTimeout(() => {
            setIsBlocked(false);
            setBlockReason("");
          }, 300000);
        }

        throw new Error(`Request validation failed: ${validation.reason}`);
      }

      // Registrar intento si es donación
      if (options.type === "donation") {
        incrementDonationAttempts();
      }

      // Ejecutar callback
      try {
        await callback();
        return true;
      } catch (error) {
        console.error("Protected request failed:", error);
        return false;
      }
    },
    [isBlocked, blockReason, downloadLimiter, donationLimiter, generalLimiter],
  );

  const checkDownloadPermission = useCallback((): boolean => {
    if (isBlocked) return false;
    return downloadLimiter.checkLimit();
  }, [isBlocked, downloadLimiter]);

  const checkDonationPermission = useCallback((): boolean => {
    if (isBlocked) return false;
    return donationLimiter.checkLimit();
  }, [isBlocked, donationLimiter]);

  const getProtectionStatus = useCallback((): DDoSProtectionStatus => {
    return {
      ...status,
      isProtected: !isBlocked,
      blockedReason: isBlocked ? blockReason : undefined,
    };
  }, [status, isBlocked, blockReason]);

  const getSecurityHeaders = useCallback(() => {
    return {
      "X-Client-Protection": "hydra-ddos-shield",
      "X-Request-ID": crypto.randomUUID(),
      "X-Timestamp": Date.now().toString(),
      "X-Risk-Score": status.riskScore.toString(),
    };
  }, [status.riskScore]);

  // Función para reportar actividad sospechosa
  const reportSuspiciousActivity = useCallback(
    (reason: string, severity: "low" | "medium" | "high" = "medium") => {
      console.warn(
        `[HYDRA SECURITY] Suspicious activity detected: ${reason} (Severity: ${severity})`,
      );

      // En un entorno real, esto enviaría data a un sistema de monitoring
      const securityEvent = {
        timestamp: new Date().toISOString(),
        type: "suspicious_activity",
        reason,
        severity,
        userAgent: navigator.userAgent,
        url: window.location.href,
        riskScore: status.riskScore,
      };

      // Guardar en localStorage para debugging (en producción sería enviado a servidor)
      const events = JSON.parse(
        localStorage.getItem("hydra-security-events") || "[]",
      );
      events.push(securityEvent);
      localStorage.setItem(
        "hydra-security-events",
        JSON.stringify(events.slice(-50)),
      ); // Mantener últimos 50 eventos
    },
    [status.riskScore],
  );

  return {
    status: getProtectionStatus(),
    isBlocked,
    blockReason,
    executeProtectedRequest,
    checkDownloadPermission,
    checkDonationPermission,
    getSecurityHeaders,
    reportSuspiciousActivity,
  };
};
