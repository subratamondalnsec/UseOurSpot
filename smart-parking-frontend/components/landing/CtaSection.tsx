"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function CTASection() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12"
    >
      <div className="relative bg-[#4A9EAD] rounded-3xl overflow-hidden min-h-[380px] flex flex-col lg:flex-row items-center shadow-[0_20px_80px_rgba(74,158,173,0.25)]">
        {/* Subtle dark overlay pattern */}
        <div className="absolute inset-0 bg-linear-to-br from-[#3d8a98] via-[#4A9EAD] to-[#5bb8c8] opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,0,0,0.15),transparent)]" />

        {/* Left: Text */}
        <div className="flex-1 p-8 lg:p-14 z-10 relative">
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-5 py-2 text-xs text-white/90 inline-block mb-6 border border-white/10">
            Free trial download now 🎉
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase leading-tight tracking-tight text-white mb-5 drop-shadow-md">
            BE PART OF THE FUTURE PARKING ERA NOW
          </h2>

          <p className="text-sm text-white/75 max-w-md mb-8 leading-relaxed">
            You can try this application for 13 days and please feel the convenience
            of the future.
          </p>

          <div className="flex w-full max-w-md gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/15 backdrop-blur-sm rounded-full px-6 py-4 text-white placeholder:text-white/40 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors"
            />
            <button className="bg-[#050509] text-white rounded-full px-8 py-4 font-semibold text-sm hover:bg-black transition-all whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              Get Access
            </button>
          </div>
        </div>

        {/* Right: Phone Mockups */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="relative w-full lg:w-[45%] h-[350px] lg:h-[480px] lg:-mt-16 z-10"
        >
          <Image
            src="/images/phone-double.png"
            alt="DIGIPARK app mockups"
            fill
            className="object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
