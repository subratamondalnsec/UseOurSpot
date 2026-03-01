"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import Image from "next/image";
import { MapPin, Navigation, Zap, Shield, Clock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Spot data ─── */
const SPOTS = [
  { id: "A", top: "28%", left: "22%", price: "₹45", spots: 8,  delay: 0 },
  { id: "B", top: "42%", left: "62%", price: "₹72", spots: 3,  delay: 0.15 },
  { id: "C", top: "65%", left: "38%", price: "₹38", spots: 12, delay: 0.3 },
  { id: "D", top: "30%", left: "78%", price: "₹90", spots: 2,  delay: 0.45 },
];

/* ─── Radar sweep ─── */
function RadarSweep() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 pointer-events-none"
      style={{ transformOrigin: "50% 50%" }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 70%, rgba(74,158,173,0.35) 85%, rgba(74,158,173,0.6) 100%)",
        }}
      />
    </motion.div>
  );
}

/* ─── Single spot marker ─── */
function SpotMarker({
  spot,
}: {
  spot: (typeof SPOTS)[0];
}) {
  const isCritical = spot.spots <= 3;
  const color = isCritical ? "#FF4D6D" : "#4A9EAD";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: spot.delay + 0.4, type: "spring", stiffness: 200 }}
      style={{ top: spot.top, left: spot.left }}
      className="absolute group cursor-pointer z-30"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.8 + spot.delay, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* Sonar rings */}
        {[1, 2].map((ring) => (
          <motion.div
            key={ring}
            animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{
              duration: 2.2,
              delay: ring * 0.7,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
            style={{ background: `${color}40`, width: 36, height: 36 }}
          />
        ))}

        {/* Core pin */}
        <div
          className="relative w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white z-10 group-hover:scale-125 transition-transform duration-200"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}30`,
          }}
        >
          {spot.id}
        </div>

        {/* HUD card tooltip */}
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[140px] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50"
          style={{ transform: "translateX(-50%) translateY(4px)" }}
        >
          <div
            className="rounded-xl px-3 py-2.5 text-xs"
            style={{
              background: "rgba(5,5,9,0.92)",
              border: `1px solid ${color}40`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 12px ${color}20`,
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#7a8591] uppercase tracking-wider text-[9px]">Zone {spot.id}</span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${color}20`, color }}
              >
                {isCritical ? "FULL" : "OPEN"}
              </span>
            </div>
            <div className="text-white font-bold text-sm leading-none">{spot.price}/hr</div>
            <div className="text-[#5a6370] text-[10px] mt-1">{spot.spots} spots left</div>
          </div>
          {/* Arrow */}
          <div
            className="w-2 h-2 absolute left-1/2 -translate-x-1/2 -bottom-1 rotate-45"
            style={{ background: `${color}40` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Live count-up number ─── */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const tl = gsap.fromTo(
      el,
      { innerText: 0 },
      {
        innerText: to,
        duration: 1.8,
        ease: "power2.out",
        snap: { innerText: 1 },
        onUpdate() {
          el.textContent = Math.round(+el.innerText) + suffix;
        },
      }
    );
    return () => { tl.kill(); };
  }, [inView, to, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ══════════════════════════════════════════════════════════
   MapSection — aggressive HUD-style redesign
   ══════════════════════════════════════════════════════════ */
export default function MapSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const headingRef   = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const mapWrapRef   = useRef<HTMLDivElement>(null);
  const lineLeftRef  = useRef<HTMLDivElement>(null);
  const lineRightRef = useRef<HTMLDivElement>(null);

  /* ── Framer scroll for map parallax ── */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const smoothProg = useSpring(scrollYProgress, { stiffness: 40, damping: 18 });
  const mapY       = useTransform(smoothProg, [0, 1], ["0%", "-8%"]);
  const mapScale   = useTransform(smoothProg, [0, 0.5, 1], [1.06, 1.02, 1]);
  const scanLineY  = useTransform(smoothProg, [0, 1], ["0%", "100%"]);

  /* ── GSAP: heading letter stagger ── */
  useEffect(() => {
    if (!headingRef.current) return;

    const chars = headingRef.current.querySelectorAll(".gsap-char");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { opacity: 0, y: 60, rotateX: -90 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.035,
          duration: 0.7,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  /* ── GSAP: side panel slide-in ── */
  useEffect(() => {
    if (!panelRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panelRef.current,
            start: "top 75%",
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  /* ── GSAP: map frame lines expand ── */
  useEffect(() => {
    if (!lineLeftRef.current || !lineRightRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [lineLeftRef.current, lineRightRef.current],
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: mapWrapRef.current,
            start: "top 70%",
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  /* ── Split heading text into individual chars ── */
  const splitLine = (text: string) =>
    text.split("").map((ch, i) => (
      <span key={`${text}-${i}`} className="gsap-char inline-block" style={{ transformOrigin: "50% 100%" }}>
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative w-full py-24 overflow-hidden"
      style={{ background: "#050509" }}
    >
      {/* ── Corner accent lines (top) ── */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
        <div className="absolute top-0 left-12 w-px h-16 bg-gradient-to-b from-[#4A9EAD]/60 to-transparent" />
        <div className="absolute top-12 left-0 h-px w-16 bg-gradient-to-r from-[#4A9EAD]/60 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
        <div className="absolute top-0 right-12 w-px h-16 bg-gradient-to-b from-[#4A9EAD]/60 to-transparent" />
        <div className="absolute top-12 right-0 h-px w-16 bg-gradient-to-l from-[#4A9EAD]/60 to-transparent" />
      </div>

      {/* ── Deep background glow ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-[#4A9EAD]/4 rounded-full blur-[160px]" />
        <div className="absolute top-[40%] right-[5%] w-[400px] h-[400px] bg-[#4A9EAD]/6 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-14 relative z-10">
        {/* ══ Section label ══ */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-8 h-px bg-[#4A9EAD]" />
          <span className="text-[#4A9EAD] text-xs font-bold uppercase tracking-[0.3em]">
            Live Parking Intelligence
          </span>
          {/* Blink dot */}
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-[#4A9EAD]"
          />
        </motion.div>

        {/* ══ Heading ══ */}
        <div ref={headingRef} className="mb-14 perspective-[800px]">
          <h2 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black uppercase leading-[0.9] tracking-tight flex flex-wrap items-baseline gap-x-6">
            <span className="text-white">{splitLine("LOCATE.")}</span>
            <span
              style={{ WebkitTextStroke: "1.5px rgba(74,158,173,0.7)", color: "transparent" }}
            >
              {splitLine("BOOK.")}
            </span>
            <span className="bg-gradient-to-r from-[#4A9EAD] to-[#5fbecc] bg-clip-text text-transparent">
              {splitLine("ARRIVE.")}
            </span>
          </h2>
        </div>

        {/* ══ Two-col layout: map + side panel ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* ── Map block ── */}
          <div
            ref={mapWrapRef}
            className="relative rounded-2xl overflow-hidden"
            style={{
              height: "clamp(340px, 55vw, 680px)",
              border: "1px solid rgba(74,158,173,0.18)",
              boxShadow: "0 0 60px rgba(74,158,173,0.08), inset 0 0 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* GSAP frame lines */}
            <div
              ref={lineLeftRef}
              className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#4A9EAD]/60 via-[#4A9EAD]/20 to-transparent origin-top z-30 pointer-events-none"
            />
            <div
              ref={lineRightRef}
              className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#4A9EAD]/60 via-[#4A9EAD]/20 to-transparent origin-top z-30 pointer-events-none"
            />

            {/* Map image with parallax */}
            <motion.div
              style={{ y: mapY, scale: mapScale }}
              className="absolute inset-0 will-change-transform"
            >
              <Image
                src="/images/map-full.png"
                alt="City parking map"
                fill
                className="object-cover"
                style={{ filter: "brightness(0.75) saturate(0.7) contrast(1.1)" }}
                priority
              />
            </motion.div>

            {/* Teal tint overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(135deg, rgba(74,158,173,0.07) 0%, transparent 60%)",
              }}
            />

            {/* Gradient edges */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-[#050509]/70 via-transparent to-[#050509]/80" />
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#050509]/60 via-transparent to-[#050509]/30" />

            {/* Scanline effect */}
            <motion.div
              className="absolute left-0 right-0 h-0.5 z-20 pointer-events-none"
              animate={{ opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                top: scanLineY,
                background:
                  "linear-gradient(to right, transparent, rgba(74,158,173,0.6) 30%, rgba(74,158,173,0.9) 50%, rgba(74,158,173,0.6) 70%, transparent)",
                boxShadow: "0 0 12px rgba(74,158,173,0.5)",
              }}
            />

            {/* Radar circle */}
            <div className="absolute top-[38%] left-[42%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <div
                className="relative rounded-full"
                style={{ width: 200, height: 200 }}
              >
                {/* Concentric rings */}
                {[1, 2, 3].map((r) => (
                  <div
                    key={r}
                    className="absolute inset-0 rounded-full"
                    style={{
                      transform: `scale(${r * 0.33})`,
                      border: "1px solid rgba(74,158,173,0.15)",
                    }}
                  />
                ))}
                <RadarSweep />
                {/* Center dot */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{ background: "#4A9EAD", boxShadow: "0 0 12px #4A9EAD" }}
                />
              </div>
            </div>

            {/* Spot markers */}
            {SPOTS.map((s) => (
              <SpotMarker key={s.id} spot={s} />
            ))}

            {/* Car image */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-25 pointer-events-none"
              style={{ top: "52%", left: "44%", transform: "translate(-50%, -50%)" }}
            >
              <div className="relative w-[90px] h-[90px]">
                <Image
                  src="/images/car-topdown1.png"
                  alt="Your car"
                  fill
                  className="object-contain"
                  style={{
                    filter:
                      "drop-shadow(0 0 18px rgba(74,158,173,0.8)) drop-shadow(0 12px 30px rgba(0,0,0,0.9)) brightness(1.1)",
                  }}
                />
              </div>
            </motion.div>

            {/* Top-left HUD label */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[#4A9EAD]"
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "rgba(74,158,173,0.8)" }}
              >
                LIVE FEED
              </span>
            </div>

            {/* Bottom stats bar */}
            <div
              className="absolute bottom-0 left-0 right-0 z-30 flex items-stretch"
              style={{
                background: "rgba(5,5,9,0.88)",
                borderTop: "1px solid rgba(74,158,173,0.18)",
                backdropFilter: "blur(16px)",
              }}
            >
              {[
                { label: "Active Zones", val: 42, suffix: "" },
                { label: "Spots Open",   val: 287, suffix: "+" },
                { label: "Avg. Price",   val: 55,  suffix: "₹" },
                { label: "Availability", val: 87,  suffix: "%" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`flex-1 flex flex-col items-center justify-center py-4 ${
                    i < 3 ? "border-r border-[#4A9EAD]/10" : ""
                  }`}
                >
                  <span className="text-xl font-black text-white">
                    {s.suffix === "₹" ? (
                      <><span className="text-[#4A9EAD]">₹</span><CountUp to={s.val} /></>
                    ) : (
                      <CountUp to={s.val} suffix={s.suffix} />
                    )}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#5a6370] mt-0.5">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Side panel ── */}
          <div ref={panelRef} className="flex flex-col gap-4 opacity-0">
            {/* Features */}
            {[
              {
                icon: Zap,
                title: "Instant Booking",
                desc: "Reserve your spot in seconds. No queues, no hassle — guaranteed slot on arrival.",
                accent: "#4A9EAD",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "End-to-end encrypted transactions. Pay via UPI, card or wallet — all in-app.",
                accent: "#4A9EAD",
              },
              {
                icon: Clock,
                title: "Flexible Duration",
                desc: "Book hourly or monthly. Extend time remotely before you even leave your car.",
                accent: "#4A9EAD",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 + 0.3, duration: 0.6, ease: "easeOut" }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="group relative rounded-xl p-5 cursor-default overflow-hidden"
                style={{
                  background: "rgba(10,13,20,0.7)",
                  border: "1px solid rgba(74,158,173,0.12)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
              >
                {/* Hover glow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 0% 50%, rgba(74,158,173,0.07) 0%, transparent 70%)",
                  }}
                />
                <div className="flex items-start gap-4 relative z-10">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: "rgba(74,158,173,0.12)",
                      border: "1px solid rgba(74,158,173,0.25)",
                    }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.accent }} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm mb-1 group-hover:text-[#4A9EAD] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[#5a6370] text-xs leading-relaxed">{item.desc}</div>
                  </div>
                </div>
                {/* Right edge accent */}
                <div
                  className="absolute right-0 top-4 bottom-4 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(to bottom, transparent, #4A9EAD, transparent)" }}
                />
              </motion.div>
            ))}

            {/* Search CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="rounded-xl overflow-hidden"
              style={{
                background: "rgba(10,13,20,0.7)",
                border: "1px solid rgba(74,158,173,0.12)",
              }}
            >
              <div className="p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#5a6370] mb-3">
                  Find parking near you
                </p>
                <div
                  className="flex items-center gap-2 mb-3 px-3 py-2.5 rounded-lg text-sm text-[#7a8591]"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,158,173,0.1)" }}
                >
                  <MapPin className="w-4 h-4 text-[#4A9EAD] shrink-0" />
                  <span>Enter location…</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-[#050509] relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #4A9EAD, #5fbecc)",
                    boxShadow: "0 6px 24px rgba(74,158,173,0.4)",
                  }}
                >
                  <Navigation className="w-4 h-4" />
                  Search Spots
                  {/* Shimmer */}
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                    }}
                  />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
