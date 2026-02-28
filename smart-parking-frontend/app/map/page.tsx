"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import SpotCard from '@/components/SpotCard';
import { Navigation } from 'lucide-react';
import { ParkingSpot, Location, ParkingFilters } from '@/types';

// Dynamic import to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#050509]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4A9EAD] mb-4"></div>
        <p className="text-white text-lg font-semibold">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapView() {
  const [filters, setFilters] = useState<ParkingFilters>({
    maxPrice: '',
    type: '',
    size: '',
  });
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get driver location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location: Location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setDriverLocation(location);
          setLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  // Fetch spots when driver location is available or filters change
  useEffect(() => {
    if (!driverLocation) return;

    fetchSpots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverLocation]);

  const fetchSpots = async () => {
    if (!driverLocation) return;
    
    setLoading(true);
    try {
      const params: any = {
        lat: driverLocation.lat,
        lng: driverLocation.lng,
      };

      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.type) params.type = filters.type;
      if (filters.size) params.size = filters.size;

      const response = await axios.get<{ success: boolean; spots: ParkingSpot[] }>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/driver/search`,
        { params }
      );

      if (response.data.success) {
        setSpots(response.data.spots);
      }
    } catch (err) {
      console.error('Error fetching spots:', err);
      setError('Failed to load parking spots');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    fetchSpots();
  };

  const handleBookSpot = () => {
    if (selectedSpot) {
      // Navigate to booking page
      alert(`Booking ${selectedSpot.address || selectedSpot.title}`);
    }
  };

  if (loading && !driverLocation) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050509]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4A9EAD] mb-4"></div>
          <p className="text-white text-lg font-semibold">Getting your location...</p>
        </div>
      </div>
    );
  }

  if (error && !driverLocation) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050509]">
        <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050509]">
      {/* Left Sidebar - Filters & Spots List */}
      <div className="w-[30%] flex flex-col border-r border-[#4A9EAD]/10 overflow-hidden">
        {/* Filter Section */}
        <div className="p-6 border-b border-[#4A9EAD]/10 bg-[#08090f]">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-[#4A9EAD]" />
            Find Parking
          </h2>

          <div className="space-y-4">
            {/* Max Price Filter */}
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-semibold text-gray-300 mb-2">
                Max Price (₹/hr)
              </label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="e.g., 50"
                className="w-full px-4 py-2.5 bg-[#0a0d14] border border-[#4A9EAD]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4A9EAD] transition-colors"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-gray-300 mb-2">
                Parking Type
              </label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 bg-[#0a0d14] border border-[#4A9EAD]/20 rounded-lg text-white focus:outline-none focus:border-[#4A9EAD] transition-colors"
              >
                <option value="">All Types</option>
                <option value="open">Open</option>
                <option value="covered">Covered</option>
                <option value="garage">Garage</option>
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label htmlFor="size" className="block text-sm font-semibold text-gray-300 mb-2">
                Spot Size
              </label>
              <select
                id="size"
                name="size"
                value={filters.size}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 bg-[#0a0d14] border border-[#4A9EAD]/20 rounded-lg text-white focus:outline-none focus:border-[#4A9EAD] transition-colors"
              >
                <option value="">All Sizes</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* Apply Filters Button */}
            <button
              onClick={handleApplyFilters}
              className="w-full bg-gradient-to-r from-[#4A9EAD] to-[#5fbecc] text-white font-bold py-3 px-6 rounded-lg hover:shadow-[0_8px_30px_rgba(74,158,173,0.5)] transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Spots List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">
              Available Spots ({spots.length})
            </h3>
            {loading && (
              <div className="text-xs text-[#4A9EAD]">Loading...</div>
            )}
          </div>

          {spots.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-400">No parking spots found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          )}

          {spots.map((spot, index) => (
            <SpotCard
              key={spot._id}
              spot={spot}
              isNearest={index === 0}
              onClick={() => setSelectedSpot(spot)}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Map */}
      <div className="w-[70%] relative">
        {driverLocation && (
          <MapComponent
            spots={spots}
            driverLocation={driverLocation}
            selectedSpot={selectedSpot}
            onSpotSelect={setSelectedSpot}
          />
        )}

        {/* Bottom Info Bar (when spot selected) */}
        {selectedSpot && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-[#4A9EAD]/20 p-6 z-[1001]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">🅿️ Nearest:</span>
                  <span className="text-white font-bold">
                    {selectedSpot.address || selectedSpot.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📏</span>
                  <span className="text-white font-bold">
                    {selectedSpot.distance?.toFixed(1)} km
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">₹</span>
                  <span className="text-green-400 font-bold">
                    {selectedSpot.pricePerHour}/hr
                  </span>
                </div>
              </div>

              <button
                onClick={handleBookSpot}
                className="bg-gradient-to-r from-[#4A9EAD] to-[#5fbecc] text-white font-bold py-3 px-8 rounded-xl hover:shadow-[0_8px_30px_rgba(74,158,173,0.5)] transition-all"
              >
                Book This Spot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
