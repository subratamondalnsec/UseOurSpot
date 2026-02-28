"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "About Us", href: "#about" },
  { label: "Resources", href: "#resources" },
  { label: "Blog", href: "#blog" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth();

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

        <div className="hidden lg:flex items-center gap-6">
          {!isLoading && (
            isAuthenticated ? (
              /* ── Logged-in: show Profile button ── */
              <Link href="/profile">
                <Button
                  className="flex items-center gap-2 px-5 rounded-full font-semibold transition-all duration-200"
                  style={{
                    background: "rgba(74,158,173,0.15)",
                    border: "1px solid rgba(74,158,173,0.4)",
                    color: "#4A9EAD",
                  }}
                >
                  <span
                    className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                    style={{ background: "#4A9EAD" }}
                  >
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </span>
                  {user?.name?.split(" ")[0] ?? "Profile"}
                </Button>
              </Link>
            ) : (
              /* ── Logged-out: show Sign in + Sign up ── */
              <>
                <Link
                  href="/login"
                  className="text-sm text-[#5a6370] hover:text-white transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link href="/signup">
                  <Button className="bg-[#4A9EAD] hover:bg-[#3d8390] text-white px-6 rounded-full transition-colors duration-200">
                    Sign up
                  </Button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </motion.header>
  );
}
