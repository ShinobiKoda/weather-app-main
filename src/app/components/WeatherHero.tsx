"use client";
import { motion } from "motion/react";
import Image from "next/image";
import { bgFloat, sunBounceRotate } from "./animations/motion";
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
  // no-op: will be updated to accept tempUnit
  return (
    <>
      <motion.div
        className="bg-cover bg-center h-[286px] rounded-[20px] flex flex-col items-center justify-center lg:hidden relative overflow-hidden px-[24.5px]"
        style={{
          backgroundImage: "url('/images/bg-today-small.svg')",
        }}
        variants={bgFloat}
      >
        <div className="flex flex-col gap-3 text-center mt-[41px]">
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
        <div className="flex items-center">
          <motion.div variants={sunBounceRotate} className="flex items-center">
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

      <motion.div
        className="bg-cover bg-center h-[286px] rounded-3xl hidden lg:flex flex-row items-center justify-between px-8 relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/bg-today-large.svg')",
        }}
        variants={bgFloat}
      >
        <div>
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
        <div className="flex items-center gap-4">
          <motion.div variants={sunBounceRotate} className="flex items-center">
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
          <p className="text-8xl font-extrabold italic">
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
    </>
  );
}
