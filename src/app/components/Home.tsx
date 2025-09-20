"use client";
import { Navbar } from "./layout/Navbar";
import { motion } from "motion/react";
import { useEffect, useState, useRef, useCallback } from "react";
import fetchWeather, { WeatherPayload } from "../api/open-meto";
import { fetchUserLocation } from "@/lib/fetchUserLocation";
import { Bricolage_Grotesque } from "next/font/google";

import {
  staggerChildren,
  slideInFromRight,
  fadeInUp,
  caretBlink,
} from "./animations/motion";

import SearchBar from "./SearchBar";
import WeatherHero from "./WeatherHero";
import StatsGrid from "./StatsGrid";
import DailyForecast from "./DailyForecast";
import HourlyForecast from "./HourlyForecast";
import { formatLongDate as defaultFormatLongDate } from "./utils";
import Background from "./Background";
import { FavoritesProvider } from "./FavoritesContext";
import { APIError } from "./APIError";

function deriveWeatherKind(weather: WeatherPayload | null | undefined): string {
  if (!weather) return "clear";
  const w = weather as unknown;
  if (typeof w !== "object" || w === null) return "clear";
  const wObj = w as Record<string, unknown>;

  let codeValue: number | string | null = null;

  if ("current_weather" in wObj) {
    const cw = wObj.current_weather as Record<string, unknown> | undefined;
    if (cw && "weathercode" in cw) {
      const vc = cw.weathercode as number | string | undefined;
      if (typeof vc === "number" || typeof vc === "string") codeValue = vc;
    }
  }

  if (codeValue == null && "hourly" in wObj) {
    const hourly = wObj.hourly as Record<string, unknown> | undefined;
    if (hourly && "weathercode" in hourly) {
      const wc = hourly.weathercode as unknown;
      if (Array.isArray(wc) && wc.length > 0) {
        const first = wc[0];
        if (typeof first === "number" || typeof first === "string")
          codeValue = first as number | string;
      }
    }
  }

  if (codeValue == null) return "clear";
  const c = Number(codeValue);
  if (c === 0) return "clear";
  if (c >= 1 && c <= 3) return "partly-cloudy";
  if (c >= 45 && c <= 48) return "fog";
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return "rain";
  if (c >= 71 && c <= 77) return "snow";
  if (c >= 95 && c <= 99) return "storm";
  return "overcast";
}

const bricolage_grotesque = Bricolage_Grotesque({
  variable: "--font-bricolage_grotesque",
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
});

const titles = ["How's the sky looking today?", "Have a nice day!"];

