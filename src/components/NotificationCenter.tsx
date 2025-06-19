import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Shield,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Trash2,
} from "lucide-react";
import { generateUUID } from "@/lib/utils";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error" | "security";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "security":
        return <Shield className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "error":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "security":
        return "text-primary";
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: generateUUID(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]); // Máximo 50 notificaciones
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Simular notificaciones del sistema de seguridad
  useEffect(() => {
    const interval = setInterval(() => {
      const notificationTypes = [
        {
          type: "security" as const,
          title: "Protección Activada",
          message: "Sistema DDoS funcionando correctamente",
        },
        {
          type: "info" as const,
          title: "Nueva Descarga",
          message: "Usuario descargó Hydra Tools para Windows",
        },
        {
          type: "warning" as const,
          title: "Rate Limit Aplicado",
          message: "Demasiadas requests desde IP 192.168.1.100",
        },
      ];

      if (Math.random() > 0.7) {
        const randomNotif =
          notificationTypes[
            Math.floor(Math.random() * notificationTypes.length)
          ];
        addNotification(randomNotif);
      }
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  // Agregar notificación inicial
  useEffect(() => {
    addNotification({
      type: "success",
      title: "Sistema Inicializado",
      message:
        "Hydra Tools está listo para usar. Todas las protecciones están activas.",
      action: {
        label: "Ver Dashboard",
        handler: () => {
          document.getElementById("security-toggle")?.click();
          setIsOpen(false);
        },
      },
    });
  }, []);

  return (
    <>
      {/* Notification Button */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-20 right-4 w-96">
            <Card className="bg-card border-border shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-mono">
                    NOTIFICATIONS
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} notificaciones sin leer
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay notificaciones</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${
                            !notification.read ? "bg-primary/5" : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`mt-1 ${getTypeColor(notification.type)}`}
                            >
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-mono font-bold truncate">
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {notification.timestamp.toLocaleTimeString()}
                                </span>
                                {notification.action && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      notification.action!.handler();
                                    }}
                                    className="text-xs h-6"
                                  >
                                    {notification.action.label}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationCenter;
