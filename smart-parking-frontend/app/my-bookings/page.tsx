'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, Star, Car, Loader2, Map } from 'lucide-react';
import { useState, useEffect } from 'react';
import { bookingAPI } from '@/utils/api';
import { toast } from 'react-hot-toast';
import BookingTimer from '@/components/BookingTimer';
import ExtendTimeModal from '@/components/ExtendTimeModal';
import OverstayModal from '@/components/OverstayModal';
import BookingRouteMap from '@/components/BookingRouteMap';
import { Booking, ParkingSpot } from '@/types';
import Image from 'next/image';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showExtend, setShowExtend] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [showOverstay, setShowOverstay] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [overstayData, setOverstayData] = useState<{
    overstayCharge: number;
    finalAmount: number;
    baseAmount: number;
    extraMinutes: number;
  } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [endLoading, setEndLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.myBookings();
      setBookings(res.data.bookings || res.data);
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleEndSession = async (booking: Booking) => {
    setEndLoading(booking._id);
    try {
      const res = await bookingAPI.endSession(booking._id);
      const { overstayCharge, finalAmount } = res.data;

      if (overstayCharge && overstayCharge > 0) {
        const spot = booking.spotId as ParkingSpot;
        setOverstayData({
          overstayCharge,
          finalAmount,
          baseAmount: booking.baseAmount,
          extraMinutes: Math.ceil((overstayCharge / spot.pricePerHour) * 60),
        });
        setShowOverstay(true);
      } else {
        toast.success('Session ended successfully!');
      }

      await fetchBookings();
    } catch (error: any) {
      console.error('Failed to end session:', error);
      toast.error(error?.response?.data?.message || 'Failed to end session');
    } finally {
      setEndLoading(null);
    }
  };

  const handleRate = async () => {
    if (!selectedBooking) return;

    try {
      await bookingAPI.rateSpot(selectedBooking._id, rating);
      toast.success('Rating submitted successfully!');
      setShowRate(false);
      setRating(5);
      setComment('');
      await fetchBookings();
    } catch (error: any) {
      console.error('Failed to submit rating:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit rating');
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'active');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'active') return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (status === 'completed') return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  const renderBookingCard = (booking: Booking) => {
    const spot = booking.spotId as ParkingSpot;

    return (
      <Card key={booking._id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Spot Photo */}
            {spot.photos && spot.photos.length > 0 && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={spot.photos[0]}
                  alt={spot.address}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Booking Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{spot.title || spot.address}</h3>
                <Badge className={getStatusBadgeClass(booking.status)} variant="outline">
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-emerald-600">
                  ₹{booking.finalAmount || booking.baseAmount}
                </span>
              </div>

              {/* Active Booking Actions */}
              {booking.status === 'active' && (
                <div className="space-y-2 pt-2">
                  <BookingTimer
                    endTime={booking.endTime}
                    startTime={booking.startTime}
                    onExpired={() => fetchBookings()}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowExtend(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      ⏱ Extend
                    </Button>
                    <Button
                      onClick={() => handleEndSession(booking)}
                      variant="destructive"
                      size="sm"
                      disabled={endLoading === booking._id}
                    >
                      {endLoading === booking._id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Ending...
                        </>
                      ) : (
                        'End Session'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Completed Booking Actions */}
              {booking.status === 'completed' && (
                <div className="pt-2 flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowRate(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    ⭐ Rate Spot
                  </Button>
                  {booking.carLocation && spot.location?.coordinates && (
                    <Button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowRouteMap(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Map className="w-4 h-4 mr-1" />
                      View Route
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = (message: string) => (
    <div className="text-center py-12">
      <Car className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="w-20 h-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTabContent = (bookingsList: Booking[], emptyMessage: string) => {
    if (loading) return renderLoadingState();
    if (bookingsList.length === 0) return renderEmptyState(emptyMessage);
    return bookingsList.map(renderBookingCard);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Car className="w-8 h-8 text-emerald-500" />
        <h1 className="text-3xl font-bold">My Bookings</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="relative">
            Active
            {activeBookings.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500 text-white text-xs">
                {activeBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Completed
            {completedBookings.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gray-500 text-white text-xs">
                {completedBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="relative">
            Cancelled
            {cancelledBookings.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {cancelledBookings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Active Bookings */}
        <TabsContent value="active" className="space-y-4 mt-6">
          {renderTabContent(activeBookings, 'No active bookings')}
        </TabsContent>

        {/* Completed Bookings */}
        <TabsContent value="completed" className="space-y-4 mt-6">
          {renderTabContent(completedBookings, 'No completed bookings')}
        </TabsContent>

        {/* Cancelled Bookings */}
        <TabsContent value="cancelled" className="space-y-4 mt-6">
          {renderTabContent(cancelledBookings, 'No cancelled bookings')}
        </TabsContent>
      </Tabs>

      {/* Extend Time Modal */}
      {selectedBooking && (
        <ExtendTimeModal
          open={showExtend}
          bookingId={selectedBooking._id}
          currentEndTime={selectedBooking.endTime}
          pricePerHour={(selectedBooking.spotId as ParkingSpot).pricePerHour}
          onClose={() => {
            setShowExtend(false);
            setSelectedBooking(null);
          }}
          onSuccess={fetchBookings}
        />
      )}

      {/* Rate Spot Dialog */}
      <Dialog open={showRate} onOpenChange={setShowRate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Rate Your Experience
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button onClick={() => setShowRate(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleRate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overstay Modal */}
      {overstayData && (
        <OverstayModal
          open={showOverstay}
          overstayCharge={overstayData.overstayCharge}
          finalAmount={overstayData.finalAmount}
          baseAmount={overstayData.baseAmount}
          extraMinutes={overstayData.extraMinutes}
          onClose={() => setShowOverstay(false)}
        />
      )}

      {/* Route Map Modal */}
      <Dialog open={showRouteMap} onOpenChange={setShowRouteMap}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-emerald-500" />
              Booking Route
            </DialogTitle>
          </DialogHeader>

          {selectedBooking?.carLocation && (() => {
            const spot = selectedBooking.spotId as ParkingSpot;
            // Convert MongoDB GeoJSON coordinates [lng, lat] to {lat, lng}
            const spotLocation = {
              lat: spot.location.coordinates[1],
              lng: spot.location.coordinates[0]
            };
            
            return (
              <BookingRouteMap
                carLocation={selectedBooking.carLocation}
                spotLocation={spotLocation}
                spotAddress={spot.address}
              />
            );
          })()}

          <DialogFooter>
            <Button onClick={() => setShowRouteMap(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
