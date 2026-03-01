"use client";

import React, { useEffect, useState } from "react";
import { ownerAPI } from "@/utils/api";
import { Loader2, AlertCircle, CheckCircle, XCircle, Calendar, DollarSign } from "lucide-react";

interface Booking {
  _id: string;
  driverId?: { name: string } | string;
  spotId?: { address: string } | string;
  finalAmount: number;
  createdAt: string;
  paymentStatus: string;
}

interface EarningsData {
  totalEarnings: number;
  thisMonthEarnings: number;
  todayEarnings: number;
  totalBookings: number;
  bookings: Booking[];
}

export default function OwnerEarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ownerAPI
      .earnings()
      .then((res) => setEarnings(res.data))
      .catch(() => setError("Failed to load earnings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
          <span className="text-red-900 font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Earnings & Bookings</h1>
        <p className="text-gray-600 mt-2">Track your earnings and recent bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-start">
          <span className="text-gray-600 text-sm mb-1">Total Earnings</span>
          <span className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />₹{earnings?.totalEarnings ?? 0}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-start">
          <span className="text-gray-600 text-sm mb-1">This Month</span>
          <span className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />₹{earnings?.thisMonthEarnings ?? 0}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-start">
          <span className="text-gray-600 text-sm mb-1">Today</span>
          <span className="text-2xl font-bold text-orange-700 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />₹{earnings?.todayEarnings ?? 0}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-start">
          <span className="text-gray-600 text-sm mb-1">Total Bookings</span>
          <span className="text-2xl font-bold text-purple-700 flex items-center gap-2">
            <Calendar className="w-5 h-5" />{earnings?.totalBookings ?? 0}
          </span>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Spot</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {earnings?.bookings?.length ? (
                earnings.bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {typeof booking.driverId === "object" && booking.driverId?.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {typeof booking.spotId === "object" && booking.spotId?.address}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap font-semibold text-emerald-700">
                      ₹{booking.finalAmount}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {booking.paymentStatus === "paid" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-4 h-4 mr-1" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-4 h-4 mr-1" /> Unpaid
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
