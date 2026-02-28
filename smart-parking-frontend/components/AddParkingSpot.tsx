"use client";

import { useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { AddSpotFormData, Coordinates } from '@/types';

// Dynamic import to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-[#0a0d14] rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4A9EAD] mb-3"></div>
        <p className="text-white text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

export default function AddParkingSpot() {
  const [formData, setFormData] = useState<AddSpotFormData>({
    address: '',
    title: '',
    description: '',
    pricePerHour: '',
    type: 'open',
    size: 'medium',
    coordinates: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Handle location selection from map
  const handleLocationSelect = (coords: Coordinates) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: coords,
    }));
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.coordinates) {
      setError('Please select a location on the map');
      return;
    }

    if (!formData.address || !formData.title || !formData.pricePerHour) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/owner/add-spot`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          address: '',
          title: '',
          description: '',
          pricePerHour: '',
          type: 'open',
          size: 'medium',
          coordinates: null,
        });
        
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error adding parking spot:', err);
      setError(err.response?.data?.message || 'Failed to add parking spot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050509] to-[#0a0d14] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#08090f] border border-[#4A9EAD]/20 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Add Parking Spot</h1>
          <p className="text-gray-400 mb-8">Fill in the details to list your parking spot</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-300 mb-2">
                Spot Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Covered Garage Near Mall"
                className="w-full px-4 py-3 bg-[#0a0d14] border border-[#4A9EAD]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4A9EAD] transition-colors"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-300 mb-2">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., 123 Park Street, Kolkata"
                className="w-full px-4 py-3 bg-[#0a0d14] border border-[#4A9EAD]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4A9EAD] transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your parking spot features..."
                rows={3}
                className="w-full px-4 py-3 bg-[#0a0d14] border border-[#4A9EAD]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4A9EAD] transition-colors resize-none"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="pricePerHour" className="block text-sm font-semibold text-gray-300 mb-2">
                Price per Hour (₹) *
              </label>
              <input
                type="number"
                id="pricePerHour"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                placeholder="e.g., 50"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-[#0a0d14] border border-[#4A9EAD]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4A9EAD] transition-colors"
                required
              />
            </div>

            {/* Type and Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-gray-300 mb-2">
                  Parking Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0a0d14] border border-[#4A9EAD]/20 rounded-lg text-white focus:outline-none focus:border-[#4A9EAD] transition-colors"
                >
                  <option value="open">Open</option>
                  <option value="covered">Covered</option>
                  <option value="garage">Garage</option>
                </select>
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-semibold text-gray-300 mb-2">
                  Spot Size
                </label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0a0d14] border border-[#4A9EAD]/20 rounded-lg text-white focus:outline-none focus:border-[#4A9EAD] transition-colors"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>

            {/* Location Picker */}
            <div>
              <div className="block text-sm font-semibold text-gray-300 mb-3">
                Select Location on Map *
              </div>
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialPosition={formData.coordinates ? [formData.coordinates.lat, formData.coordinates.lng] : null}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 text-sm">✅ Parking spot added successfully!</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4A9EAD] to-[#5fbecc] text-white font-bold py-4 px-6 rounded-xl hover:shadow-[0_8px_30px_rgba(74,158,173,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Parking Spot'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
