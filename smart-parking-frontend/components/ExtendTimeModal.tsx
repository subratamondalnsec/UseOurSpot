'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { paymentAPI, bookingAPI } from '@/utils/api';
import { toast } from 'react-hot-toast';
import { Clock, CreditCard, Loader2 } from 'lucide-react';
import Script from 'next/script';

interface ExtendTimeModalProps {
  readonly open: boolean;
  readonly bookingId: string;
  readonly currentEndTime: string;
  readonly pricePerHour: number;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export default function ExtendTimeModal({
  open,
  bookingId,
  currentEndTime,
  pricePerHour,
  onClose,
  onSuccess,
}: ExtendTimeModalProps) {
  const [extraMinutes, setExtraMinutes] = useState<number>(30);
  const [loading, setLoading] = useState(false);

  const extraCharge = Math.ceil((extraMinutes / 60) * pricePerHour);
  const newEndTime = new Date(
    new Date(currentEndTime).getTime() + extraMinutes * 60000
  ).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const options = [30, 60, 90, 120];

  const handlePay = async () => {
    setLoading(true);
    try {
      const orderRes = await paymentAPI.createOrder(extraCharge);
      const { order } = orderRes.data;

      const rzpOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'SmartPark — Extend Time',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await bookingAPI.extendTime(bookingId, extraMinutes);
            toast.success(`Extended by ${extraMinutes} mins!`);
            onSuccess();
            onClose();
          } catch (error: any) {
            console.error('Failed to extend time:', error);
            toast.error('Failed to extend booking time');
          }
        },
        theme: { color: '#10b981' },
      };
      const rzp = new (globalThis as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed');
      });
      rzp.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md text-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Extend Parking Time
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current End Time */}
            <div className="flex items-center gap-2 text-sm ">
              <Clock className="w-4 h-4" />
              <span>
                Current end: {new Date(currentEndTime).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <Separator />

            {/* Select Extra Time */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Select extra time:</div>
              <div className="grid grid-cols-2 gap-2">
                {options.map((min) => (
                  <Button
                    key={min}
                    variant={extraMinutes === min ? 'default' : 'outline'}
                    onClick={() => setExtraMinutes(min)}
                    className={
                      extraMinutes === min
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'text-slate-900'
                    }
                  >
                    +{min} min
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Summary */}
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="">New end time:</span>
                <span className="font-medium">{newEndTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Extra charge:</span>
                <span className="text-xl font-bold text-emerald-600">₹{extraCharge}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button onClick={onClose} variant="outline" disabled={loading} className="text-slate-900">
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ₹{extraCharge} & Extend
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </>
  );
}
