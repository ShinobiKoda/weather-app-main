"use client";
import { motion, AnimatePresence } from "motion/react";
import React, { useRef, useId, useState, useEffect } from "react";
import {
  sunOverlay,
  fogOverlay,
  rainOverlay,
  starTwinkle,
  lightningFlash,
  fogBlob,
} from "./animations/motion";

// shadeColor helper removed — no longer needed after cloud removal.

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
  // if provided, forces the displayed hour (0-23) so external controls can preview times
  forcedHour?: number | null;
};

// Cloud graphics and their animated layers were intentionally removed.
// Previously a CloudSVG component and three parallax motion layers rendered
// animated clouds. This file now omits that markup so no clouds or cloud
// animations are present in the background.

export default function Background({ kind, forcedHour }: Props) {
  // useId() is fine for client; we avoid deriving visuals from it on server.
  const uid = useId();
  // Determine theme classes and overlays
  const isRainy = /rain|drizzle|storm/.test(String(kind || ""));
  const isFog = /fog/.test(String(kind || ""));

  // To avoid hydration mismatches, make the server-rendered output deterministic.
  // Move all uses of Date.now()/new Date() and Math.random() to client-only effects
  // and provide stable defaults for the initial render.

  // Determine time of day helper and initial value
  const getTimeOfDay = (hour: number): "day" | "dusk" | "night" => {
    // dusk extended to last until 19:00 (hour < 19)
    if (hour >= 19 || hour < 6) return "night";
    if (hour >= 16 && hour < 19) return "dusk";
    return "day";
  };

  // Make initialHour deterministic for SSR: if forcedHour is provided use it,
  // otherwise default to 12 (no access to `window`/Date during server render).
  const initialHour = typeof forcedHour === "number" ? forcedHour : 12;

  const [timeOfDay, setTimeOfDay] = useState<"day" | "dusk" | "night">(
    getTimeOfDay(initialHour)
  );

  // Format the displayed time for the top-right badge including seconds.
  // If `forcedHour` is provided we show the forced hour with minutes/seconds set to :00:00
  // (useful for previews). Otherwise show the actual current time with seconds.
  const getDisplayTimeString = (now?: Date) => {
    if (typeof forcedHour === "number" && forcedHour >= 0 && forcedHour < 24) {
      const h = forcedHour % 24;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12}:00:00`;
    }

    // Avoid calling `new Date()` during SSR. If not mounted, return a stable
    // placeholder matching the server-rendered initialHour so hydration matches.
    if (!mounted) {
      const h = initialHour % 24;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12}:00:00`;
    }

    const t = now ?? new Date();
    const h = t.getHours();
    const m = t.getMinutes();
    const s = t.getSeconds();
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const min = String(m).padStart(2, "0");
    const sec = String(s).padStart(2, "0");
    return `${hour12}:${min}:${sec}`;
  };

  const getTimeOfDayLabel = () =>
    timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1);

  // Cloud animation refs removed — no cloud layers will be rendered.

  const [mounted, setMounted] = useState(false);

  // starfield + shooting stars state
  const [stars, setStars] = useState<
    Array<{ x: number; y: number; r: number; seed: number }>
  >([]);
  // single shooting star definition (only one active at a time)
  const [shootingDef, setShootingDef] = useState<{
    left: string;
    top: string;
    rotate: number;
    seed: number;
    duration: number;
  } | null>(null);
  const shootTimerRef = useRef<number | null>(null);
  const activeTimeoutRef = useRef<number | null>(null);

  // On first client mount, compute real hour and randomized animation values
  useEffect(() => {
    const updateTime = () => {
      const realHour = new Date().getHours();
      const hour =
        typeof forcedHour === "number" && forcedHour >= 0 && forcedHour < 24
          ? forcedHour
          : realHour;
      setTimeOfDay(getTimeOfDay(hour));
    };

    // run immediately
    updateTime();

    // re-check every second so the badge can show live seconds
    const id = setInterval(updateTime, 1000);

    // generate a modest starfield (rendered only at night)
    setStars(
      Array.from({ length: 72 }).map(() => ({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        r: Math.random() * 1.2 + 0.6,
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

  // Cloud animation objects and cloud color variables removed.

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {mounted && (
        <div className="pointer-events-none fixed right-3 top-3 z-50 text-xs text-white/90 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
          <span>
            Time: {getDisplayTimeString()} ({getTimeOfDayLabel()})
          </span>
        </div>
      )}
      <div
        className={`absolute inset-0 transition-colors duration-700 ease-in-out `}
        aria-hidden
      >
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
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                >
                  {stars.map((s, i) => (
                    <motion.circle
                      key={`star-${i}`}
                      cx={`${s.x}%`}
                      cy={`${s.y}%`}
                      r={s.r}
                      fill="white"
                      animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.4, 1],
                      }}
                      transition={{
                        duration: 2 + (s.seed % 2),
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: s.seed * 3,
                      }}
                    />
                  ))}
                </svg>
              )}
            </AnimatePresence>
          </div>

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

      {/* Shooting star with leading glowing head */}
      {/* Shooting star with glowing head that leads the trail */}
      {mounted &&
        shootingDef &&
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
                {/* Trail gradient: bright near the star, fading out */}
                <linearGradient id={trailId} x1="0" x2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="80%" stopColor="white" stopOpacity="0" />
                </linearGradient>

                {/* Glow filter for soft edges */}
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

              {/* Trail line */}
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

              {/* Star head (glowing dot) */}
              <circle r={4} fill="white" filter={`url(#${glowId})`}>
                <animateMotion dur={dur} begin="0s" rotate="auto">
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
              <circle r={2} fill="white">
                <animateMotion dur={dur} begin="0s" rotate="auto">
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
            </svg>
          );
        })()}

      {kind === "storm" && (
        <motion.div
          className="absolute inset-0 bg-white/40 pointer-events-none"
          variants={lightningFlash}
          initial="hidden"
          animate="visible"
          custom={4}
        />
      )}

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
