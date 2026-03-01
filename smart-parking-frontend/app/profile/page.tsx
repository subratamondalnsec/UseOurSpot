"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Map, Home, Calendar, PlusCircle, MapPin, User, LogOut, Menu, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import BookingRouteMap from "@/components/BookingRouteMap";

// ── Types ─────────────────────────────────────────────────────
interface Spot {
  _id: string;
  address: string;
  title?: string;
  size: "small" | "medium" | "large";
  type: "open" | "covered" | "garage";
  pricePerHour: number;
  status: "free" | "occupied";
  isApproved: boolean;
  availability: string;
  availableFrom?: string;
  availableTo?: string;
  rules?: string;
  photos?: string[];
  averageRating?: number;
  coordinates?: { lat: number; lng: number };
  createdAt?: string;
}

interface Booking {
  _id: string;
  spotId: {
    _id: string;
    address: string;
    photos?: string[];
    pricePerHour: number;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  startTime: string;
  endTime: string;
  actualEndTime?: string;
  status: "active" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid";
  baseAmount?: number;
  overstayCharge?: number;
  finalAmount?: number;
  carLocation?: { lat: number; lng: number };
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

// ── Helpers ───────────────────────────────────────────────────
function initials(name?: string) {
  if (!name) return "U";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDuration(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ── Reusable Badge ────────────────────────────────────────────
function LabelBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{ background: color + "22", color }}
    >
      {label}
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; color: string;
}) {
  return (
    <div className="rounded-2xl p-px" style={{ background: `linear-gradient(135deg, ${color}30, ${color}08)` }}>
      <div className="rounded-2xl p-5 flex items-center gap-4 h-full"
        style={{ background: "oklch(0.145 0 0 / 92%)", backdropFilter: "blur(12px)" }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
          style={{ background: color + "18", color }}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.556 0 0)" }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════ PAGE ═════════════════════════════════
export default function ProfilePage() {
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Owner state
  const [spots, setSpots] = useState<Spot[]>([]);
  const [earnings, setEarnings] = useState<{ totalEarnings: number; bookingCount: number } | null>(null);
  const [loadingSpots, setLoadingSpots] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Driver state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  // Fetch owner data
  useEffect(() => {
    if (!token || user?.role !== "owner") return;
    const headers = { Authorization: `Bearer ${token}` };
    (async () => {
      setLoadingSpots(true);
      try {
        const [spotsRes, earningsRes] = await Promise.all([
          axios.get(`${API}/owner/my-spots`, { headers }),
          axios.get(`${API}/owner/earnings`, { headers }),
        ]);
        setSpots(spotsRes.data.spots || []);
        setEarnings(earningsRes.data);
      } catch {
        toast("Failed to load your data", { description: "Please refresh the page." });
      } finally {
        setLoadingSpots(false);
      }
    })();
  }, [token, user?.role]);

  // Fetch driver bookings
  useEffect(() => {
    if (!token || user?.role !== "driver") return;
    (async () => {
      setLoadingBookings(true);
      try {
        const res = await axios.get(`${API}/booking/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data.bookings || []);
      } catch {
        toast("Couldn't load your bookings", { description: "Please refresh." });
      } finally {
        setLoadingBookings(false);
      }
    })();
  }, [token, user?.role]);

  const handleDeleteSpot = async (id: string) => {
    if (!confirm("Are you sure you want to delete this spot?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/owner/delete-spot/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpots((prev) => prev.filter((s) => s._id !== id));
      toast("Spot deleted successfully");
    } catch {
      toast("Failed to delete spot");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Loading screen ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050509" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "oklch(0.623 0.214 259.815)", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "oklch(0.556 0 0)" }}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isOwner = user.role === "owner";
  const isDriver = user.role === "driver";

  // Driver computed stats
  const totalSpent = bookings.reduce((s, b) => s + (b.finalAmount || b.baseAmount || 0), 0);
  const activeBooking = bookings.find((b) => b.status === "active");
  const completedTrips = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#050509", color: "#fff" }}>

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-15 blur-[120px]"
        style={{ background: "oklch(0.488 0.243 264.376)" }} />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ background: "oklch(0.623 0.214 259.815)" }} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-12">
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-6 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "oklch(0.145 0 0 / 95%)", border: "1px solid oklch(1 0 0 / 12%)" }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Layout Grid */}
        <div className="flex gap-6">
          
          {/* Sidebar */}
          <aside className={`
            fixed lg:sticky top-0 left-0 h-screen
            w-64 lg:w-72 shrink-0
            transition-transform duration-300 z-40
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="h-full pt-20 lg:pt-12 pb-6 px-4 lg:px-0">
              <div className="rounded-2xl p-px h-full"
                style={{ background: "linear-gradient(135deg, oklch(1 0 0 / 12%), oklch(1 0 0 / 4%))" }}>
                <div className="rounded-2xl p-4 h-full"
                  style={{ background: "oklch(0.145 0 0 / 95%)", backdropFilter: "blur(20px)" }}>
                  
                  {/* Profile Section */}
                  <div className="mb-6 pb-6 border-b" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-black mb-3"
                      style={{
                        background: isDriver
                          ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
                          : "linear-gradient(135deg, oklch(0.488 0.243 264.376), oklch(0.546 0.245 262.881))",
                      }}>
                      {initials(user.name)}
                    </div>
                    <h3 className="font-bold text-white text-sm truncate">{user.name}</h3>
                    <p className="text-xs mt-1 truncate" style={{ color: "oklch(0.556 0 0)" }}>{user.email}</p>
                    <div className="mt-2">
                      {isOwner && <LabelBadge label="Owner" color="oklch(0.623 0.214 259.815)" />}
                      {isDriver && <LabelBadge label="Driver" color="#a78bfa" />}
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="space-y-1">
                    <button
                      onClick={() => { setActiveSection("overview"); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === "overview" ? "text-white" : "text-gray-400 hover:text-white"
                      }`}
                      style={activeSection === "overview" ? {
                        background: "linear-gradient(135deg, #a78bfa18, #a78bfa08)",
                        border: "1px solid #a78bfa30"
                      } : {}}>
                      <Home size={18} />
                      <span>Overview</span>
                    </button>

                    {isDriver && (
                      <>
                        <Link href="/my-bookings" onClick={() => setSidebarOpen(false)}>
                          <div className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === "bookings" ? "text-white" : "text-gray-400 hover:text-white"}`}
                            style={activeSection === "bookings" ? {
                              background: "linear-gradient(135deg, #a78bfa18, #a78bfa08)",
                              border: "1px solid #a78bfa30"
                            } : {}}>
                            <Calendar size={18} />
                            <span>My Bookings</span>
                          </div>
                        </Link>
                        <Link href="/map" onClick={() => setSidebarOpen(false)}>
                          <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            <MapPin size={18} />
                            <span>Find Parking</span>
                          </div>
                        </Link>
                      </>
                    )}

                    {isOwner && (
                      <>
                        <button
                          onClick={() => { setActiveSection("spots"); setSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            activeSection === "spots" ? "text-white" : "text-gray-400 hover:text-white"
                          }`}
                          style={activeSection === "spots" ? {
                            background: "linear-gradient(135deg, oklch(0.488 0.243 264.376 / 18%), oklch(0.488 0.243 264.376 / 8%))",
                            border: "1px solid oklch(0.623 0.214 259.815 / 30%)"
                          } : {}}>
                          <MapPin size={18} />
                          <span>My Spots</span>
                        </button>
                        <Link href="/owner/add-spot" onClick={() => setSidebarOpen(false)}>
                          <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            <PlusCircle size={18} />
                            <span>Add New Spot</span>
                          </div>
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => { setActiveSection("account"); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === "account" ? "text-white" : "text-gray-400 hover:text-white"
                      }`}
                      style={activeSection === "account" ? {
                        background: "linear-gradient(135deg, #22c55e18, #22c55e08)",
                        border: "1px solid #22c55e30"
                      } : {}}>
                      <User size={18} />
                      <span>Account</span>
                    </button>
                  </nav>

                  {/* Logout Button */}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
                    <button
                      onClick={() => { logout(); setSidebarOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 transition-colors">
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">

        {/* ── Profile Header ──────────────────────────────────── */}
        <div className="rounded-2xl p-px"
          style={{ background: "linear-gradient(135deg, oklch(1 0 0 / 12%), oklch(1 0 0 / 4%), oklch(0.488 0.243 264.376 / 20%))" }}>
          <div className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            style={{ background: "oklch(0.145 0 0 / 92%)", backdropFilter: "blur(20px)" }}>

            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0"
              style={{
                background: isDriver
                  ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
                  : "linear-gradient(135deg, oklch(0.488 0.243 264.376), oklch(0.546 0.245 262.881))",
                boxShadow: isDriver
                  ? "0 8px 32px rgba(167,139,250,0.3)"
                  : "0 8px 32px oklch(0.488 0.243 264.376 / 30%)",
              }}>
              {initials(user.name)}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                {isOwner && <LabelBadge label="Owner" color="oklch(0.623 0.214 259.815)" />}
                {isDriver && <LabelBadge label="Driver" color="#a78bfa" />}
              </div>
              <p className="text-sm" style={{ color: "oklch(0.556 0 0)" }}>{user.email}</p>
              <p className="text-xs font-mono" style={{ color: "oklch(0.4 0 0)" }}>ID: {user.id}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-row sm:flex-col gap-2 sm:items-end">
              {isOwner && (
                <Link href="/owner/add-spot">
                  <Button className="rounded-full px-5 font-semibold text-sm"
                    style={{ background: "oklch(0.87 0 0)", color: "oklch(0.145 0 0)", height: "38px" }}>
                    + Add Spot
                  </Button>
                </Link>
              )}
              {isDriver && (
                <Link href="/map">
                  <Button className="rounded-full px-5 font-semibold text-sm"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", color: "#fff", height: "38px" }}>
                    🗺️ Find Parking
                  </Button>
                </Link>
              )}
              <Button variant="ghost" onClick={logout}
                className="text-xs rounded-full px-4"
                style={{ color: "oklch(0.556 0 0)", height: "38px" }}>
                Sign out →
              </Button>
            </div>
          </div>
        </div>

        {/* ══════════ OWNER VIEW ═══════════════════════════════ */}
        {isOwner && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6"/></svg>}
                label="Total Spots" value={spots.length} color="oklch(0.623 0.214 259.815)" />
              <StatCard
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                label="Total Earnings" value={earnings ? `₹${earnings.totalEarnings.toLocaleString()}` : "—"} color="#22c55e" />
              <StatCard
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
                label="Total Bookings" value={earnings?.bookingCount ?? "—"} color="#f59e0b" />
            </div>

            {/* My Spots */}
            <div className="rounded-2xl p-px"
              style={{ background: "linear-gradient(135deg, oklch(1 0 0 / 8%), oklch(1 0 0 / 3%))" }}>
              <div className="rounded-2xl p-6 sm:p-8"
                style={{ background: "oklch(0.145 0 0 / 92%)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">My Parking Spots</h2>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.556 0 0)" }}>
                      {spots.length} spot{spots.length !== 1 ? "s" : ""} listed
                    </p>
                  </div>
                  <Link href="/owner/add-spot">
                    <Button variant="ghost" className="rounded-full text-xs px-4 font-semibold"
                      style={{ background: "oklch(0.488 0.243 264.376 / 12%)", border: "1px solid oklch(0.623 0.214 259.815 / 30%)", color: "oklch(0.809 0.105 251.813)", height: "34px" }}>
                      + Add New
                    </Button>
                  </Link>
                </div>

                {loadingSpots && (
                  <div className="flex justify-center py-16">
                    <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "oklch(0.623 0.214 259.815)", borderTopColor: "transparent" }} />
                  </div>
                )}

                {!loadingSpots && spots.length === 0 && (
                  <div className="flex flex-col items-center text-center gap-4 py-14">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ background: "oklch(0.488 0.243 264.376 / 12%)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="oklch(0.623 0.214 259.815)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">No spots listed yet</p>
                      <p className="text-sm mt-1 max-w-xs" style={{ color: "oklch(0.556 0 0)" }}>
                        Start earning by listing your first parking spot. It only takes a minute.
                      </p>
                    </div>
                    <Link href="/owner/add-spot">
                      <Button className="rounded-full px-6 font-semibold mt-1"
                        style={{ background: "oklch(0.87 0 0)", color: "oklch(0.145 0 0)", height: "38px" }}>
                        Add Your First Spot
                      </Button>
                    </Link>
                  </div>
                )}

                {!loadingSpots && spots.length > 0 && (
                  <div className="space-y-3">
                    {spots.map((spot) => (
                      <div key={spot._id} className="rounded-xl p-4 flex flex-col sm:flex-row gap-4"
                        style={{ background: "oklch(1 0 0 / 4%)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                        <div className="w-full sm:w-24 h-24 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                          style={{ background: "oklch(0.488 0.243 264.376 / 10%)" }}>
                          {spot.photos?.[0]
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={spot.photos[0]} alt="spot" className="w-full h-full object-cover rounded-xl" />
                            : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="oklch(0.488 0.243 264.376)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6"/></svg>
                          }
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-white font-semibold text-sm truncate">{spot.title || spot.address}</p>
                            <LabelBadge label={spot.isApproved ? "Approved" : "Pending"} color={spot.isApproved ? "#22c55e" : "#f59e0b"} />
                            <LabelBadge label={spot.status === "free" ? "Available" : "Occupied"} color={spot.status === "free" ? "oklch(0.623 0.214 259.815)" : "#ef4444"} />
                          </div>
                          <p className="text-xs truncate" style={{ color: "oklch(0.556 0 0)" }}>{spot.address}</p>
                          <div className="flex flex-wrap gap-3 text-xs" style={{ color: "oklch(0.556 0 0)" }}>
                            <span>Size: <span className="text-white capitalize">{spot.size}</span></span>
                            <span>Type: <span className="text-white capitalize">{spot.type}</span></span>
                            <span>₹<span className="text-white">{spot.pricePerHour}</span>/hr</span>
                            {spot.averageRating && <span>⭐ <span className="text-white">{spot.averageRating.toFixed(1)}</span></span>}
                          </div>
                          {spot.availableFrom && spot.availableTo && (
                            <p className="text-xs" style={{ color: "oklch(0.556 0 0)" }}>
                              Hours: <span style={{ color: "oklch(0.708 0 0)" }}>{spot.availableFrom} – {spot.availableTo}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex sm:flex-col gap-2 sm:items-end justify-end shrink-0">
                          <Button variant="ghost" onClick={() => handleDeleteSpot(spot._id)}
                            disabled={deletingId === spot._id}
                            className="rounded-full text-xs px-4 disabled:opacity-50"
                            style={{ background: "oklch(0.704 0.191 22.216 / 10%)", border: "1px solid oklch(0.704 0.191 22.216 / 25%)", color: "oklch(0.704 0.191 22.216)", height: "32px" }}>
                            {deletingId === spot._id ? (
                              <span className="flex items-center gap-1.5">
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
                                </svg>
                                Deleting…
                              </span>
                            ) : "Delete"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ══════════ DRIVER VIEW ══════════════════════════════ */}
        {isDriver && (
          <div className="space-y-5">

            {/* Driver stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>}
                label="Total Trips" value={completedTrips} color="#a78bfa" />
              <StatCard
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} color="#22c55e" />
              <StatCard
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                label="Active Now" value={activeBooking ? "Yes" : "None"} color={activeBooking ? "#22c55e" : "#f59e0b"} />
            </div>

            {/* Active booking alert */}
            {activeBooking && (
              <div className="rounded-2xl p-px"
                style={{ background: "linear-gradient(135deg, #22c55e40, #22c55e08)" }}>
                <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  style={{ background: "oklch(0.145 0 0 / 92%)", backdropFilter: "blur(20px)" }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                    style={{ background: "#22c55e18", color: "#22c55e" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">Active Parking Session</p>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.556 0 0)" }}>
                      {activeBooking.spotId?.address}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs" style={{ color: "oklch(0.556 0 0)" }}>
                      <span>Started: <span className="text-white">{formatTime(activeBooking.startTime)}</span></span>
                      <span>Ends: <span className="text-white">{formatTime(activeBooking.endTime)}</span></span>
                      <span>Duration: <span className="text-white">{formatDuration(activeBooking.startTime, activeBooking.endTime)}</span></span>
                    </div>
                  </div>
                  <LabelBadge label="Active" color="#22c55e" />
                </div>
              </div>
            )}

            {/* Quick links grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/map">
                <div className="rounded-2xl p-px cursor-pointer transition-transform hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #a78bfa30, #a78bfa08)" }}>
                  <div className="rounded-2xl p-6 h-full"
                    style={{ background: "oklch(0.145 0 0 / 92%)", backdropFilter: "blur(20px)" }}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                      style={{ background: "#a78bfa18", color: "#a78bfa" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                      </svg>
                    </div>
                    <p className="text-white font-bold">Find Parking</p>
                    <p className="text-xs mt-1" style={{ color: "oklch(0.556 0 0)" }}>
                      Browse available spots on the live map.
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/my-bookings">
                <div className="rounded-2xl p-px cursor-pointer transition-transform hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, oklch(0.488 0.243 264.376 / 30%), oklch(0.488 0.243 264.376 / 8%))" }}>
                  <div className="rounded-2xl p-6 h-full"
                    style={{ background: "oklch(0.145 0 0 / 92%)", backdropFilter: "blur(20px)" }}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                      style={{ background: "oklch(0.488 0.243 264.376 / 18%)", color: "oklch(0.809 0.105 251.813)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </div>
                    <p className="text-white font-bold">My Bookings</p>
                    <p className="text-xs mt-1" style={{ color: "oklch(0.556 0 0)" }}>
                      View and manage all your bookings.
                    </p>
                  </div>
                </div>
              </Link>

              <div className="rounded-2xl p-px"
                style={{ background: "linear-gradient(135deg, #22c55e30, #22c55e08)" }}>
                <div className="rounded-2xl p-6 h-full"
                  style={{ background: "oklch(0.145 0 0 / 92%)", backdropFilter: "blur(20px)" }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                    style={{ background: "#22c55e18", color: "#22c55e" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <p className="text-white font-bold">My Account</p>
                  <div className="mt-2 space-y-1 text-xs" style={{ color: "oklch(0.556 0 0)" }}>
                    <p>Name: <span className="text-white">{user.name}</span></p>
                    <p>Email: <span className="text-white">{user.email}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking History */}
            <div className="rounded-2xl p-px"
              style={{ background: "linear-gradient(135deg, oklch(1 0 0 / 8%), oklch(1 0 0 / 3%))" }}>
              <div className="rounded-2xl p-6 sm:p-8"
                style={{ background: "oklch(0.145 0 0 / 92%)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">Booking History</h2>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.556 0 0)" }}>
                      {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/my-bookings">
                      <Button variant="ghost" className="rounded-full text-xs px-4 font-semibold"
                        style={{ background: "oklch(0.488 0.243 264.376 / 12%)", border: "1px solid oklch(0.623 0.214 259.815 / 30%)", color: "oklch(0.809 0.105 251.813)", height: "34px" }}>
                        View All
                      </Button>
                    </Link>
                    <Link href="/map">
                      <Button variant="ghost" className="rounded-full text-xs px-4 font-semibold"
                        style={{ background: "#a78bfa12", border: "1px solid #a78bfa30", color: "#a78bfa", height: "34px" }}>
                        + Book a spot
                      </Button>
                    </Link>
                  </div>
                </div>

                {loadingBookings && (
                  <div className="flex justify-center py-16">
                    <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "#a78bfa", borderTopColor: "transparent" }} />
                  </div>
                )}

                {!loadingBookings && bookings.length === 0 && (
                  <div className="flex flex-col items-center text-center gap-4 py-14">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ background: "#a78bfa12" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">No bookings yet</p>
                      <p className="text-sm mt-1 max-w-xs" style={{ color: "oklch(0.556 0 0)" }}>
                        Find a spot near you and book your first parking session.
                      </p>
                    </div>
                    <Link href="/map">
                      <Button className="rounded-full px-6 font-semibold mt-1"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", color: "#fff", height: "38px" }}>
                        Find Parking
                      </Button>
                    </Link>
                  </div>
                )}

                {!loadingBookings && bookings.length > 0 && (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="rounded-xl p-4 flex flex-col sm:flex-row gap-4"
                        style={{ background: "oklch(1 0 0 / 4%)", border: "1px solid oklch(1 0 0 / 8%)" }}>

                        {/* Spot thumbnail */}
                        <div className="w-full sm:w-20 h-20 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                          style={{ background: "#a78bfa0d" }}>
                          {booking.spotId?.photos?.[0]
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={booking.spotId.photos[0]} alt="spot" className="w-full h-full object-cover rounded-xl" />
                            : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6"/></svg>
                          }
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-white font-semibold text-sm truncate">
                              {booking.spotId?.address || "Parking Spot"}
                            </p>
                            <LabelBadge
                              label={booking.status === "active" ? "Active" : booking.status === "completed" ? "Completed" : "Cancelled"}
                              color={booking.status === "active" ? "#22c55e" : booking.status === "completed" ? "oklch(0.623 0.214 259.815)" : "#ef4444"}
                            />
                            <LabelBadge
                              label={booking.paymentStatus === "paid" ? "Paid" : "Pending"}
                              color={booking.paymentStatus === "paid" ? "#22c55e" : "#f59e0b"}
                            />
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs" style={{ color: "oklch(0.556 0 0)" }}>
                            <span>📅 {formatDate(booking.startTime)}</span>
                            <span>🕐 {formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                            <span>⏱ {formatDuration(booking.startTime, booking.endTime)}</span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-xs" style={{ color: "oklch(0.556 0 0)" }}>
                            {booking.baseAmount != null && (
                              <span>Base: <span className="text-white">₹{booking.baseAmount.toFixed(2)}</span></span>
                            )}
                            {booking.overstayCharge != null && booking.overstayCharge > 0 && (
                              <span>Overstay: <span style={{ color: "#f59e0b" }}>₹{booking.overstayCharge.toFixed(2)}</span></span>
                            )}
                            {booking.finalAmount != null && (
                              <span>Total: <span className="text-white font-semibold">₹{booking.finalAmount.toFixed(2)}</span></span>
                            )}
                          </div>

                          {/* View Route Button */}
                          <div className="mt-2">
                            <Button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowRouteMap(true);
                              }}
                              variant="ghost"
                              className="rounded-full text-xs px-4 py-1.5 h-auto font-semibold"
                              style={{ background: "#10b98112", border: "1px solid #10b98130", color: "#10b981" }}
                            >
                              <Map className="w-3.5 h-3.5 mr-1.5" />
                              View Route
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Route Map Modal */}
        <Dialog open={showRouteMap} onOpenChange={setShowRouteMap}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-black">
                <Map className="w-5 h-5 text-emerald-500" />
                Parking Spot Location
              </DialogTitle>
            </DialogHeader>

            {selectedBooking && (() => {
              const spot = selectedBooking.spotId;
              
              // Check if location data exists, use fallback if not
              const hasLocation = spot?.location?.coordinates?.length === 2;
              
              // Default to Kolkata coordinates if no spot location
              const spotLocation = hasLocation ? {
                lat: spot.location.coordinates[1],
                lng: spot.location.coordinates[0]
              } : {
                lat: 22.5726,
                lng: 88.3639
              };
              
              // Use car location if available, otherwise use a point 500m away from spot
              const carLocation = selectedBooking.carLocation || {
                lat: spotLocation.lat + 0.005,
                lng: spotLocation.lng + 0.005
              };
              
              return (
                <BookingRouteMap
                  carLocation={carLocation}
                  spotLocation={spotLocation}
                  spotAddress={spot?.address || "Parking Spot"}
                />
              );
            })()}

            <DialogFooter>
              <Button onClick={() => setShowRouteMap(false)} variant="outline">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

          </main>
        </div>
      </div>
    </div>
  );
}