"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown, MapPin, Navigation } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const filterItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MapSection() {
  return (
    <motion.section
      id="how-it-works"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full py-28 relative overflow-hidden"
    >
      {/* Ambient glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#4A9EAD]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#0a0d14] via-[#0d1117] to-[#0a0d14] border border-[#4A9EAD]/20 rounded-full px-6 py-2.5 text-xs text-[#7a8591] mb-8 shadow-lg backdrop-blur-sm"
          >
            <span className="bg-gradient-to-r from-[#4A9EAD] to-[#5fbecc] bg-clip-text text-transparent font-semibold">
              Let&apos;s explore what we can do 👋
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight bg-gradient-to-b from-white via-white to-[#7a8591] bg-clip-text text-transparent leading-tight">
            EASY WAY TO FIND
            <br />
            <span className="bg-gradient-to-r from-[#4A9EAD] via-[#5fbecc] to-[#4A9EAD] bg-clip-text text-transparent">
              PARKING LOCATION
            </span>
          </h2>
          <p className="mt-6 text-[#6a7280] text-sm sm:text-base max-w-2xl">
            Discover available parking spots in real-time with our intelligent mapping system
          </p>
        </div>

        {/* Enhanced Search/Filter Bar */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative rounded-3xl p-[1px] mb-16 bg-gradient-to-r from-[#4A9EAD]/20 via-[#4A9EAD]/5 to-[#4A9EAD]/20"
        >
          <div className="flex flex-col lg:flex-row items-center gap-4 rounded-3xl px-6 lg:px-8 py-6 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(74,158,173,0.1)]" 
               style={{ background: "rgba(8, 9, 15, 0.8)" }}>
            {[
              { label: "Location:", value: "Semarang City", icon: MapPin },
              { label: "Range price:", value: "$0.00 - $5.00", icon: null },
              { label: "Parking Type:", value: "Hourly", icon: null },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                variants={filterItem}
                className={`group flex items-center gap-3 flex-1 py-3 lg:py-0 px-4 rounded-2xl transition-all hover:bg-[#4A9EAD]/5 ${
                  i < 2 ? "lg:border-r border-[#4A9EAD]/10 lg:pr-6" : ""
                }`}
              >
                {item.icon && (
                  <item.icon className="w-4 h-4 text-[#4A9EAD] opacity-70" />
                )}
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#5a6370] font-semibold">
                    {item.label}
                  </span>
                  <span className="text-sm text-white font-medium flex items-center gap-2 cursor-pointer group-hover:text-[#4A9EAD] transition-colors">
                    {item.value}
                    <ChevronDown className="w-3.5 h-3.5 text-[#5a6370] group-hover:text-[#4A9EAD] transition-all group-hover:translate-y-0.5" />
                  </span>
                </div>
              </motion.div>
            ))}
            <motion.button 
              variants={filterItem}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-r from-[#4A9EAD] to-[#5fbecc] text-white rounded-2xl px-10 py-4 text-sm font-bold hover:shadow-[0_8px_30px_rgba(74,158,173,0.5)] transition-all whitespace-nowrap group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Search Parking
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#5fbecc] to-[#4A9EAD] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Full Width Map with Enhanced Effects */}
      <div className="relative w-full h-[400px] sm:h-[550px] lg:h-[700px] overflow-hidden">
        <Image
          src="/images/map-full.png"
          alt="Dark mode city map"
          fill
          className="object-cover"
          priority
        />
        
        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050509]/90 via-transparent via-40% to-[#050509]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050509]/70 via-transparent to-[#050509]/70" />
        
        {/* Spotlight effect behind car */}
        <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#4A9EAD]/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Animated Parking Markers */}
        {[
          { top: "30%", left: "25%", delay: 0, id: "marker-1" },
          { top: "45%", left: "65%", delay: 0.2, id: "marker-2" },
          { top: "60%", left: "35%", delay: 0.4, id: "marker-3" },
          { top: "35%", left: "75%", delay: 0.6, id: "marker-4" },
        ].map((pos, i) => (
          <motion.div
            key={pos.id}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: pos.delay + 0.5, duration: 0.5 }}
            style={{ top: pos.top, left: pos.left }}
            className="absolute group cursor-pointer"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-2 bg-[#4A9EAD]/30 rounded-full"
              />
              
              {/* Pin */}
              <div className="relative w-8 h-8 bg-gradient-to-br from-[#4A9EAD] to-[#5fbecc] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(74,158,173,0.6)] group-hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4 text-white" fill="white" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 backdrop-blur-md rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#4A9EAD]/20">
                ${3 + i}.50/hr • {10 - i * 2} spots
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-black/90" />
              </div>
            </motion.div>
          </motion.div>
        ))}

        {/* Floating Car with Enhanced Animation */}
        <motion.div
          animate={{ 
            y: [0, -16, 0],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[220px] h-[220px]"
          >
            <Image
              src="/images/car-topdown.png"
              alt="Navigation car"
              fill
              className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] filter brightness-110"
            />
            {/* Car glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A9EAD]/30 to-transparent rounded-full blur-2xl scale-75" />
          </motion.div>
          
          {/* Navigation circle */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -z-10"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border-2 border-dashed border-[#4A9EAD]/30 rounded-full" />
          </motion.div>
        </motion.div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-[#4A9EAD]/20"
        >
          {[
            { label: "Active Spots", value: "250+" },
            { label: "Avg. Price", value: "$3.50" },
            { label: "Availability", value: "87%" },
          ].map((stat, i) => (
            <div key={stat.label} className={`flex flex-col items-center ${i < 2 ? "border-r border-[#4A9EAD]/20 pr-6" : ""}`}>
              <span className="text-xl font-bold text-white">{stat.value}</span>
              <span className="text-[10px] text-[#7a8591] uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
