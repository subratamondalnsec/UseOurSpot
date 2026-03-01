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
import { AlertTriangle } from 'lucide-react';

interface OverstayModalProps {
  readonly open: boolean;
  readonly overstayCharge: number;
  readonly finalAmount: number;
  readonly baseAmount: number;
  readonly extraMinutes: number;
  readonly onClose: () => void;
}

export default function OverstayModal({
  open,
  overstayCharge,
  finalAmount,
  baseAmount,
  extraMinutes,
  onClose,
}: OverstayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-red-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            Overstay Detected
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alert Box */}
          <div className="bg-red-950 border border-red-800 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium text-red-200">
              Extra time: {extraMinutes} mins
            </p>
            <p className="text-xs text-red-300">Overstay rate applied</p>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Amount</span>
              <span className="font-medium">₹{baseAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overstay Charge</span>
              <span className="font-medium text-red-500">₹{overstayCharge}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Charged</span>
              <span className="text-lg font-bold text-red-500">₹{finalAmount}</span>
            </div>
          </div>

          {/* Warning Message */}
          <p className="text-sm text-muted-foreground">
            ⚠️ Please vacate the spot immediately to avoid more charges.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            I Understand — Leave Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
