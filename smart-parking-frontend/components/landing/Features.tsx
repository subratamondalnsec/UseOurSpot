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

        </div>
      </div>
    </motion.section>
  );
}
