"use client";
import Image from "next/image";
import { IoSettingsOutline } from "react-icons/io5";
import { BiChevronDown } from "react-icons/bi";
import { motion } from "motion/react";
import { useState } from "react";
import { chevronRotate, dropdownMenu } from "../animations/motion";
import { IoMdCheckmark } from "react-icons/io";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [windUnit, setWindUnit] = useState<"kmh" | "mph">("kmh");
  const [precipUnit, setPrecipUnit] = useState<"mm" | "in">("mm");

  return (
    <nav className="w-full max-w-[1440px] mx-auto p-4 md:px-8 lg:px-12 flex items-center justify-between">
      <Image src="/images/logo.svg" alt="Logo" width={150} height={100} />
      <div className="relative">
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
          className="absolute right-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-xl px-4 py-2.5 min-w-[214px] z-20"
          variants={dropdownMenu}
          initial="hidden"
          animate={open ? "visible" : "hidden"}
        >
          <h3 className="font-medium text-base mb-3.5">Switch to Metric</h3>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-neutral-300">
              Temperature
            </h4>
            <motion.button
              type="button"
              onClick={() => setTempUnit("C")}
              className={`font-medium text-base w-full flex items-center justify-between rounded-lg px-2 py-2.5 ${
                tempUnit === "C" ? "bg-neutral-700" : ""
              } cursor-pointer`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span>Celsius (°C)</span>
              {tempUnit === "C" && <IoMdCheckmark />}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setTempUnit("F")}
              className={`font-medium text-base w-full flex items-center justify-between px-2 py-2.5 ${
                tempUnit === "F" ? "bg-neutral-700 rounded-lg" : ""
              } cursor-pointer`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              Fahrenheit (°F)
              {tempUnit === "F" && <IoMdCheckmark />}
            </motion.button>
          </div>
          <hr className="my-4 text-neutral-600" />
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-neutral-300">Wind Speed</h4>
            <motion.button
              type="button"
              onClick={() => setWindUnit("kmh")}
              className={`font-medium text-base w-full flex items-center justify-between rounded-lg px-2 py-2.5 ${
                windUnit === "kmh" ? "bg-neutral-700" : ""
              } cursor-pointer`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span>km/h</span>
              {windUnit === "kmh" && <IoMdCheckmark />}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setWindUnit("mph")}
              className={`font-medium text-base w-full flex items-center justify-between px-2 py-2.5 ${
                windUnit === "mph" ? "bg-neutral-700 rounded-lg" : ""
              } cursor-pointer`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              mph
              {windUnit === "mph" && <IoMdCheckmark />}
            </motion.button>
          </div>
          <hr className="my-4 text-neutral-600" />
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-neutral-300">
              Precipitaion
            </h4>
            <motion.button
              type="button"
              onClick={() => setPrecipUnit("mm")}
              className={`font-medium text-base w-full flex items-center justify-between rounded-lg px-2 py-2.5 ${
                precipUnit === "mm" ? "bg-neutral-700" : ""
              } cursor-pointer`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span>Millimeters (mm)</span>
              {precipUnit === "mm" && <IoMdCheckmark />}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setPrecipUnit("in")}
              className={`font-medium text-base w-full flex items-center justify-between px-2 py-2.5 ${
                precipUnit === "in" ? "bg-neutral-700 rounded-lg" : ""
              } cursor-pointer`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              Inches (in)
              {precipUnit === "in" && <IoMdCheckmark />}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
