"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const testimonials = [
  {
    name: "Sarah Johnson",
    avatar: "SJ",
    rating: 5,
    text: "DIGIPARK completely changed how I handle parking at events. I save at least 30 minutes every time. The GPS integration is incredibly accurate!",
  },
  {
    name: "Michael Chen",
    avatar: "MC",
    rating: 5,
    text: "As a venue owner, listing my parking spaces was effortless. I've earned over $2,000 in passive income since joining. Highly recommended!",
  },
  {
    name: "Emily Rodriguez",
    avatar: "ER",
    rating: 4,
    text: "The real-time availability feature is a game changer. No more circling the block endlessly. Found a spot near the concert venue in under 2 minutes.",
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="max-w-[1400px] mx-auto px-6 lg:px-12 py-28"
    >
      <div className="flex flex-col items-center text-center mb-14">
        <div className="bg-[#0a0d14] border border-[#4A9EAD]/10 rounded-full px-5 py-2 text-xs text-[#5a6370] mb-6">
          Testimonials from user 😊
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight mb-4">
          WHAT OUR USER SAY
        </h2>
        <p className="text-sm text-[#4a5568] max-w-lg">
          You will get many benefits from our features. Finding a parking space becomes easier.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className={`rounded-2xl p-7 border transition-all cursor-pointer ${
              active === i
                ? "border-[#4A9EAD]/30 shadow-[0_12px_40px_rgba(74,158,173,0.12),0_0_0_1px_rgba(74,158,173,0.1)]"
                : "border-white/5 hover:border-white/10"
            }`}
            style={{ background: "#08090f" }}
            onClick={() => setActive(i)}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-linear-to-br from-[#4A9EAD] to-[#1a4a54] flex items-center justify-center text-xs font-bold text-white shadow-[0_4px_16px_rgba(74,158,173,0.3)]">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`w-3.5 h-3.5 ${j < t.rating ? "text-amber-400 fill-amber-400" : "text-[#1e2530]"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-[#5a6370] leading-relaxed">{t.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              active === i ? "bg-[#4A9EAD] w-8 shadow-[0_0_12px_rgba(74,158,173,0.5)]" : "bg-[#1e2530] w-2"
            }`}
          />
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <button className="border border-[#4A9EAD]/30 rounded-full px-8 py-3 text-sm text-[#4A9EAD] hover:bg-[#4A9EAD] hover:text-black font-medium transition-all duration-300">
          Learn More
        </button>
      </div>
    </motion.section>
  );
}
