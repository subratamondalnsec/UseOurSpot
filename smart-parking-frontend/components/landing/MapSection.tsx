"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function MapSection() {
  return (
    <motion.section
      id="how-it-works"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full py-28"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="bg-[#0a0d14] border border-[#4A9EAD]/10 rounded-full px-5 py-2 text-xs text-[#5a6370] mb-6">
            Let&apos;s explore what we can do 👋
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            EASY WAY TO FIND PARKING LOCATION
          </h2>
        </div>

        {/* Search/Filter Bar */}
        <div className="flex flex-col lg:flex-row items-center gap-4 rounded-full border border-[#4A9EAD]/10 px-6 lg:px-8 py-4 mb-12 shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(74,158,173,0.05)]" style={{ background: "#08090f" }}>
          {[
            { label: "Location:", value: "Semarang City" },
            { label: "Range price:", value: "$0.00 - $5.00" },
            { label: "Parking Type:", value: "Hourly" },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 flex-1 py-2 lg:py-0 ${
                i < 2 ? "lg:border-r border-[#4A9EAD]/10 lg:pr-6" : ""
              }`}
            >
              <span className="text-xs text-[#4a5568]">{item.label}</span>
              <span className="text-sm text-white font-medium flex items-center gap-1 cursor-pointer">
                {item.value} <ChevronDown className="w-3.5 h-3.5 text-[#4a5568]" />
              </span>
            </div>
          ))}
          <button className="bg-[#4A9EAD] text-white rounded-full px-8 py-3 text-sm font-semibold hover:brightness-110 transition-all whitespace-nowrap shadow-[0_4px_20px_rgba(74,158,173,0.35)]">
            Get Access
          </button>
        </div>
      </div>

      {/* Full Width Map */}
      <div className="relative w-full h-[400px] sm:h-[550px] lg:h-[650px] overflow-hidden">
        <Image
          src="/images/map-full.png"
          alt="Dark mode city map"
          fill
          className="object-cover"
        />
        {/* Deep fade edges */}
        <div className="absolute inset-0 bg-linear-to-b from-[#050509] via-transparent to-[#050509]" />
        <div className="absolute inset-0 bg-linear-to-r from-[#050509]/50 via-transparent to-[#050509]/50" />

        {/* Floating Car */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-[200px] h-[200px]"
        >
          <Image
            src="/images/car-topdown.png"
            alt="Navigation car"
            fill
            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
