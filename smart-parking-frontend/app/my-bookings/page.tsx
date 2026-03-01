// 
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
import { MapPin, Clock, Star, Car, Loader2, Map, Zap, CheckCircle2, XCircle } from 'lucide-react';
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
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleEndSession = async (booking: Booking) => {
    setEndLoading(booking._id);
    try {
      const res = await bookingAPI.endSession(booking._id);
      const { overstayCharge, finalAmount } = res.data;
      if (overstayCharge && overstayCharge > 0) {
        const spot = booking.spotId as ParkingSpot;
        setOverstayData({
          overstayCharge, finalAmount,
          baseAmount: booking.baseAmount,
          extraMinutes: Math.ceil((overstayCharge / spot.pricePerHour) * 60),
        });
        setShowOverstay(true);
      } else {
        toast.success('Session ended successfully!');
      }
      await fetchBookings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to end session');
    } finally {
      setEndLoading(null);
    }
  };

  const handleRate = async () => {
    if (!selectedBooking) return;
    try {
      await bookingAPI.rateSpot(selectedBooking._id, rating);
      toast.success('Rating submitted!');
      setShowRate(false);
      setRating(5);
      setComment('');
      await fetchBookings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit rating');
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'active');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const renderBookingCard = (booking: Booking) => {
    const spot = booking.spotId as ParkingSpot;
    const isActive = booking.status === 'active';
    const isCompleted = booking.status === 'completed';

    return (
      <div
        key={booking._id}
        className="group relative rounded-2xl p-px transition-all duration-300 hover:scale-[1.01]"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, rgba(16,185,129,0.4) 0%, rgba(255,255,255,0.08) 50%, rgba(16,185,129,0.15) 100%)'
            : isCompleted
            ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(255,255,255,0.04) 100%)',
        }}
      >
        {/* Active pulse ring */}
        {isActive && (
          <div className="absolute -inset-px rounded-2xl animate-pulse opacity-30"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.5), transparent)' }}
          />
        )}

        <div
          className="relative rounded-2xl p-5 overflow-hidden"
          style={{
            background: 'rgba(9, 13, 25, 0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Inner glow for active */}
          {isActive && (
            <div className="pointer-events-none absolute top-0 right-0 w-48 h-48 opacity-10 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
            />
          )}

          <div className="flex gap-4">
            {/* Spot Photo */}
            {spot.photos && spot.photos.length > 0 ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/10">
                <Image src={spot.photos[0]} alt={spot.address} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl shrink-0 flex items-center justify-center ring-1 ring-white/10"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Car className="w-8 h-8 text-white/20" />
              </div>
            )}

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-2.5">
              {/* Title + Badge */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white text-sm leading-snug truncate">
                  {spot.title || spot.address}
                </h3>
                <span
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border"
                  style={
                    isActive
                      ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }
                      : isCompleted
                      ? { background: 'rgba(148,163,184,0.1)', color: '#94a3b8', borderColor: 'rgba(148,163,184,0.2)' }
                      : { background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }
                  }
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                  {booking.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDateTime(booking.startTime)} — {formatDateTime(booking.endTime)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-400">
                  ₹{booking.finalAmount || booking.baseAmount}
                </span>
                {booking.finalAmount && booking.finalAmount !== booking.baseAmount && (
                  <span className="text-xs text-white/30 line-through">₹{booking.baseAmount}</span>
                )}
              </div>

              {/* Active Actions */}
              {isActive && (
                <div className="space-y-2.5 pt-1">
                  <BookingTimer
                    endTime={booking.endTime}
                    startTime={booking.startTime}
                    onExpired={() => fetchBookings()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedBooking(booking); setShowExtend(true); }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      Extend Time
                    </button>
                    <button
                      onClick={() => handleEndSession(booking)}
                      disabled={endLoading === booking._id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171',
                      }}
                    >
                      {endLoading === booking._id ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Ending…</>
                      ) : (
                        'End Session'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Completed Actions */}
              {isCompleted && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setSelectedBooking(booking); setShowRate(true); }}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(250,204,21,0.1)',
                      border: '1px solid rgba(250,204,21,0.25)',
                      color: '#fbbf24',
                    }}
                  >
                    <Star className="w-3.5 h-3.5" />
                    Rate Spot
                  </button>
                  {booking.carLocation && spot.location?.coordinates && (
                    <button
                      onClick={() => { setSelectedBooking(booking); setShowRouteMap(true); }}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        color: '#a5b4fc',
                      }}
                    >
                      <Map className="w-3.5 h-3.5" />
                      View Route
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = (message: string, icon: React.ReactNode, color: string) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: `rgba(${color}, 0.08)`, border: `1px solid rgba(${color}, 0.15)` }}
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-white/30">{message}</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="h-4 w-3/4 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-3 w-1/2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-5 w-1/4 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabConfig = [
    { value: 'active', label: 'Active', count: activeBookings.length, color: '#10b981', dot: 'bg-emerald-400' },
    { value: 'completed', label: 'Completed', count: completedBookings.length, color: '#94a3b8', dot: 'bg-slate-400' },
    { value: 'cancelled', label: 'Cancelled', count: cancelledBookings.length, color: '#f87171', dot: 'bg-red-400' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.25)' }}>
              <Car className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                My Bookings
              </h1>
              <p className="text-xs text-white/35">
                {bookings.length > 0 ? `${bookings.length} total booking${bookings.length !== 1 ? 's' : ''}` : 'Manage your parking sessions'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-5">
          {/* Custom Tab Bar */}
          <div
            className="flex gap-1 rounded-2xl p-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {tabConfig.map((tab) => (
              <button
                key={tab.value}
                data-tab={tab.value}
                onClick={(e) => {
                  document.querySelectorAll('[data-tab-content]').forEach(el => (el as HTMLElement).style.display = 'none');
                  const target = document.querySelector(`[data-tab-content="${tab.value}"]`) as HTMLElement;
                  if (target) target.style.display = 'block';
                  document.querySelectorAll('[data-tab]').forEach(el => {
                    (el as HTMLElement).style.background = 'transparent';
                    (el as HTMLElement).style.color = 'rgba(255,255,255,0.35)';
                  });
                  e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                  e.currentTarget.style.color = 'white';
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
                style={{ background: tab.value === 'active' ? 'rgba(255,255,255,0.09)' : 'transparent', color: tab.value === 'active' ? 'white' : 'rgba(255,255,255,0.35)' }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                    style={{ background: `${tab.color}22`, color: tab.color, border: `1px solid ${tab.color}44` }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div>
            <div data-tab-content="active" style={{ display: 'block' }}>
              {loading ? renderLoadingState() : activeBookings.length === 0
                ? renderEmptyState('No active bookings', <Zap className="w-7 h-7 text-emerald-400/50" />, '16, 185, 129')
                : <div className="space-y-3">{activeBookings.map(renderBookingCard)}</div>}
            </div>
            <div data-tab-content="completed" style={{ display: 'none' }}>
              {loading ? renderLoadingState() : completedBookings.length === 0
                ? renderEmptyState('No completed bookings', <CheckCircle2 className="w-7 h-7 text-slate-400/50" />, '148, 163, 184')
                : <div className="space-y-3">{completedBookings.map(renderBookingCard)}</div>}
            </div>
            <div data-tab-content="cancelled" style={{ display: 'none' }}>
              {loading ? renderLoadingState() : cancelledBookings.length === 0
                ? renderEmptyState('No cancelled bookings', <XCircle className="w-7 h-7 text-red-400/50" />, '239, 68, 68')
                : <div className="space-y-3">{cancelledBookings.map(renderBookingCard)}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Extend Modal */}
      {selectedBooking && (
        <ExtendTimeModal
          open={showExtend}
          bookingId={selectedBooking._id}
          currentEndTime={selectedBooking.endTime}
          pricePerHour={(selectedBooking.spotId as ParkingSpot).pricePerHour}
          onClose={() => { setShowExtend(false); setSelectedBooking(null); }}
          onSuccess={fetchBookings}
        />
      )}

      {/* Rate Dialog */}
      <Dialog open={showRate} onOpenChange={setShowRate}>
        <DialogContent
          className="sm:max-w-md border-0 rounded-2xl p-0 overflow-hidden"
          style={{ background: 'rgba(9,13,25,0.96)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)' }}>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Rate Your Experience</h3>
                <p className="text-xs text-white/40">Help others find great spots</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Your Rating</p>
              <div className="flex gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="transition-all duration-150 hover:scale-125 active:scale-95">
                    <Star className={`w-9 h-9 transition-colors duration-150 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/15'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wide">Comment (Optional)</label>
              <textarea
                placeholder="Share your experience…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none resize-none focus:ring-2 focus:ring-yellow-500/30 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowRate(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                Cancel
              </button>
              <button onClick={handleRate}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
                Submit Rating
              </button>
            </div>
          </div>
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

      {/* Route Map Dialog */}
      <Dialog open={showRouteMap} onOpenChange={setShowRouteMap}>
        <DialogContent
          className="sm:max-w-2xl border-0 rounded-2xl p-0 overflow-hidden max-h-[90vh]"
          style={{ background: 'rgba(9,13,25,0.96)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <Map className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Booking Route</h3>
                <p className="text-xs text-white/35">Navigate to your spot</p>
              </div>
            </div>
          </div>

          <div className="p-5 overflow-y-auto">
            {selectedBooking?.carLocation && (() => {
              const spot = selectedBooking.spotId as ParkingSpot;
              const spotLocation = { lat: spot.location.coordinates[1], lng: spot.location.coordinates[0] };
              return <BookingRouteMap carLocation={selectedBooking.carLocation} spotLocation={spotLocation} spotAddress={spot.address} />;
            })()}
          </div>

          <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <button onClick={() => setShowRouteMap(false)}
              className="w-full rounded-xl py-2.5 text-sm font-medium transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}