"use client";
import { motion } from "motion/react";
import { fadeInUp } from "./animations/motion";
import { WeatherPayload } from "../api/open-meto";

import { convertTemp, convertWind, convertPrecip } from "./utils";

type Props = {
  weather: WeatherPayload | null;
  loading: boolean;
  tempUnit: "C" | "F";
  windUnit: "kmh" | "mph";
  precipUnit: "mm" | "in";
};

export default function StatsGrid({
  weather,
  loading,
  tempUnit,
  windUnit,
  precipUnit,
}: Props) {
  return (
    <motion.div
      className="mt-5 lg:mt-8 w-full grid grid-cols-2 gap-4 md:grid-cols-4"
      variants={{}}
    >
      <motion.div
        className="rounded-xl px-5 py-4 min-h-[118px] bg-neutral-800 flex flex-col justify-between border border-neutral-600"
        variants={fadeInUp}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.995 }}
      >
        <p className="font-medium text-lg text-neutral-200">Feels like</p>
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
        className="rounded-xl px-5 py-4 min-h-[118px] bg-neutral-800 flex flex-col justify-between border border-neutral-600"
        variants={fadeInUp}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.995 }}
      >
        <p className="font-medium text-lg text-neutral-200">Humidity</p>
        <p className="text-white font-light text-[32px]">
          {loading
            ? "--"
            : Number.isFinite(weather?.properties.humidity as number)
            ? `${Math.round(weather!.properties.humidity!)}%`
            : "--"}
        </p>
      </motion.div>

      <motion.div
        className="rounded-xl px-5 py-4 min-h-[118px] bg-neutral-800 flex flex-col justify-between border border-neutral-600"
        variants={fadeInUp}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.995 }}
      >
        <p className="font-medium text-lg text-neutral-200">Wind</p>
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
        className="rounded-xl px-5 py-4 min-h-[118px] bg-neutral-800 flex flex-col justify-between border border-neutral-600"
        variants={fadeInUp}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.995 }}
      >
        <p className="font-medium text-lg text-neutral-200">Precipitation</p>
        <p className="text-white font-light text-[32px]">
          {loading
            ? "--"
            : Number.isFinite(weather?.properties.precipitation as number)
            ? `${Number(
                convertPrecip(weather!.properties.precipitation!, precipUnit)
              ).toFixed(1)} ${precipUnit}`
            : "--"}
        </p>
      </motion.div>
    </motion.div>
  );
}
