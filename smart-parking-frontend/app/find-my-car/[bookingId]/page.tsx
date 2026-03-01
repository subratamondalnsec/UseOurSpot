'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { bookingAPI } from '@/utils/api';
import { useLocation } from '@/hooks/useLocation';
import { getRoute } from '@/utils/getRoute';
import { Car, Navigation, Footprints, Clock, Loader2 } from 'lucide-react';
import { Booking } from '@/types';

// Dynamic imports for Leaflet (SSR: false)
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
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

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

  // Fetch booking on mount
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingAPI.findMyCar(bookingId);
        setBooking(res.data.booking || res.data);
      } catch (error: any) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  // Load icons client-side
  useEffect(() => {
    if (typeof globalThis !== 'undefined') {
      import('@/utils/mapIcons').then(({ getCarIcon, getDriverIcon }) => {
        setCarIcon(getCarIcon());
        setDriverIcon(getDriverIcon());
      });
    }
  }, []);

  // Fetch walking route when both booking and location are available
  useEffect(() => {
    if (booking?.carLocation && location) {
      const fetchRoute = async () => {
        try {
          const route = await getRoute(
            location.lat,
            location.lng,
            booking.carLocation!.lat,
            booking.carLocation!.lng,
            'walking'
          );

          if (route) {
            setRouteData(route.geometry);
            setWalkingDistance((route.distance / 1000).toFixed(2));
            setWalkingMinutes(Math.ceil(route.duration / 60));
          }
        } catch (error) {
          console.error('Failed to fetch route:', error);
        }
      };
      fetchRoute();
    }
  }, [booking, location]);

  const openInGoogleMaps = () => {
    if (!booking?.carLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lng}&destination=${booking.carLocation.lat},${booking.carLocation.lng}&travelmode=walking`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex items-center justify-center min-h-100">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-emerald-500" />
          <p className="text-muted-foreground">Loading car location...</p>
        </div>
      </div>
    );
  }

  if (!booking?.carLocation) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Car className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Car Location Not Available</h2>
            <p className="text-muted-foreground mb-6">
              No car location saved for this booking.
            </p>
            <Button onClick={() => router.push('/my-bookings')}>
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mapCenter: [number, number] = [
    (booking.carLocation.lat + (location?.lat || booking.carLocation.lat)) / 2,
    (booking.carLocation.lng + (location?.lng || booking.carLocation.lng)) / 2,
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      {/* Header Card */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold">Find My Car</h2>
          </div>
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            GPS Active
          </Badge>
        </CardContent>
      </Card>

      {/* Map Card */}
      <Card>
        <CardContent className="p-0">
          <div className="h-80 rounded-lg overflow-hidden">
            {typeof globalThis !== 'undefined' && (
              <MapContainer
                center={mapCenter}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Car Location Marker */}
                {carIcon && (
                  <Marker
                    position={[booking.carLocation.lat, booking.carLocation.lng]}
                    icon={carIcon}
                  >
                    <Popup>
                      <strong>🚗 Your car is here</strong>
                    </Popup>
                  </Marker>
                )}

                {/* User Location Marker */}
                {location && driverIcon && (
                  <Marker position={[location.lat, location.lng]} icon={driverIcon}>
                    <Popup>
                      <strong>🧍 You are here</strong>
                    </Popup>
                  </Marker>
                )}

                {/* Walking Route */}
                {routeData && (
                  <GeoJSON
                    data={routeData}
                    style={{
                      color: '#10b981',
                      weight: 4,
                      dashArray: '10, 10',
                      opacity: 0.8,
                    }}
                  />
                )}
              </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      {walkingDistance && (
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Walking Distance */}
              <div className="text-center bg-muted rounded-lg p-3 space-y-2">
                <Footprints className="w-6 h-6 mx-auto text-emerald-500" />
                <div className="text-2xl font-bold">{walkingDistance} km</div>
                <div className="text-sm text-muted-foreground">Walking Distance</div>
              </div>

              {/* Walking Time */}
              <div className="text-center bg-muted rounded-lg p-3 space-y-2">
                <Clock className="w-6 h-6 mx-auto text-emerald-500" />
                <div className="text-2xl font-bold">~{walkingMinutes} min</div>
                <div className="text-sm text-muted-foreground">Walking Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Card */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <Button
            onClick={openInGoogleMaps}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Open in Google Maps
          </Button>
          <Button
            onClick={() => router.push('/my-bookings')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Back to Bookings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
