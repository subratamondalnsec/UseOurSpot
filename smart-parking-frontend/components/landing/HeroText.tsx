"use client";

import { motion } from "framer-motion";
import { FlipWords } from "./FlipWords";

const HeroText = () => {
  const words = ["Smarter", "Faster", "Effortless", "Affordable", "Reliable"];

  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="z-10 mt-20 text-center md:mt-40 md:text-left">
      {/* ── Desktop ── */}
      <div className="hidden md:flex flex-col gap-2">
        {/* Badge */}
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium w-fit mb-4"
          style={{
            background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.25)",
            color: "#67e8f9",
          }}
        >
          ✦ Smart Event-Driven Parking
        </motion.div>

        {/* Line 1 */}
        <motion.h1
          className="text-5xl font-black uppercase tracking-tight text-white"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          The Solution To
        </motion.h1>

        {/* Line 2 */}
        <motion.p
          className="text-5xl font-black uppercase tracking-tight text-white"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.0 }}
        >
          Your Parking
        </motion.p>

        {/* FlipWord line */}
        <motion.div
          className="flex items-baseline gap-4"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 500 }}
        >
          <FlipWords
            words={words}
            className="font-black text-7xl uppercase"
            style={{ color: "#06b6d4" }}
          />
        </motion.div>

        {/* Subtext */}
        <motion.p
          className="text-base max-w-md leading-relaxed mt-4"
          style={{ color: "#94a3b8" }}
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.5 }}
        >
          Find, book and pay for parking spots near any event — instantly.
          Real-time availability, dynamic pricing, GPS to your exact spot.
        </motion.p>

        {/* CTA row */}
        <motion.div
          className="flex items-center gap-3 mt-8"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.7 }}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 max-w-xs px-5 py-3.5 rounded-full text-sm text-white placeholder-[#475569] outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <button
            className="px-7 py-3.5 rounded-full text-sm font-semibold text-white whitespace-nowrap transition-all hover:scale-[1.03] hover:brightness-110"
            style={{ background: "#06b6d4" }}
          >
            Get Access
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="flex items-center gap-6 mt-4"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.9 }}
        >
          {["No spam email", "24/7 support", "Free trial 13 days"].map((t) => (
            <span
              key={t}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "#64748b" }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Mobile ── */}
      <div className="flex flex-col gap-4 md:hidden">
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium w-fit mx-auto"
          style={{
            background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.25)",
            color: "#67e8f9",
          }}
        >
          ✦ Smart Parking Platform
        </motion.div>

        <motion.h1
          className="text-4xl font-black uppercase tracking-tight text-white"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          Your Parking
        </motion.h1>

        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.0 }}
        >
          <FlipWords
            words={words}
            className="font-black text-5xl uppercase"
            style={{ color: "#06b6d4" }}
          />
        </motion.div>

        <motion.p
          className="text-sm leading-relaxed max-w-sm mx-auto"
          style={{ color: "#94a3b8" }}
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.2 }}
        >
          Find and book parking near any event — instantly.
        </motion.p>

        <motion.button
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.4 }}
          className="w-fit px-7 py-3.5 rounded-full text-sm font-semibold text-white mx-auto mt-4"
          style={{ background: "#06b6d4" }}
        >
          Get Access
        </motion.button>
      </div>
    </div>
  );
};

export default HeroText;
