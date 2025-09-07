"use client";
import Image from "next/image";
import { IoSettingsOutline } from "react-icons/io5";
import { BiChevronDown } from "react-icons/bi";
import { motion } from "motion/react";
import { useState } from "react";
import { chevronRotate } from "../animations/motion";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full max-w-[1440px] mx-auto p-4 md:px-8 lg:px-12 flex items-center justify-between">
      <Image src="/images/logo.svg" alt="Logo" width={150} height={100} />
      <motion.div
        className="flex items-center gap-1 rounded-md bg-neutral-600 px-2 py-3 cursor-pointer select-none"
        onClick={() => setOpen((s) => !s)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <IoSettingsOutline size={20} />
        <span>Units</span>
        <motion.span
          variants={chevronRotate}
          initial="closed"
          animate={open ? "open" : "closed"}
        >
          <BiChevronDown size={20} />
        </motion.span>
      </motion.div>
    </nav>
  );
}
