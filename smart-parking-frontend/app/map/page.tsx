"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import SpotCard from '@/components/SpotCard';
import { Navigation, SlidersHorizontal, MapPin, Loader2 } from 'lucide-react';
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

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
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
            className="p-6 flex-shrink-0"
            style={{
              background: "oklch(0.145 0 0 / 92%)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid oklch(1 0 0 / 8%)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "oklch(0.488 0.243 264.376 / 15%)", color: "oklch(0.809 0.105 251.813)" }}
              >
                <Navigation size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Find Parking</h2>
                <p className="text-xs" style={{ color: "oklch(0.556 0 0)" }}>Near your location</p>
              </div>
            </div>

            {/* Filters */}
            <FieldGroup className="gap-4">
              {/* Max Price */}
              <Field>
                <FieldLabel className="text-xs font-medium" style={{ color: "oklch(0.708 0 0)" }}>
                  Max Price (₹/hr)
                </FieldLabel>
                <Input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(p => ({ ...p, maxPrice: e.target.value }))}
                  placeholder="e.g., 50"
                  className="mt-1.5"
                  style={{
                    background: "oklch(1 0 0 / 6%)",
                    border: "1px solid oklch(1 0 0 / 10%)",
                    color: "white",
                  }}
                />
              </Field>

              {/* Type */}
              <Field>
                <FieldLabel className="text-xs font-medium" style={{ color: "oklch(0.708 0 0)" }}>
                  Parking Type
                </FieldLabel>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(v) => setFilters(p => ({ ...p, type: v === "all" ? "" : String(v || "") }))}
                >
                  <SelectTrigger
                    className="mt-1.5"
                    style={{
                      background: "oklch(1 0 0 / 6%)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      color: "white",
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
                <FieldLabel className="text-xs font-medium" style={{ color: "oklch(0.708 0 0)" }}>
                  Spot Size
                </FieldLabel>
                <Select
                  value={filters.size || "all"}
                  onValueChange={(v) => setFilters(p => ({ ...p, size: v === "all" ? "" : String(v || "") }))}
                >
                  <SelectTrigger
                    className="mt-1.5"
                    style={{
                      background: "oklch(1 0 0 / 6%)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      color: "white",
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
                className="w-full font-semibold mt-1"
                style={{
                  background: "oklch(0.87 0 0)",
                  color: "oklch(0.145 0 0)",
                  height: "40px",
                }}
              >
                {spotsLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Searching…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal size={14} /> Apply Filters
                  </span>
                )}
              </Button>
            </FieldGroup>
          </div>

          {/* Spots list */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ background: "oklch(0.13 0 0 / 80%)" }}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm font-semibold text-white">
                Available Spots
                <span
                  className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{ background: "oklch(0.488 0.243 264.376 / 15%)", color: "oklch(0.809 0.105 251.813)" }}
                >
                  {spots.length}
                </span>
              </p>
              {spotsLoading && <Loader2 size={14} className="animate-spin" style={{ color: "oklch(0.623 0.214 259.815)" }} />}
            </div>

            {/* Empty state */}
            {!spotsLoading && spots.length === 0 && (
              <div
                className="rounded-xl p-8 flex flex-col items-center text-center gap-3"
                style={{ background: "oklch(1 0 0 / 3%)", border: "1px solid oklch(1 0 0 / 7%)" }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: "oklch(0.488 0.243 264.376 / 12%)" }}
                >
                  <MapPin size={22} style={{ color: "oklch(0.623 0.214 259.815)" }} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">No spots found</p>
                  <p className="text-xs mt-1" style={{ color: "oklch(0.556 0 0)" }}>Try adjusting your filters</p>
                </div>
              </div>
            )}

            {/* Spot cards */}
            {spots.map((spot, index) => (
              <div
                key={spot._id}
                onClick={() => setSelectedSpot(spot)}
                className="cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <div
                  className="rounded-2xl p-px"
                  style={{
                    background: selectedSpot?._id === spot._id
                      ? "linear-gradient(135deg, oklch(0.623 0.214 259.815 / 60%), oklch(0.488 0.243 264.376 / 20%))"
                      : "linear-gradient(135deg, oklch(1 0 0 / 8%), oklch(1 0 0 / 3%))",
                  }}
                >
                  <div
                    className="rounded-2xl"
                    style={{
                      background: selectedSpot?._id === spot._id
                        ? "oklch(0.488 0.243 264.376 / 10%)"
                        : "oklch(0.145 0 0 / 90%)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <SpotCard spot={spot} isNearest={index === 0} onClick={() => setSelectedSpot(spot)} />
                  </div>
                </div>
              </div>
            ))}
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
            className="absolute bottom-0 left-0 right-0 z-[1001] p-px"
            style={{
              background: "linear-gradient(to top, oklch(0.488 0.243 264.376 / 25%), transparent)",
            }}
          >
            <div
              className="p-5"
              style={{
                background: "oklch(0.12 0 0 / 95%)",
                backdropFilter: "blur(24px)",
                borderTop: "1px solid oklch(1 0 0 / 10%)",
              }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Info */}
                <div className="flex flex-wrap items-center gap-5">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "oklch(0.556 0 0)" }}>Selected Spot</p>
                    <p className="text-white font-semibold text-sm">
                      {selectedSpot.address || selectedSpot.title}
                    </p>
                  </div>

                  <div
                    className="h-8 w-px hidden sm:block"
                    style={{ background: "oklch(1 0 0 / 10%)" }}
                  />

                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "oklch(0.556 0 0)" }}>Distance</p>
                    <p className="text-white font-semibold text-sm">
                      {selectedSpot.distance?.toFixed(1)} km
                    </p>
                  </div>

                  <div
                    className="h-8 w-px hidden sm:block"
                    style={{ background: "oklch(1 0 0 / 10%)" }}
                  />

                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "oklch(0.556 0 0)" }}>Price</p>
                    <p className="font-bold text-sm" style={{ color: "#22c55e" }}>
                      ₹{selectedSpot.pricePerHour}/hr
                    </p>
                  </div>

                  <div
                    className="h-8 w-px hidden sm:block"
                    style={{ background: "oklch(1 0 0 / 10%)" }}
                  />

                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "oklch(0.556 0 0)" }}>Type</p>
                    <p className="text-white font-semibold text-sm capitalize">{selectedSpot.type}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedSpot(null)}
                    className="rounded-full text-xs px-4"
                    style={{
                      color: "oklch(0.556 0 0)",
                      height: "38px",
                      border: "1px solid oklch(1 0 0 / 10%)",
                    }}
                  >
                    Dismiss
                  </Button>
                  <Button
                    className="rounded-full px-6 font-semibold text-sm"
                    style={{
                      background: "oklch(0.87 0 0)",
                      color: "oklch(0.145 0 0)",
                      height: "38px",
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

