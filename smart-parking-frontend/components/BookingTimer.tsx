'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock } from 'lucide-react';

interface BookingTimerProps {
  readonly endTime: string;
  readonly startTime: string;
  readonly onExpired?: () => void;
}

type TimeLeft = {
  h: number;
  m: number;
  s: number;
};

type Status = 'safe' | 'warning' | 'urgent' | 'expired';

type NotificationState = {
  ten: boolean;
  five: boolean;
  zero: boolean;
};

export default function BookingTimer({ endTime, startTime, onExpired }: BookingTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ h: 0, m: 0, s: 0 });
  const [status, setStatus] = useState<Status>('safe');
  const [progress, setProgress] = useState(100);
  const [notified, setNotified] = useState<NotificationState>({
    ten: false,
    five: false,
    zero: false,
  });

  useEffect(() => {
    // Request notification permission on mount
    if (typeof globalThis !== 'undefined' && 'Notification' in globalThis) {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(endTime).getTime();
      const start = new Date(startTime).getTime();
      const remaining = end - now;
      const total = end - start;

      // Progress bar (100% → 0%)
      setProgress(Math.max(0, (remaining / total) * 100));

      // Time left
      const abs = Math.abs(remaining);
      setTimeLeft({
        h: Math.floor(abs / 3600000),
        m: Math.floor((abs % 3600000) / 60000),
        s: Math.floor((abs % 60000) / 1000),
      });

      // Status
      if (remaining <= 0) {
        setStatus('expired');
      } else if (remaining < 5 * 60000) {
        setStatus('urgent');
      } else if (remaining < 10 * 60000) {
        setStatus('warning');
      } else {
        setStatus('safe');
      }

      // Notifications
      if (typeof globalThis !== 'undefined' && 'Notification' in globalThis && Notification.permission === 'granted') {
        if (remaining < 10 * 60000 && remaining > 5 * 60000 && !notified.ten) {
          new Notification('⚠️ SmartPark — 10 mins left!');
          setNotified((prev) => ({ ...prev, ten: true }));
        }

        if (remaining < 5 * 60000 && remaining > 0 && !notified.five) {
          new Notification('🔴 SmartPark — 5 mins left!');
          setNotified((prev) => ({ ...prev, five: true }));
        }

        if (remaining <= 0 && !notified.zero) {
          new Notification('💸 SmartPark — Overstay started!');
          onExpired?.();
          setNotified((prev) => ({ ...prev, zero: true }));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, startTime, notified, onExpired]);

  const pad = (n: number) => String(n).padStart(2, '0');

  const getProgressColor = () => {
    if (status === 'safe') return '[&>div]:bg-green-500';
    if (status === 'warning') return '[&>div]:bg-orange-500';
    return '[&>div]:bg-red-500';
  };

  const getBadgeVariant = () => {
    if (status === 'urgent' || status === 'expired') return 'destructive';
    return 'default';
  };

  const getBadgeText = () => {
    if (status === 'safe') return 'Active';
    if (status === 'warning') return 'Ending Soon';
    if (status === 'urgent') return 'Urgent!';
    return 'Expired';
  };

  const getBadgeClass = () => {
    if (status === 'safe') return 'bg-green-500 hover:bg-green-600 text-white';
    if (status === 'warning') return 'bg-orange-500 hover:bg-orange-600 text-white';
    return '';
  };

  const getWarningMessage = () => {
    if (status === 'warning') return '⚠️ Less than 10 mins! Consider extending.';
    if (status === 'urgent') return '🔴 Less than 5 mins! Leave immediately.';
    if (status === 'expired') return '💸 Session expired. Overstay charges applying.';
    return null;
  };

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <Progress value={progress} className={getProgressColor()} />

      {/* Time Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-lg font-semibold">
            {status === 'expired' ? '+' : ''}
            {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
          </span>
        </div>
        <Badge variant={getBadgeVariant()} className={getBadgeClass()}>
          {getBadgeText()}
        </Badge>
      </div>

      {/* Warning Message */}
      {(status === 'warning' || status === 'urgent' || status === 'expired') && (
        <div
          className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
            status === 'warning'
              ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
              : 'bg-red-500/10 text-red-600 border border-red-500/20'
          }`}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{getWarningMessage()}</span>
        </div>
      )}
    </div>
  );
}
