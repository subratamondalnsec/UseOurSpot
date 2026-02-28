"use client";

import { useRef, useEffect } from "react";
import { IconCheck } from "@tabler/icons-react";
import { motion, useScroll, useTransform, MotionValue, useSpring, useMotionValueEvent, useMotionValue } from "framer-motion";
import Image from "next/image";
import { FlipWords } from "./FlipWords";
import Link from "next/link";

/* ─────────────────── Price-pin data ─────────────────── */
interface PricePinData {
  id: number;
  label: string;
  name: string;
  x: string;
  y: string;
  appearAt: number;
  fadeAt: number;
}


const pricePins: PricePinData[] = [
  { id: 1, name: "City Center Garage", label: "₹45/hr", x: "28%", y: "68%", appearAt: 0.15, fadeAt: 0.55 },
  { id: 2, name: "Central Park Lot", label: "₹62/hr", x: "72%", y: "42%", appearAt: 0.55, fadeAt: 0.85 },
  { id: 3, name: "Downtown Valet", label: "₹38/hr", x: "38%", y: "32%", appearAt: 0.28, fadeAt: 0.60 },
  { id: 4, name: "Station Premium", label: "₹80/hr", x: "68%", y: "18%", appearAt: 0.65, fadeAt: 0.95 },
  { id: 5, name: "Metro Hub Lot", label: "₹50/hr", x: "15%", y: "50%", appearAt: 0.10, fadeAt: 0.40 },
  { id: 6, name: "Market Complex", label: "₹75/hr", x: "82%", y: "75%", appearAt: 0.45, fadeAt: 0.80 },
  { id: 7, name: "Arena Parking", label: "₹40/hr", x: "45%", y: "85%", appearAt: 0.20, fadeAt: 0.50 },
  { id: 8, name: "Business District", label: "₹90/hr", x: "10%", y: "25%", appearAt: 0.75, fadeAt: 0.98 },
];


