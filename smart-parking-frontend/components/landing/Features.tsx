"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { LayoutGrid, MapPin, Radio } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const features = [
  { icon: LayoutGrid, title: "Well organized information", active: true },
  { icon: MapPin, title: "Google maps integration", active: false },
  { icon: Radio, title: "Integrate with car sensor", active: false },
];

export default function FeaturesSection() {
  return (
    <motion.section
      id="features"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="max-w-[1400px] mx-auto px-6 lg:px-12 py-28"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* LEFT: Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="relative flex justify-center"
        >
          <div className="relative w-[280px] sm:w-[320px] h-[560px] sm:h-[640px] -rotate-[8deg]">
            {/* Glow behind phone */}
            <div className="absolute -inset-10 bg-[#4A9EAD]/8 rounded-full blur-[80px]" />
            <Image
              src="/images/phone-mockup.png"
              alt="DIGIPARK phone app mockup"
              fill
              className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative z-10"
            />
          </div>
        </motion.div>

        {/* RIGHT: Text + Feature Cards */}
        <div className="flex flex-col items-start">
          <div className="bg-[#0a0d14] border border-[#4A9EAD]/10 rounded-full px-5 py-2 text-xs text-[#5a6370] mb-6">
            Our best features for you 💎
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase leading-tight tracking-tight mb-6">
            THE SOLUTION TO YOUR PARKING PROBLEMS
          </h2>

          <p className="text-sm text-[#4a5568] max-w-md mb-10 leading-relaxed">
            We are aware that many people have difficulty finding a parking space.
            We made a feature that can certainly solve your parking problems so far.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-4 w-full mb-10">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`rounded-2xl p-5 flex flex-col items-center text-center gap-3 border transition-all cursor-pointer ${
                  f.active
                    ? "bg-[#4A9EAD] border-[#4A9EAD] text-white shadow-[0_8px_30px_rgba(74,158,173,0.35)]"
                    : "bg-[#08090f] border-white/5 text-[#5a6370] hover:border-[#4A9EAD]/30 hover:bg-[#0a0d14]"
                }`}
              >
                <f.icon className="w-6 h-6" />
                <span className="text-xs font-medium leading-snug">{f.title}</span>
              </motion.div>
            ))}
          </div>

          <button className="border border-[#4A9EAD]/30 rounded-full px-8 py-3 text-sm text-[#4A9EAD] hover:bg-[#4A9EAD] hover:text-black font-medium transition-all duration-300">
            Learn More
          </button>
        </div>
      </div>
    </motion.section>
  );
}
