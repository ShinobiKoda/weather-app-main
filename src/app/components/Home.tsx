"use client";
import { Navbar } from "./layout/Navbar";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import fetchWeather, { WeatherPayload } from "../api/open-meto";
import { Bricolage_Grotesque } from "next/font/google";

import {
  staggerChildren,
  slideInFromRight,
  fadeInUp,
} from "./animations/motion";

import SearchBar from "./SearchBar";
import WeatherHero from "./WeatherHero";
import StatsGrid from "./StatsGrid";
import DailyForecast from "./DailyForecast";
import HourlyForecast from "./HourlyForecast";
import { formatLongDate as defaultFormatLongDate } from "./utils";

const bricolage_grotesque = Bricolage_Grotesque({
  variable: "--font-bricolage_grotesque",
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
});

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

  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");

  const [windUnit, setWindUnit] = useState<"kmh" | "mph">("kmh");

  useEffect(() => {
    try {
      const t = localStorage.getItem("wa_tempUnit");
      if (t === "F" || t === "C") setTempUnit(t as "C" | "F");
    } catch {}

    try {
      const w = localStorage.getItem("wa_windUnit");
      if (w === "mph" || w === "kmh") setWindUnit(w as "kmh" | "mph");
    } catch {}

    // no precipitation unit preference — we only show chance of rain
  }, []);

  type GeoResult = {
    latitude: number | string;
    longitude: number | string;
    name?: string;
    country?: string;
    locality?: string;
  };

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
    // hide suggestions when searching
    setSuggestions([]);
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

  useEffect(() => {
    try {
      localStorage.setItem("wa_tempUnit", tempUnit);
    } catch {}
  }, [tempUnit]);

  useEffect(() => {
    try {
      localStorage.setItem("wa_windUnit", windUnit);
    } catch {}
  }, [windUnit]);

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
      <Navbar
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        windUnit={windUnit}
        setWindUnit={setWindUnit}
      />
      <div className="w-full px-4 max-w-[1440px] mx-auto md:px-8 lg:px-12">
        <motion.h1
          className={` ${bricolage_grotesque.className} text-center text-[52px] lg:text-7xl font-bold mt-12`}
          variants={fadeInUp}
        >
          How&apos;s the sky looking today?
        </motion.h1>

        <div className="mt-12 lg:mt-16">
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-center max-w-[1024px] mx-auto md:grid md:grid-cols-[3fr_1fr] lg:hidden items-center"
            variants={slideInFromRight}
          >
            <SearchBar
              query={query}
              setQuery={setQuery}
              handleSearch={handleSearch}
              suggestions={suggestions}
              suggestionLoading={suggestionLoading}
              selectSuggestion={selectSuggestion}
            />
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
                    tabIndex={0}
                    variants={slideInFromRight}
                  >
                    <SearchBar
                      query={query}
                      setQuery={setQuery}
                      handleSearch={handleSearch}
                      suggestions={suggestions}
                      suggestionLoading={suggestionLoading}
                      selectSuggestion={selectSuggestion}
                    />
                  </motion.div>
                </div>
              </div>

              <WeatherHero
                weather={weather}
                loading={loading}
                location={location}
                formatLongDate={defaultFormatLongDate}
                tempUnit={tempUnit}
              />

              <StatsGrid
                weather={weather}
                loading={loading}
                tempUnit={tempUnit}
                windUnit={windUnit}
              />

              <DailyForecast
                weather={weather}
                loading={loading}
                tempUnit={tempUnit}
              />
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

              <HourlyForecast
                weather={weather}
                loading={loading}
                dayOpen={dayOpen}
                setDayOpen={setDayOpen}
                tempUnit={tempUnit}
                windUnit={windUnit}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
