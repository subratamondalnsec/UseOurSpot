"use client";

import React, { useEffect, useState } from "react";
import { ownerAPI } from "@/utils/api";
import { Loader2, AlertCircle, User, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle } from "lucide-react";

interface Booking {
  _id: string;
  driverId?: {
    name: string;
    email: string;
    phone?: string;
  } | string;
  spotId?: string;
  status: string;
  finalAmount: number;
  createdAt: string;
}

interface Spot {
  _id: string;
  address: string;
}

export default function OwnerBookingsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "active" | "completed">("all");

  // Fetch spots first
  useEffect(() => {
    ownerAPI.mySpots()
      .then(res => setSpots(res.data.spots))
      .catch(() => setError("Failed to load spots"));
  }, []);

  // Fetch bookings for selected spot
  useEffect(() => {
    if (selectedSpotId === "all") {
      // Fetch all spots' bookings and merge
      Promise.all(
        spots.map(spot => ownerAPI.getSpotBookings(spot._id).then(res => res.data.bookings))
      )
        .then(results => setBookings(results.flat()))
        .catch(() => setError("Failed to load bookings"))
        .finally(() => setLoading(false));
    } else {
      setLoading(true);
      ownerAPI.getSpotBookings(selectedSpotId)
        .then(res => setBookings(res.data.bookings))
        .catch(() => setError("Failed to load bookings"))
        .finally(() => setLoading(false));
    }
  }, [selectedSpotId, spots]);

  // Filtered bookings
  const filteredBookings =
    tab === "all"
      ? bookings
      : bookings.filter(b => b.status === tab);

  // Revenue calculation
  const completedBookings = bookings.filter(b => b.status === "completed");
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Spot Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage all bookings for your spots</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Revenue: ₹{totalRevenue}
        </div>
      </div>

      {/* Spot Selector */}
      <div className="flex gap-4 items-center mb-4">
        <label htmlFor="spot-select" className="text-sm font-medium text-gray-700">
          Filter by Spot:
        </label>
        <select
          id="spot-select"
          value={selectedSpotId}
          onChange={e => setSelectedSpotId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">All Spots</option>
          {spots.map(spot => (
            <option key={spot._id} value={spot._id}>{spot.address}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-medium ${tab === "all" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"}`}
          onClick={() => setTab("all")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium ${tab === "active" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
          onClick={() => setTab("active")}
        >
          Active
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium ${tab === "completed" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}
          onClick={() => setTab("completed")}
        >
          Completed
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bookings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.length ? (
                filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {typeof booking.driverId === "object" && booking.driverId?.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {typeof booking.driverId === "object" && booking.driverId?.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {typeof booking.driverId === "object" && booking.driverId?.phone}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap font-semibold text-emerald-700">
                      ₹{booking.finalAmount}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {booking.status === "completed" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <CheckCircle className="w-4 h-4 mr-1" /> Completed
                        </span>
                      ) : booking.status === "active" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Calendar className="w-4 h-4 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="w-4 h-4 mr-1" /> {booking.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
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
