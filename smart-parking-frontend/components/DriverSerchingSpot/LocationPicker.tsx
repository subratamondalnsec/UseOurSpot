"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { LocationPickerProps, ParkingSpot } from '@/types';
import { getDistanceKm } from '@/utils/getDistance';
import { getSpotIcon } from '@/utils/mapIcons';

export default function LocationPicker({ onLocationSelect, initialPosition = null }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null); // User's current GPS location
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbySpots, setNearbySpots] = useState<ParkingSpot[]>([]);
  const [loadingSpots, setLoadingSpots] = useState(false);
  const mapRef = useRef<any>(null);

  // Create icon on client side only - enhanced selected location pin
  const locationIcon = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    
    const L = require('leaflet');
    return L.divIcon({
      className: 'location-picker-marker',
      html: `
        <style>
          @keyframes pin-drop {
            0% { transform: translateY(-100px); opacity: 0; }
            50% { transform: translateY(5px); }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes pin-glow {
            0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 68, 68, 0.8)); }
            50% { filter: drop-shadow(0 0 20px rgba(255, 68, 68, 1)); }
          }
          .location-pin {
            animation: pin-drop 0.6s ease-out, pin-glow 2s infinite;
          }
        </style>
        <div class="location-pin" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 44px;">📍</div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50],
    });
  }, []);

  // Create human icon for current location with pulsing effect
  const humanIcon = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    
    const L = require('leaflet');
    return L.divIcon({
      className: 'human-location-marker',
      html: `
        <style>
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.6; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .pulse-ring {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 3px solid #4A9EAD;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: pulse-ring 2s infinite;
          }
          .human-marker {
            animation: bounce 2s ease-in-out infinite;
          }
        </style>
        <div style="width: 100%; height: 100%; position: relative;">
          <div class="pulse-ring"></div>
          <div class="pulse-ring" style="animation-delay: 0.5s;"></div>
          <div class="pulse-ring" style="animation-delay: 1s;"></div>
          <div class="human-marker" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center;">
            <div style="font-size: 32px; filter: drop-shadow(0 4px 8px rgba(74, 158, 173, 0.6));">🧍</div>
            <div style="width: 16px; height: 16px; background: linear-gradient(135deg, #4A9EAD, #5fbecc); border: 4px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(74, 158, 173, 0.8), 0 0 20px rgba(74, 158, 173, 0.4); margin-top: -10px;"></div>
          </div>
        </div>
      `,
      iconSize: [80, 80],
      iconAnchor: [40, 60],
      popupAnchor: [0, -60],
    });
  }, []);

  // Create parking spot icon
  const parkingSpotIcon = useMemo(() => getSpotIcon(), []);

  // Fetch nearby parking spots
  const fetchNearbySpots = async (lat: number, lng: number) => {
    setLoadingSpots(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/driver/search`,
        {
          params: { lat, lng },
          withCredentials: true,
        }
      );

      if (response.data.success && response.data.spots) {
        // Calculate distance for each spot and filter out spots without valid coordinates
        const spotsWithDistance = response.data.spots
          .filter((spot: ParkingSpot) => 
            spot.location && 
            spot.location.coordinates && 
            Array.isArray(spot.location.coordinates) &&
            spot.location.coordinates.length === 2
          )
          .map((spot: ParkingSpot) => ({
            ...spot,
            distance: getDistanceKm(
              lat,
              lng,
              spot.location.coordinates[1],
              spot.location.coordinates[0]
            ),
          }));
        setNearbySpots(spotsWithDistance);
      }
    } catch (error) {
      console.error('Error fetching nearby spots:', error);
      setNearbySpots([]);
    } finally {
      setLoadingSpots(false);
    }
  };

  // Fetch spots when position changes
  useEffect(() => {
    if (position) {
      fetchNearbySpots(position[0], position[1]);
    }
  }, [position]);

  // Function to get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        
        // Set as current location (human icon)
        setCurrentLocation(newPosition);
        
        // Also set as selected position
        setPosition(newPosition);
        setLoadingLocation(false);

        // Call parent callback with coordinates
        if (onLocationSelect) {
          onLocationSelect({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }

        // Center map on user's location
        if (mapRef.current) {
          mapRef.current.flyTo(newPosition, 15);
        }
      },
      (error) => {
        setLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Please allow location access to use this feature');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('An unknown error occurred');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Inner component to handle map clicks
  function ClickHandler() {
    const map = useMapEvents({
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
    
    // Store map reference
    if (!mapRef.current) {
      mapRef.current = map;
    }
    
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Get Current Location Button */}
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={loadingLocation}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg"
        style={{
          background: currentLocation 
            ? "linear-gradient(135deg, oklch(0.488 0.243 264.376 / 25%), oklch(0.623 0.214 259.815 / 20%))"
            : "linear-gradient(135deg, oklch(0.488 0.243 264.376 / 20%), oklch(0.623 0.214 259.815 / 15%))",
          border: currentLocation 
            ? "2px solid oklch(0.623 0.214 259.815)"
            : "2px solid oklch(0.623 0.214 259.815 / 60%)",
          color: "oklch(0.809 0.105 251.813)",
          boxShadow: currentLocation 
            ? "0 4px 20px rgba(74, 158, 173, 0.4)" 
            : "0 2px 10px rgba(74, 158, 173, 0.2)",
        }}
      >
        {loadingLocation ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span>Getting location...</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{currentLocation ? '✓ Location Tracked' : 'Use My Current Location'}</span>
          </>
        )}
      </button>

      {/* Location Error */}
      {locationError && (
        <div className="bg-red-500/15 border-2 border-red-500/40 rounded-lg p-4 shadow-lg shadow-red-500/20 backdrop-blur-sm">
          <p className="text-sm text-red-400 font-medium flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            {locationError}
          </p>
        </div>
      )}

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
          
          {/* Show highlight circle and human icon at current location */}
          {currentLocation && (
            <>
              {/* Accuracy circle around current location */}
              <Circle
                center={currentLocation}
                radius={100}
                pathOptions={{
                  fillColor: '#4A9EAD',
                  fillOpacity: 0.15,
                  color: '#4A9EAD',
                  weight: 2,
                  opacity: 0.6,
                }}
              />
              {/* Human marker */}
              <Marker position={currentLocation} icon={humanIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">🧍 Your Current Location</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Lat: {currentLocation[0].toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Lng: {currentLocation[1].toFixed(6)}
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      📍 You are here!
                    </p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
          
          {/* Show marker at clicked/selected position */}
          {position && (
            <Marker position={position} icon={locationIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Selected Location</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {position[0].toFixed(6)}, {position[1].toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Show nearby parking spots */}
          {nearbySpots.map((spot) => {
            // Safety check for coordinates
            if (!spot.location?.coordinates || spot.location.coordinates.length !== 2) {
              return null;
            }
            
            const spotLat = spot.location.coordinates[1];
            const spotLng = spot.location.coordinates[0];
            
            return (
              <Marker
                key={spot._id}
                position={[spotLat, spotLng]}
                icon={parkingSpotIcon}
                eventHandlers={{
                  click: () => {
                    // When clicking a spot marker, set it as the selected position
                    const newPosition: [number, number] = [spotLat, spotLng];
                    setPosition(newPosition);
                    
                    if (onLocationSelect) {
                      onLocationSelect({
                        lat: spotLat,
                        lng: spotLng,
                      });
                    }

                    // Center map on selected spot
                    if (mapRef.current) {
                      mapRef.current.flyTo(newPosition, 15);
                    }
                  },
                }}
              >
                <Popup>
                  <div className="text-sm" style={{ minWidth: '200px' }}>
                    <p className="font-semibold text-gray-900">{spot.title || spot.address}</p>
                    <p className="text-xs text-gray-600 mt-1">{spot.address}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs">
                        <span className="font-medium">Type:</span> {spot.type}
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">Size:</span> {spot.size}
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">Price:</span> ₹{spot.pricePerHour}/hr
                      </p>
                      {spot.distance && (
                        <p className="text-xs font-medium text-blue-600">
                          📍 {spot.distance.toFixed(2)} km away
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newPosition: [number, number] = [spotLat, spotLng];
                        setPosition(newPosition);
                        
                        if (onLocationSelect) {
                          onLocationSelect({
                            lat: spotLat,
                            lng: spotLng,
                          });
                        }
                      }}
                      className="mt-2 w-full px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Select This Location
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Instructions overlay */}
        <div className="absolute top-4 left-4 z-[1000] bg-black/90 backdrop-blur-md text-white px-4 py-3 rounded-lg border-2 border-[#4A9EAD]/40 shadow-xl shadow-[#4A9EAD]/20 max-w-xs">
          <p className="text-sm font-semibold">👆 Click on map or parking spot to select location</p>
          {currentLocation && (
            <p className="text-xs text-gray-300 mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                🧍 = Your location
              </span>
              <span>|</span>
              <span>📍 = Selected spot</span>
            </p>
          )}
        </div>

        {/* Loading overlay for spots */}
        {loadingSpots && (
          <div className="absolute top-24 left-4 z-[1000] bg-blue-600/90 backdrop-blur-md text-white px-4 py-2.5 rounded-lg shadow-xl shadow-blue-500/30 border-2 border-blue-400/50">
            <p className="text-sm font-semibold flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Loading nearby spots...
            </p>
          </div>
        )}
      </div>

      {/* Selected coordinates display */}
      {position ? (
        <div className="space-y-3">
          {/* Current Location Display */}
          {currentLocation && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-400/50 rounded-lg p-4 shadow-lg shadow-green-500/20 backdrop-blur-sm">
              <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <span className="text-xl">🧍</span>
                <span>Your Current Location</span>
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Latitude:</span>
                  <p className="font-mono font-bold text-white">{currentLocation[0].toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Longitude:</span>
                  <p className="font-mono font-bold text-white">{currentLocation[1].toFixed(6)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-green-300">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span>Live location tracked</span>
              </div>
            </div>
          )}
          
          {/* Selected Location Display */}
          <div className="bg-gradient-to-r from-[#4A9EAD]/20 to-[#5fbecc]/20 border-2 border-[#4A9EAD]/60 rounded-lg p-4 shadow-lg shadow-[#4A9EAD]/20 backdrop-blur-sm">
            <p className="text-sm font-semibold text-[#4A9EAD] mb-2 flex items-center gap-2">
              <span className="text-xl">📍</span>
              <span>Selected Parking Spot Location</span>
            </p>
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
            {nearbySpots.length > 0 && (
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
                <span className="text-base">🅿️</span>
                Found {nearbySpots.length} nearby parking spot{nearbySpots.length !== 1 ? 's' : ''} - Click any spot marker to select its location
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/15 border-2 border-yellow-500/40 rounded-lg p-4 shadow-lg shadow-yellow-500/20 backdrop-blur-sm">
          <p className="text-sm text-yellow-400 font-medium flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>Please click on the map to select your parking spot location</span>
          </p>
        </div>
      )}
    </div>
  );
}
