"use client";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  fadeInUp,
  fadeIn,
  chevronRotate,
  dropdownMenu,
} from "./animations/motion";
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
  const formatKey = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const now = new Date();
    return formatKey(now);
  });

  const todayKey = formatKey(new Date());

  const weekDays = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        key: formatKey(d),
        label: d.toLocaleDateString(undefined, { weekday: "long" }),
      };
    });
  }, []);

  const hoursToShow = useMemo(() => {
    const hourly = weather?.hourly || [];

    const [y, m, d] = selectedDay.split("-").map((s) => parseInt(s, 10));
    const endOfDay = new Date(y, m - 1, d, 23, 0, 0, 0); // local 23:00

    const vals = hourly
      .filter((h) => {
        const t = new Date(h.time);
        return (
          t.getFullYear() === y &&
          t.getMonth() === m - 1 &&
          t.getDate() === d &&
          t <= endOfDay
        );
      })
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    const lastEight = vals.slice(Math.max(0, vals.length - 8));
    return lastEight;
  }, [weather?.hourly, selectedDay]);
  return (
    <motion.div
      className="bg-neutral-800 rounded-[20px] px-6 py-8 flex flex-col flex-1"
      variants={fadeIn}
    >
      <div className="w-full relative z-40">
        <div className="w-full flex items-center justify-between">
          <h2 className="font-semibold text-xl">Hourly Forecast</h2>
          <motion.div
            className="bg-neutral-600 flex items-center px-4 py-2 rounded-lg gap-2 cursor-pointer"
            onClick={() => setDayOpen((s: boolean) => !s)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            role="button"
            aria-expanded={dayOpen}
          >
            <span className="font-medium text-base truncate">
              {new Date(selectedDay).toLocaleDateString(undefined, {
                weekday: "long",
              })}
            </span>
            <motion.span
              variants={chevronRotate}
              initial="closed"
              animate={dayOpen ? "open" : "closed"}
            >
              <BiChevronDown />
            </motion.span>
          </motion.div>
        </div>
        <motion.ul
          className={`absolute w-full right-0 max-w-[214px] top-12 bg-neutral-800 border border-neutral-600 rounded-xl shadow-lg flex flex-col gap-4 z-50 p-2 ${
            dayOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          variants={dropdownMenu}
          initial="hidden"
          animate={dayOpen ? "visible" : "hidden"}
        >
          {weekDays.map((d) => {
            const isToday = d.key === todayKey;
            const isSelected = d.key === selectedDay;
            return (
              <div key={d.key} className="">
                <motion.li
                  className={`font-medium text-base px-4 py-2.5 rounded-lg cursor-pointer hover:bg-neutral-700 ${
                    isToday ? "bg-neutral-700" : ""
                  } ${isSelected ? "bg-neutral-700" : ""}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedDay(d.key);
                    setDayOpen(false);
                  }}
                >
                  {d.label}
                </motion.li>
              </div>
            );
          })}
        </motion.ul>
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
                  <p className="font-medium text-xl">--</p>
                </div>
                <p className="font-medium text-base">--</p>
              </motion.div>
            ))
          : (hoursToShow || []).map((h: HourlyForecastItem, index: number) => (
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
