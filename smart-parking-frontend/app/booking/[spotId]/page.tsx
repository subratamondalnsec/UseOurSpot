'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { driverAPI, bookingAPI, paymentAPI } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'react-hot-toast';
import Script from 'next/script';
import Image from 'next/image';
import {
  MapPin,
  Clock,
  CreditCard,
  Shield,
  AlertCircle,
  Star,
  Loader2,
} from 'lucide-react';
import { ParkingSpot } from '@/types';

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const spotId = params.spotId as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { location } = useLocation();

  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hours, setHours] = useState(0);
  const [baseAmount, setBaseAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to book a parking spot');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch spot details on mount
  useEffect(() => {
    if (!isAuthenticated) return; // Don't fetch if not authenticated
    
    const fetchSpot = async () => {
      try {
        const res = await driverAPI.getSpot(spotId);
        setSpot(res.data.spot || res.data);
      } catch (error: any) {
        console.error('Failed to load spot:', error);
        toast.error('Failed to load parking spot');
        router.push('/map');
      } finally {
        setLoading(false);
      }
    };
    fetchSpot();
  }, [spotId, router, isAuthenticated]);

  // Calculate hours and pricing when time changes
  useEffect(() => {
    if (startTime && endTime && spot) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const h = (end.getTime() - start.getTime()) / 3600000;

      if (h > 0) {
        setHours(Math.ceil(h));
        const base = Math.ceil(h * spot.pricePerHour);
        setBaseAmount(base);
        setTotalAmount(base + 5);
      } else {
        setHours(0);
        setBaseAmount(0);
        setTotalAmount(0);
      }
    }
  }, [startTime, endTime, spot]);

  const handleBooking = async () => {
    // Validate inputs
    if (!startTime || !endTime) {
      toast.error('Please select start and end time');
      return;
    }

    const start = new Date(startTime);
    const now = new Date();

    if (start <= now) {
      toast.error('Start time must be in the future');
      return;
    }

    if (hours <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    setBookingLoading(true);

    try {
      // Step 1 - Create booking
      const bookingRes = await bookingAPI.create({
        spotId,
        startTime,
        endTime,
        carLocation: location || { lat: 0, lng: 0 },
      });
      const { bookingId } = bookingRes.data;

      // Step 2 - Create Razorpay order
      const orderRes = await paymentAPI.createOrder(totalAmount);
      const { order } = orderRes.data;

      // Step 3 - Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'SmartPark',
        description: spot?.address || 'Parking Spot',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            });
            if (verifyRes.data.success) {
              toast.success('Payment successful!');
              router.push('/payment-success/' + bookingId);
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#10b981' },
      };

      const rzp = new (globalThis as any).Razorpay(options);
      rzp.on('payment.failed', () => toast.error('Payment failed'));
      rzp.open();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Booking failed. Try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <div className="space-y-4">
          <Card>
            <Skeleton className="h-48 w-full rounded-t-xl" />
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!spot) return null;

  const minStartTime = new Date().toISOString().slice(0, 16);

  const getSpotTypeBadgeClass = (type: string) => {
    if (type === 'covered') return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (type === 'garage') return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    return 'bg-green-500/10 text-green-600 border-green-500/20';
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto">
        {/* Left Column - Spot Details */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            {spot.photos && spot.photos.length > 0 && (
              <div className="relative h-48 w-full">
                <Image
                  src={spot.photos[0]}
                  alt={spot.address}
                  fill
                  className="object-cover rounded-t-xl"
                  priority
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                <span>{spot.title || spot.address}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                <MapPin className="w-4 h-4" />
                {spot.address}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className={getSpotTypeBadgeClass(spot.type)}>
                  {spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}
                </Badge>
                <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/20">
                  {spot.size.charAt(0).toUpperCase() + spot.size.slice(1)}
                </Badge>
                {spot.averageRating && spot.averageRating > 0 && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {spot.averageRating.toFixed(1)}
                  </Badge>
                )}
              </div>

              <Separator />

              {spot.description && (
                <>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{spot.description}</p>
                  </div>
                  <Separator />
                </>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-600">₹{spot.pricePerHour}</span>
                <span className="text-muted-foreground">/hour</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure payment with Razorpay</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking Form */}
        <div className="space-y-4">
          {/* Time Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                Select Parking Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={minStartTime}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime || minStartTime}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Price Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{hours} hrs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parking Rate</span>
                  <span className="font-medium">₹{spot.pricePerHour}/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{baseAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium">₹5</span>
                </div>

                <Separator />

                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-emerald-600">₹{totalAmount}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-600">Overstay charges apply after end time</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleBooking}
                disabled={bookingLoading || hours <= 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₹{totalAmount} with Razorpay
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </>
  );
}
