"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type FavoriteItem = {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
};

type FavoritesContextValue = {
  favorites: FavoriteItem[];
  count: number;
  addFavorite: (item: {
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  }) => Promise<void>;
  removeFavorite: (id: string) => void;
  isToastVisible: boolean;
  lastToastMessage: string | null;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const STORAGE_KEY = "wa_favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [lastToastMessage, setLastToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  async function resolveCoordsIfNeeded(name: string) {
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          name
        )}&count=1&language=en`
      );
      if (!res.ok) return { latitude: null, longitude: null };
      const json = await res.json();
      const first =
        Array.isArray(json?.results) && json.results.length > 0
          ? json.results[0]
          : null;
      if (!first) return { latitude: null, longitude: null };
      return {
        latitude: Number(first.latitude),
        longitude: Number(first.longitude),
      };
    } catch {
      return { latitude: null, longitude: null };
    }
  }

  async function addFavorite(item: {
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  }) {
    if (!item || !item.name) return;
    const normalize = (n: string | undefined | null) =>
      (n ?? "").trim().toLowerCase();
    const normalizedNew = normalize(item.name);

    const exists = favorites.find((f) => {
      // if both have coordinates, prefer coordinate-based equality (exact match)
      if (
        item.latitude != null &&
        item.longitude != null &&
        f.latitude != null &&
        f.longitude != null
      ) {
        return (
          Math.abs((f.latitude ?? 0) - (item.latitude ?? 0)) < 1e-6 &&
          Math.abs((f.longitude ?? 0) - (item.longitude ?? 0)) < 1e-6
        );
      }
      // fallback to comparing normalized names
      return normalize(f.name) === normalizedNew;
    });
    if (exists) {
      setLastToastMessage(`${item.name} is already in favorites`);
      setIsToastVisible(true);
      window.setTimeout(() => setIsToastVisible(false), 2200);
      return;
    }

    let latitude = item.latitude ?? null;
    let longitude = item.longitude ?? null;
    if ((latitude == null || longitude == null) && item.name) {
      const resolved = await resolveCoordsIfNeeded(item.name);
      latitude = resolved.latitude;
      longitude = resolved.longitude;
    }

    // normalize stored name to trimmed version (preserve original casing except trimmed)
    const storedName = item.name.trim();
    const id = `${storedName}-${latitude ?? "na"}-${longitude ?? "na"}`;
    const fav: FavoriteItem = { id, name: storedName, latitude, longitude };

    // final dedupe inside state updater to avoid race conditions when multiple
    // addFavorite calls happen concurrently
    setFavorites((s) => {
      const already = s.find((f) => {
        if (fav.latitude != null && fav.longitude != null && f.latitude != null && f.longitude != null) {
          return (
            Math.abs((f.latitude ?? 0) - (fav.latitude ?? 0)) < 1e-6 &&
            Math.abs((f.longitude ?? 0) - (fav.longitude ?? 0)) < 1e-6
          );
        }
        return normalize(f.name) === normalize(fav.name);
      });
      if (already) return s; // no change
      return [...s, fav];
    });

    setLastToastMessage(`Added ${item.name} to favorites`);
    setIsToastVisible(true);
    window.setTimeout(() => setIsToastVisible(false), 2200);
  }

  function removeFavorite(id: string) {
    const removed = favorites.find((f) => f.id === id);
    setFavorites((s) => s.filter((f) => f.id !== id));
    if (removed) {
      setLastToastMessage(`Removed ${removed.name} from favorites`);
      setIsToastVisible(true);
      window.setTimeout(() => setIsToastVisible(false), 2200);
    }
  }

  const value: FavoritesContextValue = {
    favorites,
    count: favorites.length,
    addFavorite,
    removeFavorite,
    isToastVisible,
    lastToastMessage,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 pointer-events-none">
        <div
          aria-live="polite"
          className={`${
            isToastVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          } transition-opacity duration-200`}
        >
          <div className="bg-neutral-900 text-neutral-100 px-4 py-2 rounded-lg shadow-lg pointer-events-auto">
            <span className="font-medium">{lastToastMessage ?? ""}</span>
          </div>
        </div>
      </div>
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

export default FavoritesContext;
