"use client";

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, GeoJSON } from 'react-leaflet';
import axios from 'axios';
import { getDriverIcon, getNearestSpotIcon, getSpotIcon } from '@/utils/mapIcons';
import { getRoute } from '@/utils/getRoute';
import { getDistanceKm } from '@/utils/getDistance';
import { MapComponentProps, ParkingSpot, Location, RouteData } from '@/types';

export default function MapComponent({ 
  spots: propSpots = null, 
  driverLocation: propDriverLocation = null,
  selectedSpot: propSelectedSpot = null,
  onSpotSelect = null,
}: MapComponentProps) {
  const [internalDriverLocation, setInternalDriverLocation] = useState<Location | null>(null);
  const [internalSpots, setInternalSpots] = useState<ParkingSpot[]>([]);
  const [internalSelectedSpot, setInternalSelectedSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  // Create icons on client side only
  const driverIcon = useMemo(() => getDriverIcon(), []);
  const nearestSpotIcon = useMemo(() => getNearestSpotIcon(), []);
  const spotIcon = useMemo(() => getSpotIcon(), []);

  // Use props if provided, otherwise use internal state
  const driverLocation = propDriverLocation || internalDriverLocation;
  const spots = propSpots || internalSpots;
  const selectedSpot = propSelectedSpot ?? internalSelectedSpot;
  const setSelectedSpot = onSpotSelect || setInternalSelectedSpot;

  // Get driver location on component mount (only if not provided via props)
  useEffect(() => {
    if (propDriverLocation) {
      setLoading(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location: Location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setInternalDriverLocation(location);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, [propDriverLocation]);

  // Fetch parking spots once driver location is available (only if spots not provided via props)
  useEffect(() => {
    if (propSpots !== null || !driverLocation) return;

    const fetchSpots = async () => {
      try {
        const response = await axios.get<{ success: boolean; spots: ParkingSpot[] }>(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/driver/search`,
          {
            params: {
              lat: driverLocation.lat,
              lng: driverLocation.lng,
            },
          }
        );

        if (response.data.success) {
          setInternalSpots(response.data.spots);
        }
      } catch (err) {
        console.error('Error fetching parking spots:', err);
        setError('Failed to load parking spots.');
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, [driverLocation, propSpots]);

  // Fetch route when selectedSpot changes
  useEffect(() => {
    if (!selectedSpot || !driverLocation) {
      setRouteData(null);
      return;
    }

    const fetchRoute = async () => {
      try {
        // Check if selectedSpot has coordinates in the correct format
        const spotLat = selectedSpot.location?.coordinates?.[1] || (selectedSpot as any).coordinates?.lat;
        const spotLng = selectedSpot.location?.coordinates?.[0] || (selectedSpot as any).coordinates?.lng;

        if (!spotLat || !spotLng) {
          console.error('Invalid spot coordinates');
          return;
        }

        const result = await getRoute(
          driverLocation.lat,
          driverLocation.lng,
          spotLat,
          spotLng
        );
        setRouteData(result);
      } catch (err) {
        console.error('Error fetching route:', err);
        setRouteData(null);
      }
    };

    fetchRoute();
  }, [selectedSpot, driverLocation]);

  // Real-time GPS tracking (only when not using prop driver location)
  useEffect(() => {
    if (!navigator.geolocation || !driverLocation || propDriverLocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;

        // Update internal driver location state
        setInternalDriverLocation({ lat: newLat, lng: newLng });

        // If a spot is selected, update route
        if (selectedSpot) {
          const spotLat = selectedSpot.location?.coordinates?.[1] || (selectedSpot as any).coordinates?.lat;
          const spotLng = selectedSpot.location?.coordinates?.[0] || (selectedSpot as any).coordinates?.lng;

          if (spotLat && spotLng) {
            getRoute(newLat, newLng, spotLat, spotLng)
              .then(result => {
                setRouteData(result);
              })
              .catch(err => {
                console.error('Error updating route:', err);
              });

            // Check if driver reached the spot (within 50 meters)
            const dist = getDistanceKm(newLat, newLng, spotLat, spotLng);

            if (dist < 0.05) {
              alert('✅ You have arrived at the parking spot!');
              navigator.geolocation.clearWatch(watchId);
            }
          }
        }
      },
      (error) => {
        console.error('Geolocation watch error:', error);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [selectedSpot, driverLocation, propDriverLocation]);

  // Get spot coordinates in [lat, lng] format
  const getSpotPosition = (spot: ParkingSpot): [number, number] => {
    if (spot.location?.coordinates) {
      return [spot.location.coordinates[1], spot.location.coordinates[0]];
    }
    // Fallback to coordinates property if available
    const coords = (spot as any).coordinates;
    if (coords?.lat && coords?.lng) {
      return [coords.lat, coords.lng];
    }
    return [0, 0];
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#050509] to-[#0a0d14]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4A9EAD] mb-4"></div>
          <p className="text-white text-lg font-semibold">Getting your location...</p>
          <p className="text-gray-400 text-sm mt-2">Please allow location access</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#050509] to-[#0a0d14]">
        <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  // No driver location
  if (!driverLocation) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[driverLocation.lat, driverLocation.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Driver Location Marker */}
        <Marker
          position={[driverLocation.lat, driverLocation.lng]}
          icon={driverIcon}
        />

        {/* Route Line */}
        {routeData && routeData.geometry && (
          <GeoJSON
            key={JSON.stringify(routeData.geometry)}
            data={routeData.geometry}
            style={{ color: '#3b82f6', weight: 5, opacity: 0.8 }}
          />
        )}

        {/* Parking Spot Markers */}
        {spots.map((spot, index) => {
          const position = getSpotPosition(spot);
          return (
            <Marker
              key={spot._id}
              position={position}
              icon={index === 0 ? nearestSpotIcon : spotIcon}
              eventHandlers={{
                click: () => setSelectedSpot(spot),
              }}
            />
          );
        })}
      </MapContainer>

      {/* Route Info Bar */}
      {routeData && (
        <div className="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-md text-white p-4 rounded-2xl border border-blue-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-blue-400">📍 Route Info</h3>
            <div className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />{' '}
              Updating
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center justify-between gap-4">
              <span className="text-gray-400">Distance:</span>
              <span className="font-bold text-white">
                {(routeData.distance / 1000).toFixed(1)} km
              </span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className="text-gray-400">ETA:</span>
              <span className="font-bold text-green-400">
                {Math.ceil(routeData.duration / 60)} min
              </span>
            </p>
            
            {/* Proximity Alert */}
            {routeData.distance < 500 && (
              <div className="mt-3 pt-3 border-t border-blue-500/20">
                <p className="text-xs text-yellow-400 font-bold animate-pulse">
                  🎯 Almost there! &lt; {Math.round(routeData.distance)}m away
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
