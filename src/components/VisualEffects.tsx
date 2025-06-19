import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

const ParticleSystem = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles (reduce to 8 for max perf)
    const initParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1 + 0.5, // even smaller
          speedX: (Math.random() - 0.5) * 0.12, // even slower
          speedY: (Math.random() - 0.5) * 0.12,
          opacity: Math.random() * 0.09 + 0.04, // ultra low opacity
          hue: 200 + Math.random() * 20, // soft blue
        });
      }
      setParticles(newParticles);
    };

    initParticles();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          // Move particle
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;

          // Bounce off edges
          if (newX < 0 || newX > canvas.width) particle.speedX *= -1;
          if (newY < 0 || newY > canvas.height) particle.speedY *= -1;

          // Keep in bounds
          newX = Math.max(0, Math.min(canvas.width, newX));
          newY = Math.max(0, Math.min(canvas.height, newY));

          // Mouse interaction (minimal)
          const dx = mousePos.x - newX;
          const dy = mousePos.y - newY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 40) {
            const force = (40 - distance) / 40;
            newX -= (dx / distance) * force * 0.3;
            newY -= (dy / distance) * force * 0.3;
          }

          // Draw particle (no connections)
          ctx.beginPath();
          ctx.arc(newX, newY, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${particle.hue}, 80%, 70%, ${particle.opacity})`;
          ctx.fill();

          return {
            ...particle,
            x: newX,
            y: newY,
          };
        }),
      );

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
};

const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Only 1 floating element, very subtle */}
      {[...Array(1)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 0,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 360,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div
            style={{
              background: `linear-gradient(45deg, rgba(120, 200, 255, 0.05), transparent)`,
              width: `40px`,
              height: `40px`,
              borderRadius: "12px",
              filter: "blur(2px)",
            }}
          />
        </motion.div>
      ))}

      {/* Only 1 glowing orb, ultra subtle */}
      {[...Array(1)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(120, 200, 255, 0.06), transparent)`,
            width: `100px`,
            height: `100px`,
            filter: "blur(28px)",
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [1, 1.05, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 36,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const GlassmorphismOverlay = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [0.1, 0.3]);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed inset-0 pointer-events-none z-10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 backdrop-blur-[2px]" />
    </motion.div>
  );
};

const VisualEffects = () => {
  return (
    <>
      <ParticleSystem />
      <FloatingElements />
      <GlassmorphismOverlay />
    </>
  );
};

export default VisualEffects;
