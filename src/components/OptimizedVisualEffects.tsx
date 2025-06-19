import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

const OptimizedVisualEffects = () => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    // Hide effects when tab is not visible for performance
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Don't render heavy effects if reduced motion or not visible
  if (isReducedMotion || !isVisible) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-30" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Simplified floating elements - reduced from 8 to 3 */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-8 h-8 bg-primary/5 rounded-lg backdrop-blur-sm"
          style={{
            left: `${20 + i * 30}%`,
            top: `${20 + i * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10 + i * 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Reduced glowing orbs - from 5 to 2 */}
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full bg-primary/10 blur-xl"
          style={{
            width: "100px",
            height: "100px",
            left: `${10 + i * 70}%`,
            top: `${30 + i * 40}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}

      {/* Simplified glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-primary/5 backdrop-blur-[1px]" />
    </div>
  );
};

export default OptimizedVisualEffects;
