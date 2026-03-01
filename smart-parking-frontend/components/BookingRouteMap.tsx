'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { getRoute } from '@/utils/getRoute';
import { getCarIcon, getSpotIcon } from '@/utils/mapIcons';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

interface BookingRouteMapProps {
  readonly carLocation: { lat: number; lng: number };
  readonly spotLocation: { lat: number; lng: number };
  readonly spotAddress: string;
}

export default function BookingRouteMap({
  carLocation,
  spotLocation,
  spotAddress,
}: BookingRouteMapProps) {
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [carIcon, setCarIcon] = useState<any>(null);
  const [spotIconMarker, setSpotIconMarker] = useState<any>(null);

  // Load icons client-side
  useEffect(() => {
    if (globalThis.window !== undefined) {
      setCarIcon(getCarIcon());
      setSpotIconMarker(getSpotIcon());
    }
  }, []);

  // Fetch route
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const route = await getRoute(
          carLocation.lat,
          carLocation.lng,
          spotLocation.lat,
          spotLocation.lng,
          'driving'
        );
        setRouteData(route);
      } catch (error) {
        console.error('Failed to fetch route:', error);
      } finally {
        setLoading(false);
      }
    };

    if (carLocation && spotLocation) {
      fetchRoute();
    }
  }, [carLocation, spotLocation]);

  // Calculate center (midpoint)
  const centerLat = (carLocation.lat + spotLocation.lat) / 2;
  const centerLng = (carLocation.lng + spotLocation.lng) / 2;

  // Calculate distance in km
  const distance = routeData
    ? (routeData.distance / 1000).toFixed(2)
    : '—';

  // Calculate duration in minutes
  const duration = routeData
    ? Math.ceil(routeData.duration / 60)
    : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-75">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'oklch(0.623 0.214 259.815)' }} />
          <p className="text-sm" style={{ color: 'oklch(0.556 0 0)' }}>Loading route...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="h-100 rounded-xl overflow-hidden border-2" 
        style={{ borderColor: 'oklch(1 0 0 / 12%)' }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Car Location Marker */}
          {carIcon && (
            <Marker position={[carLocation.lat, carLocation.lng]} icon={carIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Your Car Location</p>
                  <p className="text-xs text-gray-600">Parked here</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Parking Spot Marker */}
          {spotIconMarker && (
            <Marker position={[spotLocation.lat, spotLocation.lng]} icon={spotIconMarker}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Parking Spot</p>
                  <p className="text-xs text-gray-600">{spotAddress}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Line */}
          {routeData?.geometry && (
            <GeoJSON
              data={routeData.geometry}
              style={{
                color: '#10b981',
                weight: 4,
                opacity: 0.8,
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Route Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'oklch(1 0 0 / 4%)', border: '1px solid oklch(1 0 0 / 8%)' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
            style={{ background: '#10b98118', color: '#10b981' }}>
            <Navigation size={20} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'oklch(0.556 0 0)' }}>Distance</p>
            <p className="text-white font-bold text-lg">{distance} km</p>
          </div>
        </div>

        <div className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'oklch(1 0 0 / 4%)', border: '1px solid oklch(1 0 0 / 8%)' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
            style={{ background: 'oklch(0.623 0.214 259.815 / 18%)', color: 'oklch(0.809 0.105 251.813)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'oklch(0.556 0 0)' }}>Drive Time</p>
            <p className="text-white font-bold text-lg">~{duration} min</p>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 p-3 rounded-lg"
          style={{ background: 'oklch(1 0 0 / 4%)' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5"
            style={{ background: '#ef444418', color: '#ef4444' }}>
            🚗
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: 'oklch(0.708 0 0)' }}>Car Parked At</p>
            <p className="text-white text-sm mt-0.5">
              {carLocation.lat.toFixed(6)}, {carLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg"
          style={{ background: 'oklch(1 0 0 / 4%)' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5"
            style={{ background: 'oklch(0.488 0.243 264.376 / 18%)', color: 'oklch(0.809 0.105 251.813)' }}>
            <MapPin size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: 'oklch(0.708 0 0)' }}>Parking Spot</p>
            <p className="text-white text-sm mt-0.5 line-clamp-2">{spotAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
