"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ownerAPI } from "@/utils/api";
import { Coordinates } from "@/types";
import {
  MapPin,
  Upload,
  X,
  Loader2,
  Camera,
  AlertCircle,
} from "lucide-react";

const LocationPicker = dynamic(
  () => import("@/components/DriverSerchingSpot/LocationPicker"),
  { ssr: false }
);

interface FormData {
  address: string;
  lat: string;
  lng: string;
  size: string;
  type: string;
  rules: string;
  availability: string;
  availableFrom: string;
  availableTo: string;
  pricePerHour: string;
}

export default function EditSpotPage() {
  const router = useRouter();
  const { spotId } = useParams();
  const [formData, setFormData] = useState<FormData>({
    address: "",
    lat: "",
    lng: "",
    size: "medium",
    type: "open",
    rules: "",
    availability: "24/7",
    availableFrom: "",
    availableTo: "",
    pricePerHour: "",
  });
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch spot on mount
  useEffect(() => {
    if (!spotId) return;
    ownerAPI.getSpot(spotId as string)
      .then(res => {
        const spot = res.data.spot;
        setFormData({
          address: spot.address,
          lat: spot.coordinates.lat.toString(),
          lng: spot.coordinates.lng.toString(),
          size: spot.size,
          type: spot.type,
          rules: spot.rules || '',
          availability: spot.availability,
          availableFrom: spot.availableFrom || '',
          availableTo: spot.availableTo || '',
          pricePerHour: spot.pricePerHour.toString()
        });
        setExistingPhotos(spot.photos || []);
      })
      .catch(() => setError("Failed to load spot details"))
      .finally(() => setLoading(false));
  }, [spotId]);

  // Handle location selection
  const handleLocationSelect = (coords: Coordinates) => {
    setFormData((prev) => ({
      ...prev,
      lat: coords.lat.toString(),
      lng: coords.lng.toString(),
    }));
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length + existingPhotos.length > 5) {
      setError("Maximum 5 photos allowed");
      return;
    }
    setPhotos((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    setError(null);
  };

  // Remove new photo
  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing photo
  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!formData.address || !formData.lat || !formData.lng) {
        throw new Error("Please select a location on the map");
      }
      if (!formData.pricePerHour || Number.parseFloat(formData.pricePerHour) <= 0) {
        throw new Error("Please enter a valid price per hour");
      }
      if (photos.length + existingPhotos.length === 0) {
        throw new Error("Please upload at least one photo");
      }
      const fd = new FormData();
      fd.append("address", formData.address);
      fd.append("lat", formData.lat);
      fd.append("lng", formData.lng);
      fd.append("size", formData.size);
      fd.append("type", formData.type);
      fd.append("rules", formData.rules);
      fd.append("availability", formData.availability);
      fd.append("availableFrom", formData.availableFrom);
      fd.append("availableTo", formData.availableTo);
      fd.append("pricePerHour", formData.pricePerHour);
      existingPhotos.forEach((url) => fd.append("existingPhotos", url));
      photos.forEach((p) => fd.append("photos", p));
      await ownerAPI.editSpot(spotId as string, fd);
      // toast.success('Spot updated!')
      router.push("/dashboard/owner/spots");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update spot";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading spot details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Parking Spot</h1>
        <p className="text-gray-600 mt-2">Update your parking spot details</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Location
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter parking spot address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">
                Select Location on Map *
              </div>
              <div className="h-100 rounded-lg overflow-hidden border border-gray-300">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialPosition={
                    formData.lat && formData.lng
                      ? [Number.parseFloat(formData.lat), Number.parseFloat(formData.lng)]
                      : null
                  }
                />
              </div>
              {formData.lat && formData.lng && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {Number.parseFloat(formData.lat).toFixed(6)}, {Number.parseFloat(formData.lng).toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            Photos * (Max 5)
          </h2>
          <div className="space-y-4">
            {/* Existing Photos */}
            {existingPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {existingPhotos.map((url, i) => (
                  <div key={`existing-photo-${url}-${i}`} className="relative group">
                    <img
                      src={url}
                      alt={`Existing Photo ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(i)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* New Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={`photo-preview-${preview}-${index}`} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Upload Button */}
            {photos.length + existingPhotos.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload photos
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB ({photos.length + existingPhotos.length}/5)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
        {/* ...existing code for spot details, rules, and submit buttons... */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/owner/spots")}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
