"use client";
import { motion } from "motion/react";
import { fadeInUp, staggerChildren } from "./animations/motion";
import { IoThermometerOutline } from "react-icons/io5";
import { BsDroplet } from "react-icons/bs";
import { ImCompass } from "react-icons/im";
import { WiRain } from "react-icons/wi";

import { WeatherPayload } from "../api/open-meto";

import { convertTemp, convertWind } from "./utils";

type Props = {
  weather: WeatherPayload | null;
  loading: boolean;
  tempUnit: "C" | "F";
  windUnit: "kmh" | "mph";
};

export default function StatsGrid({
  weather,
  loading,
  tempUnit,
  windUnit,
}: Props) {
  return (
    <motion.div
      key={loading ? "skeleton" : "data"}
      className="mt-5 lg:mt-8 w-full grid grid-cols-2 gap-4 md:grid-cols-4"
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={`rounded-xl px-5 py-4 min-h-[118px] bg-neutral-800 flex flex-col justify-between border border-neutral-600 ${
          loading ? "skeleton" : ""
        }`}
        variants={fadeInUp}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.995 }}
      >
        {loading && <div className="shimmer" />}
        <div className="flex items-center gap-2">
          <motion.span
            aria-label="Feels like icon"
            className="text-neutral-300"
            initial={{ y: 0 }}
            animate={{ y: loading ? 0 : [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <IoThermometerOutline size={28} />
          </motion.span>
          <p
            className="font-medium text-lg text-neutral-200 max-w-[70px] truncate xl:max-w-none"
            title="Feels like"
            aria-label="Feels like"
          >
            <span className="inline xl:hidden" aria-hidden="true">
              Feels
            </span>
            <span className="hidden xl:inline" aria-hidden="true">
              Feels like
            </span>
          </p>
        </div>
        <p className="text-white font-light text-[32px]">
          {loading
            ? "--"
            : Number.isFinite(weather?.properties.feels_like as number)
            ? `${Math.round(
                convertTemp(weather!.properties.feels_like!, tempUnit)
              )}°`
            : "--"}
        </p>
      </motion.div>

      <motion.div
        className={`rounded-xl px-5 py-4 min-h-[118px] bg-neutral-800 flex flex-col justify-between border border-neutral-600 ${
          loading ? "skeleton" : ""
        }`}
        variants={fadeInUp}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.995 }}
      >
        {loading && <div className="shimmer" />}
        <div className="flex items-center gap-2">
          <motion.span
            aria-label="Humidity icon"
            className="text-neutral-300"
            initial={{ rotate: 0 }}
            animate={{ rotate: loading ? 0 : [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <BsDroplet size={25} />
          </motion.span>
          <p className="font-medium text-lg text-neutral-200">Humidity</p>
        </div>
        <p className="text-white font-light text-[32px]">
          {loading
            ? "--"
            : Number.isFinite(weather?.properties.humidity as number)
            ? `${Math.round(weather!.properties.humidity!)}%`
            : "--"}
        </p>
      </motion.div>

      <motion.div
        className={`rounded-xl px-5 py-4 min-h-[118px] bg-neutral-800 flex flex-col justify-between border border-neutral-600 ${
          loading ? "skeleton" : ""
        }`}
        variants={fadeInUp}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.995 }}
      >
        {loading && <div className="shimmer" />}
        <div className="flex items-center gap-2">
          <motion.span
            aria-label="Wind direction compass"
            className="text-neutral-300"
            style={{ originX: 0.5, originY: 0.5, display: "inline-block" }}
            animate={{
              rotate: loading ? 0 : weather?.current.winddirection ?? 0,
            }}
            transition={{ type: "spring", stiffness: 55, damping: 14 }}
          >
            <motion.span
              style={{ originX: 0.5, originY: 0.5, display: "inline-block" }}
              animate={
                loading
                  ? { rotate: 0 }
                  : { rotate: [-20, 20, -20], scale: [1, 1.1, 1] }
              }
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ImCompass size={26} />
            </motion.span>
          </motion.span>
          <p className="font-medium text-lg text-neutral-200">Wind</p>
        </div>
        <p className="text-white font-light text-[32px]">
          {loading
            ? "--"
            : Number.isFinite(weather?.properties.wind as number)
            ? `${Math.round(
                convertWind(weather!.properties.wind!, windUnit)
              )} ${windUnit === "kmh" ? "km/h" : "mph"}`
            : "--"}
        </p>
      </motion.div>

      <motion.div
        className={`rounded-xl p-4 min-h-[118px] bg-neutral-800 flex flex-col justify-between border border-neutral-600 ${
          loading ? "skeleton" : ""
        }`}
        variants={fadeInUp}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.995 }}
      >
        {loading && <div className="shimmer" />}
        <div className="flex items-center gap-2">
          <motion.span
            aria-label="Precipitation chance icon"
            className="text-neutral-300"
            initial={{ y: 0, opacity: 1 }}
            animate={
              loading
                ? { y: 0, opacity: 1 }
                : { y: [0, 6, 0], opacity: [1, 0.65, 1] }
            }
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <WiRain size={30} />
          </motion.span>
          <p
            className="font-medium text-lg text-neutral-200 max-w-[110px] truncate xl:max-w-none"
            title="Precipitation (chance of rain)"
            aria-label="Precipitation (chance of rain)"
          >
            <span className="inline xl:hidden" aria-hidden="true">
              Precip.
            </span>
            <span className="hidden xl:inline" aria-hidden="true">
              Precipitation (chance of rain)
            </span>
          </p>
        </div>
        <p className="text-white font-light text-[32px]">
          {loading
            ? "--"
            : Number.isFinite(
                weather?.properties.precipitation_probability as number
              )
            ? `${Math.round(weather!.properties.precipitation_probability!)}%`
            : "--"}
        </p>
      </motion.div>
    </motion.div>
  );
}
