"use client";
import { motion } from "motion/react";
import { fadeInUp, fadeIn, chevronRotate } from "./animations/motion";
import Image from "next/image";
import { BiChevronDown } from "react-icons/bi";
import { HourlyForecastItem } from "../api/open-meto";

type Props = {
  weather: { hourly?: HourlyForecastItem[] } | null;
  loading: boolean;
  dayOpen: boolean;
  setDayOpen: (v: boolean | ((v: boolean) => boolean)) => void;
};

export default function HourlyForecast({
  weather,
  loading,
  dayOpen,
  setDayOpen,
}: Props) {
  return (
    <motion.div
      className="bg-neutral-800 rounded-[20px] px-6 py-8 flex flex-col flex-1"
      variants={fadeIn}
    >
      <div className="w-full flex items-center justify-between">
        <h2 className="font-semibold text-xl">Hourly Forecast</h2>
        <motion.div
          className="bg-neutral-600 flex items-center px-4 py-2 rounded-lg gap-2 cursor-pointer select-none"
          onClick={() => setDayOpen((s: boolean) => !s)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="font-medium text-base">Tuesday</span>
          <motion.span
            variants={chevronRotate}
            initial="closed"
            animate={dayOpen ? "open" : "closed"}
          >
            <BiChevronDown />
          </motion.span>
        </motion.div>
      </div>
      <div className="space-y-4 mt-4">
        {loading && !weather
          ? Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="rounded-lg bg-neutral-700 flex items-center justify-between px-4 h-[60px] border border-neutral-600"
                variants={fadeInUp}
              >
                <div className="flex items-center gap-2">
                  <div className="w-[50px] h-[50px] bg-neutral-600 rounded" />
                  <p className="font-medium text-xl">--</p>
                </div>
                <p className="font-medium text-base">--</p>
              </motion.div>
            ))
          : (weather?.hourly || [])
              .slice(0, 8)
              .map((h: HourlyForecastItem, index: number) => (
                <motion.div
                  key={index}
                  className="rounded-lg bg-neutral-700 flex items-center justify-between px-4 h-[60px] border border-neutral-600"
                  variants={fadeInUp}
                >
                  <div className="flex items-center gap-2">
                    <Image src={h.icon} alt="Weather" width={50} height={50} />
                    <p className="font-medium text-xl">
                      {new Date(h.time).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <p className="font-medium text-base">{Math.round(h.temp)}°</p>
                </motion.div>
              ))}
      </div>
    </motion.div>
  );
}
