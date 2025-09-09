"use client";
import { Navbar } from "./layout/Navbar";
import { IoIosSearch } from "react-icons/io";
import Image from "next/image";
import { BiChevronDown } from "react-icons/bi";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { SearchDropdown } from "./SearchDropdown";
import fetchWeather, {
  WeatherPayload,
  DailyForecastItem,
  HourlyForecastItem,
} from "../api/open-meto";
import { Bricolage_Grotesque } from "next/font/google";

const bricolage_grotesque = Bricolage_Grotesque({
  variable: "--font-bricolage_grotesque",
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
});

import {
  fadeInUp,
  staggerChildren,
  slideInFromRight,
  fadeIn,
  bgFloat,
  sunBounceRotate,
  chevronRotate,
} from "./animations/motion";

export function HomePage() {
  const [dayOpen, setDayOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [location, setLocation] = useState<string>("");

  function formatLongDate(isoOrDate?: string | Date) {
    const d = isoOrDate ? new Date(isoOrDate) : new Date();
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const data = await fetchWeather(lat, lon);
          setWeather(data);
          try {
            const rev = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
            );
            const revJson = await rev.json();
            const addr = revJson.address || {};
            const place =
              addr.city || addr.town || addr.village || addr.county || "";
            const country = addr.country || "";
            if (place && country) setLocation(`${place}, ${country}`);
            else if (revJson.display_name)
              setLocation(
                String(revJson.display_name)
                  .split(",")
                  .slice(0, 2)
                  .join(",")
                  .trim()
              );
          } catch {
            // ignore reverse geocode errors
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
      }
    );
  }, []);

  async function handleSearch() {
    if (!query) return;
    setLoading(true);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=1`
      );
      if (!geoRes.ok) {
        console.error("Geocoding error", geoRes.status);
        setWeather(null);
        return;
      }
      const geoJson = await geoRes.json();
      const first =
        Array.isArray(geoJson?.results) && geoJson.results.length > 0
          ? geoJson.results[0]
          : null;
      if (!first) {
        setWeather(null);
        return;
      }
      const lat = Number(first.latitude);
      const lon = Number(first.longitude);
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      try {
        const place = first.name || first.locality || "";
        const country = first.country || "";
        if (place && country) setLocation(`${place}, ${country}`);
        else if (first.name) setLocation(String(first.name));
      } catch {
        // ignore
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  return (
    <motion.div
      className="w-full  text-white pb-10"
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
    >
      <Navbar />
      <div className="w-full px-4 max-w-[1440px] mx-auto md:px-8 lg:px-12">
        <motion.h1
          className={` ${bricolage_grotesque.className} text-center text-[52px] lg:text-7xl font-bold mt-12`}
          variants={fadeInUp}
        >
          How&apos;s the sky looking today?
        </motion.h1>
        <div className="mt-12 lg:mt-16">
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-center max-w-[1024px] mx-auto md:grid md:grid-cols-[3fr_1fr] lg:hidden items-center xl:hidden"
            variants={slideInFromRight}
          >
            <div className="w-full flex items-center bg-neutral-800 rounded-xl p-4 gap-2 text-xl text-neutral-200 font-medium">
              <IoIosSearch size={35} />
              <input
                value={query ?? ""}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                className="border-none outline-none placeholder:text-neutral-200 placeholder:text-xl w-full"
                placeholder="Search for a place..."
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-blue-500 w-full lg:w-34 text-xl font-medium"
              onClick={handleSearch}
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : "Search"}
            </motion.button>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 min-h-[700px]">
            <div className="mt-8 flex flex-col">
              <motion.div
                className="w-full items-center bg-neutral-800 rounded-xl p-4 gap-2 text-xl text-neutral-200 font-medium mb-8 lg:mb-12 max-w-[500px] ml-auto hidden lg:flex"
                variants={slideInFromRight}
              >
                <IoIosSearch size={25} />
                <input
                  value={query ?? ""}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  className="border-none outline-none placeholder:text-neutral-300 placeholder:text-lg w-full"
                  placeholder="Search for a place..."
                />
              </motion.div>
              <motion.div
                className="bg-cover bg-center h-[286px] rounded-[20px] flex flex-col items-center justify-center lg:hidden relative overflow-hidden px-[24.5px]"
                style={{
                  backgroundImage: "url('/images/bg-today-small.svg')",
                }}
                variants={bgFloat}
              >
                <div className="flex flex-col gap-3">
                  <h2 className="font-bold text-[28px]">
                    <span>
                      {loading
                        ? "Detecting..."
                        : location || "Unknown location"}
                    </span>
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
                  <motion.div
                    variants={sunBounceRotate}
                    className="flex items-center"
                  >
                    <Image
                      src={
                        weather
                          ? weather.hourly[0]?.icon ??
                            "/images/icon-overcast.webp"
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
                      ? `${Math.round(weather.current.temperature)}°`
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
                    <span>
                      {loading
                        ? "Detecting..."
                        : location || "Unknown location"}
                    </span>
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
                  <motion.div
                    variants={sunBounceRotate}
                    className="flex items-center"
                  >
                    <Image
                      src={
                        weather
                          ? weather.hourly[0]?.icon ??
                            "/images/icon-overcast.webp"
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
                      ? `${Math.round(weather.current.temperature)}°`
                      : "--"}
                  </p>
                </div>
              </motion.div>
              <motion.div
                className="mt-5 lg:mt-8 w-full grid grid-cols-2 gap-4 md:grid-cols-4"
                variants={staggerChildren}
              >
                <motion.div
                  className="rounded-xl px-5 py-4 min-h-[118px] bg-neutral-800 flex flex-col justify-between border border-neutral-600"
                  variants={fadeInUp}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <p className="font-medium text-lg text-neutral-200">
                    Feels like
                  </p>
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
                  <p className="font-medium text-lg text-neutral-200">
                    Humidity
                  </p>
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
                  <p className="font-medium text-lg text-neutral-200">
                    Precipitation
                  </p>
                  <p className="text-white font-light text-[32px]">
                    {loading
                      ? "--"
                      : weather?.properties.precipitation
                      ? `${weather.properties.precipitation} mm`
                      : "--"}
                  </p>
                </motion.div>
              </motion.div>
              <div className="mt-8 lg:mt-12">
                <h2 className="font-semibold text-xl">Daily Forecast</h2>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-4 mt-5">
                  {loading && !weather
                    ? Array.from({ length: 7 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="rounded-xl px-[10px] py-4 min-h-[165px] bg-neutral-800 flex flex-col justify-between border border-neutral-600 items-center"
                          variants={fadeInUp}
                        >
                          <p className="font-medium text-lg">--</p>
                          <div className="w-[50px] h-[50px] bg-neutral-700 rounded" />
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
                            <Image
                              src={d.icon}
                              alt="Weather"
                              width={50}
                              height={50}
                            />
                            <p className="w-full flex items-center justify-between font-medium text-base">
                              <span className="">{Math.round(d.maxTemp)}°</span>
                              <span className="text-neutral-200">
                                {Math.round(d.minTemp)}°
                              </span>
                            </p>
                          </motion.div>
                        ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col max-h-full">
              <motion.button
                className="px-4 py-3 rounded-xl bg-blue-500 w-full lg:w-34 text-lg mb-8 lg:mb-12 hidden lg:block cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
              >
                {loading ? <ClipLoader size={18} color="#fff" /> : "Search"}
              </motion.button>
              <motion.div
                className="bg-neutral-800 rounded-[20px] px-6 py-8 flex flex-col flex-1"
                variants={fadeIn}
              >
                <div className="w-full flex items-center justify-between">
                  <h2 className="font-semibold text-xl">Hourly Forecast</h2>
                  <motion.div
                    className="bg-neutral-600 flex items-center px-4 py-2 rounded-lg gap-2 cursor-pointer select-none"
                    onClick={() => setDayOpen((s) => !s)}
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
                              <Image
                                src={h.icon}
                                alt="Weather"
                                width={50}
                                height={50}
                              />
                              <p className="font-medium text-xl">
                                {new Date(h.time).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  hour12: true,
                                })}
                              </p>
                            </div>
                            <p className="font-medium text-base">
                              {Math.round(h.temp)}°
                            </p>
                          </motion.div>
                        ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="mt-16">
          <SearchDropdown />
        </div>
      </div>
    </motion.div>
  );
}
