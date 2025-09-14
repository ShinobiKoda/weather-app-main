"use client";
import { motion } from "motion/react";
import React, { useMemo, useRef, useId, useState, useEffect } from "react";
import {
  sunOverlay,
  fogOverlay,
  rainOverlay,
  starTwinkle,
  lightningFlash,
  fogBlob,
} from "./animations/motion";

// small utility to darken or lighten a hex color by percent (-100..100)
function shadeColor(hex: string, percent: number) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) + Math.round((percent / 100) * 255);
  let g = ((num >> 8) & 0x00ff) + Math.round((percent / 100) * 255);
  let b = (num & 0x0000ff) + Math.round((percent / 100) * 255);
  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

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

// Use the provided cloud icon path for cloud clusters (scaled and positioned)
const CloudSVG = ({
  className = "",
  baseColor = "#ffffff",
}: {
  className?: string;
  baseColor?: string;
}) => {
  const uid = useId();
  const id = `cloudGrad-${uid.replaceAll(":", "-")}`;
  const filt = `cloudBlur-${uid.replaceAll(":", "-")}`;

  // the cloud path provided (converted from the svg icon)
  const cloudPath = `M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z`;

  // cluster positions and scales (for the 1000x280 viewBox)
  const clusterDefs = [
    // smaller scale values so translate doesn't get accidentally over-applied
    { x: 100, y: 60, s: 9 },
    { x: 420, y: 72, s: 11 },
    { x: 760, y: 62, s: 8.5 },
  ];

  return (
    <svg
      viewBox="0 0 1000 280"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0%" stopColor={baseColor} stopOpacity="1" />
          <stop offset="45%" stopColor={baseColor} stopOpacity="0.85" />
          <stop offset="100%" stopColor={baseColor} stopOpacity="0.05" />
        </linearGradient>
        <filter id={filt} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        fill={`url(#${id})`}
        filter={`url(#${filt})`}
        transform="translate(0,20)"
        style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.06))" }}
      >
        {clusterDefs.map((c, i) => (
          <g key={i} transform={`translate(${c.x}, ${c.y})`}>
            <g transform={`scale(${c.s})`}>
              <path
                d={cloudPath}
                fill={`url(#${id})`}
                stroke={`rgba(0,0,0,0.08)`}
                strokeWidth={1.2}
                strokeOpacity={0.95}
                transform={`translate(0,0)`}
              />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
};

export default function Background({ kind, forcedHour }: Props) {
  const uid = useId();
  // Determine theme classes and overlays
  const isRainy = /rain|drizzle|storm/.test(String(kind || ""));
  const isFog = /fog/.test(String(kind || ""));

  // Time of day: day | dusk | night
  const realHour = typeof window !== "undefined" ? new Date().getHours() : 12;
  const hour =
    typeof forcedHour === "number" && forcedHour >= 0 && forcedHour < 24
      ? forcedHour
      : realHour;
  let timeOfDay: "day" | "dusk" | "night" = "day";
  if (hour >= 18 || hour < 6) timeOfDay = "night";
  else if (hour >= 16 && hour < 18) timeOfDay = "dusk";

  // Randomized starts/durations so clouds don't all begin at the same place
  const slowStart = useRef(-30 - Math.random() * 50); // e.g. -30% to -80%
  const medStart = useRef(-30 - Math.random() * 40);
  const fastStart = useRef(-30 - Math.random() * 30);

  const slowDelay = useRef(Math.random() * 6);
  const medDelay = useRef(Math.random() * 4);
  const fastDelay = useRef(Math.random() * 2);

  const slowDuration = useRef(38 + Math.random() * 8);
  const medDuration = useRef(22 + Math.random() * 6);
  const fastDuration = useRef(12 + Math.random() * 4);

  const slowAnimate = useMemo(
    () => ({ x: [`${slowStart.current}%`, "110%"] }),
    []
  );
  const medAnimate = useMemo(
    () => ({ x: [`${medStart.current}%`, "110%"] }),
    []
  );
  const fastAnimate = useMemo(
    () => ({ x: [`${fastStart.current}%`, "110%"] }),
    []
  );

  const slowTrans = useMemo(
    () => ({
      duration: slowDuration.current,
      ease: "linear" as const,
      repeat: Infinity,
      repeatType: "loop" as const,
      delay: slowDelay.current,
    }),
    []
  );
  const medTrans = useMemo(
    () => ({
      duration: medDuration.current,
      ease: "linear" as const,
      repeat: Infinity,
      repeatType: "loop" as const,
      delay: medDelay.current,
    }),
    []
  );
  const fastTrans = useMemo(
    () => ({
      duration: fastDuration.current,
      ease: "linear" as const,
      repeat: Infinity,
      repeatType: "loop" as const,
      delay: fastDelay.current,
    }),
    []
  );

  // client-only starfield + shooting stars to avoid SSR hydration mismatches
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
    // generate stars (higher density + some larger twinkles)
    const s: Array<{ x: number; y: number; r: number; seed: number }> = [];
    const starCount = 220;
    for (let i = 0; i < starCount; i++) {
      // bias to a few larger stars
      const large = Math.random() < 0.06;
      s.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: large ? 1.8 + Math.random() * 1.6 : 0.6 + Math.random() * 1.8,
        seed: Math.random(),
      });
    }
    setStars(s);

    // schedule a single shooting star spawn; after it completes we'll schedule the next
    const schedule = (minSec = 3, maxSec = 10) => {
      const delay = minSec + Math.random() * (maxSec - minSec);
      shootTimerRef.current = window.setTimeout(() => {
        const duration = 0.9 + Math.random() * 1.2; // sec (longer, more visible)
        setShootingDef({
          left: `${Math.random() * 80 + 5}%`,
          top: `${Math.random() * 50 + 5}%`,
          rotate: -18 - Math.random() * 12,
          seed: Math.random(),
          duration,
        });
        // when this star's animation finishes, clear it and schedule the next
        activeTimeoutRef.current = window.setTimeout(() => {
          setShootingDef(null);
          schedule(4, 12);
        }, (duration + 0.12) * 1000) as unknown as number;
      }, delay * 1000) as unknown as number;
    };

    schedule(2, 8);
  }, []);

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (shootTimerRef.current)
        clearTimeout(shootTimerRef.current as unknown as number);
      if (activeTimeoutRef.current)
        clearTimeout(activeTimeoutRef.current as unknown as number);
    };
  }, []);

  // choose a cloud base color that remains visible across sky backgrounds
  // Cloud color primarily follows time of day so page background isn't weather-driven.
  let cloudBaseColor = "#ffffff";
  if (timeOfDay === "day") cloudBaseColor = "#f6f8fb";
  else if (timeOfDay === "dusk") cloudBaseColor = "#fff7ee";
  else cloudBaseColor = "#dfe9ff"; // night

  // Slight tint when rainy so clouds feel moodier, but this does not change page background
  if (isRainy) cloudBaseColor = shadeColor(cloudBaseColor, -6);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* subtle gradient sky */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ease-in-out `}
        aria-hidden
      >
        <div className="w-full h-full relative">
          {/* Multiple slowly-fading gradient layers to simulate color cycles (sunrise -> day -> dusk) */}
          <div className="absolute inset-0">
            <div className="absolute inset-0">
              {timeOfDay === "day" && (
                <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500" />
              )}
              {timeOfDay === "dusk" && (
                <div className="absolute inset-0 bg-gradient-to-b from-orange-200 via-pink-400 to-purple-600" />
              )}
              {timeOfDay === "night" && (
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-blue-950 to-black" />
              )}
            </div>
            {/* intentionally no weather-driven base gradient here; background colors are controlled by time of day layers above */}
          </div>

          {/* darkening overlay by time of day; keep opacity low so clouds show through */}
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

      {/* Night stars + shooting stars */}
      {timeOfDay === "night" && (
        <>
          {mounted && (
            <svg className="absolute inset-0 w-full h-full" aria-hidden>
              <g className="opacity-95">
                {stars.map((st, i) => (
                  <motion.circle
                    key={`s-${i}`}
                    cx={`${st.x}%`}
                    cy={`${st.y}%`}
                    r={st.r}
                    fill="#fff"
                    variants={starTwinkle}
                    initial="hidden"
                    animate="visible"
                    custom={st.seed}
                    style={{ filter: "blur(0.25px)" }}
                  />
                ))}
              </g>
            </svg>
          )}

          {/* single shooting star spawn (one at a time) */}
          {mounted &&
            shootingDef &&
            (() => {
              const sdef = shootingDef;
              const pathId = `shootPath-${uid}`;
              const gradId = `shootGrad-${uid}`;
              const glowId = `shootGlow-${uid}`;
              // Parabolic quadratic curve; adjust control point slightly by seed
              const cp = 12 + (sdef.seed % 1) * 36;
              // longer, higher arc for a more obvious parabola
              const d = `M8 64 Q 140 ${16 - cp} 236 6`;
              const trailLength = 420;
              const dur = sdef.duration.toFixed(2) + "s";

              return (
                <svg
                  key={`shoot-single`}
                  className="absolute overflow-visible pointer-events-none"
                  style={{ left: sdef.left, top: sdef.top }}
                  width={280}
                  height={100}
                  viewBox="0 0 280 100"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id={gradId} x1="0" x2="1">
                      <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                      <stop offset="55%" stopColor="#fff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#fff" stopOpacity="1" />
                    </linearGradient>
                    <filter
                      id={glowId}
                      x="-70%"
                      y="-70%"
                      width="300%"
                      height="300%"
                    >
                      <feGaussianBlur stdDeviation="5" result="g" />
                      <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* trail: stroke-dash animated once when spawned */}
                  <path
                    id={pathId}
                    d={d}
                    stroke={`url(#${gradId})`}
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    filter={`url(#${glowId})`}
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
                  </path>

                  {/* bright core that moves along the path and is brightest at the tip */}
                  <circle r={7} fill="#fff" filter={`url(#${glowId})`}>
                    <animateMotion dur={dur} begin="0s" rotate="auto">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>

                  {/* bright terminal flare remains briefly at the end of path */}
                  <circle
                    r={4}
                    cx={236}
                    cy={6}
                    fill="#fff"
                    opacity={1}
                    filter={`url(#${glowId})`}
                  />
                </svg>
              );
            })()}
        </>
      )}

      {/* Lightning flash behind clouds when storming */}
      {kind === "storm" && (
        <motion.div
          className="absolute inset-0 bg-white/40 pointer-events-none"
          variants={lightningFlash}
          initial="hidden"
          animate="visible"
          custom={4}
        />
      )}

      {/* Fog blobs: subtle moving semi-transparent blobs (in front of gradient, behind clouds) */}
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

      {/* Precipitation (raindrops / snowflakes) in front of clouds */}
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

      {/* Far slow-moving cloud layer */}
      <motion.div
        className="absolute left-0 top-8 w-[140%] opacity-95 will-change-transform"
        initial={false}
        animate={slowAnimate}
        transition={slowTrans}
        style={{ x: `${slowStart.current}%` }}
        aria-hidden
      >
        <div className="w-full max-w-[1600px] mx-auto opacity-90">
          <CloudSVG className="w-full h-[220px]" baseColor={cloudBaseColor} />
        </div>
      </motion.div>

      {/* Middle medium-moving cloud band */}
      <motion.div
        className="absolute left-0 top-[140px] w-[120%] opacity-100 will-change-transform"
        initial={false}
        animate={medAnimate}
        transition={medTrans}
        style={{ x: `${medStart.current}%` }}
        aria-hidden
      >
        <div className="w-full max-w-[1400px] mx-auto">
          <CloudSVG className="w-full h-[260px]" baseColor={cloudBaseColor} />
        </div>
      </motion.div>

      {/* Close fast cloud puffs */}
      <motion.div
        className="absolute left-0 top-[260px] w-[110%] opacity-100 will-change-transform"
        initial={false}
        animate={fastAnimate}
        transition={fastTrans}
        style={{ x: `${fastStart.current}%` }}
        aria-hidden
      >
        <div className="w-full max-w-[1200px] mx-auto">
          <CloudSVG className="w-full h-[200px]" baseColor={cloudBaseColor} />
        </div>
      </motion.div>

      {/* Ambient overlays for weather */}
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
