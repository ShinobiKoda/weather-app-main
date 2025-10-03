"use client";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import {
  bgFloat,
  sunBounceRotate,
  cloudDrift,
  rainJitter,
  drizzleFloat,
  snowFloat,
  stormPulse,
  fadeInUp,
  fogDrift,
  rainOverlay,
  drizzleOverlay,
  snowOverlay,
  stormOverlay,
  fogOverlay,
  sunOverlay,
  rainDrop,
  drizzleLine,
  splatter,
} from "./animations/motion";
import { useMemo, memo } from "react";
import { WeatherPayload } from "../api/open-meto";
import { convertTemp } from "./utils";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";

import { useFavorites } from "./FavoritesContext";
import { useCallback } from "react";

function HeroFavoriteStar({
  location,
  size = 20,
}: {
  location: string;
  size?: number;
}) {
  const { addFavorite, removeFavorite, favorites } = useFavorites();

  const isFavorited = !!favorites.find((f) => {
    if (!location) return false;
    if (f.name === location) return true;
    if (location.includes(f.name) || f.name.includes(location)) return true;
    return false;
  });

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!location) return;
      if (isFavorited) {
        // find id and remove
        const found = favorites.find(
          (f) =>
            f.name === location ||
            location.includes(f.name) ||
            f.name.includes(location)
        );
        if (found) removeFavorite(found.id);
        return;
      }
      addFavorite({ name: location });
    },
    [addFavorite, isFavorited, location, favorites, removeFavorite]
  );

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label="add-favorite"
      className="relative inline-flex items-center justify-center group transition-transform duration-150 focus:outline-none cursor-pointer"
    >
      <AiOutlineStar
        size={size}
        className={
          isFavorited
            ? "hidden text-white transition-transform duration-150"
            : "block text-white transition-transform duration-150"
        }
      />
      <AiFillStar
        size={size}
        className={
          isFavorited
            ? "block text-white transition-transform duration-150 scale-95"
            : "hidden text-white transition-transform duration-150"
        }
      />
    </motion.button>
  );
}

type Props = {
  weather: WeatherPayload | null;
  loading: boolean;
  location: string;
  formatLongDate: (d?: string | Date) => string;
  tempUnit?: "C" | "F";
};