/* ─────────────────── PricePin component ─────────────────── */
function PricePin({
  pin,
  scrollYProgress,
}: {
  pin: PricePinData;
  scrollYProgress: MotionValue<number>;
}) {
  const opacity = useTransform(
    scrollYProgress,
    [pin.appearAt - 0.02, pin.appearAt, pin.fadeAt, pin.fadeAt + 0.05],
    [0, 1, 1, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [pin.appearAt - 0.02, pin.appearAt],
    [0.4, 1]
  );

  return (
    <motion.div
      className="absolute pointer-events-none z-50 flex items-center gap-2"
      style={{
        left: pin.x,
        top: pin.y,
        opacity,
        scale,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      {/* Number circle */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{
          background: "#4A9EAD",
          boxShadow: "0 0 14px rgba(74,158,173,0.6)",
        }}
      >
        {pin.id}.
      </div>
      {/* Price label pill with details */}
      <div
        className="text-white text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap flex flex-col gap-1"
        style={{
          background: "rgba(10, 13, 20, 0.88)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(74,158,173,0.25)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
        }}
      >
        <span className="text-[10px] text-[#4A9EAD] font-bold uppercase tracking-wider leading-none">
          {pin.name}
        </span>
        <span className="text-white font-medium leading-none">
          {pin.label}
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────── Fade-up helper ─────────────────── */
const fadeUp = (delay = 0) => ({
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  },
});

/* ═══════════════════════════════════════════════════════════
   HeroSection — scroll-driven car animation
   ═══════════════════════════════════════════════════════════ */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });


  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  const carX = useTransform(smoothProgress, [0, 0.45, 1.0], ["50%", "50%", "82%"]);
  const carY = useTransform(smoothProgress, [0, 0.45, 1.0], ["15%", "55%", "55%"]);

  const dynamicRotation = useMotionValue(180);
  const carRotation = useSpring(dynamicRotation, { stiffness: 60, damping: 15 });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const previous = smoothProgress.getPrevious() ?? 0;
    const diff = latest - previous;

    // Ignore tiny scroll jitters or zero movement to prevent twitching
    if (Math.abs(diff) < 0.001) return;

    const isScrollingUp = diff < 0;

    // Reset to facing down at the very top
    if (latest <= 0.01) {
      dynamicRotation.set(180);
      return;
    }

    if (latest < 0.45) {

      dynamicRotation.set(isScrollingUp ? 360 : 180);
    } else {

      dynamicRotation.set(isScrollingUp ? 270 : 90);
    }
  });

  /* ── Blue beam ── */
  const beamLength = useTransform(smoothProgress, [0, 0.3], [60, 200]);
  const beamOpacity = useTransform(smoothProgress, [0, 0.05, 0.88, 1], [0, 0.9, 0.9, 0]);

  /* ── Teal glow under car ── */
  const glowOpacity = useTransform(smoothProgress, [0, 0.05], [0, 1]);

  /* ── Route dash offset (drawn path) ── */
  const routeDrawProgress = useTransform(smoothProgress, [0, 1], [1, 0]);

  // Ensure user starts at top of page on refresh so the car animation sequence always correctly begins at first position
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[300vh]">
      {/* ───── Sticky wrapper — pinned for full scroll ───── */}
      <div className="sticky top-0 h-screen flex overflow-hidden" style={{ background: "#050509" }}>
        {/* Ambient glow orbs */}
        <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-[#4A9EAD]/8 rounded-full blur-[200px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-[#4A9EAD]/5 rounded-full blur-[150px] pointer-events-none" />

        {/* ══════ LEFT COLUMN — Text ══════ */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-16 relative z-10">
          {/* Badge */}
          <motion.div
            variants={fadeUp(0.2)}
            initial="hidden"
            animate="visible"
            className="bg-[#0e1118] border border-[#4A9EAD]/15 rounded-full px-5 py-2 text-xs text-[#6b7685] flex items-center gap-2 mb-8 w-fit shadow-[0_0_30px_rgba(74,158,173,0.06)]"
          >
            <span className="text-[#4A9EAD]">✦</span> Smart Parking Platform
          </motion.div>

          {/* Heading Line 1 */}
          <motion.h1
            variants={fadeUp(0.4)}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-6xl xl:text-[5.2rem] font-black uppercase leading-[0.95] tracking-tight mb-2"
          >
            THE SOLUTION TO
          </motion.h1>
          
          {/* Heading Line 2 */}
          <motion.h1
            variants={fadeUp(0.6)}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-6xl xl:text-[5.2rem] font-black uppercase leading-[0.95] tracking-tight mb-4"
          >
            YOUR PARKING
          </motion.h1>

          {/* FlipWord line */}
          <motion.div
            className="flex items-baseline gap-4 mb-7"
            variants={fadeUp(0.8)}
            initial="hidden"
            animate="visible"
          >
            <FlipWords
              words={["Smarter", "Faster", "Effortless","Affordable", "Reliable"]}
              className="text-4xl w-full sm:text-5xl xl:text-[4.8rem] font-black uppercase leading-[0.95] tracking-tight text-[#4A9EAD] drop-shadow-[0_0_30px_rgba(74,158,173,0.4)]"
            />
          </motion.div>

          {/* Subtext */}
          <motion.p
            variants={fadeUp(0.9)}
            initial="hidden"
            animate="visible"
            className="text-sm text-[#5a6370] max-w-md mb-8 leading-relaxed"
          >
            Find, book and pay for parking spots near any event — instantly. Real-time
            availability, dynamic pricing, and GPS navigation to your exact spot.
          </motion.p>

          {/* Email CTA */}
          <motion.div
            variants={fadeUp(1.0)}
            initial="hidden"
            animate="visible"
            className="flex w-full max-w-md gap-3"
          >
            <Link
              href="/signup"
              className="bg-[#4A9EAD] text-white px-10 py-4 rounded-full font-bold text-sm  transition-transform shadow-[0_0_25px_rgba(74,158,173,0.4)]"
            >
              Get Started
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp(1.2)}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-6 mt-5 text-xs text-[#5a6370]"
          >
            {["No spam email", "24/7 support", "Free trial 13 days"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <IconCheck className="w-3.5 h-3.5 text-[#4A9EAD]" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ══════ RIGHT COLUMN — Map + Car Animation ══════ */}
        <div className="hidden lg:block w-1/2 relative h-full">
          {/* Dark map background image */}
          <Image
            src="/images/map-full.png"
            alt="Dark city map"
            fill
            className="object-cover"
            style={{ filter: "brightness(0.9) contrast(1.05)" }}
            priority
          />

          {/* Left edge fade — blends map into left column */}
          <div
            className="absolute inset-y-0 left-0 w-40 pointer-events-none z-10"
            style={{
              background: "linear-gradient(to right, #050509, transparent)",
            }}
          />
          {/* Top/bottom edge fades */}
          <div
            className="absolute inset-x-0 top-0 h-24 pointer-events-none z-10"
            style={{
              background: "linear-gradient(to bottom, #050509, transparent)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none z-10"
            style={{
              background: "linear-gradient(to top, #050509, transparent)",
            }}
          />

          {/* ── Route path SVG overlay ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4A9EAD" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#4A9EAD" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            {/* Route line: south then east (right) */}
            <motion.path
              d="M 50 15 L 50 55 L 82 55"
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              style={{ pathLength: routeDrawProgress }}
            />
            {/* Point A marker */}
            <circle cx="50" cy="15" r="1.4" fill="#4A9EAD" opacity="0.7">
              <animate attributeName="r" values="1.4;2;1.4" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Point B marker */}
            <circle cx="82" cy="55" r="1.4" fill="#4A9EAD" opacity="0.7">
              <animate attributeName="r" values="1.4;2;1.4" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* ── Teal glow circle under car ── */}
          <motion.div
            className="absolute pointer-events-none z-25 rounded-full"
            style={{
              left: carX,
              top: carY,
              opacity: glowOpacity,
              width: 120,
              height: 120,
              x: "-50%",
              y: "-50%",
              background:
                "radial-gradient(circle, rgba(74,158,173,0.3) 0%, rgba(74,158,173,0.1) 50%, transparent 75%)",
              willChange: "transform",
            }}
          />

          {/* ── Blue beam SVG — extends from car front ── */}
          <motion.div
            className="absolute pointer-events-none z-30"
            style={{
              left: carX,
              top: carY,
              x: "-50%",
              y: "-50%",
              rotate: carRotation,
              willChange: "transform",
            }}
          >
            <motion.div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: "50%",
                width: 6,
                height: beamLength,
                opacity: beamOpacity,
                background:
                  "linear-gradient(to top, rgba(74,158,173,0.9), rgba(103,232,249,0.3), transparent)",
                borderRadius: 3,
                filter: "blur(1px)",
                willChange: "transform, height",
              }}
            />
          </motion.div>

          {/* ── Car image ── */}
          <motion.div
            className="absolute pointer-events-none z-40"
            style={{
              left: carX,
              top: carY,
              rotate: carRotation,
              x: "-50%",
              y: "-50%",
              width: 55,
              willChange: "transform",
              filter:
                "drop-shadow(0 6px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 8px rgba(74,158,173,0.3))",
            }}
          >
            <Image
              src="/images/car1.png"
              alt="Car top-down view"
              width={44}
              height={88}
              className="w-full h-auto"
              priority
            />
          </motion.div>

          {/* ── Price pin badges ── */}
          {pricePins.map((pin) => (
            <PricePin key={pin.id} pin={pin} scrollYProgress={scrollYProgress} />
          ))}
        </div>

        {/* ── Mobile: static map preview (shown below text on small screens) ── */}
        <div className="lg:hidden absolute inset-0 pointer-events-none">
          <Image
            src="/images/hero-map.png"
            alt="Dark city map"
            fill
            className="object-cover opacity-15"
          />
        </div>
      </div>
    </section>
  );
}
