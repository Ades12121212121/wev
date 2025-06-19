import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Moon,
  Sun,
  Monitor,
  Zap,
  Shield,
  Cpu,
  Waves,
} from "lucide-react";

interface Theme {
  id: string;
  name: string;
  icon: React.ReactNode;
  colors: {
    primary: string;
    background: string;
    accent: string;
    text: string;
  };
  effects: {
    blur: boolean;
    particles: boolean;
    glow: boolean;
    gradient: boolean;
  };
}

const themes: Theme[] = [
  {
    id: "cyber-blue",
    name: "Cyber Blue",
    icon: <Zap className="h-4 w-4" />,
    colors: {
      primary: "#00C3FF",
      background: "#0A0A0B",
      accent: "#1E1E20",
      text: "#F2F2F2",
    },
    effects: {
      blur: true,
      particles: true,
      glow: true,
      gradient: true,
    },
  },
  {
    id: "matrix-green",
    name: "Matrix Green",
    icon: <Monitor className="h-4 w-4" />,
    colors: {
      primary: "#00FF41",
      background: "#0D0F0D",
      accent: "#1A1F1A",
      text: "#E8F5E8",
    },
    effects: {
      blur: true,
      particles: true,
      glow: true,
      gradient: false,
    },
  },
  {
    id: "neon-purple",
    name: "Neon Purple",
    icon: <Shield className="h-4 w-4" />,
    colors: {
      primary: "#9945FF",
      background: "#0F0A1F",
      accent: "#1F1530",
      text: "#F0E8FF",
    },
    effects: {
      blur: true,
      particles: true,
      glow: true,
      gradient: true,
    },
  },
  {
    id: "flame-orange",
    name: "Flame Orange",
    icon: <Cpu className="h-4 w-4" />,
    colors: {
      primary: "#FF6B35",
      background: "#1A0F0A",
      accent: "#2A1F1A",
      text: "#FFF2E8",
    },
    effects: {
      blur: false,
      particles: true,
      glow: true,
      gradient: true,
    },
  },
  {
    id: "ice-cyan",
    name: "Ice Cyan",
    icon: <Waves className="h-4 w-4" />,
    colors: {
      primary: "#00E5FF",
      background: "#0A1A1F",
      accent: "#152B35",
      text: "#E8F8FF",
    },
    effects: {
      blur: true,
      particles: false,
      glow: true,
      gradient: false,
    },
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    icon: <Moon className="h-4 w-4" />,
    colors: {
      primary: "#FFFFFF",
      background: "#000000",
      accent: "#111111",
      text: "#FFFFFF",
    },
    effects: {
      blur: false,
      particles: false,
      glow: false,
      gradient: false,
    },
  },
];

const ThemeController = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem("hydra-theme");
    if (savedTheme) {
      const theme = themes.find((t) => t.id === savedTheme);
      if (theme) {
        setCurrentTheme(theme);
        applyTheme(theme);
      }
    } else {
      applyTheme(currentTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    // Apply CSS custom properties for primary color
    root.style.setProperty(
      "--primary",
      theme.colors.primary
        .replace("#", "")
        .match(/.{2}/g)
        ?.map((x) => parseInt(x, 16))
        .join(" ") + " 100%",
    );

    // Apply background and other colors through CSS variables
    root.style.setProperty(
      "--background",
      theme.colors.background
        .replace("#", "")
        .match(/.{2}/g)
        ?.map((x) => parseInt(x, 16))
        .join(" ") + " 100%",
    );

    // Remove existing theme classes
    document.body.classList.remove(
      ...Array.from(document.body.classList).filter((cls) =>
        cls.startsWith("theme-"),
      ),
    );

    // Apply new theme class
    document.body.classList.add(`theme-${theme.id}`);

    // Apply dynamic styles
    const styleId = "hydra-theme-style";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const css = `
      :root {
        --primary: ${theme.colors.primary};
        --background: ${theme.colors.background};
        --accent: ${theme.colors.accent};
        --text: ${theme.colors.text};
      }

      .theme-${theme.id} {
        background-color: ${theme.colors.background} !important;
        color: ${theme.colors.text} !important;
      }

      .theme-${theme.id} .text-primary {
        color: ${theme.colors.primary} !important;
      }

      .theme-${theme.id} .bg-primary {
        background-color: ${theme.colors.primary} !important;
      }

      .theme-${theme.id} .border-primary {
        border-color: ${theme.colors.primary} !important;
      }

      ${
        theme.effects.glow
          ? `
        .theme-${theme.id} .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px ${theme.colors.primary}33; }
          50% { box-shadow: 0 0 40px ${theme.colors.primary}66; }
        }
      `
          : ""
      }

      ${
        theme.effects.gradient
          ? `
        .theme-${theme.id} .gradient-text {
          background: linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.accent});
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `
          : ""
      }
    `;

    styleElement.textContent = css;

    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme.colors.background);
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = theme.colors.background;
      document.head.appendChild(meta);
    }
  };

  const switchTheme = (theme: Theme) => {
    if (theme.id === currentTheme.id) return;

    setIsAnimating(true);

    // Smooth transition effect
    document.body.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

    setTimeout(() => {
      setCurrentTheme(theme);
      applyTheme(theme);
      localStorage.setItem("hydra-theme", theme.id);

      setTimeout(() => {
        setIsAnimating(false);
        document.body.style.transition = "";
      }, 500);
    }, 100);
  };

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === currentTheme.id);
    const nextIndex = (currentIndex + 1) % themes.length;
    switchTheme(themes[nextIndex]);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Quick cycle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={cycleTheme}
        disabled={isAnimating}
        className="font-mono relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        {currentTheme.icon}
        <span className="ml-1 hidden sm:inline">{currentTheme.name}</span>
      </Button>

      {/* Theme selector dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isAnimating}>
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-3">
            <h3 className="font-mono font-bold text-sm mb-3">VISUAL THEMES</h3>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => (
                <DropdownMenuItem
                  key={theme.id}
                  onClick={() => switchTheme(theme)}
                  className={`p-3 cursor-pointer rounded-lg transition-all duration-200 ${
                    theme.id === currentTheme.id
                      ? "bg-primary/20 border border-primary/50"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.accent,
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        {theme.icon}
                        <span className="font-mono text-xs font-bold">
                          {theme.name}
                        </span>
                      </div>
                      <div className="flex space-x-1 mt-1">
                        {theme.effects.blur && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            Blur
                          </Badge>
                        )}
                        {theme.effects.particles && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            FX
                          </Badge>
                        )}
                        {theme.effects.glow && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            Glow
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>

            <div className="mt-4 p-2 bg-muted/30 rounded border border-border">
              <div className="text-xs font-mono text-muted-foreground">
                <p>
                  🎨 <strong>Current:</strong> {currentTheme.name}
                </p>
                <p>
                  ⚡ <strong>Effects:</strong>{" "}
                  {Object.values(currentTheme.effects).filter(Boolean).length}/4
                </p>
                <p>
                  🚀 <strong>Tip:</strong> Click theme button to cycle
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {isAnimating && (
        <Badge variant="outline" className="text-xs font-mono animate-pulse">
          Switching...
        </Badge>
      )}
    </div>
  );
};

export default ThemeController;