export function HomePage() {
  const [dayOpen, setDayOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
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

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");

  const [windUnit, setWindUnit] = useState<"kmh" | "mph">("kmh");

  const [typedTitle, setTypedTitle] = useState("");
  const [showCaret, setShowCaret] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  // time preview slider state: offset in hours (-12..+12)
  const [previewOffset, setPreviewOffset] = useState<number>(0);
  const [isDraggingTime, setIsDraggingTime] = useState(false);
  const releaseTimeout = useRef<number | null>(null);

  useEffect(() => {
    const title = titles[currentIndex] || "";
    let mounted = true;
    let idx = 0;
    let timer: number | undefined;

    setTypedTitle("");
    setShowCaret(true);

    function tick() {
      if (!mounted) return;
      if (idx <= title.length) {
        setTypedTitle(title.slice(0, idx));
        idx += 1;
        timer = window.setTimeout(tick, 45);
      } else {
        // finished typing, hide caret
        setShowCaret(false);
      }
    }

    timer = window.setTimeout(tick, 120);

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [currentIndex]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentIndex((i) => (i + 1) % titles.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const t = localStorage.getItem("wa_tempUnit");
      if (t === "F" || t === "C") setTempUnit(t as "C" | "F");
    } catch {}

    try {
      const w = localStorage.getItem("wa_windUnit");
      if (w === "mph" || w === "kmh") setWindUnit(w as "kmh" | "mph");
    } catch {}
  }, []);

  type GeoResult = {
    latitude: number | string;
    longitude: number | string;
    name?: string;
    country?: string;
    locality?: string;
  };

  useEffect(() => {
    let mounted = true;

    async function loadInitial() {
      setApiError(null);
      setLoading(true);
      try {
        const loc = await fetchUserLocation();
        if (!mounted) return;

        if (!loc) {
          setLocation("Unknown location");
          setWeather(null);
          return;
        }

        const data = await fetchWeather(loc.latitude, loc.longitude);
        if (!mounted) return;
        setWeather(data);

        if (loc.city && loc.country) setLocation(`${loc.city}, ${loc.country}`);
        else if (loc.city && loc.region)
          setLocation(`${loc.city}, ${loc.region}`);
        else setLocation(`Lat: ${loc.latitude}, Lon: ${loc.longitude}`);
      } catch (e) {
        console.error("Error fetching user location / weather:", e);
        if (mounted) {
          setLocation("Unknown location");
          setApiError(
            "Failed to fetch location or weather. Please check your network and try again."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadInitial();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSearch() {
    if (!query) return;
    setSuggestions([]);
    setLoading(true);
    setApiError(null);
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
        setApiError("No results found for that search.");
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
      } catch {}
    } catch (e) {
      console.error(e);
      setApiError("Search failed due to a network or API error.");
    } finally {
      setLoading(false);
    }
  }

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

  const selectSuggestion = useCallback(
    async (item: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      country?: string;
    }) => {
      setLocation(item.name);
      setQuery("");
      setSuggestions([]);
      setLoading(true);
      setApiError(null);
      try {
        const data = await fetchWeather(item.latitude, item.longitude);
        setWeather(data);
      } catch (error) {
        console.error(error);
        setApiError("Failed to fetch weather for the selected location.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleFavoriteSelect = useCallback(
    async (d: {
      id: string;
      name: string;
      latitude?: number | null;
      longitude?: number | null;
    }) => {
      if (!d) return;
      try {
        if (d.latitude != null && d.longitude != null) {
          selectSuggestion({
            id: d.id,
            name: d.name,
            latitude: d.latitude,
            longitude: d.longitude,
          });
          return;
        }

        setLoading(true);
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
              d.name
            )}&count=1&language=en`
          );
          if (!geoRes.ok) return;
          const geoJson = await geoRes.json();
          const first =
            Array.isArray(geoJson?.results) && geoJson.results.length > 0
              ? geoJson.results[0]
              : null;
          if (!first) return;
          const lat = Number(first.latitude);
          const lon = Number(first.longitude);
          // close mobile search overlay (if open) so UI doesn't block
          try {
            setMobileSearchOpen(false);
          } catch {}
          await selectSuggestion({
            id: `${lat}-${lon}`,
            name: d.name,
            latitude: lat,
            longitude: lon,
          });
        } catch {
          // ignore
        } finally {
          setLoading(false);
        }
      } catch {
        // ignore
      }
    },
    [selectSuggestion]
  );

  function retryInitialFetch() {

    (async () => {
      setApiError(null);
      setLoading(true);
      try {
        const loc = await fetchUserLocation();
        if (!loc) {
          setLocation("Unknown location");
          setWeather(null);
          return;
        }
        const data = await fetchWeather(loc.latitude, loc.longitude);
        setWeather(data);
        if (loc.city && loc.country) setLocation(`${loc.city}, ${loc.country}`);
        else if (loc.city && loc.region)
          setLocation(`${loc.city}, ${loc.region}`);
        else setLocation(`Lat: ${loc.latitude}, Lon: ${loc.longitude}`);
      } catch (e) {
        console.error(e);
        setApiError(
          "Failed to fetch location or weather. Please check your network and try again."
        );
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <FavoritesProvider>
      <motion.div
        className="w-full  text-white pb-10"
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
      >
        {/* Background visual layer */}
        <Background
          kind={deriveWeatherKind(weather)}
          forcedHour={(() => {
            if (!isDraggingTime) return undefined as unknown as number | null;
            const now = new Date();
            const h = (now.getHours() + previewOffset + 24) % 24;
            return h;
          })()}
        />
        <Navbar
          tempUnit={tempUnit}
          setTempUnit={setTempUnit}
          windUnit={windUnit}
          setWindUnit={setWindUnit}
          onSelectFavorite={handleFavoriteSelect}
        />

        {apiError ? (
          <div className="w-full px-4 max-w-[1440px] mx-auto md:px-8 lg:px-12 mt-8">
            <APIError message={apiError} onRetry={retryInitialFetch} />
          </div>
        ) : (
          <div className="w-full px-4 max-w-[1440px] mx-auto md:px-8 lg:px-12">
            <motion.h1
              className={` ${bricolage_grotesque.className} text-center text-[52px] lg:text-7xl font-bold mt-12`}
              variants={fadeInUp}
            >
              {typedTitle}
              {showCaret && (
                <motion.span
                  aria-hidden="true"
                  className="inline-block ml-1 align-middle"
                  variants={caretBlink}
                  initial="hidden"
                  animate="visible"
                >
                  |
                </motion.span>
              )}
            </motion.h1>

            <div className="mt-12 lg:mt-16">
              <div className="max-w-[420px] mx-auto mb-6 px-4">
                <label className="text-sm text-neutral-100 mb-2 block">
                  Preview time of day
                </label>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={previewOffset}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPreviewOffset(v);
                  }}
                  onMouseDown={() => {
                    if (releaseTimeout.current)
                      window.clearTimeout(releaseTimeout.current);
                    setIsDraggingTime(true);
                  }}
                  onTouchStart={() => {
                    if (releaseTimeout.current)
                      window.clearTimeout(releaseTimeout.current);
                    setIsDraggingTime(true);
                  }}
                  onMouseUp={() => {
                    setIsDraggingTime(false);
                    // animate return to now after 600ms
                    releaseTimeout.current = window.setTimeout(
                      () => setPreviewOffset(0),
                      600
                    );
                  }}
                  onTouchEnd={() => {
                    setIsDraggingTime(false);
                    releaseTimeout.current = window.setTimeout(
                      () => setPreviewOffset(0),
                      600
                    );
                  }}
                  className="w-full"
                  aria-label="Preview time slider"
                />
              </div>
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
                  onOpen={() => setMobileSearchOpen(true)}
                  suppressSuggestions={mobileSearchOpen}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl bg-blue-500 w-full lg:w-34 text-xl font-medium"
                  onClick={() => setMobileSearchOpen(true)}
                >
                  Search
                </motion.button>
              </motion.div>

              {/* Mobile overlay for search */}
              {mobileSearchOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-6 lg:hidden">
                  <div className="w-full max-w-md">
                    <SearchBar
                      query={query}
                      setQuery={setQuery}
                      handleSearch={handleSearch}
                      suggestions={suggestions}
                      suggestionLoading={suggestionLoading}
                      selectSuggestion={selectSuggestion}
                      suppressSuggestions={mobileSearchOpen}
                      onClose={() => setMobileSearchOpen(false)}
                      autoFocus={mobileSearchOpen}
                      closeOnOutsideClick={true}
                    />
                  </div>
                </div>
              )}

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
                          suppressSuggestions={mobileSearchOpen}
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
        )}
      </motion.div>
    </FavoritesProvider>
  );
}
