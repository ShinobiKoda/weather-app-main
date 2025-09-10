"use client";
import { motion } from "motion/react";
import { fadeInUp, staggerChildren } from "./animations/motion";
import Image from "next/image";
import { DailyForecastItem } from "../api/open-meto";
import { convertTemp } from "./utils";

type Props = {
  weather: { daily?: DailyForecastItem[] } | null;
  loading: boolean;
  tempUnit: "C" | "F";
};

export default function DailyForecast({ weather, loading, tempUnit }: Props) {
  return (
    <div className="mt-8 lg:mt-12">
      <h2 className="font-semibold text-xl">Daily Forecast</h2>
      <motion.div
        key={weather ? "data" : "skeleton"}
        className="grid grid-cols-3 md:grid-cols-7 gap-4 mt-5"
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
      >
        {loading && !weather
          ? Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                className="rounded-xl px-[10px] py-4 min-h-[165px] bg-neutral-800 flex flex-col justify-between border border-neutral-600 items-center skeleton"
                variants={fadeInUp}
              >
                <p className="font-medium text-lg">--</p>
                <div className="shimmer" />

                <p className="w-full flex items-center justify-between font-medium text-base">
                  <span>--</span>
                  <span className="text-neutral-200">--</span>
                </p>
              </motion.div>
            ))
          : (weather?.daily || [])
              .slice(0, 7)
              .map((d: DailyForecastItem, index: number) => (
                <motion.div
                  key={index}
                  className="rounded-xl px-[10px] py-4 min-h-[165px] bg-neutral-800 flex flex-col justify-between border border-neutral-600 items-center"
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <p className="font-medium text-lg">
                    {new Date(d.date).toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </p>
                  <Image src={d.icon} alt="Weather" width={50} height={50} />
                  <p className="w-full flex items-center justify-between font-medium text-base">
                    <span className="">
                      {Math.round(convertTemp(d.maxTemp, tempUnit))}°
                    </span>
                    <span className="text-neutral-200">
                      {Math.round(convertTemp(d.minTemp, tempUnit))}°
                    </span>
                  </p>
                </motion.div>
              ))}
      </motion.div>
    </div>
  );
}
