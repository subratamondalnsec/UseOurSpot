"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import SpotCard from '@/components/DriverSerchingSpot/SpotCard';
import { Navigation, SlidersHorizontal, MapPin, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { ParkingSpot, Location, ParkingFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MapComponent = dynamic(() => import('@/components/DriverSerchingSpot/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full" style={{ background: "#050509" }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-12 w-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "oklch(0.623 0.214 259.815)", borderTopColor: "transparent" }}
        />
        <p className="text-sm font-medium" style={{ color: "oklch(0.708 0 0)" }}>Loading map…</p>
      </div>
    </div>
  ),
});

// ── Full-screen states ────────────────────────────────────────
function FullScreenState({
  type,
  message,
}: {
  type: "loading" | "error";
  message: string;
}) {
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: "#050509" }}>
      {/* Ambient blobs */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-15 blur-[120px]"
        style={{ background: "oklch(0.488 0.243 264.376)" }}
      />
      <div className="relative z-10 flex flex-col items-center gap-4">
        {type === "loading" ? (
          <>
            <div
              className="h-12 w-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "oklch(0.623 0.214 259.815)", borderTopColor: "transparent" }}
            />
            <p className="text-sm font-medium" style={{ color: "oklch(0.708 0 0)" }}>{message}</p>
          </>
        ) : (
          <div
            className="rounded-2xl p-px max-w-sm w-full"
            style={{
              background: "linear-gradient(135deg, oklch(0.704 0.191 22.216 / 30%), oklch(0.704 0.191 22.216 / 8%))",
            }}
          >
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "oklch(0.145 0 0 / 95%)", backdropFilter: "blur(20px)" }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-4"
                style={{ background: "oklch(0.704 0.191 22.216 / 12%)" }}
              >
                <MapPin size={24} style={{ color: "oklch(0.704 0.191 22.216)" }} />
              </div>
              <h2 className="text-white font-bold text-lg mb-2">Location Error</h2>
              <p className="text-sm" style={{ color: "oklch(0.556 0 0)" }}>{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════ PAGE ════════════════════════════════
export default function MapView() {
  const [filters, setFilters] = useState<ParkingFilters>({ maxPrice: '', type: '', size: '' });
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Unable to get your location. Please enable location services.');
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (!driverLocation) return;
    fetchSpots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverLocation]);

  const fetchSpots = async () => {
    if (!driverLocation) return;
    setSpotsLoading(true);
    try {
      const params: any = { lat: driverLocation.lat, lng: driverLocation.lng };
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.type) params.type = filters.type;
      if (filters.size) params.size = filters.size;

      const response = await axios.get<{ success: boolean; spots: ParkingSpot[] }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/driver/search`,
        { params }
      );
      if (response.data.success) setSpots(response.data.spots);
    } catch (err) {
      console.error(err);
    } finally {
      setSpotsLoading(false);
    }
  };

  if (loading && !driverLocation) return <FullScreenState type="loading" message="Getting your location…" />;
  if (error && !driverLocation) return <FullScreenState type="error" message={error} />;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#050509" }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <div
        className="flex flex-col h-full transition-all duration-300 flex-shrink-0"
        style={{
          width: sidebarOpen ? "360px" : "0px",
          overflow: "hidden",
          borderRight: "1px solid oklch(1 0 0 / 8%)",
        }}
      >
        <div className="flex flex-col h-full w-[360px]">

          {/* Sidebar Header */}
          <div
            className="p-6 flex-shrink-0 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, oklch(0.145 0 0 / 95%) 0%, oklch(0.145 0 0 / 92%) 100%)",
              backdropFilter: "blur(30px)",
              borderBottom: "2px solid oklch(1 0 0 / 10%)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
            }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, oklch(1 0 0) 1px, transparent 0)",
              backgroundSize: "30px 30px"
            }} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 hover:rotate-3"
                  style={{ 
                    background: "linear-gradient(135deg, oklch(0.488 0.243 264.376 / 30%), oklch(0.623 0.214 259.815 / 20%))",
                    color: "oklch(0.809 0.105 251.813)",
                    boxShadow: "0 8px 20px rgba(74, 158, 173, 0.3), inset 0 1px 0 0 oklch(1 0 0 / 10%)"
                  }}
                >
                  <Navigation size={20} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight" style={{
                    background: "linear-gradient(135deg, oklch(0.87 0 0), oklch(0.809 0.105 251.813))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}>Find Parking</h2>
                  <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "oklch(0.708 0 0)" }}>
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "oklch(0.623 0.214 259.815)" }} />
                    Near your location
                  </p>
                </div>
              </div>

              {/* Filters Title - Collapsible */}
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="mb-4 flex items-center justify-between w-full group transition-all duration-200 hover:scale-[1.01] p-2 -m-2 rounded-xl"
                style={{
                  background: filtersExpanded ? "oklch(0.488 0.243 264.376 / 10%)" : "transparent"
                }}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} style={{ color: "oklch(0.809 0.105 251.813)" }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "oklch(0.809 0.105 251.813)" }}>Filters</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                    background: "oklch(0.488 0.243 264.376 / 20%)",
                    color: "oklch(0.809 0.105 251.813)"
                  }}>
                    {[filters.maxPrice, filters.type, filters.size].filter(Boolean).length} active
                  </span>
                  {filtersExpanded ? (
                    <ChevronUp size={16} style={{ color: "oklch(0.708 0 0)" }} className="transition-transform duration-200" />
                  ) : (
                    <ChevronDown size={16} style={{ color: "oklch(0.708 0 0)" }} className="transition-transform duration-200" />
                  )}
                </div>
              </button>

              {/* Filters - Collapsible */}
              <div
                className="transition-all duration-300 overflow-hidden"
                style={{
                  maxHeight: filtersExpanded ? "500px" : "0px",
                  opacity: filtersExpanded ? 1 : 0
                }}
              >
              <FieldGroup className="gap-4">
              {/* Max Price */}
              <Field>
                <FieldLabel className="text-xs font-bold flex items-center gap-2 mb-2" style={{ color: "oklch(0.708 0 0)" }}>
                  <div className="flex h-5 w-5 items-center justify-center rounded-lg" style={{ background: "oklch(0.708 0 0 / 10%)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  Max Price (₹/hr)
                </FieldLabel>
                <div className="relative group">
                  <Input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(p => ({ ...p, maxPrice: e.target.value }))}
                    placeholder="e.g., 50"
                    className="transition-all duration-300 focus:scale-[1.01] peer"
                    style={{
                      background: "linear-gradient(135deg, oklch(1 0 0 / 8%), oklch(1 0 0 / 6%))",
                      border: "2px solid oklch(1 0 0 / 10%)",
                      color: "white",
                      padding: "10px 14px",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 oklch(1 0 0 / 5%)",
                      borderRadius: "10px"
                    }}
                  />
                  <div className="absolute inset-0 rounded-xl opacity-0 peer-focus:opacity-100 transition-opacity pointer-events-none" style={{
                    boxShadow: "0 0 0 3px oklch(0.809 0.105 251.813 / 20%)"
                  }} />
                </div>
              </Field>

              {/* Type */}
              <Field>
                <FieldLabel className="text-xs font-bold flex items-center gap-2 mb-2" style={{ color: "oklch(0.708 0 0)" }}>
                  <div className="flex h-5 w-5 items-center justify-center rounded-lg" style={{ background: "oklch(0.708 0 0 / 10%)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  Parking Type
                </FieldLabel>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(v) => setFilters(p => ({ ...p, type: v === "all" ? "" : String(v || "") }))}
                >
                  <SelectTrigger
                    className="transition-all duration-300 hover:scale-[1.01]"
                    style={{
                      background: "linear-gradient(135deg, oklch(1 0 0 / 8%), oklch(1 0 0 / 6%))",
                      border: "2px solid oklch(1 0 0 / 10%)",
                      color: "white",
                      padding: "10px 14px",
                      height: "44px",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 oklch(1 0 0 / 5%)",
                      borderRadius: "10px"
                    }}
                  >
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="covered">Covered</SelectItem>
                    <SelectItem value="garage">Garage</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Size */}
              <Field>
                <FieldLabel className="text-xs font-bold flex items-center gap-2 mb-2" style={{ color: "oklch(0.708 0 0)" }}>
                  <div className="flex h-5 w-5 items-center justify-center rounded-lg" style={{ background: "oklch(0.708 0 0 / 10%)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                    </svg>
                  </div>
                  Spot Size
                </FieldLabel>
                <Select
                  value={filters.size || "all"}
                  onValueChange={(v) => setFilters(p => ({ ...p, size: v === "all" ? "" : String(v || "") }))}
                >
                  <SelectTrigger
                    className="transition-all duration-300 hover:scale-[1.01]"
                    style={{
                      background: "linear-gradient(135deg, oklch(1 0 0 / 8%), oklch(1 0 0 / 6%))",
                      border: "2px solid oklch(1 0 0 / 10%)",
                      color: "white",
                      padding: "10px 14px",
                      height: "44px",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 oklch(1 0 0 / 5%)",
                      borderRadius: "10px"
                    }}
                  >
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Button
                onClick={fetchSpots}
                disabled={spotsLoading}
                className="w-full font-bold mt-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, oklch(0.87 0 0), oklch(0.809 0.105 251.813))",
                  color: "oklch(0.145 0 0)",
                  height: "48px",
                  boxShadow: "0 4px 20px rgba(200, 200, 200, 0.3)",
                  borderRadius: "12px"
                }}
              >
                {spotsLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Searching…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal size={16} /> Apply Filters
                  </span>
                )}
              </Button>
            </FieldGroup>
            </div>
            </div>
          </div>

          {/* Spots list */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ 
            background: "linear-gradient(180deg, oklch(0.13 0 0 / 85%) 0%, oklch(0.13 0 0 / 75%) 100%)",
            minHeight: 0,
            height: 0,
            pointerEvents: "auto"
          }}>
            {/* Header - Fixed */}
            <div className="shrink-0 p-4 pb-3" style={{
              background: "oklch(0.13 0 0 / 95%)",
              backdropFilter: "blur(10px)",
              borderBottom: "2px solid oklch(1 0 0 / 8%)",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)"
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{
                    background: "oklch(0.488 0.243 264.376 / 15%)"
                  }}>
                    <MapPin size={14} style={{ color: "oklch(0.809 0.105 251.813)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Available Spots
                    </p>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block"
                      style={{ background: "oklch(0.488 0.243 264.376 / 20%)", color: "oklch(0.809 0.105 251.813)" }}
                    >
                      {spots.length} found
                    </span>
                  </div>
                </div>
                {spotsLoading && <Loader2 size={16} className="animate-spin" style={{ color: "oklch(0.623 0.214 259.815)" }} />}
              </div>
            </div>
            
            {/* Scrollable content area */}
            <div 
              className="flex-1 px-4 py-5 custom-scrollbar"
              style={{
                height: 0,
                scrollbarWidth: "thin",
                scrollbarColor: "oklch(0.623 0.214 259.815 / 50%) transparent",
                WebkitOverflowScrolling: "touch",
                pointerEvents: "auto",
                touchAction: "pan-y",
                overflowY: "scroll",
                overscrollBehavior: "contain",
                willChange: "scroll-position",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >

            {/* Empty state */}
            {!spotsLoading && spots.length === 0 && (
              <div
                className="rounded-2xl p-12 flex flex-col items-center text-center gap-5 animate-fade-in"
                style={{ 
                  background: "linear-gradient(135deg, oklch(1 0 0 / 6%), oklch(1 0 0 / 3%))",
                  border: "2px solid oklch(1 0 0 / 10%)",
                  boxShadow: "0 6px 25px rgba(0, 0, 0, 0.15), inset 0 2px 0 0 oklch(1 0 0 / 8%)",
                  position: "relative",
                  isolation: "isolate"
                }}
              >
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl relative"
                  style={{ 
                    background: "linear-gradient(135deg, oklch(0.488 0.243 264.376 / 25%), oklch(0.623 0.214 259.815 / 15%))",
                    boxShadow: "0 10px 25px rgba(74, 158, 173, 0.25)"
                  }}
                >
                  <MapPin size={32} style={{ color: "oklch(0.623 0.214 259.815)" }} className="animate-bounce" />
                  <div className="absolute inset-0 rounded-2xl" style={{
                    background: "linear-gradient(135deg, transparent, oklch(1 0 0 / 8%))"
                  }} />
                </div>
                <div>
                  <p className="text-white text-lg font-bold mb-2">No spots found</p>
                  <p className="text-xs" style={{ color: "oklch(0.556 0 0)" }}>Try adjusting your filters or search in a different area</p>
                </div>
              </div>
            )}

            {/* Spot cards */}
            {spots.map((spot, index) => (
              <div
                key={spot._id}
                onClick={() => setSelectedSpot(spot)}
                className={`cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 animate-fade-in ${
                  selectedSpot?._id === spot._id ? 'selected-card' : ''
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  position: "relative",
                  isolation: "isolate",
                  zIndex: selectedSpot?._id === spot._id ? 10 : 1
                }}
              >
                <div
                  className="rounded-2xl p-[2px] transition-all duration-300"
                  style={{
                    backgroundImage: selectedSpot?._id === spot._id
                      ? "linear-gradient(135deg, oklch(0.623 0.214 259.815), oklch(0.488 0.243 264.376 / 50%))"
                      : "linear-gradient(135deg, oklch(1 0 0 / 12%), oklch(1 0 0 / 6%))",
                    backgroundSize: "200% 200%",
                    position: "relative",
                    isolation: "isolate"
                  }}
                >
                  <div
                    className="rounded-2xl relative overflow-hidden"
                    style={{
                      background: selectedSpot?._id === spot._id
                        ? "linear-gradient(135deg, oklch(0.488 0.243 264.376 / 18%), oklch(0.623 0.214 259.815 / 10%))"
                        : "linear-gradient(180deg, oklch(0.145 0 0 / 95%) 0%, oklch(0.145 0 0 / 92%) 100%)",
                      backdropFilter: "blur(20px)",
                      boxShadow: selectedSpot?._id === spot._id
                        ? "0 10px 35px rgba(74, 158, 173, 0.45), inset 0 2px 0 0 oklch(1 0 0 / 12%)"
                        : "0 6px 20px rgba(0, 0, 0, 0.15), inset 0 2px 0 0 oklch(1 0 0 / 8%)",
                      position: "relative",
                      isolation: "isolate"
                    }}
                  >
                    {selectedSpot?._id === spot._id && (
                      <div 
                        className="absolute inset-0 pointer-events-none" 
                        style={{
                          background: "radial-gradient(circle at top right, oklch(0.623 0.214 259.815 / 25%), transparent 70%)",
                          opacity: 0.3,
                          mixBlendMode: "soft-light"
                        }} 
                      />
                    )}
                    <SpotCard spot={spot} isNearest={index === 0} onClick={() => setSelectedSpot(spot)} />
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Map area ─────────────────────────────────────────── */}
      <div className="flex-1 relative h-full">

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="absolute top-4 left-4 z-[1002] flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all"
          style={{
            background: "oklch(0.145 0 0 / 90%)",
            backdropFilter: "blur(12px)",
            border: "1px solid oklch(1 0 0 / 12%)",
          }}
        >
          <SlidersHorizontal size={14} style={{ color: "oklch(0.809 0.105 251.813)" }} />
          {sidebarOpen ? "Hide" : "Filters"}
        </button>

        {/* Map */}
        {driverLocation && (
          <MapComponent
            spots={spots}
            driverLocation={driverLocation}
            selectedSpot={selectedSpot}
            onSpotSelect={setSelectedSpot}
          />
        )}

        {/* ── Selected spot bottom bar ──────────────────────── */}
        {selectedSpot && (
          <div
            className="absolute bottom-0 left-0 right-0 z-[1001] p-px animate-fade-in"
            style={{
              background: "linear-gradient(to top, oklch(0.488 0.243 264.376 / 30%), transparent)",
              isolation: "isolate"
            }}
          >
            <div
              className="p-6"
              style={{
                background: "oklch(0.12 0 0 / 97%)",
                backdropFilter: "blur(30px)",
                borderTop: "2px solid oklch(1 0 0 / 12%)",
                boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.3)"
              }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                {/* Info */}
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-[10px] font-bold mb-1 uppercase tracking-wider" style={{ color: "oklch(0.556 0 0)" }}>Selected Spot</p>
                    <p className="text-white font-bold text-base">
                      {selectedSpot.address || selectedSpot.title}
                    </p>
                  </div>

                  <div
                    className="h-10 w-px hidden sm:block"
                    style={{ background: "oklch(1 0 0 / 12%)" }}
                  />

                  <div>
                    <p className="text-[10px] font-bold mb-1 uppercase tracking-wider" style={{ color: "oklch(0.556 0 0)" }}>Distance</p>
                    <p className="text-white font-bold text-base">
                      {selectedSpot.distance?.toFixed(1)} km
                    </p>
                  </div>

                  <div
                    className="h-10 w-px hidden sm:block"
                    style={{ background: "oklch(1 0 0 / 12%)" }}
                  />

                  <div>
                    <p className="text-[10px] font-bold mb-1 uppercase tracking-wider" style={{ color: "oklch(0.556 0 0)" }}>Price</p>
                    <p className="font-black text-base" style={{ color: "#22c55e" }}>
                      ₹{selectedSpot.pricePerHour}/hr
                    </p>
                  </div>

                  <div
                    className="h-10 w-px hidden sm:block"
                    style={{ background: "oklch(1 0 0 / 12%)" }}
                  />

                  <div>
                    <p className="text-[10px] font-bold mb-1 uppercase tracking-wider" style={{ color: "oklch(0.556 0 0)" }}>Type</p>
                    <p className="text-white font-bold text-base capitalize">{selectedSpot.type}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedSpot(null)}
                    className="rounded-full text-xs font-bold px-5 transition-all duration-200 hover:scale-105"
                    style={{
                      color: "oklch(0.556 0 0)",
                      height: "42px",
                      border: "2px solid oklch(1 0 0 / 12%)",
                    }}
                  >
                    Dismiss
                  </Button>
                  <Button
                    className="rounded-full px-7 font-bold text-sm transition-all duration-200 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.87 0 0), oklch(0.809 0.105 251.813))",
                      color: "oklch(0.145 0 0)",
                      height: "42px",
                      boxShadow: "0 4px 20px rgba(200, 200, 200, 0.3)"
                    }}
                    onClick={() => alert(`Booking ${selectedSpot.address || selectedSpot.title}`)}
                  >
                    Book This Spot
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

