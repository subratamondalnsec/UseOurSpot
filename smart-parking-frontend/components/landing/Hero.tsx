"use client";

import { IconCheck } from "@tabler/icons-react";
import { motion } from "framer-motion";

const pins = [
  { id: 1, price: "$5.0/h", top: "58%", left: "15%" },
  { id: 2, price: "$2.0/h", top: "68%", left: "72%" },
  { id: 3, price: "$3.2/h", top: "20%", left: "45%" },
  { id: 4, price: "$2.1/h", top: "26%", left: "78%" },
];

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: "easeOut" as const } },
});

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex items-center pt-20 overflow-hidden" style={{ background: "#050509" }}>
      {/* Ambient glow orbs */}
      <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-[#4A9EAD]/8 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-[#4A9EAD]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* LEFT: Text */}
        <div className="flex flex-col items-start py-12">
          <motion.div
            variants={fadeUp(0.2)}
            initial="hidden"
            animate="visible"
            className="bg-[#0e1118] border border-[#4A9EAD]/15 rounded-full px-5 py-2 text-xs text-[#6b7685] flex items-center gap-2 mb-8 shadow-[0_0_30px_rgba(74,158,173,0.06)]"
          >
            <span className="text-[#4A9EAD]">✦</span> 1# best software fest 2023
          </motion.div>

          <motion.h1
            variants={fadeUp(0.4)}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-6xl xl:text-[5.2rem] font-black uppercase leading-[0.95] tracking-tight mb-7"
          >
            THE SOLUTION TO<br />
            YOUR PARKING<br />
            <span className="text-[#4A9EAD] drop-shadow-[0_0_30px_rgba(74,158,173,0.4)]">PROBLEMS</span>
          </motion.h1>

          <motion.p
            variants={fadeUp(0.6)}
            initial="hidden"
            animate="visible"
            className="text-sm text-[#5a6370] max-w-md mb-8 leading-relaxed"
          >
            The mobile parking app that is integrated with GPS that it can make it easier
            for you to find the nearest parking lot with a variety of price ranges.
          </motion.p>

          <motion.div
            variants={fadeUp(0.8)}
            initial="hidden"
            animate="visible"
            className="flex w-full max-w-md gap-3"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-[#0a0d14] rounded-full px-6 py-4 border border-white/8 text-white placeholder:text-[#3a4050] text-sm outline-none focus:border-[#4A9EAD]/40 transition-colors shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]"
            />
            <button className="bg-[#4A9EAD] text-white rounded-full px-8 py-4 font-semibold text-sm hover:brightness-110 transition-all whitespace-nowrap shadow-[0_4px_20px_rgba(74,158,173,0.35),0_0_60px_rgba(74,158,173,0.15)]">
              Get Access
            </button>
          </motion.div>

          <motion.div
            variants={fadeUp(1.0)}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-6 mt-5 text-xs text-[#5a6370]"
          >
            {["No spam email", "22/7 support system", "Free trial 13 days"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <IconCheck className="w-3.5 h-3.5 text-[#4A9EAD]" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* RIGHT: Video with overlay pins */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" as const }}
          className="relative w-full h-[500px] lg:h-[650px]"
        >
          {/* Video Container */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_120px_rgba(74,158,173,0.08)]">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.85) contrast(1.1) saturate(1.2)" }}
            >
              <source src="/images/video.mp4" type="video/mp4" />
            </video>

            {/* Edge fade overlays to blend video into the dark background */}
            <div className="absolute inset-0 bg-linear-to-l from-transparent via-transparent to-[#050509]" />
            <div className="absolute inset-0 bg-linear-to-t from-[#050509]/60 via-transparent to-[#050509]/30" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-[#050509]/20" />

            {/* Subtle vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(5,5,9,0.5)]" />
          </div>

          {/* Floating Price Pin Badges on top of the video */}
          {pins.map((pin, i) => (
            <motion.div
              key={pin.id}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.2, duration: 0.5, ease: "backOut" }}
              className="absolute z-20 flex items-center gap-2"
              style={{ top: pin.top, left: pin.left }}
            >
              <div className="w-9 h-9 rounded-full bg-[#4A9EAD] flex items-center justify-center text-xs font-bold text-white shadow-[0_4px_20px_rgba(74,158,173,0.5)]">
                {pin.id}.
              </div>
              <div className="bg-[#0a0d14]/90 backdrop-blur-md border border-[#4A9EAD]/20 rounded-full px-3.5 py-1.5 text-xs text-white font-medium shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                {pin.price}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
