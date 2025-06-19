import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import LoadingSystem from "@/components/LoadingSystem";
import NotificationCenter from "@/components/NotificationCenter";
import SystemStatus from "@/components/SystemStatus";
import DownloadManager from "@/components/DownloadManager";
import OptimizedVisualEffects from "@/components/OptimizedVisualEffects";
import ThemeController from "@/components/ThemeController";
import EnhancedHero from "@/components/EnhancedHero";
import AdminLoginModal from "@/components/AdminLoginModal";
import SecurityPage from "./SecurityPage";
import { adminAuth } from "@/services/adminAuth";
import { useDDoSProtection } from "@/hooks/useDDoSProtection";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  Code,
  Database,
  Shield,
  Zap,
  Terminal,
  Server,
  Users,
  Check,
  ArrowRight,
} from "lucide-react";

const Index = () => {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMethod, setDonationMethod] = useState("paypal");
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showSecurityPage, setShowSecurityPage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    adminAuth.isAuthenticated(),
  );
  // Only show loading on first visit
  const [showLoadingSystem, setShowLoadingSystem] = useState(
    !sessionStorage.getItem("hydra-visited"),
  );
  const [systemInitialized, setSystemInitialized] = useState(
    !!sessionStorage.getItem("hydra-visited"),
  );
  const [showDownloadManager, setShowDownloadManager] = useState(false);

  const ddosProtection = useDDoSProtection();

  // Check authentication status periodically
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(adminAuth.isAuthenticated());
    };

    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadingComplete = () => {
    setShowLoadingSystem(false);
    setSystemInitialized(true);
    sessionStorage.setItem("hydra-visited", "true");
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      // Generate dynamic URL for security page
      const securityId = btoa(Date.now().toString()).slice(0, 12);
      window.history.pushState({}, "", `/security/${securityId}`);
      setShowSecurityPage(true);
    } else {
      setShowAdminLoginModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAdminLoginModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowSecurityPage(false);
    window.history.pushState({}, "", "/");
  };

  const handleBackFromSecurity = () => {
    setShowSecurityPage(false);
    window.history.pushState({}, "", "/");
  };

  // If showing security page, render it
  if (showSecurityPage && isAuthenticated) {
    return (
      <SecurityPage onLogout={handleLogout} onBack={handleBackFromSecurity} />
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Optimized Visual Effects Layer */}
      <OptimizedVisualEffects />
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Terminal className="h-8 w-8 text-primary" />
              <span className="font-mono text-xl font-bold tracking-tight">
                HYDRA TOOLS
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="#products"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Products
              </a>
              <a
                href="#download"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Download
              </a>
              <SystemStatus />
              <NotificationCenter />
              <ThemeController />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDownloadManager(true)}
                className="font-mono"
                id="download-manager-toggle"
              >
                DOWNLOADS
              </Button>
              <Button
                variant={isAuthenticated ? "default" : "outline"}
                size="sm"
                onClick={handleLoginClick}
                className="font-mono"
                id="security-toggle"
              >
                {isAuthenticated ? "SECURITY" : "LOGIN"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <EnhancedHero onDownloadClick={() => setShowDownloadManager(true)} />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onAuthSuccess={handleAuthSuccess}
        onClose={() => setShowAdminLoginModal(false)}
      />

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-mono font-bold text-primary mb-2">
                WIN
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                WINDOWS SUPPORT
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-mono font-bold text-primary mb-2">
                LINUX
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                LINUX SUPPORT
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-mono font-bold text-primary mb-2">
                MAC
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                COMING SOON
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-mono font-bold text-primary mb-2">
                50+
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                SUPPORTED APPS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 font-mono text-xs">
              CARACTERÍSTICAS PRINCIPALES
            </Badge>
            <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter mb-6">
              POTENTE Y SEGURO
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas avanzadas con protección DDoS integrada y monitoreo
              en tiempo real
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-mono flex items-center">
                  <Shield className="h-5 w-5 mr-3 text-primary" />
                  PROTECCIÓN AVANZADA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sistema DDoS integrado con rate limiting y validación de
                  requests en tiempo real.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-mono flex items-center">
                  <Zap className="h-5 w-5 mr-3 text-primary" />
                  RENDIMIENTO ÓPTIMO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Optimizado para máximo rendimiento con efectos visuales
                  adaptativos.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-mono flex items-center">
                  <Terminal className="h-5 w-5 mr-3 text-primary" />
                  MONITOREO COMPLETO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dashboard de administración con métricas reales y analytics en
                  tiempo real.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 font-mono text-xs">
              HYDRA SUITE
            </Badge>
            <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter mb-6">
              TRIAL EXTENSION
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Extiende períodos de prueba de software eliminando telemetría y
              datos de rastreo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card border-border hover:border-primary/50 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-mono">HYDRA WINDOWS</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Extensión de trials para aplicaciones Windows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Cursor AI Editor
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Elimina telemetría
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Resetea contadores
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full font-mono group-hover:bg-primary/10 transition-colors"
                >
                  LEARN MORE
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group animate-fade-in [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-mono">HYDRA LINUX</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Extensión de trials para aplicaciones Linux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Cursor AI Editor
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Limpia archivos de tracking
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Borra datos de prueba
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full font-mono group-hover:bg-primary/10 transition-colors"
                >
                  LEARN MORE
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group animate-fade-in [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-mono">HYDRA MAC</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Extensión de trials para aplicaciones macOS (Próximamente)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Cursor AI Editor
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Elimina plist de trials
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Resetea datos de uso
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full font-mono group-hover:bg-primary/10 transition-colors"
                >
                  LEARN MORE
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Free Download Section */}
      <section id="download" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 font-mono text-xs">
              DESCARGA GRATUITA
            </Badge>
            <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter mb-6">
              100% GRATIS
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todas las herramientas de extensión de trials están disponibles
              completamente gratis
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-primary relative overflow-hidden">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground font-mono">
                  COMPLETAMENTE GRATIS
                </Badge>
              </div>
              <CardHeader className="text-center pb-8 pt-12">
                <CardTitle className="font-mono text-2xl mb-4">
                  HYDRA TOOLS SUITE
                </CardTitle>
                <div className="text-6xl font-mono font-bold text-primary mt-4">
                  GRATIS
                  <span className="text-lg text-muted-foreground font-normal block mt-2">
                    Descarga directa sin costo
                  </span>
                </div>
                <CardDescription className="text-lg mt-4">
                  Acceso completo a todas las herramientas de bypass
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 px-8">
                <div className="space-y-4">
                  <h3 className="font-mono font-bold text-primary mb-3">
                    INCLUYE:
                  </h3>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3" />
                    <span>Hydra Tools para Windows</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3" />
                    <span>Hydra Tools para Linux</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3" />
                    <span>Compatible con Cursor AI</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3" />
                    <span>Reseteo automático de trials</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-mono font-bold text-primary mb-3">
                    CARACTERÍSTICAS:
                  </h3>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3" />
                    <span>Sin limitaciones de tiempo</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3" />
                    <span>Sin registro requerido</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3" />
                    <span>Código fuente incluido</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3" />
                    <span>Documentación completa</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 p-8">
                <Button
                  size="lg"
                  className="w-full font-mono"
                  onClick={async () => {
                    try {
                      await ddosProtection.executeProtectedRequest(
                        { type: "download" },
                        () => {
                          setShowDownloadManager(true);
                        },
                      );
                    } catch (error) {
                      alert(`Download blocked: ${error}`);
                    }
                  }}
                  disabled={
                    ddosProtection.isBlocked ||
                    !ddosProtection.status.canDownload
                  }
                >
                  ABRIR DOWNLOAD MANAGER
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-mono group hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  onClick={async () => {
                    try {
                      await ddosProtection.executeProtectedRequest(
                        { type: "general" },
                        () => {
                          setShowDonationModal(true);
                        },
                      );
                    } catch (error) {
                      alert(`Access blocked: ${error}`);
                    }
                  }}
                  disabled={ddosProtection.isBlocked}
                >
                  HACER DONACIÓN
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="text-center space-y-2">
                  {ddosProtection.isBlocked && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                      <p className="text-xs text-red-400 font-mono">
                        🛡️ SECURITY BLOCK: {ddosProtection.blockReason}
                      </p>
                    </div>
                  )}
                  {!ddosProtection.status.canDownload &&
                    !ddosProtection.isBlocked && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                        <p className="text-xs text-yellow-400 font-mono">
                          ⏱️ RATE LIMIT: Wait before next download
                        </p>
                      </div>
                    )}
                  <p className="text-xs text-muted-foreground">
                    Compatible con Windows 10/11 y distribuciones Linux modernas
                    <br />
                    Versión para Mac OS disponible próximamente
                    <br />
                    <span className="text-primary font-mono">
                      🛡️ Protected by HYDRA Security System
                    </span>
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter mb-6">
            READY TO DEPLOY?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Únete a usuarios que confían en HYDRA TOOLS para sus necesidades de
            bypass.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="font-mono">
              SCHEDULE CONSULTATION
            </Button>
            <Button variant="outline" size="lg" className="font-mono">
              DOWNLOAD WHITEPAPER
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Terminal className="h-6 w-6 text-primary" />
                <span className="font-mono text-lg font-bold">HYDRA TOOLS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Herramientas para extender trials de software como Cursor AI.
                Windows, Linux y próximamente Mac.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold mb-4">PRODUCTS</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Hydra Windows</li>
                <li>Hydra Linux</li>
                <li>Hydra Mac (Soon)</li>
                <li>Cursor AI Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold mb-4">SUPPORT</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentation</li>
                <li>Technical Support</li>
                <li>Professional Services</li>
                <li>Training</li>
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold mb-4">COMPANY</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Security</li>
                <li>Compliance</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2024 HYDRA TOOLS. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-lg max-w-md w-full animate-fade-in [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards] transform scale-95 animate-[fade-in_0.3s_ease-out_forwards,scale-in_0.3s_ease-out_forwards]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-mono font-bold">HACER DONACIÓN</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDonationModal(false)}
                  className="hover:bg-primary/10"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-mono font-bold mb-3">
                    CANTIDAD (USD/MXN)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Ingresa la cantidad"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full p-3 bg-muted border border-border rounded font-mono text-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
                      min="1"
                    />
                    <span className="absolute right-3 top-3 text-muted-foreground font-mono">
                      $
                    </span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-mono font-bold mb-3">
                    MÉTODO DE PAGO
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDonationMethod("paypal")}
                      className={`p-3 border rounded font-mono text-sm transition-all duration-300 ${
                        donationMethod === "paypal"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      PAYPAL
                    </button>
                    <button
                      onClick={() => setDonationMethod("tarjeta")}
                      className={`p-3 border rounded font-mono text-sm transition-all duration-300 ${
                        donationMethod === "tarjeta"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      TARJETA
                    </button>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-sm font-mono font-bold mb-3">
                    CANTIDADES SUGERIDAS
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["5", "10", "25"].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDonationAmount(amount)}
                        className="p-2 border border-border rounded font-mono text-sm hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donation Information */}
                {donationMethod === "tarjeta" && (
                  <div className="bg-muted/50 p-4 rounded border border-border animate-fade-in">
                    <h4 className="font-mono font-bold text-sm mb-2">
                      DATOS DE TARJETA
                    </h4>
                    <div className="text-sm space-y-1 font-mono">
                      <p>BANCO: NU</p>
                      <p>CUENTA: 5101 2565 7428 5164</p>
                      <p>TITULAR: HYDRA TOOLS</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDonationModal(false)}
                    className="flex-1 font-mono"
                  >
                    CANCELAR
                  </Button>
                  <Button
                    onClick={async () => {
                      if (donationAmount && parseFloat(donationAmount) > 0) {
                        try {
                          await ddosProtection.executeProtectedRequest(
                            {
                              type: "donation",
                              data: { amount: donationAmount },
                            },
                            () => {
                              if (donationMethod === "paypal") {
                                window.open(
                                  "https://www.paypal.com/donate?hosted_button_id=P5VX3NYH955TE",
                                  "_blank",
                                );
                              } else {
                                alert(
                                  `Transferir $${donationAmount} a la tarjeta Nu: 5101 2565 7428 5164. ¡Gracias por tu apoyo!`,
                                );
                              }
                              setShowDonationModal(false);
                            },
                          );
                        } catch (error) {
                          alert(`Donation blocked: ${error}`);
                        }
                      }
                    }}
                    disabled={
                      !donationAmount ||
                      parseFloat(donationAmount) <= 0 ||
                      ddosProtection.isBlocked ||
                      !ddosProtection.status.canDonate
                    }
                    className="flex-1 font-mono hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {donationMethod === "paypal" ? "IR A PAYPAL" : "CONFIRMAR"}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Tu donación ayuda a mantener HYDRA TOOLS gratuito para todos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading System */}
      <LoadingSystem
        visible={showLoadingSystem}
        onComplete={handleLoadingComplete}
      />

      {/* Download Manager */}
      <DownloadManager
        isOpen={showDownloadManager}
        onClose={() => setShowDownloadManager(false)}
      />
    </div>
  );
};

export default Index;
