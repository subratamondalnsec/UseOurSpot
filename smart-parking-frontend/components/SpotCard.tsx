"use client";

import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { SpotCardProps } from '@/types';

export default function SpotCard({ spot, isNearest = false, onClick }: SpotCardProps) {
  // Get type badge styling
  const getTypeBadgeClass = (type: string): string => {
    if (type === 'covered') {
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    }
    if (type === 'garage') {
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    }
    return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left bg-[#08090f] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 ${
        isNearest
          ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
          : 'border-[#4A9EAD]/20 hover:border-[#4A9EAD]/50'
      }`}
    >
      {/* Nearest Badge */}
      {isNearest && (
        <div className="absolute top-3 right-3 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
          🏆 Nearest Spot
        </div>
      )}

      {/* Spot Image */}
      <div className="relative h-48 w-full bg-gradient-to-br from-[#4A9EAD]/10 to-[#0a0d14]">
        {spot.photos && spot.photos.length > 0 ? (
          <Image
            src={spot.photos[0]}
            alt={spot.address || 'Parking spot'}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No image available</p>
            </div>
          </div>
        )}
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-3">
        {/* Address */}
        <h3 className="text-white font-bold text-lg line-clamp-2 leading-tight">
          {spot.address || spot.title || 'Parking Spot'}
        </h3>

        {/* Price and Distance Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-green-400">
              ₹{spot.pricePerHour}
            </span>
            <span className="text-gray-400 text-sm">/hr</span>
          </div>
          
          <div className="flex items-center gap-1 text-[#4A9EAD] font-semibold">
            <MapPin className="w-4 h-4" />
            <span>{spot.distance ? spot.distance.toFixed(1) : 'N/A'} km</span>
          </div>
        </div>

        {/* Type Badge and Rating */}
        <div className="flex items-center justify-between">
          {/* Type Badge */}
          {spot.type && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${getTypeBadgeClass(spot.type)}`}>
              {spot.type}
            </span>
          )}

          {/* Rating */}
          {spot.averageRating !== undefined && spot.averageRating > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span className="font-bold text-sm">
                {spot.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Size Badge (if available) */}
        {spot.size && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Size:</span>
            <span className="text-white font-semibold capitalize">{spot.size}</span>
          </div>
        )}

        {/* View on Map Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full bg-gradient-to-r from-[#4A9EAD] to-[#5fbecc] text-white font-bold py-3 px-6 rounded-xl hover:shadow-[0_8px_30px_rgba(74,158,173,0.5)] transition-all mt-2"
        >
          View on Map
        </button>
      </div>

      {/* Availability Badge (if status available) */}
      {spot.status && (
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
              spot.status === 'free'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            {spot.status === 'free' ? '✓ Available' : '✗ Occupied'}
          </span>
        </div>
      )}
    </button>
  );
}
