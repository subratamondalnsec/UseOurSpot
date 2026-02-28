"use client";

import { ParkingSpot } from "@/types";

interface SpotCardProps {
  spot: ParkingSpot;
  isNearest?: boolean;
  onClick: () => void;
}

const typeIcon: Record<string, React.ReactNode> = {
  open: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  covered: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  garage: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
};

const sizeLabel: Record<string, string> = {
  small: "S",
  medium: "M",
  large: "L",
};

const sizeColor: Record<string, string> = {
  small: "#f59e0b",
  medium: "oklch(0.623 0.214 259.815)",
  large: "#a78bfa",
};

export default function SpotCard({ spot, isNearest, onClick }: SpotCardProps) {
  const isFree = spot.status === "free";
  const isApproved = spot.isApproved;

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.015] isolate"
      style={{
        background: "transparent",
        position: "relative",
        zIndex: 1
      }}
    >
      {/* Top row: title + price */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            {isNearest && (
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0 uppercase tracking-wide flex items-center gap-1.5 animate-pulse"
                style={{
                  background: "linear-gradient(135deg, oklch(0.488 0.243 264.376 / 30%), oklch(0.623 0.214 259.815 / 20%))",
                  color: "oklch(0.809 0.105 251.813)",
                  border: "1.5px solid oklch(0.623 0.214 259.815 / 50%)",
                  boxShadow: "0 4px 15px rgba(74, 158, 173, 0.3)"
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Nearest
              </span>
            )}
            {!isApproved && (
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 uppercase tracking-wide"
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#f59e0b",
                  border: "1.5px solid rgba(245, 158, 11, 0.3)",
                }}
              >
                Pending
              </span>
            )}
          </div>
          <p className="text-base font-bold text-white truncate leading-tight mb-1.5">
            {spot.title || spot.address}
          </p>
          {spot.title && (
            <p className="text-[11px] truncate flex items-center gap-1.5" style={{ color: "oklch(0.556 0 0)" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {spot.address}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex-shrink-0 text-center px-4 py-2.5 rounded-xl" style={{
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.08))",
          border: "2px solid rgba(34, 197, 94, 0.35)",
          boxShadow: "0 4px 15px rgba(34, 197, 94, 0.15)"
        }}>
          <p className="text-xl font-black leading-none" style={{ color: "#22c55e" }}>
            ₹{spot.pricePerHour}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "rgba(34, 197, 94, 0.8)" }}>/hour</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4" style={{ 
        height: "2px", 
        background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 12%), transparent)"
      }} />

      {/* Meta row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Type pill */}
          <span
            className="flex items-center gap-2 text-[11px] font-bold px-3.5 py-2 rounded-xl capitalize transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, oklch(0.488 0.243 264.376 / 22%), oklch(0.488 0.243 264.376 / 10%))",
              color: "oklch(0.809 0.105 251.813)",
              border: "2px solid oklch(0.623 0.214 259.815 / 35%)",
              boxShadow: "0 3px 12px rgba(74, 158, 173, 0.2)"
            }}
          >
            <span style={{ color: "oklch(0.809 0.105 251.813)" }}>
              {typeIcon[spot.type] ?? typeIcon.open}
            </span>
            {spot.type}
          </span>

          {/* Size badge */}
          <span
            className="flex items-center justify-center h-9 w-9 rounded-xl text-xs font-black transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${sizeColor[spot.size]}30, ${sizeColor[spot.size]}18)`,
              color: sizeColor[spot.size],
              border: `2px solid ${sizeColor[spot.size]}45`,
              boxShadow: `0 3px 12px ${sizeColor[spot.size]}25`
            }}
          >
            {sizeLabel[spot.size]}
          </span>

          {/* Distance */}
          {spot.distance !== undefined && (
            <span
              className="flex items-center gap-2 text-[11px] font-semibold px-3.5 py-2 rounded-xl"
              style={{
                background: "oklch(1 0 0 / 10%)",
                color: "oklch(0.708 0 0)",
                border: "2px solid oklch(1 0 0 / 15%)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {spot.distance.toFixed(1)} km
            </span>
          )}
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-2.5 flex-shrink-0 px-3.5 py-2 rounded-xl" style={{
          background: isFree ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
          border: `2px solid ${isFree ? "rgba(34, 197, 94, 0.35)" : "rgba(239, 68, 68, 0.35)"}`,
          boxShadow: `0 3px 12px ${isFree ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}`
        }}>
          <span
            className="h-2 w-2 rounded-full flex-shrink-0 animate-pulse"
            style={{
              background: isFree ? "#22c55e" : "#ef4444",
              boxShadow: `0 0 8px ${isFree ? "#22c55e" : "#ef4444"}`,
            }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: isFree ? "#22c55e" : "#ef4444" }}
          >
            {isFree ? "Free" : "Occupied"}
          </span>
        </div>
      </div>

      {/* Rating (if present) */}
      {spot.averageRating && (
        <div className="mt-4 pt-4 flex items-center gap-2.5" style={{
          borderTop: "2px solid oklch(1 0 0 / 8%)"
        }}>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill={star <= Math.round(spot.averageRating!) ? "#f59e0b" : "none"}
                stroke="#f59e0b"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span className="text-xs font-bold" style={{ color: "#f59e0b" }}>
            {spot.averageRating.toFixed(1)}
          </span>
          <span className="text-[10px] font-medium" style={{ color: "oklch(0.556 0 0)" }}>
            rating
          </span>
        </div>
      )}
      
      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" style={{
        boxShadow: "0 0 0 3px oklch(0.623 0.214 259.815 / 25%), 0 8px 24px rgba(74, 158, 173, 0.2)"
      }} />
    </div>
  );
}