"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "About Us", href: "#about" },
  { label: "Resources", href: "#resources" },
  { label: "Blog", href: "#blog" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        background: scrolled ? "rgba(5,5,9,0.85)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(74,158,173,0.08)" : "none",
        boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.6)" : "none",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">
        <Link
          href="/"
          className="text-white font-black text-lg tracking-[0.25em] uppercase"
        >
          UseOurSpot
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#5a6370] hover:text-[#4A9EAD] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button className="hidden sm:block text-sm border border-[#4A9EAD]/40 rounded-full px-6 py-2.5 text-[#4A9EAD] hover:bg-[#4A9EAD] hover:text-black font-medium transition-all duration-300 shadow-[0_0_20px_rgba(74,158,173,0.1)]">
          Start free trial
        </button>
      </div>
    </motion.header>
  );
}
