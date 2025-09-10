"use client";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  fadeInUp,
  fadeIn,
  chevronRotate,
  dropdownMenu,
  staggerChildren,
} from "./animations/motion";
import Image from "next/image";
import { BiChevronDown } from "react-icons/bi";
import { HourlyForecastItem } from "../api/open-meto";
import { useEffect } from "react";
import { convertTemp } from "./utils";

type Props = {
  weather: { hourly?: HourlyForecastItem[] } | null;
  loading: boolean;
  dayOpen: boolean;
  setDayOpen: (v: boolean | ((v: boolean) => boolean)) => void;
  tempUnit?: "C" | "F";
  windUnit?: "kmh" | "mph";
};

const formatKey = (d: Date) => {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getUTCDate()).padStart(2, "0")}`;
};

export default function HourlyForecast({
  weather,
  loading,
  dayOpen,
  setDayOpen,
  tempUnit = "C",
}: Props) {
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    return formatKey(new Date()); // today in UTC
  });

  const [blockKey, setBlockKey] = useState(() => {
    const now = new Date();
    return Math.floor(now.getHours() / 8); // 0,1,2 for the 8h block
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newBlock = Math.floor(now.getHours() / 8);
      setBlockKey(newBlock);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() + i);
      return {
        key: formatKey(d),
        label: d.toLocaleDateString(undefined, { weekday: "long" }),
      };
    });
  }, []);

  const hoursToShow = useMemo(() => {
    const hourly = weather?.hourly || [];
    if (!hourly.length) return [];

    const todayKey = formatKey(new Date());

    const dayHours = hourly
      .filter((h) => formatKey(new Date(h.time)) === selectedDay)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    if (!dayHours.length) return [];

    if (selectedDay === todayKey) {
      const blockStart = blockKey * 8;

      return dayHours.filter((h) => {
        const hour = new Date(h.time).getHours();
        return hour >= blockStart && hour < blockStart + 8;
      });
    } else {
      return dayHours.filter((h) => {
        const hour = new Date(h.time).getHours();
        return hour >= 0 && hour < 8;
      });
    }
  }, [weather?.hourly, selectedDay, blockKey]);

  const displayDay = useMemo(() => {
    const d = new Date(selectedDay);
    const label = d.toLocaleDateString(undefined, { weekday: "long" });
    return label.length > 7 ? label.slice(0, 7) + "…" : label;
  }, [selectedDay]);

  const [playStagger, setPlayStagger] = useState(false);

  useEffect(() => {
    if (!hoursToShow || hoursToShow.length === 0) {
      setPlayStagger(false);
      return;
    }
    setPlayStagger(false);
    const id = window.setTimeout(() => setPlayStagger(true), 30);
    return () => window.clearTimeout(id);
  }, [selectedDay, hoursToShow]);

  return (
    <motion.div
      className="bg-neutral-800 rounded-[20px] px-6 py-8 flex flex-col flex-1"
      variants={fadeIn}
    >
      <div className="w-full relative">
        <div className="w-full flex items-center justify-between">
          <h2 className="font-semibold text-xl">Hourly Forecast</h2>
          <motion.div
            className={`bg-neutral-600 flex items-center px-4 py-2 rounded-lg gap-2 cursor-pointer  ${
              dayOpen ? "ring-2 ring-white" : ""
            }`}
            onClick={() => setDayOpen((s: boolean) => !s)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            role="button"
            aria-expanded={dayOpen}
          >
            <span className="font-medium text-base">{displayDay}</span>
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
          className={`absolute w-full right-0 max-w-[214px] top-12 bg-neutral-800 border border-neutral-600 rounded-xl shadow-lg flex flex-col gap-1 z-30 p-2 ${
            dayOpen ? "pointer-events-auto" : "pointer-events-none"
          } `}
          variants={dropdownMenu}
          initial="hidden"
          animate={dayOpen ? "visible" : "hidden"}
        >
          {weekDays.map((d) => {
            const isSelected = d.key === selectedDay;
            return (
              <div key={d.key}>
                <motion.li
                  className={`font-medium text-base px-2 py-2.5 rounded-lg cursor-pointer hover:bg-neutral-700 ${
                    isSelected ? "bg-neutral-700" : ""
                  }`}
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

      <motion.div
        className="space-y-4 mt-4"
        variants={staggerChildren}
        initial={false}
        animate={playStagger || (loading && !weather) ? "visible" : "hidden"}
        key={selectedDay + "-" + (hoursToShow ? hoursToShow.length : 0)}
      >
        {loading && !weather
          ? Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="rounded-lg bg-neutral-700 flex items-center justify-between px-4 h-[60px] border border-neutral-600 skeleton"
                variants={fadeInUp}
              >
                <div className="shimmer" />
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
                <p className="font-medium text-base">
                  {Math.round(convertTemp(h.temp, tempUnit))}°
                </p>
              </motion.div>
            ))}
      </motion.div>
    </motion.div>
  );
}
