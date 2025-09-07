"use client";
import { Navbar } from "./layout/Navbar";
import { IoIosSearch } from "react-icons/io";
import Image from "next/image";

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

export function HomePage() {
  return (
    <div className="w-full  text-white">
      <Navbar />
      <div className="w-full px-4 max-w-[1440px] mx-auto md:px-8 lg:px-12">
        <h1 className="text-center text-5xl lg:text-7xl font-extrabold mt-10">
          How&apos;s the sky looking today?
        </h1>
        <div className="mt-15">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-center max-w-[800px] mx-auto">
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
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[2.3fr_1fr]">
            <div className="mt-8">
              <div
                className="bg-cover bg-center h-[300px] rounded-lg flex flex-col items-center justify-center lg:hidden"
                style={{
                  backgroundImage: "url('/images/bg-today-small.svg')",
                }}
              >
                <h2 className="font-bold text-xl">
                  <span>Berlin</span>,<span> Germany</span>
                </h2>
                <p className="font-normal text-lg text-neutral-300">
                  Tuesday, August 5, 2025
                </p>
                <div className="flex items-center justify-between">
                  <Image
                    src="/images/icon-sunny.webp"
                    alt="Sunny Icon"
                    width={150}
                    height={100}
                  />
                  <p className="text-8xl font-extrabold italic">68°</p>
                </div>
              </div>
              <div
                className="bg-cover bg-center h-[300px] rounded-lg hidden lg:flex flex-row items-center justify-between px-8"
                style={{
                  backgroundImage: "url('/images/bg-today-large.svg')",
                }}
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
                  <Image
                    src="/images/icon-sunny.webp"
                    alt="Sunny Icon"
                    width={150}
                    height={100}
                  />
                  <p className="text-8xl font-extrabold italic">68°</p>
                </div>
              </div>
              <div className="mt-6 w-full grid grid-cols-2 gap-5 lg:grid-cols-4">
                {properties.map((property, index) => (
                  <div
                    key={index}
                    className="rounded-lg px-3 py-4 min-h-[120px] bg-neutral-800 flex flex-col justify-between border border-neutral-700"
                  >
                    <p className="font-medium text-base text-neutral-300">
                      {property.title}
                    </p>
                    <p className="text-white font-mediun text-3xl">
                      {property.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <h2 className="font-semibold text-lg">Daily Forecast</h2>
                <div className="grid grid-cols-3 lg:grid-cols-7 gap-5 mt-5">
                  {forecast.map((item, index) => (
                    <div key={index} className="rounded-lg px-3 py-4 min-h-[180px] bg-neutral-800 flex flex-col justify-between border border-neutral-700 items-center">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
