"use client";
import { motion, AnimatePresence } from "motion/react";
import React, { useRef, useId, useState, useEffect } from "react";
import {
  sunOverlay,
  fogOverlay,
  rainOverlay,
  lightningFlash,
  fogBlob,
} from "./animations/motion";

type WeatherKind =
  | "clear"
  | "partly-cloudy"
  | "overcast"
  | "rain"
  | "drizzle"
  | "storm"
  | "snow"
  | "fog";

type Props = {
  kind?: WeatherKind | string | null;
  forcedHour?: number | null;
};

export default function Background({ kind, forcedHour }: Props) {
  const uid = useId();
  const isRainy = /rain|drizzle|storm/.test(String(kind || ""));
  const isFog = /fog/.test(String(kind || ""));

  // Determine time of day helper
  const getTimeOfDay = (hour: number): "day" | "dusk" | "night" => {
    if (hour >= 19 || hour < 6) return "night";
    if (hour >= 16 && hour < 19) return "dusk";
    return "day";
  };

  const initialHour = typeof forcedHour === "number" ? forcedHour : 12;

  const [timeOfDay, setTimeOfDay] = useState<"day" | "dusk" | "night">(
    getTimeOfDay(initialHour)
  );

  const [mounted, setMounted] = useState(false);

  const [stars, setStars] = useState<
    Array<{ x: number; y: number; r: number; seed: number }>
  >([]);
  const [shootingDef, setShootingDef] = useState<{
    left: string;
    top: string;
    rotate: number;
    seed: number;
    duration: number;
  } | null>(null);
  const shootTimerRef = useRef<number | null>(null);
  const activeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const realHour = new Date().getHours();
      const hour =
        typeof forcedHour === "number" && forcedHour >= 0 && forcedHour < 24
          ? forcedHour
          : realHour;
      setTimeOfDay(getTimeOfDay(hour));
    };

    updateTime();
    const id = setInterval(updateTime, 1000);

    setStars(
      Array.from({ length: 150 }).map(() => ({
        x: Math.floor(Math.random() * 400), // 0..400
        y: Math.floor(Math.random() * 100),
        r: Math.random() * 0.2 + 0.05, // tiny dots
        seed: Math.random(),
      }))
    );

    setMounted(true);

    const schedule = (minSec = 3, maxSec = 10) => {
      const delay = minSec + Math.random() * (maxSec - minSec);
      shootTimerRef.current = window.setTimeout(() => {
        const duration = 0.9 + Math.random() * 1.2;
        setShootingDef({
          left: `${Math.random() * 80 + 5}%`,
          top: `${Math.random() * 50 + 5}%`,
          rotate: -18 - Math.random() * 12,
          seed: Math.random(),
          duration,
        });
        activeTimeoutRef.current = window.setTimeout(() => {
          setShootingDef(null);
          schedule(4, 12);
        }, (duration + 0.12) * 1000) as unknown as number;
      }, delay * 1000) as unknown as number;
    };

    schedule(2, 8);

    return () => {
      clearInterval(id);
      if (shootTimerRef.current)
        clearTimeout(shootTimerRef.current as unknown as number);
      if (activeTimeoutRef.current)
        clearTimeout(activeTimeoutRef.current as unknown as number);
    };
  }, [forcedHour]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 transition-colors duration-700 ease-in-out">
        <div className="w-full h-full relative">
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              {timeOfDay === "day" && (
                <motion.div
                  key="day"
                  className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                />
              )}
              {timeOfDay === "dusk" && (
                <motion.div
                  key="dusk"
                  className="absolute inset-0 bg-gradient-to-b from-orange-200 via-pink-400 to-purple-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                />
              )}
              {timeOfDay === "night" && (
                <motion.svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  preserveAspectRatio="none"
                  viewBox="0 0 400 100"
                  initial={{ x: 0 }}
                  animate={{ x: ["0vw", "-100vw"] }}
                  transition={{
                    duration: 120,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {stars.map((s, i) => (
                    <motion.circle
                      key={`star-${i}`}
                      cx={s.x}
                      cy={s.y}
                      r={s.r}
                      fill="white"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{
                        duration: 3 + (s.seed % 2),
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: s.seed * 2,
                      }}
                    />
                  ))}
                </motion.svg>
              )}
            </AnimatePresence>
          </div>

          {/* dark overlay at dusk/night */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-in-out ${
              timeOfDay === "day"
                ? "opacity-0"
                : timeOfDay === "dusk"
                ? "bg-black/18 opacity-100"
                : "bg-black/36 opacity-100"
            }`}
          />
        </div>
      </div>

      {/* shooting stars */}
      {mounted &&
        shootingDef &&
        timeOfDay !== "dusk" &&
        (() => {
          const sdef = shootingDef;
          const pathId = `shootPath-${uid}`;
          const trailId = `shootTrail-${uid}`;
          const glowId = `shootGlow-${uid}`;
          const cp = 12 + (sdef.seed % 1) * 36;
          const d = `M0 100 Q 300 ${40 - cp} 600 20`;
          const trailLength = 1000;
          const dur = sdef.duration.toFixed(2) + "s";

          return (
            <svg
              key={`shoot-single`}
              className="absolute overflow-visible pointer-events-none"
              style={{ left: sdef.left, top: sdef.top }}
              width={600}
              height={200}
              viewBox="0 0 600 200"
              aria-hidden
            >
              <defs>
                <linearGradient id={trailId} x1="0" x2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="80%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <filter
                  id={glowId}
                  x="-100%"
                  y="-100%"
                  width="300%"
                  height="300%"
                >
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                id={pathId}
                d={d}
                stroke={`url(#${trailId})`}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={trailLength}
                strokeDashoffset={trailLength}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from={trailLength}
                  to={0}
                  dur={dur}
                  begin="0s"
                  fill="freeze"
                />
                <animate
                  attributeName="opacity"
                  values="1;1;0"
                  dur={dur}
                  begin="0s"
                  fill="freeze"
                />
              </path>

              <circle r={3} fill="white" filter={`url(#${glowId})`}>
                <animateMotion dur={dur} begin="0s" rotate="auto">
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
            </svg>
          );
        })()}

      {/* storm flash */}
      {kind === "storm" && (
        <motion.div
          className="absolute inset-0 bg-white/40 pointer-events-none"
          variants={lightningFlash}
          initial="hidden"
          animate="visible"
          custom={4}
        />
      )}

      {/* moon */}
      {timeOfDay === "night" && (
        <>
          {/* moon: render inside an SVG so <circle> is valid and give it a higher z so it stays above star layers */}
          <motion.svg
            className="absolute left-8 top-6 w-36 h-36 pointer-events-none z-10"
            viewBox="0 0 100 100"
            aria-hidden
            overflow="visible"
            style={{ overflow: "visible" }}
            initial={{ x: "0%" }}
            animate={{ x: ["0%", "22%", "0%"] }}
            transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
          >
            {/* radial gradient halo (vector) to avoid rasterized square artifacts */}
            <defs>
              <radialGradient id={`moonGrad-${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,244,200,0.95)" />
                <stop offset="35%" stopColor="rgba(255,244,200,0.65)" />
                <stop offset="60%" stopColor="rgba(255,244,200,0.28)" />
                <stop offset="100%" stopColor="rgba(255,244,200,0)" />
              </radialGradient>
            </defs>

            {/* soft radial halo behind the moon (vector, no square) */}
            <motion.circle
              cx={80}
              cy={60}
              r={34}
              fill={`url(#moonGrad-${uid})`}
              animate={{
                opacity: [0.95, 1, 0.95],
                cy: [60, 58, 60],
                r: [34, 36, 34],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />

            {/* solid moon on top */}
            <motion.circle
              cx={80}
              cy={60}
              r={20}
              fill="white"
              animate={{ cy: [60, 58, 60] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
          </motion.svg>

          {/* First starfield */}
          <motion.svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            preserveAspectRatio="none"
            viewBox="0 0 400 100"
            initial={{ x: 0 }}
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              duration: 120, // slow drift
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {stars.map((s, i) => (
              <motion.circle
                key={`star-a-${i}`}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="white"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 2 + (s.seed % 2),
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: s.seed * 3,
                }}
              />
            ))}
          </motion.svg>

          {/* Second starfield, shifted right */}
          <motion.svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            preserveAspectRatio="none"
            viewBox="0 0 400 100"
            initial={{ x: "100%" }}
            animate={{ x: ["100%", "0%"] }}
            transition={{
              duration: 120,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {stars.map((s, i) => (
              <motion.circle
                key={`star-b-${i}`}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="white"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 2 + (s.seed % 2),
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: s.seed * 3,
                }}
              />
            ))}
          </motion.svg>
        </>
      )}

      {/* fog */}
      {isFog && (
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`fog-${i}`}
              className="absolute rounded-full bg-white/8 blur-2xl"
              style={{
                width: `${220 - i * 40}px`,
                height: `${120 - i * 24}px`,
                left: `${6 + i * 28}%`,
                top: `${18 + i * 18}%`,
              }}
              variants={fogBlob}
              initial="hidden"
              animate="visible"
              custom={i * 2}
            />
          ))}
        </div>
      )}

      {/* rain */}
      {isRainy && (
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2, 3, 4].map((n) => (
            <motion.div
              key={`drop-${n}`}
              className="absolute bg-white/70"
              style={{
                width: 2,
                height: 28,
                left: `${8 + n * 16}%`,
                top: `${-6 + (n % 3) * 10}%`,
                borderRadius: 2,
              }}
              animate={{ y: ["-10%", "120%"], opacity: [0.7, 0.9, 0] }}
              transition={{
                duration: 1.1 + n * 0.12,
                repeat: Infinity,
                ease: "linear",
                delay: n * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* overlays */}
      {!isRainy && !isFog && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          variants={sunOverlay}
          initial="hidden"
          animate="visible"
          aria-hidden
        />
      )}
      {isFog && (
        <motion.div
          className="absolute inset-0 bg-white/6 backdrop-blur-sm pointer-events-none"
          variants={fogOverlay}
          initial="hidden"
          animate="visible"
          aria-hidden
        />
      )}
      {isRainy && (
        <motion.div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/5 to-black/10"
          variants={rainOverlay}
          initial="hidden"
          animate="visible"
          aria-hidden
        />
      )}
    </div>
  );
}