function WeatherHero({
  weather,
  loading,
  location,
  formatLongDate,
  tempUnit = "C",
}: Props) {
  const code = weather?.current?.weathercode ?? 0;

  function pickIconVariant(code: number) {
    if (code === 0) return sunBounceRotate; // clear
    if (code === 1 || code === 2 || code === 3) return sunBounceRotate;
    if (code === 45 || code === 48) return fogDrift;
    if (
      (code >= 51 && code <= 57) ||
      (code >= 61 && code <= 67) ||
      (code >= 80 && code <= 82)
    )
      return drizzleFloat; // drizzle / light rain
    if ((code >= 63 && code <= 65) || (code >= 85 && code <= 86))
      return rainJitter; // rain
    if (code >= 71 && code <= 77) return snowFloat; // snow
    if (code >= 95 && code <= 99) return stormPulse; // thunderstorm
    return cloudDrift;
  }

  function pickOverlayVariant(code: number) {
    if (code === 0) return sunOverlay;
    if (code === 1 || code === 2 || code === 3) return sunOverlay;
    if (code === 45 || code === 48) return fogOverlay;
    if (code >= 51 && code <= 57) return drizzleOverlay;
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
      return rainOverlay;
    if (code >= 71 && code <= 77) return snowOverlay;
    if (code >= 95 && code <= 99) return stormOverlay;
    return undefined;
  }

  const iconVariant = pickIconVariant(code);
  const overlayVariant = pickOverlayVariant(code);

  const keyId = `${location}-${weather?.current?.time ?? "loading"}`;

  function pickTint(code: number) {
    if (code === 0 || code === 1 || code === 2 || code === 3)
      return "rgba(255,255,255,0.06)"; // light sun wash
    if (code === 45 || code === 48) return "rgba(200,200,210,0.08)"; // fog slightly light
    if (
      (code >= 51 && code <= 57) ||
      (code >= 61 && code <= 67) ||
      (code >= 80 && code <= 82)
    )
      return "rgba(10,14,22,0.55)"; // drizzle / light rain -> darker
    if ((code >= 63 && code <= 65) || (code >= 85 && code <= 86))
      return "rgba(6,10,16,0.7)"; // rain -> dark
    if (code >= 71 && code <= 77) return "rgba(18,20,26,0.45)";
    if (code >= 95 && code <= 99) return "rgba(8,8,12,0.72)";
    return "rgba(12,16,22,0.5)";
  }

  const tint = pickTint(code);

  const isRain = (c: number) =>
    (c >= 61 && c <= 67) ||
    (c >= 63 && c <= 65) ||
    (c >= 80 && c <= 82) ||
    (c >= 95 && c <= 99);
  const isDrizzle = (c: number) => c >= 51 && c <= 57;

  const currentPrecip = weather?.properties?.precipitation ?? null;
  const currentPrecipProb =
    weather?.properties?.precipitation_probability ?? null;

  function findHourlyIndexForCurrent() {
    if (!weather || !weather.hourly || !weather.current) return -1;
    const currentTime = weather.current.time;
    let bestIdx = -1;
    let bestDiff = Infinity;
    for (let i = 0; i < weather.hourly.length; i++) {
      const t = weather.hourly[i].time;
      const dt = Math.abs(
        new Date(t).getTime() - new Date(currentTime).getTime()
      );
      if (isNaN(dt)) continue;
      if (dt < bestDiff) {
        bestDiff = dt;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  const hourlyIdx = findHourlyIndexForCurrent();
  const hourlyPrecip =
    hourlyIdx >= 0 && weather?.hourly?.[hourlyIdx]?.precipitation != null
      ? weather.hourly[hourlyIdx].precipitation ?? null
      : null;
  const hourlyPrecipProb =
    hourlyIdx >= 0 &&
    weather?.hourly?.[hourlyIdx]?.precipitation_probability != null
      ? weather.hourly[hourlyIdx].precipitation_probability ?? null
      : null;

  const isCurrentlyRaining = (() => {
    if (!isRain(code)) return false;
    if (currentPrecipProb !== null) return currentPrecipProb >= 90;
    if (hourlyPrecipProb !== null) return hourlyPrecipProb >= 90;

    if (currentPrecip !== null) return currentPrecip > 0;
    if (hourlyPrecip !== null) return hourlyPrecip > 0;
    return false;
  })();

  const isCurrentlyDrizzling = (() => {
    if (!isDrizzle(code)) return false;
    if (currentPrecip !== null) return currentPrecip > 0;
    if (hourlyPrecip !== null) return hourlyPrecip > 0;
    if (currentPrecipProb !== null) return currentPrecipProb >= 35;
    if (hourlyPrecipProb !== null) return hourlyPrecipProb >= 35;
    return false;
  })();

  type Drop = {
    id: string;
    left: number;
    size: number;
    delay: number;
    duration: number;
    slant: number;
  };
  const rainDrops = useMemo<Drop[]>(() => {
    if (!isCurrentlyRaining) return [];
    const count = 70;
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const size = 6 + Math.random() * 4;
      const delay = Math.random() * 2;
      const duration = 0.9 + Math.random() * 0.7;
      const slant = -10 + Math.random() * 6;
      return { id: `drop-${i}`, left, size, delay, duration, slant };
    });
  }, [isCurrentlyRaining]);

  type DrizzleLine = {
    id: string;
    left: number;
    height: number;
    angle: number;
    delay: number;
    color: string;
  };
  const drizzleLines = useMemo<DrizzleLine[]>(() => {
    if (!isCurrentlyDrizzling) return [];
    const count = 20;
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const height = 24 + Math.round(Math.random() * 40);
      const opacity = 0.3 + Math.random() * 0.45;
      const angle = -4 + Math.random() * 8;
      const delay = Math.random() * 1.6;
      const color = `rgba(170,190,210,${opacity})`;
      return { id: `drizzle-${i}`, left, height, angle, delay, color };
    });
  }, [isCurrentlyDrizzling]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyId}
        className="w-full"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={bgFloat}
      >
        <motion.div
          className={
            loading
              ? "h-[286px] rounded-[20px] flex flex-col items-center justify-center lg:hidden relative overflow-hidden px-[24.5px] skeleton bg-neutral-700"
              : "bg-cover bg-center h-[286px] rounded-[20px] flex flex-col items-center justify-center lg:hidden relative overflow-hidden px-[24.5px]"
          }
          style={
            loading
              ? {}
              : { backgroundImage: "url('/images/bg-today-small.svg')" }
          }
          variants={bgFloat}
        >
          {loading && <div className="shimmer" />}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: tint }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {overlayVariant &&
            (() => {
              if (overlayVariant === rainOverlay && !isCurrentlyRaining)
                return null;
              if (overlayVariant === drizzleOverlay && !isCurrentlyDrizzling)
                return null;
              return (
                <motion.div
                  variants={overlayVariant}
                  initial="hidden"
                  animate="visible"
                  className="absolute inset-0 pointer-events-none"
                />
              );
            })()}

          {isCurrentlyRaining && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {rainDrops.map((d) => (
                <motion.div
                  key={d.id}
                  variants={rainDrop}
                  custom={{ delay: d.delay, duration: d.duration }}
                  initial="hidden"
                  animate="visible"
                  className="absolute"
                  style={{ left: `${d.left}%` }}
                >
                  <div
                    style={{
                      width: `${d.size}px`,
                      height: `${d.size * 1.6}px`, // slightly elongated
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", // teardrop-like
                      background:
                        "linear-gradient(to bottom, rgba(160,190,220,0.9), rgba(160,190,220,0.3))",
                      transform: `translateX(-50%) rotate(${d.slant}deg)`,
                      filter: "blur(0.4px)",
                    }}
                  />
                </motion.div>
              ))}

              {rainDrops.map((d) => (
                <motion.div
                  key={`${d.id}-splat`}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${d.left}%`,
                    bottom: "4%",
                    zIndex: 20,
                    transform: "translateX(-50%)",
                    width: `${Math.max(6, d.size * 0.9)}px`,
                    height: `${Math.max(6, d.size * 0.5)}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  variants={splatter}
                  custom={d.delay + d.duration * 0.75}
                  initial="hidden"
                  animate="visible"
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "rgba(180,200,220,0.6)",
                      filter: "blur(0.6px)",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {isCurrentlyDrizzling && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {drizzleLines.map((l) => (
                <motion.div
                  key={l.id}
                  variants={drizzleLine}
                  custom={l.delay}
                  initial="hidden"
                  animate="visible"
                >
                  <div
                    className="absolute left-0"
                    style={{
                      left: `${l.left}%`,
                      transform: `translateX(-50%) rotate(${l.angle}deg)`,
                      width: "1.5px",
                      height: `${l.height}px`,
                      background: l.color,
                      borderRadius: "2px",
                      bottom: "0",
                      top: "0",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 text-center mt-[41px] relative z-10">
            <h2 className="font-bold text-[28px] flex items-center gap-2 justify-center">
              <span>{loading ? "--" : location || "Here"}</span>
              <HeroFavoriteStar location={location} size={30} />
            </h2>
            <p className="font-medium text-lg opacity-80">
              {loading
                ? "--"
                : weather
                ? formatLongDate(weather.current.time)
                : formatLongDate()}
            </p>
          </div>

          <div className="flex items-center relative z-10">
            <motion.div
              variants={iconVariant}
              initial="hidden"
              animate="visible"
              className="flex items-center"
            >
              {loading || !weather ? (
                <div>--</div>
              ) : (
                <Image
                  src={weather.hourly[0]?.icon ?? "/images/icon-overcast.webp"}
                  alt="Weather Icon"
                  width={170}
                  height={100}
                />
              )}
            </motion.div>
            <p className="text-[96px] font-semibold italic">
              {loading
                ? "--"
                : weather
                ? `${Math.round(
                    convertTemp(weather.current.temperature, tempUnit)
                  )}°`
                : "--"}
            </p>
          </div>
        </motion.div>

        <motion.div
          className={
            loading
              ? "h-[286px] rounded-3xl hidden lg:flex flex-row items-center justify-between px-8 relative overflow-hidden skeleton bg-neutral-800"
              : "bg-cover bg-center h-[286px] rounded-3xl hidden lg:flex flex-row items-center justify-between px-8 relative overflow-hidden"
          }
          style={
            loading
              ? {}
              : { backgroundImage: "url('/images/bg-today-large.svg')" }
          }
          variants={fadeInUp}
        >
          {loading && <div className="shimmer" />}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: tint }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {overlayVariant &&
            (() => {
              if (overlayVariant === rainOverlay && !isCurrentlyRaining)
                return null;
              if (overlayVariant === drizzleOverlay && !isCurrentlyDrizzling)
                return null;
              return (
                <motion.div
                  variants={overlayVariant}
                  initial="hidden"
                  animate="visible"
                  className="absolute inset-0 pointer-events-none"
                />
              );
            })()}

          {isCurrentlyRaining && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {rainDrops.map((d) => (
                <motion.div
                  key={d.id}
                  variants={rainDrop}
                  custom={{ delay: d.delay, duration: d.duration }}
                  initial="hidden"
                  animate="visible"
                  className="absolute"
                  style={{ left: `${d.left}%` }}
                >
                  <div
                    style={{
                      width: `${d.size}px`,
                      height: `${d.size * 1.6}px`, // slightly elongated
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", // teardrop-like
                      background:
                        "linear-gradient(to bottom, rgba(160,190,220,0.9), rgba(160,190,220,0.3))",
                      transform: `translateX(-50%) rotate(${d.slant}deg)`,
                      filter: "blur(0.4px)",
                    }}
                  />
                </motion.div>
              ))}

              {rainDrops.map((d) => (
                <motion.div
                  key={`${d.id}-splat-desktop`}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${d.left}%`,
                    bottom: "4%",
                    zIndex: 20,
                    transform: "translateX(-50%)",
                    width: `${Math.max(6, d.size * 0.9)}px`,
                    height: `${Math.max(6, d.size * 0.5)}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  variants={splatter}
                  custom={d.delay + d.duration * 0.75}
                  initial="hidden"
                  animate="visible"
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "rgba(180,200,220,0.6)",
                      filter: "blur(0.6px)",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {isDrizzle(code) && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {drizzleLines.map((l) => (
                <motion.div
                  key={l.id}
                  variants={drizzleLine}
                  custom={l.delay}
                  initial="hidden"
                  animate="visible"
                >
                  <div
                    className="absolute left-0"
                    style={{
                      left: `${l.left}%`,
                      transform: `translateX(-50%) rotate(${l.angle}deg)`,
                      width: "1.5px",
                      height: `${l.height}px`,
                      background: l.color,
                      borderRadius: "2px",
                      bottom: "0",
                      top: "0",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}

          <div className="relative z-10">
            <h2 className="font-bold text-xl flex items-center gap-2">
              <span>{loading ? "--" : location || "Unknown location"}</span>
              <HeroFavoriteStar location={location} size={30} />
            </h2>
            <p className="font-normal text-lg text-neutral-300">
              {loading
                ? "--"
                : weather
                ? formatLongDate(weather.current.time)
                : formatLongDate()}
            </p>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <motion.div
              variants={iconVariant}
              initial="hidden"
              animate="visible"
              className="flex items-center"
            >
              {loading || !weather ? (
                <p>--</p>
              ) : (
                <Image
                  src={weather.hourly[0]?.icon ?? "/images/icon-overcast.webp"}
                  alt="Weather Icon"
                  width={150}
                  height={100}
                />
              )}
            </motion.div>
            <motion.p
              variants={iconVariant}
              initial="hidden"
              animate="visible"
              className="text-8xl font-extrabold italic"
            >
              {loading
                ? "--"
                : weather
                ? `${Math.round(
                    convertTemp(weather.current.temperature, tempUnit)
                  )}°`
                : "--"}
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(WeatherHero);
