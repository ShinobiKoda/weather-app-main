"use client"
import { Navbar } from "./layout/Navbar"
import { IoIosSearch } from "react-icons/io";

export function HomePage(){
  return(
    <div className="w-full  text-white">
     <Navbar />
     <div className="w-full px-4 max-w-[1440px] mx-auto md:px-8 lg:px-12">
        <h1 className="text-center text-5xl lg:text-7xl font-extrabold mt-10">How&apos;s the sky looking today?</h1>
        <div className="mt-15">
          <div className="space-y-4">
            <div className="w-full flex items-center bg-neutral-700 rounded-lg px-4 py-3 gap-2 text-base">
              <IoIosSearch size={25}/>
              <input type="text" className="border-none outline-none placeholder:text-neutral-300 placeholder:text-lg w-full" placeholder="Search for a place..."/>
            </div>
            <button className="px-4 py-3 rounded-lg bg-blue-500 w-full text-lg">
              Search
            </button>
          </div>
          <div className="mt-20">

          </div>
        </div>
     </div>
    </div>
  )
}