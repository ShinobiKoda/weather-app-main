"use client";
import { Navbar } from "./layout/Navbar";
import { IoIosSearch } from "react-icons/io";
import Image from "next/image";
import { BiChevronDown } from "react-icons/bi";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
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
  const [suggestions, setSuggestions] = useState<
    Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      country?: string;
    }>
  >([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  // Geocoding result shape (partial) to avoid using `any`
  type GeoResult = {
    latitude: number | string;
    longitude: number | string;
    name?: string;
    country?: string;
    locality?: string;
    admin1?: string;
    display_name?: string;
  };

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
    if (!navigator.geolocation) {
      setLocation("Geolocation not supported");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          const data = await fetchWeather(lat, lon);
          setWeather(data);

          const res = await fetch(`http://ip-api.com/json/`);
          const geo = await res.json();

          if (geo.status === "success") {
            setLocation(`${geo.city}, ${geo.country}`);
          } else {
            setLocation(`Lat: ${lat}, Lon: ${lon}`);
          }
        } catch (e) {
          console.error("Error:", e);
          setLocation("Unknown location");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLoading(false);
        setLocation("Unknown location");
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

  // Debounced suggestions for the search input
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const id = setTimeout(async () => {
      setSuggestionLoading(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query
          )}&count=6&language=en`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          setSuggestions([]);
          return;
        }
        const json = await res.json();
        const results = Array.isArray(json?.results) ? json.results : [];
        setSuggestions(
          results.map((r: GeoResult) => ({
            id: `${r.latitude}-${r.longitude}-${r.name}`,
            name: (r.name || "") + (r.country ? `, ${r.country}` : ""),
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            country: r.country,
          }))
        );
      } catch {
        // ignore aborted or network errors
      } finally {
        setSuggestionLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(id);
    };
  }, [query]);

  async function selectSuggestion(item: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
  }) {
    setLocation(item.name);
    setQuery("");
    setSuggestions([]);
    setLoading(true);
    try {
      const data = await fetchWeather(item.latitude, item.longitude);
      setWeather(data);
    } catch (error) {
      console.error(error);
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
              Search
            </motion.button>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 min-h-[700px]">
            <div className="mt-8 flex flex-col">
              <div className="w-full lg:max-w-[500px] ml-auto relative">
                <div className="w-full flex flex-col mb-8 lg:mb-12 gap-3.5">
                  <motion.div
                    className="w-full items-center bg-neutral-800 rounded-xl p-4 gap-2 text-xl text-neutral-200 font-medium max-w-[500px] ml-auto hidden lg:flex"
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
                  <div
                    className={`${
                      suggestions.length === 0 && !suggestionLoading
                        ? "hidden"
                        : ""
                    } bg-neutral-800 border border-neutral-700 rounded-xl w-full p-4 absolute -top-25 md:-top-4 lg:top-19 z-30`}
                    role="listbox"
                    aria-label="location-suggestions"
                  >
                    <p className="font-medium text-base flex items-center gap-2">
                      {suggestionLoading ? (
                        <ClipLoader color="white" size={20} />
                      ) : (
                        <ClipLoader color="white" size={20} />
                      )}
                      <span className="text-right">City</span>
                    </p>
                    <div className="w-full text-right">
                      {suggestions.length === 0 ? (
                        <div className="text-sm text-neutral-400">
                          No suggestions
                        </div>
                      ) : (
                        <ul className="space-y-2 mt-2 max-h-[164px] overflow-y-scroll">
                          {suggestions.map((s) => (
                            <li key={s.id}>
                              <button
                                onClick={() => selectSuggestion(s)}
                                className="w-full text-left text-base font-medium hover:bg-neutral-700 hover:border border-neutral-600 rounded-lg px-2 py-2.5"
                              >
                                {s.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
                Search
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
      </div>
    </motion.div>
  );
}
