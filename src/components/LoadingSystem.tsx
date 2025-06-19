import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Shield, Zap } from "lucide-react";

interface LoadingStage {
  id: string;
  name: string;
  description: string;
  duration: number; // ms
  icon: React.ReactNode;
}

const loadingStages: LoadingStage[] = [
  {
    id: "security",
    name: "SECURITY VALIDATION",
    description: "Verificando integridad del cliente...",
    duration: 900,
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: "ddos",
    name: "DDOS PROTECTION",
    description: "Activando sistemas de protección...",
    duration: 900,
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: "download",
    name: "DOWNLOAD PREPARATION",
    description: "Preparando enlaces de descarga...",
    duration: 900,
    icon: <Download className="h-4 w-4" />,
  },
  {
    id: "complete",
    name: "SYSTEM READY",
    description: "Hydra Tools está listo para usar",
    duration: 900,
    icon: <CheckCircle className="h-4 w-4" />,
  },
];

interface LoadingSystemProps {
  onComplete: () => void;
  visible: boolean;
  allowSkip?: boolean;
}

const LoadingSystem = ({
  onComplete,
  visible,
  allowSkip = true,
}: LoadingSystemProps) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [skipSeconds, setSkipSeconds] = useState(1);

  // Refs para temporizadores
  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lógica para el skip
  useEffect(() => {
    if (!visible || !allowSkip) return;
    setSkipSeconds(1);
    setCanSkip(false);
    skipTimerRef.current && clearInterval(skipTimerRef.current);
    skipTimerRef.current = setInterval(() => {
      setSkipSeconds((s) => {
        if (s <= 1) {
          setCanSkip(true);
          skipTimerRef.current && clearInterval(skipTimerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      skipTimerRef.current && clearInterval(skipTimerRef.current);
    };
  }, [visible, allowSkip]);

  // Lógica de progreso y etapas
  useEffect(() => {
    if (!visible) return;
    let isMounted = true;
    setCurrentStage(0);
    setProgress(0);
    setStageProgress(0);
    const totalStages = loadingStages.length;
    const runStage = (stageIdx: number) => {
      if (!isMounted) return;
      if (stageIdx >= totalStages) {
        setProgress(100);
        setStageProgress(100);
        setTimeout(() => isMounted && onComplete(), 300);
        return;
      }
      setCurrentStage(stageIdx);
      setStageProgress(0);
      const stage = loadingStages[stageIdx];
      const stageDuration = stage.duration;
      const start = Date.now();
      progressTimerRef.current && clearInterval(progressTimerRef.current);
      progressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        let percent = Math.min(100, (elapsed / stageDuration) * 100);
        setStageProgress(percent);
        // Progreso total
        const stageWeight = 100 / totalStages;
        setProgress(
          stageIdx * stageWeight + (percent / 100) * stageWeight
        );
        if (percent >= 100) {
          progressTimerRef.current && clearInterval(progressTimerRef.current);
        }
      }, 30);
      stageTimerRef.current && clearTimeout(stageTimerRef.current);
      stageTimerRef.current = setTimeout(() => {
        runStage(stageIdx + 1);
      }, stageDuration);
    };
    runStage(0);
    return () => {
      isMounted = false;
      stageTimerRef.current && clearTimeout(stageTimerRef.current);
      progressTimerRef.current && clearInterval(progressTimerRef.current);
    };
  }, [visible, onComplete]);

  const handleSkip = () => {
    setProgress(100);
    setStageProgress(100);
    onComplete();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md bg-card border-border">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div></div>
              <div className="flex items-center justify-center">
                <Shield className="h-12 w-12 text-primary animate-pulse" />
              </div>
              {allowSkip && canSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Saltar
                </Button>
              )}
              {(!allowSkip || !canSkip) && <div></div>}
            </div>
            <h2 className="text-2xl font-mono font-bold mb-2">HYDRA TOOLS</h2>
            <p className="text-sm text-muted-foreground">
              Inicializando sistemas de seguridad...
            </p>
            {allowSkip && !canSkip && (
              <p className="text-xs text-muted-foreground mt-2">
                Puedes saltar en {skipSeconds}s
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono">PROGRESO TOTAL</span>
                <span className="text-sm font-mono text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3">
              {loadingStages.map((stage, index) => (
                <div
                  key={stage.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    index === currentStage
                      ? "bg-primary/10 border border-primary/20"
                      : index < currentStage
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-muted/30"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index === currentStage
                        ? "bg-primary/20 text-primary animate-pulse"
                        : index < currentStage
                          ? "bg-green-500/20 text-green-500"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-mono font-bold ${
                          index === currentStage
                            ? "text-primary"
                            : index < currentStage
                              ? "text-green-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stage.name}
                      </span>
                      {index < currentStage && (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-500 border-green-500/50"
                        >
                          COMPLETE
                        </Badge>
                      )}
                      {index === currentStage && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(stageProgress)}%
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-xs ${
                        index === currentStage
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingSystem;
