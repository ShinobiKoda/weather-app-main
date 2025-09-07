"use client";
import Image from "next/image";
import { IoSettingsOutline } from "react-icons/io5";
import { BiChevronDown } from "react-icons/bi";

export function Navbar() {
  return (
    <nav className="w-full max-w-[1440px] mx-auto p-4 md:px-8 lg:px-12 flex items-center justify-between">
      <Image src="/images/logo.svg" alt="Logo" width={150} height={100} />
      <div className="flex items-center gap-1 rounded-md bg-neutral-600 px-2 py-3">
        <IoSettingsOutline size={20}/>
        Units
        <BiChevronDown size={20}/>
      </div>
    </nav>
  );
}
