"use client";
import { motion } from "motion/react";
import { fadeInUp } from "./animations/motion";
import { WeatherPayload } from "../api/open-meto";

type Props = {
  weather: WeatherPayload | null;
  loading: boolean;
};

export default function StatsGrid({ weather, loading }: Props) {
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
            : weather?.properties.feels_like
            ? `${Math.round(weather.properties.feels_like)}°`
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
            : weather?.properties.humidity
            ? `${Math.round(weather.properties.humidity)}%`
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
            : weather?.properties.wind
            ? `${Math.round(weather.properties.wind)} km/h`
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
            : weather?.properties.precipitation
            ? `${weather.properties.precipitation} mm`
            : "--"}
        </p>
      </motion.div>
    </motion.div>
  );
}
