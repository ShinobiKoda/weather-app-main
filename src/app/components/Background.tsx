"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

type Props = {
  /**
   * Open-Meteo weather code. Optional because initial render may not yet have fetched data.
   * When undefined we fall back to a neutral cloudy background.
   */
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

const Background: React.FC<Props> = ({ weatherCode }) => {
  const type = weatherCodeToBackground(weatherCode);

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
      })),
    []
  );

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none bg-neutral-900"
    >
      {type === "clear" && (
        <>
          {/* Blob 1 */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full bg-yellow-400/30 blur-3xl"
            animate={{
              x: [0, 100, -100, 0],
              y: [0, 50, -50, 0],
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
            style={{ top: "20%", left: "10%" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full bg-yellow-300/10 blur-[120px]"
            animate={{
              x: [0, 100, -100, 0],
              y: [0, 50, -50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
            style={{ top: "20%", left: "10%" }}
          />

          <motion.div
            className="absolute w-[350px] h-[350px] rounded-full bg-yellow-500/20 blur-2xl"
            animate={{
              x: [0, -80, 80, 0],
              y: [0, -40, 40, 0],
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
            style={{ bottom: "15%", right: "10%" }}
          />
          <motion.div
            className="absolute w-[350px] h-[350px] rounded-full bg-yellow-400/10 blur-[100px]"
            animate={{
              x: [0, -80, 80, 0],
              y: [0, -40, 40, 0],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{ repeat: Infinity, duration: 27, ease: "easeInOut" }}
            style={{ bottom: "15%", right: "10%" }}
          />
        </>
      )}

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

      {type === "fog" && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
      )}

      {type === "rain" &&
        particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-10 bg-blue-400/30 rounded"
            style={{ left: `${p.x}vw`, top: "-10vh" }}
            animate={{ y: "110vh" }}
            transition={{
              repeat: Infinity,
              duration: 2,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}

      {type === "snow" &&
        particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-white/70 rounded-full"
            style={{ left: `${p.x}vw`, top: "-5vh" }}
            animate={{
              y: "110vh",
              x: [p.x, p.x + 5, p.x - 5, p.x],
            }}
            transition={{
              repeat: Infinity,
              duration: 6,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}

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
