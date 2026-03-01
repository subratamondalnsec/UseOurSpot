"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ownerAPI } from "@/utils/api";
import {
  MapPin,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Loader2,
  AlertCircle,
  DollarSign,
  Car,
} from "lucide-react";

interface ParkingSpot {
  _id: string;
  address: string;
  pricePerHour: number;
  size: string;
  type: string;
  photos?: string[];
  isApproved: boolean;
  status: "free" | "occupied";
  location: {
    type: string;
    coordinates: [number, number];
  };
}

export default function MySpotsPage() {
  const router = useRouter();
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch spots on mount
  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = () => {
    setLoading(true);
    setError(null);

    ownerAPI
      .mySpots()
      .then((res) => setSpots(res.data.spots))
      .catch(() => {
        setError("Failed to load spots");
        console.error("Failed to load spots");
      })
      .finally(() => setLoading(false));
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await ownerAPI.deleteSpot(deleteId);
      console.log("Spot deleted successfully!");
      // toast.success('Spot deleted successfully!')
      setDeleteId(null);
      // Refetch spots
      fetchSpots();
    } catch (err) {
      console.error("Failed to delete spot:", err);
      setError("Failed to delete spot");
    } finally {
      setDeleting(false);
    }
  };

  // Get status badge
  const getStatusBadge = (spot: ParkingSpot) => {
    if (!spot.isApproved) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }

    if (spot.status === "occupied") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Occupied
        </span>
      );
    }

    if (spot.status === "free") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Free
        </span>
      );
    }

    return null;
  };

  const getApprovalBadge = (spot: ParkingSpot) => {
    if (spot.isApproved) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your spots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Parking Spots</h1>
          <p className="text-gray-600 mt-2">
            Manage your parking spots and their availability
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/owner/add-spot")}
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Add New Spot
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* Spots Grid or Empty State */}
      {spots.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Parking Spots Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Get started by adding your first parking spot
          </p>
          <button
            onClick={() => router.push("/dashboard/owner/add-spot")}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Add Your First Spot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot) => (
            <div
              key={spot._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {spot.photos && spot.photos.length > 0 ? (
                  <img
                    src={spot.photos[0]}
                    alt={spot.address}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {getApprovalBadge(spot)}
                  {getStatusBadge(spot)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                      {spot.address}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="capitalize">{spot.type}</span>
                      <span className="capitalize">{spot.size}</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4 text-emerald-600 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  <span>₹{spot.pricePerHour}/hour</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/dashboard/owner/spots/${spot._id}`)
                    }
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/owner/edit-spot/${spot._id}`)
                    }
                    className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(spot._id)}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Delete Parking Spot
                </h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to delete this parking spot? This action
                  cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
