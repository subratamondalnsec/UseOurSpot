"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

// Dynamically import LocationPicker with SSR disabled
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

export default function AddSpotPage() {
  const router = useRouter();
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

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle location selection from map
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

    if (files.length + photos.length > 5) {
      setError("Maximum 5 photos allowed");
      return;
    }

    // Store File objects
    setPhotos((prev) => [...prev, ...files]);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);

    setError(null);
  };

  // Remove photo
  const removePhoto = (index: number) => {
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(photoPreviews[index]);

    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.address || !formData.lat || !formData.lng) {
        throw new Error("Please select a location on the map");
      }

      if (!formData.pricePerHour || Number.parseFloat(formData.pricePerHour) <= 0) {
        throw new Error("Please enter a valid price per hour");
      }

      if (photos.length === 0) {
        throw new Error("Please upload at least one photo");
      }

      // Build FormData
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

      // Append all photos
      photos.forEach((p) => fd.append("photos", p));

      // API call
      await ownerAPI.addSpot(fd);

      // Success - show toast (using console for now)
      console.log("Spot submitted for approval!");
      // toast.success('Spot submitted for approval!')

      // Redirect to spots page
      router.push("/dashboard/owner/spots");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add spot";
      setError(errorMessage);
      console.error("Error adding spot:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Parking Spot</h1>
        <p className="text-gray-600 mt-2">
          Fill in the details to list your parking spot
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Location Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Location
          </h2>

          <div className="space-y-4">
            {/* Address Input */}
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

            {/* Map */}
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
                  Selected: {Number.parseFloat(formData.lat).toFixed(6)},{" "}
                  {Number.parseFloat(formData.lng).toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            Photos * (Max 5)
          </h2>

          <div className="space-y-4">
            {/* Photo Previews */}
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
            {photos.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload photos
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB ({photos.length}/5)
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

        {/* Spot Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Spot Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Size */}
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                Size *
              </label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="small">Small (Compact cars)</option>
                <option value="medium">Medium (Sedans, SUVs)</option>
                <option value="large">Large (Trucks, Vans)</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="open">Open Parking</option>
                <option value="covered">Covered Parking</option>
                <option value="garage">Garage</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700 mb-2">
                Price per Hour (₹) *
              </label>
              <input
                type="number"
                id="pricePerHour"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                placeholder="50"
                min="1"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            {/* Availability */}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                Availability *
              </label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="24/7">24/7</option>
                <option value="daytime">Daytime Only</option>
                <option value="nighttime">Nighttime Only</option>
                <option value="custom">Custom Hours</option>
              </select>
            </div>

            {/* Available From (if custom) */}
            {formData.availability === "custom" && (
              <>
                <div>
                  <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700 mb-2">
                    Available From
                  </label>
                  <input
                    type="time"
                    id="availableFrom"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="availableTo" className="block text-sm font-medium text-gray-700 mb-2">
                    Available To
                  </label>
                  <input
                    type="time"
                    id="availableTo"
                    name="availableTo"
                    value={formData.availableTo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Rules */}
          <div className="mt-4">
            <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
              Rules & Instructions
            </label>
            <textarea
              id="rules"
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              placeholder="e.g., No overnight parking, Maximum 2 hours, etc."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/owner/spots")}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Approval"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
