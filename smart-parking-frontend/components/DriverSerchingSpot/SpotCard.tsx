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
      className="group relative rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: "oklch(1 0 0 / 4%)",
        border: "1px solid oklch(1 0 0 / 8%)",
      }}
    >
      {/* Top row: title + price */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {isNearest && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: "oklch(0.488 0.243 264.376 / 20%)",
                  color: "oklch(0.809 0.105 251.813)",
                  border: "1px solid oklch(0.623 0.214 259.815 / 30%)",
                }}
              >
                Nearest
              </span>
            )}
            {!isApproved && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: "#f59e0b18",
                  color: "#f59e0b",
                  border: "1px solid #f59e0b30",
                }}
              >
                Pending
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-white truncate leading-snug">
            {spot.title || spot.address}
          </p>
          {spot.title && (
            <p className="text-xs truncate mt-0.5" style={{ color: "oklch(0.556 0 0)" }}>
              {spot.address}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex-shrink-0 text-right">
          <p className="text-base font-bold" style={{ color: "#22c55e" }}>
            ₹{spot.pricePerHour}
          </p>
          <p className="text-[10px]" style={{ color: "oklch(0.556 0 0)" }}>/hr</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-3" style={{ height: "1px", background: "oklch(1 0 0 / 6%)" }} />

      {/* Meta row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Type pill */}
          <span
            className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg capitalize"
            style={{
              background: "oklch(0.488 0.243 264.376 / 12%)",
              color: "oklch(0.708 0 0)",
              border: "1px solid oklch(1 0 0 / 8%)",
            }}
          >
            <span style={{ color: "oklch(0.809 0.105 251.813)" }}>
              {typeIcon[spot.type] ?? typeIcon.open}
            </span>
            {spot.type}
          </span>

          {/* Size badge */}
          <span
            className="flex items-center justify-center h-6 w-6 rounded-lg text-[11px] font-bold"
            style={{
              background: sizeColor[spot.size] + "18",
              color: sizeColor[spot.size],
              border: `1px solid ${sizeColor[spot.size]}30`,
            }}
          >
            {sizeLabel[spot.size]}
          </span>

          {/* Distance */}
          {spot.distance !== undefined && (
            <span
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg"
              style={{
                background: "oklch(1 0 0 / 5%)",
                color: "oklch(0.708 0 0)",
                border: "1px solid oklch(1 0 0 / 8%)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {spot.distance.toFixed(1)} km
            </span>
          )}
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{
              background: isFree ? "#22c55e" : "#ef4444",
              boxShadow: `0 0 6px ${isFree ? "#22c55e" : "#ef4444"}`,
            }}
          />
          <span
            className="text-[11px] font-medium"
            style={{ color: isFree ? "#22c55e" : "#ef4444" }}
          >
            {isFree ? "Free" : "Occupied"}
          </span>
        </div>
      </div>

      {/* Rating (if present) */}
      {spot.averageRating && (
        <div className="mt-2.5 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill={star <= Math.round(spot.averageRating!) ? "#f59e0b" : "none"}
              stroke="#f59e0b"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span className="text-[10px] ml-1" style={{ color: "oklch(0.556 0 0)" }}>
            {spot.averageRating.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}