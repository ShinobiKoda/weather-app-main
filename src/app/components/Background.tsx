"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

type Props = {
  weatherCode?: number;
};

function weatherCodeToBackground(code: number | undefined) {
  if (code == null) return "cloudy";
  if (code === 0) return "clear";
  if (code === 1 || code === 2 || code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (
    (code >= 51 && code <= 57) ||
    (code >= 61 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 63 && code <= 65)
  )
    return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95 && code <= 99) return "storm";
  return "cloudy";
}

type Particle = {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  glow: string;
};

const Background: React.FC<Props> = ({ weatherCode }) => {
  const type = weatherCodeToBackground(weatherCode);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      { base: "#ffe699", glow: "rgba(255, 230, 150, 0.8)" }, // soft yellow
      { base: "#96c8ff", glow: "rgba(150, 200, 255, 0.8)" }, // blue
      { base: "#ffb4c8", glow: "rgba(255, 180, 200, 0.8)" }, // pink
      { base: "#c8ffc8", glow: "rgba(200, 255, 200, 0.8)" }, // mint green
      { base: "#ffffff", glow: "rgba(255, 255, 255, 0.8)" }, // white
    ];

    const generated = Array.from({ length: 40 }).map(() => {
      const c = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 3 + Math.random() * 4, 
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 6,
        color: c.base,
        glow: c.glow,
      };
    });
    setParticles(generated);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none bg-neutral-900"
    >
      {/* ✨ Glowing floating particles (base ambient sparkles) */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`,
            boxShadow: `0 0 12px 4px ${p.glow}`,
            mixBlendMode: "screen",
          }}
          animate={{
            y: [p.y, p.y + 5, p.y - 5, p.y],
            x: [p.x, p.x + 3, p.x - 3, p.x],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ☀️ Clear → Floating Glow Blob */}
      {type === "clear" && (
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-yellow-400/20 blur-3xl"
          animate={{ x: [0, 100, -100, 0], y: [0, 50, -50, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          style={{ top: "20%", left: "10%" }}
        />
      )}

      {/* ☁️ Cloudy → Drifting Clouds */}
      {type === "cloudy" && (
        <>
          <motion.div
            className="absolute w-[600px] h-[250px] bg-white/10 rounded-full blur-3xl"
            animate={{ x: ["-50%", "100%"] }}
            transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
            style={{ top: "20%" }}
          />
          <motion.div
            className="absolute w-[700px] h-[300px] bg-white/10 rounded-full blur-3xl"
            animate={{ x: ["100%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
            style={{ top: "40%" }}
          />
        </>
      )}

      {/* 🌫 Fog → Static Mist */}
      {type === "fog" && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
      )}

      {/* 🌧 Rain → Glowing falling streaks */}
      {type === "rain" &&
        particles.map((p, i) => (
          <motion.div
            key={`rain-${i}`}
            className="absolute rounded"
            style={{
              left: `${p.x}vw`,
              top: "-10vh",
              width: "2px",
              height: "15vh",
              background: "linear-gradient(to bottom, rgba(150,200,255,0.8), transparent)",
              boxShadow: "0 0 8px rgba(150,200,255,0.6)",
              mixBlendMode: "screen",
            }}
            animate={{ y: "110vh" }}
            transition={{
              repeat: Infinity,
              duration: 2,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}

      {/* ❄️ Snow → Glowing flakes */}
      {type === "snow" &&
        particles.map((p, i) => (
          <motion.div
            key={`snow-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${p.x}vw`,
              top: "-5vh",
              width: `${p.size + 2}px`,
              height: `${p.size + 2}px`,
              background: `radial-gradient(circle, white 0%, transparent 70%)`,
              boxShadow: "0 0 10px 4px rgba(255,255,255,0.6)",
              mixBlendMode: "screen",
            }}
            animate={{
              y: "110vh",
              x: [p.x, p.x + 5, p.x - 5, p.x],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: 6,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* ⛈ Storm → Lightning Flashes */}
      {type === "storm" && (
        <>
          <div className="absolute inset-0 bg-black/60" />
          <motion.div
            className="absolute inset-0 bg-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              repeatDelay: 5,
              ease: "easeInOut",
            }}
          />
        </>
      )}
    </div>
  );
};

export default Background;
