"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ownerAPI } from "@/utils/api";
import {
  MapPin,
  DollarSign,
  Calendar,
  PlusCircle,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";

interface DashboardStats {
  totalSpots: number;
  activeSpots: number;
  occupiedSpots: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalEarnings: number;
  pendingEarnings: number;
  thisMonthEarnings?: number;
}

interface RecentBooking {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  spot: {
    name: string;
    address: string;
  };
  status: string;
  totalPrice: number;
  startTime: string;
  endTime: string;
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Fetch dashboard stats on mount
  useEffect(() => {
    ownerAPI
      .getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {
        // Toast error
        console.error("Failed to load stats");
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch recent bookings
  useEffect(() => {
    // For now, we'll leave this empty as we don't have a specific endpoint
    // You can implement this later with ownerAPI.getSpotBookings for all spots
    setBookingsLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Earnings",
      value: `₹${stats?.totalEarnings || 0}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "+12.5%",
    },
    {
      title: "This Month Earnings",
      value: `₹${stats?.thisMonthEarnings || 0}`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+8.2%",
    },
    {
      title: "Total Spots",
      value: stats?.totalSpots || 0,
      icon: <MapPin className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      subtitle: `${stats?.activeSpots || 0} active`,
    },
    {
      title: "Occupied Spots",
      value: stats?.occupiedSpots || 0,
      icon: <Users className="w-6 h-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      subtitle: `${stats?.activeBookings || 0} active bookings`,
    },
  ];

  const quickActions = [
    {
      label: "Add New Spot",
      icon: <PlusCircle className="w-5 h-5" />,
      color: "bg-emerald-600 hover:bg-emerald-700",
      action: () => router.push("/dashboard/owner/add-spot"),
    },
    {
      label: "View Earnings",
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-blue-600 hover:bg-blue-700",
      action: () => router.push("/dashboard/owner/earnings"),
    },
    {
      label: "My Spots",
      icon: <MapPin className="w-5 h-5" />,
      color: "bg-purple-600 hover:bg-purple-700",
      action: () => router.push("/dashboard/owner/spots"),
    },
    {
      label: "Bookings",
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-orange-600 hover:bg-orange-700",
      action: () => router.push("/dashboard/owner/bookings"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening with your parking spots.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                )}
                {card.trend && (
                  <p className="text-sm text-emerald-600 font-medium mt-1">
                    {card.trend} from last month
                  </p>
                )}
              </div>
              <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Bookings
            </h2>
            <button
              onClick={() => router.push("/dashboard/owner/bookings")}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              View All
            </button>
          </div>

          {bookingsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      booking.status === "completed"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {booking.status === "completed" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {booking.user.name}
                    </p>
                    <p className="text-sm text-gray-600">{booking.spot.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{booking.totalPrice}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent bookings</p>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Performance Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalBookings || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div>
                <p className="text-sm text-emerald-700">Completed Bookings</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {stats?.completedBookings || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-blue-700">Active Bookings</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats?.activeBookings || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-orange-700">Pending Earnings</p>
                <p className="text-2xl font-bold text-orange-900">
                  ₹{stats?.pendingEarnings || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
