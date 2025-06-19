import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Download,
  Shield,
  Zap,
  Code,
  Terminal,
} from "lucide-react";

const FloatingIcon = ({
  icon: Icon,
  delay = 0,
}: {
  icon: any;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ y: 0, rotate: 0 }}
      animate={{
        y: [-10, 10, -10],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className="absolute opacity-10 text-primary"
    >
      <Icon size={40} />
    </motion.div>
  );
};

const TypingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(
        () => {
          setDisplayText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        },
        delay + currentIndex * 100,
      );
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <span className="gradient-text">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="inline-block w-1 h-8 bg-primary ml-1"
      />
    </span>
  );
};

const ParallaxCard = ({
  children,
  className = "",
  depth = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50 * depth]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div ref={ref} style={{ y: springY }} className={className}>
      {children}
    </motion.div>
  );
};

const InteractiveButton = ({
  children,
  onClick,
  variant = "default",
  size = "lg",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: any;
  size?: any;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        className={`relative overflow-hidden group ${className}`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? "100%" : "-100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        <span className="relative z-10 flex items-center">{children}</span>
      </Button>
    </motion.div>
  );
};

const EnhancedHero = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative py-24 lg:py-32 overflow-hidden min-h-screen flex items-center"
    >
      {/* Smooth Gradient Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-primary/10"
          animate={{
            backgroundPosition: ["100% 100%", "0% 0%"],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20">
          <FloatingIcon icon={Shield} delay={0} />
        </div>
        <div className="absolute top-40 right-32">
          <FloatingIcon icon={Code} delay={1} />
        </div>
        <div className="absolute bottom-32 left-40">
          <FloatingIcon icon={Zap} delay={2} />
        </div>
        <div className="absolute bottom-20 right-20">
          <FloatingIcon icon={Terminal} delay={1.5} />
        </div>
      </div>

      {/* Parallax Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <ParallaxCard depth={0.3} className="absolute top-10 left-10">
          <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
        </ParallaxCard>
        <ParallaxCard depth={0.7} className="absolute bottom-20 right-10">
          <div className="w-48 h-48 bg-gradient-to-tl from-primary/15 to-transparent rounded-full blur-2xl" />
        </ParallaxCard>
      </div>

      {/* Interactive Glow Effect */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left:
            mousePosition.x *
              (typeof window !== "undefined" ? window.innerWidth : 1920) -
            100,
          top:
            mousePosition.y *
              (typeof window !== "undefined" ? window.innerHeight : 1080) -
            100,
          width: 200,
          height: 200,
          background:
            "radial-gradient(circle, rgba(0, 195, 255, 0.1), transparent)",
          borderRadius: "50%",
          filter: "blur(20px)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Badge
              variant="outline"
              className="font-mono text-xs px-4 py-2 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">TRIAL EXTENSION TOOLS</span>
            </Badge>
          </motion.div>

          {/* Animated Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-mono font-bold tracking-tighter mb-8"
          >
            <motion.span
              className="block"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              EXTEND
            </motion.span>
            <div className="block">
              <TypingText text="TRIAL" delay={1000} />
            </div>
            <motion.span
              className="block text-muted-foreground"
              whileHover={{ scale: 1.02, color: "rgb(0, 195, 255)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              PERIODS
            </motion.span>
          </motion.h1>

          {/* Animated Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Herramientas para{" "}
            <motion.span
              className="text-primary font-semibold"
              whileHover={{ scale: 1.05 }}
            >
              extender períodos de prueba
            </motion.span>{" "}
            de software como Cursor, reseteando telemetría y datos de
            seguimiento.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <InteractiveButton
              onClick={onDownloadClick}
              className="font-mono bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="mr-2 h-5 w-5" />
              DESCARGAR AHORA
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </InteractiveButton>

            <InteractiveButton
              variant="outline"
              className="font-mono border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              VER CARACTERÍSTICAS
              <motion.div
                className="ml-2"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-5 w-5" />
              </motion.div>
            </InteractiveButton>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {[
              { label: "WINDOWS", value: "✓" },
              { label: "LINUX", value: "✓" },
              { label: "MAC", value: "SOON" },
              { label: "APPS", value: "50+" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="text-2xl md:text-3xl font-mono font-bold text-primary mb-2"
                  animate={{
                    textShadow: [
                      "0 0 0px rgba(0, 195, 255, 0)",
                      "0 0 10px rgba(0, 195, 255, 0.5)",
                      "0 0 0px rgba(0, 195, 255, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-muted-foreground font-mono">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="w-1 h-3 bg-primary rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default EnhancedHero;
