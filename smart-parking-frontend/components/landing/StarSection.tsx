"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function StatsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <motion.section
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="max-w-[1400px] mx-auto px-6 lg:px-12 my-20"
    >
      <div className="rounded-3xl p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-center border border-[#4A9EAD]/8 shadow-[0_16px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(74,158,173,0.05)]" style={{ background: "#08090f" }}>
        {/* Col 1 */}
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold leading-snug">
            There are systems that offer nearby listings and{" "}
            <span className="text-[#4a5568]">competitive prices</span>
          </h3>
        </div>

        {/* Col 2 */}
        <div className="lg:border-l border-[#4A9EAD]/10 lg:pl-10 flex flex-col items-center lg:items-start">
          <div className="text-6xl lg:text-7xl font-black tracking-tight">
            {inView ? <CountUp end={99} duration={2} /> : "0"}
            <span className="text-[#4A9EAD] drop-shadow-[0_0_20px_rgba(74,158,173,0.4)]">%</span>
          </div>
          <p className="text-sm text-[#4a5568] mt-3">
            Accurate data based on our system
          </p>
        </div>

        {/* Col 3 */}
        <div className="lg:border-l border-[#4A9EAD]/10 lg:pl-10 flex flex-col items-center lg:items-start">
          <div className="text-6xl lg:text-7xl font-black tracking-tight">
            {inView ? <CountUp end={570} duration={2.5} /> : "0"}
            <span className="text-[#4A9EAD] drop-shadow-[0_0_20px_rgba(74,158,173,0.4)]">k+</span>
          </div>
          <p className="text-sm text-[#4a5568] mt-3">
            Users who are actively using the application
          </p>
        </div>
      </div>
    </motion.section>
  );
}
