import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Shield, Zap } from "lucide-react";

interface LoadingStage {
  id: string;
  name: string;
  description: string;
  duration: number;
  icon: React.ReactNode;
}

const loadingStages: LoadingStage[] = [
  {
    id: "security",
    name: "SECURITY VALIDATION",
    description: "Verificando integridad del cliente...",
    duration: 1,
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: "ddos",
    name: "DDOS PROTECTION",
    description: "Activando sistemas de protección...",
    duration: 1,
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: "download",
    name: "DOWNLOAD PREPARATION",
    description: "Preparando enlaces de descarga...",
    duration: 1,
    icon: <Download className="h-4 w-4" />,
  },
  {
    id: "complete",
    name: "SYSTEM READY",
    description: "Hydra Tools está listo para usar",
    duration: 1,
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

  useEffect(() => {
    if (!visible) return;

    // Allow skip after 1 second
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 1000);

    let stageTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    const startStage = (stageIndex: number) => {
      if (stageIndex >= loadingStages.length) {
        onComplete();
        return;
      }

      setCurrentStage(stageIndex);
      setStageProgress(0);

      const stage = loadingStages[stageIndex];
      const progressInterval = stage.duration / 100;

      progressTimer = setInterval(() => {
        setStageProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prev + 1;
        });

        setProgress((prev) => {
          const totalStages = loadingStages.length;
          const stageWeight = 100 / totalStages;
          const currentStageProgress = (stageProgress / 100) * stageWeight;
          const previousStagesProgress = stageIndex * stageWeight;
          return previousStagesProgress + currentStageProgress;
        });
      }, progressInterval);

      stageTimer = setTimeout(() => {
        clearInterval(progressTimer);
        startStage(stageIndex + 1);
      }, stage.duration);
    };

    startStage(0);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(stageTimer);
      clearInterval(progressTimer);
    };
  }, [visible, onComplete, stageProgress]);

  const handleSkip = () => {
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
                Puedes saltar en{" "}
                {Math.max(0, Math.ceil((1000 - (Date.now() % 1000)) / 1000))}s
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
