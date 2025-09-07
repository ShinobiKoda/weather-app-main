"use client";
import { Navbar } from "./layout/Navbar";
import { IoIosSearch } from "react-icons/io";
import Image from "next/image";
import { BiChevronDown } from "react-icons/bi";
import { motion } from "motion/react";
import {
  fadeInUp,
  staggerChildren,
  slideInFromRight,
  fadeIn,
  bgFloat,
  sunBounceRotate,
} from "./animations/motion";

const properties = [
  {
    title: "Feels like",
    value: "64°",
  },
  {
    title: "Humidity",
    value: "46%",
  },
  {
    title: "Wind",
    value: "9km/h",
  },
  {
    title: "Precipitation",
    value: "0 mm",
  },
];

const forecast = [
  {
    day: "Tue",
    icon: "/images/icon-drizzle.webp",
    temp: "24°",
    other_temp: "14°",
  },
  {
    day: "Wed",
    icon: "/images/icon-rain.webp",
    temp: "21°",
    other_temp: "15°",
  },
  {
    day: "Thu",
    icon: "/images/icon-sunny.webp",
    temp: "24°",
    other_temp: "14°",
  },
  {
    day: "Fri",
    icon: "/images/icon-partly-cloudy.webp",
    temp: "25°",
    other_temp: "13°",
  },
  {
    day: "Sat",
    icon: "/images/icon-storm.webp",
    temp: "21°",
    other_temp: "15°",
  },
  {
    day: "Sun",
    icon: "/images/icon-snow.webp",
    temp: "25°",
    other_temp: "16°",
  },
  {
    day: "Mon",
    icon: "/images/icon-fog.webp",
    temp: "24°",
    other_temp: "15°",
  },
];

const hourly_forecast = [
  {
    time: "3PM",
    temp: "20°",
    weather: "/images/icon-overcast.webp",
  },
  {
    time: "4PM",
    temp: "20°",
    weather: "/images/icon-overcast.webp",
  },
  {
    time: "5PM",
    temp: "20°",
    weather: "/images/icon-overcast.webp",
  },
  {
    time: "6PM",
    temp: "19",
    weather: "/images/icon-overcast.webp",
  },
  {
    time: "7PM",
    temp: "18°",
    weather: "/images/icon-overcast.webp",
  },
  {
    time: "8PM",
    temp: "18°",
    weather: "/images/icon-overcast.webp",
  },
  {
    time: "9PM",
    temp: "20°",
    weather: "/images/icon-overcast.webp",
  },
  {
    time: "10PM",
    temp: "20°",
    weather: "/images/icon-overcast.webp",
  },
];

