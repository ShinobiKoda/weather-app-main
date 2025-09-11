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
  // overlays
  rainOverlay,
  drizzleOverlay,
  snowOverlay,
  stormOverlay,
  fogOverlay,
  sunOverlay,
} from "./animations/motion";
import { WeatherPayload } from "../api/open-meto";
import { convertTemp } from "./utils";

type Props = {
  weather: WeatherPayload | null;
  loading: boolean;
  location: string;
  formatLongDate: (d?: string | Date) => string;
  tempUnit?: "C" | "F";
};

export default function WeatherHero({
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

  // ✅ Create a unique key so AnimatePresence knows when data changes
  const keyId = `${location}-${weather?.current?.time ?? "loading"}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyId} // 👈 forces re-animation when location/weather changes
        className="w-full"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={bgFloat} // simple fade/slide for the whole card
      >
        {/* Mobile card */}
        <motion.div
          className="bg-cover bg-center h-[286px] rounded-[20px] flex flex-col items-center justify-center lg:hidden relative overflow-hidden px-[24.5px]"
          style={{ backgroundImage: "url('/images/bg-today-small.svg')" }}
          variants={bgFloat}
        >
          {overlayVariant && (
            <motion.div
              variants={overlayVariant}
              initial="hidden"
              animate="visible"
              className="absolute inset-0 pointer-events-none"
            />
          )}

          <div className="flex flex-col gap-3 text-center mt-[41px] relative z-10">
            <h2 className="font-bold text-[28px]">
              <span>{loading ? "--" : location || "Here"}</span>
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
              <Image
                src={
                  weather
                    ? weather.hourly[0]?.icon ?? "/images/icon-overcast.webp"
                    : "/images/icon-overcast.webp"
                }
                alt="Weather Icon"
                width={170}
                height={100}
              />
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

        {/* Desktop card */}
        <motion.div
          className="bg-cover bg-center h-[286px] rounded-3xl hidden lg:flex flex-row items-center justify-between px-8 relative overflow-hidden"
          style={{ backgroundImage: "url('/images/bg-today-large.svg')" }}
          variants={fadeInUp}
        >
          {overlayVariant && (
            <motion.div
              variants={overlayVariant}
              initial="hidden"
              animate="visible"
              className="absolute inset-0 pointer-events-none"
            />
          )}

          <div className="relative z-10">
            <h2 className="font-bold text-xl">
              <span>{loading ? "--" : location || "Unknown location"}</span>
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
              <Image
                src={
                  weather
                    ? weather.hourly[0]?.icon ?? "/images/icon-overcast.webp"
                    : "/images/icon-overcast.webp"
                }
                alt="Weather Icon"
                width={150}
                height={100}
              />
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


