"use client";

import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LocationPickerProps } from '@/types';

export default function LocationPicker({ onLocationSelect, initialPosition = null }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition);

  // Create icon on client side only
  const locationIcon = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    
    const L = require('leaflet');
    return L.divIcon({
      className: 'location-picker-marker',
      html: '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">📍</div>',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }, []);

  // Inner component to handle map clicks
  function ClickHandler() {
    useMapEvents({
      click(e) {
        const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPosition);
        
        // Call parent callback with coordinates
        if (onLocationSelect) {
          onLocationSelect({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          });
        }
      },
    });
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <MapContainer
          center={initialPosition || [22.5726, 88.3639]} // Kolkata coordinates as default
          zoom={13}
          style={{ height: '400px', width: '100%', borderRadius: '12px' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <ClickHandler />
          
          {/* Show marker at clicked position */}
          {position && (
            <Marker position={position} icon={locationIcon} />
          )}
        </MapContainer>

        {/* Instructions overlay */}
        <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-[#4A9EAD]/20 shadow-lg">
          <p className="text-sm font-medium">👆 Click on map to select location</p>
        </div>
      </div>

      {/* Selected coordinates display */}
      {position ? (
        <div className="bg-gradient-to-r from-[#4A9EAD]/10 to-[#5fbecc]/10 border border-[#4A9EAD]/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-[#4A9EAD] mb-2">📍 Selected Location:</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Latitude:</span>
              <p className="font-mono font-bold text-white">{position[0].toFixed(6)}</p>
            </div>
            <div>
              <span className="text-gray-400">Longitude:</span>
              <p className="font-mono font-bold text-white">{position[1].toFixed(6)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm text-yellow-400">
            ⚠️ Please click on the map to select your parking spot location
          </p>
        </div>
      )}
    </div>
  );
}