export function HomePage() {
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
          className="text-center text-5xl lg:text-7xl font-extrabold mt-10"
          variants={fadeInUp}
        >
          How&apos;s the sky looking today?
        </motion.h1>
        <div className="mt-15">
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-center max-w-[800px] mx-auto lg:hidden"
            variants={slideInFromRight}
          >
            <div className="w-full flex items-center bg-neutral-700 rounded-lg px-4 py-3 gap-2 text-base">
              <IoIosSearch size={25} />
              <input
                type="text"
                className="border-none outline-none placeholder:text-neutral-300 placeholder:text-lg w-full"
                placeholder="Search for a place..."
              />
            </div>
            <button className="px-4 py-3 rounded-lg bg-blue-500 w-full lg:w-34 text-lg">
              Search
            </button>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 min-h-[700px]">
            <div className="mt-8 flex flex-col">
              <motion.div
                className="w-full items-center bg-neutral-700 rounded-xl px-4 py-4 gap-2 text-base mb-8 max-w-[500px] ml-auto hidden lg:flex"
                variants={slideInFromRight}
              >
                <IoIosSearch size={25} />
                <input
                  type="text"
                  className="border-none outline-none placeholder:text-neutral-300 placeholder:text-lg w-full"
                  placeholder="Search for a place..."
                />
              </motion.div>
              <motion.div
                className="bg-cover bg-center h-[300px] rounded-3xl flex flex-col items-center justify-center lg:hidden relative overflow-hidden"
                style={{
                  backgroundImage: "url('/images/bg-today-small.svg')",
                }}
                variants={bgFloat}
              >
                <h2 className="font-bold text-xl">
                  <span>Berlin</span>,<span> Germany</span>
                </h2>
                <p className="font-normal text-lg text-neutral-300">
                  Tuesday, August 5, 2025
                </p>
                <div className="flex items-center justify-between">
                  <motion.div
                    variants={sunBounceRotate}
                    className="flex items-center"
                  >
                    <Image
                      src="/images/icon-sunny.webp"
                      alt="Sunny Icon"
                      width={150}
                      height={100}
                    />
                  </motion.div>
                  <p className="text-8xl font-extrabold italic">68°</p>
                </div>
              </motion.div>
              <motion.div
                className="bg-cover bg-center h-[300px] rounded-3xl hidden lg:flex flex-row items-center justify-between px-8 relative overflow-hidden"
                style={{
                  backgroundImage: "url('/images/bg-today-large.svg')",
                }}
                variants={bgFloat}
              >
                <div>
                  <h2 className="font-bold text-xl">
                    <span>Berlin,</span>
                    <span> Germany</span>
                  </h2>
                  <p className="font-normal text-lg text-neutral-300">
                    Tuesday, August 5, 2025
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <motion.div
                    variants={sunBounceRotate}
                    className="flex items-center"
                  >
                    <Image
                      src="/images/icon-sunny.webp"
                      alt="Sunny Icon"
                      width={150}
                      height={100}
                    />
                  </motion.div>
                  <p className="text-8xl font-extrabold italic">68°</p>
                </div>
              </motion.div>
              <motion.div
                className="mt-6 w-full grid grid-cols-2 gap-5 lg:grid-cols-4"
                variants={staggerChildren}
              >
                {properties.map((property, index) => (
                  <motion.div
                    key={index}
                    className="rounded-lg px-3 py-4 min-h-[120px] bg-neutral-800 flex flex-col justify-between border border-neutral-700"
                    variants={fadeInUp}
                  >
                    <p className="font-medium text-base text-neutral-300">
                      {property.title}
                    </p>
                    <p className="text-white font-mediun text-3xl">
                      {property.value}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-8">
                <h2 className="font-semibold text-lg">Daily Forecast</h2>
                <div className="grid grid-cols-3 lg:grid-cols-7 gap-5 mt-5">
                  {forecast.map((item, index) => (
                    <motion.div
                      key={index}
                      className="rounded-lg px-3 py-4 min-h-[180px] bg-neutral-800 flex flex-col justify-between border border-neutral-700 items-center"
                      variants={fadeInUp}
                    >
                      <p>{item.day}</p>
                      <Image
                        src={item.icon}
                        alt="Weather"
                        width={50}
                        height={50}
                      />
                      <p className="w-full flex items-center justify-between">
                        <span>{item.temp}</span>
                        <span>{item.other_temp}</span>
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col max-h-full">
              <button className="px-4 py-3 rounded-xl bg-blue-500 w-full lg:w-34 text-lg mb-8 hidden lg:block">
                Search
              </button>
              <motion.div
                className="bg-neutral-800 rounded-3xl px-6 py-8 flex flex-col flex-1"
                variants={fadeIn}
              >
                <div className="w-full flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Hourly Forecast</h2>
                  <div className="bg-neutral-600 flex items-center px-4 py-2 rounded-lg gap-2">
                    <span className="font-normal text-lg">Tuesday</span>
                    <BiChevronDown />
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  {hourly_forecast.map((forecast, index) => (
                    <motion.div
                      key={index}
                      className="rounded-xl bg-neutral-700 flex items-center justify-between px-4 py-2 border border-neutral-600"
                      variants={fadeInUp}
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={forecast.weather}
                          alt="Weather"
                          width={50}
                          height={50}
                        />
                        <p className="font-semibold">{forecast.time}</p>
                      </div>
                      <p className="font-medium">{forecast.temp}</p>
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
