'use client';

import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { bookingAPI } from '@/utils/api';
import { useLocation } from '@/hooks/useLocation';
import { getRoute } from '@/utils/getRoute';
import { Car, Navigation, Footprints, Clock, Loader2, ArrowLeft, MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { Booking } from '@/types';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(m => m.GeoJSON), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

// ── Loading screen ─────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#060810]">
      {/* Background orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative flex flex-col items-center gap-8">
        {/* Spinner ring */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg className="absolute inset-0 animate-spin" viewBox="0 0 96 96" fill="none">
            <circle cx="48" cy="48" r="44" stroke="rgba(16,185,129,0.15)" strokeWidth="2" />
            <path d="M48 4 A44 44 0 0 1 92 48" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <Car className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-base font-bold text-white tracking-tight">Finding your car</p>
          <p className="text-xs text-white/30">Fetching GPS location…</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-400/40"
              style={{ animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── No location screen ─────────────────────────────────────────
function NoLocationScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#060810]">
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.8) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-6 px-6 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-3xl opacity-20 animate-pulse"
            style={{ background: 'rgba(239,68,68,0.4)' }} />
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Car className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Location Unavailable</h2>
          <p className="text-sm text-white/35 leading-relaxed">No car location was saved for this booking session.</p>
        </div>

        <button onClick={onBack}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function FindMyCarPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const { location } = useLocation();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [walkingDistance, setWalkingDistance] = useState('');
  const [walkingMinutes, setWalkingMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [carIcon, setCarIcon] = useState<any>(null);
  const [driverIcon, setDriverIcon] = useState<any>(null);
  const [panelExpanded, setPanelExpanded] = useState(true);

  useEffect(() => {
    bookingAPI.findMyCar(bookingId)
      .then(res => setBooking(res.data.booking || res.data))
      .catch(err => console.error('Failed to fetch booking:', err))
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/utils/mapIcons').then(({ getCarIcon, getDriverIcon }) => {
        setCarIcon(getCarIcon());
        setDriverIcon(getDriverIcon());
      });
    }
  }, []);

  useEffect(() => {
    if (!booking?.carLocation || !location) return;
    getRoute(location.lat, location.lng, booking.carLocation.lat, booking.carLocation.lng, 'walking')
      .then(route => {
        if (route) {
          setRouteData(route.geometry);
          setWalkingDistance((route.distance / 1000).toFixed(2));
          setWalkingMinutes(Math.ceil(route.duration / 60));
        }
      });
  }, [booking, location]);

  const openInGoogleMaps = () => {
    if (!booking?.carLocation) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lng}&destination=${booking.carLocation.lat},${booking.carLocation.lng}&travelmode=walking`,
      '_blank'
    );
  };

  if (loading) return <LoadingScreen />;
  if (!booking?.carLocation) return <NoLocationScreen onBack={() => router.push('/my-bookings')} />;

  const mapCenter: [number, number] = [
    (booking.carLocation.lat + (location?.lat ?? booking.carLocation.lat)) / 2,
    (booking.carLocation.lng + (location?.lng ?? booking.carLocation.lng)) / 2,
  ];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#060810]">

      {/* ── MAP ── */}
      <div className="absolute inset-0 z-0">
        {typeof window !== 'undefined' && (
          <MapContainer
            center={mapCenter}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {carIcon && (
              <Marker position={[booking.carLocation.lat, booking.carLocation.lng]} icon={carIcon}>
                <Popup>
                  <div className="rounded-lg bg-[#0d0d14] px-3 py-2 text-sm font-bold text-white">🚗 Your car</div>
                </Popup>
              </Marker>
            )}
            {location && driverIcon && (
              <Marker position={[location.lat, location.lng]} icon={driverIcon}>
                <Popup>
                  <div className="rounded-lg bg-[#0d0d14] px-3 py-2 text-sm font-bold text-white">🧍 You</div>
                </Popup>
              </Marker>
            )}
            {routeData && (
              <GeoJSON
                data={routeData}
                style={{ color: '#10b981', weight: 4, dashArray: '8 14', opacity: 0.85 }}
              />
            )}
          </MapContainer>
        )}
      </div>

      {/* ── Map edge fade ── */}
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(6,8,16,0.5) 100%)' }} />
      {/* Bottom fade for panel blend */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-64"
        style={{ background: 'linear-gradient(to top, rgba(6,8,16,0.95) 0%, transparent 100%)' }} />

      {/* ── TOP BAR ── */}
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
        {/* Back button */}
        <button
          onClick={() => router.push('/my-bookings')}
          className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>

        {/* Title pill */}
        <div
          className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5"
          style={{
            background: 'rgba(9,13,25,0.75)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Car className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">Find My Car</span>
        </div>

        {/* Live GPS badge */}
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
          style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">Live</span>
        </div>
      </div>

      {/* ── CALCULATING ROUTE pill ── */}
      {!walkingDistance && (
        <div className="absolute left-1/2 bottom-56 z-30 -translate-x-1/2">
          <div
            className="flex items-center gap-2.5 rounded-full px-5 py-2.5"
            style={{
              background: 'rgba(9,13,25,0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            <span className="text-xs font-medium text-white/60">Calculating route…</span>
          </div>
        </div>
      )}

      {/* ── BOTTOM PANEL ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-6 sm:px-5 sm:pb-7">
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(8,11,22,0.88)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          {/* Panel drag handle + toggle */}
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="flex w-full flex-col items-center gap-2 pt-3 pb-1 transition-opacity hover:opacity-70"
          >
            <div className="h-1 w-10 rounded-full bg-white/15" />
          </button>

          {/* Stats row */}
          {panelExpanded && walkingDistance && (
            <div className="grid grid-cols-3 divide-x px-2 pb-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.06)' }}>

              {/* Distance */}
              <div className="flex flex-col items-center gap-2 py-4 px-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Footprints className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white leading-none">{walkingDistance}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">km away</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex flex-col items-center gap-2 py-4 px-3"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Clock className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white leading-none">~{walkingMinutes}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">min walk</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col items-center gap-2 py-4 px-3"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.18)' }}>
                  <MapPin className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white leading-none tabular-nums">
                    {booking.carLocation.lat.toFixed(4)}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">latitude</p>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 p-4">
            {/* Google Maps button */}
            <button
              onClick={openInGoogleMaps}
              className="relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 60%, #34d399 100%)',
                boxShadow: '0 6px 28px rgba(16,185,129,0.35), 0 1px 0 rgba(255,255,255,0.15) inset',
              }}
            >
              {/* Shine */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
              <Navigation className="h-4 w-4" />
              Navigate with Google Maps
            </button>

            {/* Back icon button */}
            <button
              onClick={() => router.push('/my-bookings')}
              className="flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-2xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <ArrowLeft className="h-4 w-4 text-white/50" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}