'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, MapPin, Clock, Car, ArrowRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { bookingAPI } from '@/utils/api';
import { Booking, ParkingSpot } from '@/types';
import { toast } from 'react-hot-toast';

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch booking details on mount
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingAPI.getBooking(bookingId);
        const bookingData = res.data.booking || res.data;
        setBooking(bookingData);
        
        // Extract spot data if it's populated
        if (bookingData.spotId && typeof bookingData.spotId === 'object') {
          setSpot(bookingData.spotId as ParkingSpot);
        }
      } catch (error: any) {
        console.error('Failed to load booking:', error);
        toast.error('Failed to load booking details');
        router.push('/map');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, router]);

  const downloadQR = () => {
    if (!booking?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = booking.qrCode;
    link.download = `smartpark-qr-${bookingId}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading booking details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking || !spot) return null;

  // Calculate hours
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const hours = Math.ceil((end.getTime() - start.getTime()) / 3600000);

  // Format dates
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Success Banner */}
      <Card>
        <CardContent className="text-center py-8 space-y-4">
          <CheckCircle className="text-green-500 w-20 h-20 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold">Payment Successful!</h2>
          <p className="text-muted-foreground">Your parking is confirmed</p>
          <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-1">
            CONFIRMED
          </Badge>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm">{spot.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm">
              {formatDateTime(start)} → {formatDateTime(end)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-medium">Duration: {hours} hrs</span>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between items-center">
            <span className="font-semibold">Amount Paid:</span>
            <span className="text-xl font-bold text-emerald-600">₹{booking.baseAmount}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Booking ID:</span>
            <span className="font-mono text-muted-foreground">
              #{booking._id.slice(-8).toUpperCase()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      {booking.qrCode && (
        <Card>
          <CardHeader>
            <CardTitle>Entry QR Code</CardTitle>
            <p className="text-sm text-muted-foreground">Show this at parking entrance</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="inline-block p-2 bg-white rounded-xl border-4 border-green-500">
              <img
                src={booking.qrCode}
                alt="Entry QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <Button onClick={downloadQR} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Car Location */}
      {booking.carLocation && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Car location saved</span>
            </div>
            <Button
              onClick={() => router.push('/find-my-car/' + bookingId)}
              variant="outline"
              size="sm"
            >
              View Location
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bottom Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => router.push('/my-bookings')}
          variant="outline"
          size="lg"
        >
          My Bookings
        </Button>
        <Button
          onClick={() => router.push('/map')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          size="lg"
        >
          Back to Map
        </Button>
      </div>
    </div>
  );
}
