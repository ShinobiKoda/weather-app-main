"use client";
import Image from "next/image";
import { IoSettingsOutline } from "react-icons/io5";
import { BiChevronDown } from "react-icons/bi";
import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { chevronRotate, dropdownMenu } from "../animations/motion";
import { IoMdCheckmark } from "react-icons/io";
import { CiStar } from "react-icons/ci";
import { useFavorites } from "../FavoritesContext";

type Props = {
  tempUnit: "C" | "F";
  setTempUnit: (u: "C" | "F") => void;
  windUnit: "kmh" | "mph";
  setWindUnit: (u: "kmh" | "mph") => void;
  onSelectFavorite?: (f: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  }) => void;
};

export function Navbar({
  tempUnit,
  setTempUnit,
  windUnit,
  setWindUnit,
  onSelectFavorite,
}: Props) {
  const [open, setOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { favorites: favList, count, isToastVisible } = useFavorites();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (!containerRef.current) return;
      if (target && !containerRef.current.contains(target)) {
        setOpen(false);
        setFavOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <nav className="w-full max-w-[1440px] mx-auto p-4 md:px-8 lg:px-12 flex items-center justify-between">
      <Image src="/images/logo.svg" alt="Logo" width={150} height={100} />
      <div className="flex items-center gap-4">
        <div className="relative" ref={containerRef}>
          <motion.div
            className={`flex items-center gap-1.5 rounded-md bg-neutral-600 px-2 py-3 cursor-pointer select-none ${
              open ? "ring-2 ring-white" : ""
            }`}
            onClick={() => setOpen((s) => !s)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            role="button"
            aria-expanded={open}
          >
            <IoSettingsOutline size={20} />
            <span className="font-medium text-sm">Units</span>
            <motion.span
              variants={chevronRotate}
              initial="closed"
              animate={open ? "open" : "closed"}
            >
              <BiChevronDown size={20} />
            </motion.span>
          </motion.div>

          <motion.div
            className={`absolute right-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-xl px-4 py-2.5 min-w-[214px] z-50 ${
              open ? "pointer-events-auto" : "pointer-events-none"
            }`}
            variants={dropdownMenu}
            initial="hidden"
            animate={open ? "visible" : "hidden"}
          >
            <button
              className="font-medium text-base mb-3.5 w-full text-left hover:bg-neutral-700 rounded-lg cursor-pointer px-2 py-2.5"
              onClick={() => {
                if (tempUnit === "C" || windUnit === "kmh") {
                  setTempUnit("F");
                  setWindUnit("mph");
                } else {
                  setTempUnit("C");
                  setWindUnit("kmh");
                }
              }}
            >
              {tempUnit === "C" || windUnit === "kmh"
                ? "Switch to Imperial"
                : "Switch to Metric"}
            </button>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-neutral-300">
                Temperature
              </h4>
              <motion.button
                type="button"
                onClick={() => setTempUnit("C")}
                className={`font-medium text-base w-full flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-neutral-700 ${
                  tempUnit === "C" ? "bg-neutral-700" : ""
                } cursor-pointer`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span>Celsius (°C)</span>
                {mounted && tempUnit === "C" && <IoMdCheckmark />}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setTempUnit("F")}
                className={`font-medium text-base w-full flex items-center justify-between hover:bg-neutral-700 rounded-lg px-2 py-2.5 ${
                  tempUnit === "F" ? "bg-neutral-700 rounded-lg" : ""
                } cursor-pointer`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                Fahrenheit (°F)
                {mounted && tempUnit === "F" && <IoMdCheckmark />}
              </motion.button>
            </div>
            <hr className="my-4 text-neutral-600" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-neutral-300">
                Wind Speed
              </h4>
              <motion.button
                type="button"
                onClick={() => setWindUnit("kmh")}
                className={`font-medium text-base w-full flex items-center justify-between hover:bg-neutral-700 rounded-lg px-2 py-2.5 ${
                  windUnit === "kmh" ? "bg-neutral-700" : ""
                } cursor-pointer`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span>km/h</span>
                {mounted && windUnit === "kmh" && <IoMdCheckmark />}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setWindUnit("mph")}
                className={`font-medium text-base w-full flex items-center justify-between hover:bg-neutral-700 rounded-lg px-2 py-2.5 ${
                  windUnit === "mph" ? "bg-neutral-700 rounded-lg" : ""
                } cursor-pointer`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                mph
                {mounted && windUnit === "mph" && <IoMdCheckmark />}
              </motion.button>
            </div>
          </motion.div>
        </div>
        <div className="relative ml-2 hidden md:block" ref={containerRef}>
          <motion.div
            className={`flex items-center gap-1.5 rounded-md bg-neutral-600 px-2 py-3 cursor-pointer select-none ${
              favOpen ? "ring-2 ring-white" : ""
            } ${isToastVisible ? "animate-pulse" : ""}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            role="button"
            aria-expanded={favOpen}
            onClick={() => setFavOpen((s) => !s)}
          >
            <CiStar size={18} />
            <span className="font-medium text-sm">Favorites</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
            <motion.span whileTap={{ rotate: 0 }}>
              <BiChevronDown size={18} />
            </motion.span>
          </motion.div>

          <motion.div
            className={`absolute right-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-xl px-2 py-4 min-w-[214px] z-50 ${
              favOpen ? "pointer-events-auto" : "pointer-events-none"
            } `}
            initial={false}
            animate={favOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {favList.length === 0 ? (
              <div className="text-sm text-neutral-400">No favorites</div>
            ) : (
              <ul className="space-y-2">
                {favList.map((f) => (
                  <li key={f.id}>
                    <button
                      className="w-full text-left font-medium hover:bg-neutral-700 rounded-lg px-2 py-2.5 cursor-pointer"
                      onClick={() => {
                        if (onSelectFavorite) onSelectFavorite(f);
                        setFavOpen(false);
                      }}
                    >
                      {f.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
