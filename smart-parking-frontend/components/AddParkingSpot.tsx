"use client";

import { useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AddSpotFormData, Coordinates } from '@/types';

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-xl flex items-center justify-center"
      style={{ background: "oklch(1 0 0 / 4%)", border: "1px solid oklch(1 0 0 / 10%)" }}
    >
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mb-3"
          style={{ borderColor: "oklch(0.623 0.214 259.815)" }}
        />
        <p className="text-sm" style={{ color: "oklch(0.708 0 0)" }}>Loading map...</p>
      </div>
    </div>
  ),
});

const parkingTypes = [
  {
    value: "open",
    label: "Open",
    description: "Outdoor, uncovered",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    value: "covered",
    label: "Covered",
    description: "Sheltered roof",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    ),
  },
  {
    value: "garage",
    label: "Garage",
    description: "Fully enclosed",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
];

const spotSizes = [
  {
    value: "small",
    label: "Small",
    description: "Bikes / compact cars",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
      </svg>
    ),
  },
  {
    value: "medium",
    label: "Medium",
    description: "Sedans / SUVs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="7"/>
      </svg>
    ),
  },
  {
    value: "large",
    label: "Large",
    description: "Vans / trucks",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
      </svg>
    ),
  },
];

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [typeError, setTypeError] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const handleLocationSelect = (coords: Coordinates) => {
    setFormData(prev => ({ ...prev, coordinates: coords }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let hasError = false;
    if (!formData.type) { setTypeError(true); hasError = true; }
    if (!formData.size) { setSizeError(true); hasError = true; }
    if (!formData.coordinates) {
      setError('Please select a location on the map');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/owner/add-spot`,
        formData,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          address: '', title: '', description: '',
          pricePerHour: '', type: 'open', size: 'medium', coordinates: null,
        });
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add parking spot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 py-12">
      {/* Ambient blobs */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "oklch(0.488 0.243 264.376)" }}
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-40 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ background: "oklch(0.623 0.214 259.815)" }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Gradient border card */}
        <div
          className="w-full rounded-2xl p-px"
          style={{
            background: "linear-gradient(135deg, oklch(1 0 0 / 12%), oklch(1 0 0 / 4%), oklch(0.488 0.243 264.376 / 20%))",
          }}
        >
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ background: "oklch(0.145 0 0 / 92%)", backdropFilter: "blur(20px)" }}
          >
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white">Add Parking Spot</h2>
              <p className="mt-1.5 text-sm" style={{ color: "oklch(0.708 0 0)" }}>
                Fill in the details to list your parking spot.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-5">

                {/* Title */}
                <Field>
                  <FieldLabel className="text-xs font-medium" style={{ color: "oklch(0.708 0 0)" }}>
                    Spot Title *
                  </FieldLabel>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Covered Garage Near Mall"
                    required
                    className="mt-1.5"
                    style={{
                      background: "oklch(1 0 0 / 6%)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      color: "white",
                    }}
                  />
                </Field>

                {/* Address */}
                <Field>
                  <FieldLabel className="text-xs font-medium" style={{ color: "oklch(0.708 0 0)" }}>
                    Address *
                  </FieldLabel>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g., 123 Park Street, Kolkata"
                    required
                    className="mt-1.5"
                    style={{
                      background: "oklch(1 0 0 / 6%)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      color: "white",
                    }}
                  />
                </Field>

                {/* Description */}
                <Field>
                  <FieldLabel className="text-xs font-medium" style={{ color: "oklch(0.708 0 0)" }}>
                    Description
                  </FieldLabel>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your parking spot features..."
                    rows={3}
                    className="mt-1.5 w-full resize-none rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[oklch(0.4_0_0)]"
                    style={{
                      background: "oklch(1 0 0 / 6%)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                    }}
                  />
                </Field>

                {/* Price */}
                <Field>
                  <FieldLabel className="text-xs font-medium" style={{ color: "oklch(0.708 0 0)" }}>
                    Price per Hour (₹) *
                  </FieldLabel>
                  <Input
                    name="pricePerHour"
                    type="number"
                    value={formData.pricePerHour}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    min="0"
                    step="0.01"
                    required
                    className="mt-1.5"
                    style={{
                      background: "oklch(1 0 0 / 6%)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      color: "white",
                    }}
                  />
                </Field>

                {/* Parking Type — card picker */}
                <Field>
                  <FieldLabel className="text-xs font-medium" style={{ color: "oklch(0.708 0 0)" }}>
                    Parking Type *
                  </FieldLabel>
                  <div className="mt-1.5 grid grid-cols-3 gap-3">
                    {parkingTypes.map((t) => {
                      const isSelected = formData.type === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => { setFormData(p => ({ ...p, type: t.value as any })); setTypeError(false); }}
                          className="relative flex flex-col items-start gap-1.5 rounded-xl p-4 text-left transition-all duration-150"
                          style={{
                            background: isSelected ? "oklch(0.488 0.243 264.376 / 15%)" : "oklch(1 0 0 / 5%)",
                            border: isSelected ? "1px solid oklch(0.623 0.214 259.815 / 60%)" : "1px solid oklch(1 0 0 / 10%)",
                          }}
                        >
                          {isSelected && (
                            <span className="absolute top-3 right-3 flex h-2 w-2 rounded-full"
                              style={{ background: "oklch(0.623 0.214 259.815)" }} />
                          )}
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{
                              background: isSelected ? "oklch(0.488 0.243 264.376 / 25%)" : "oklch(1 0 0 / 8%)",
                              color: isSelected ? "oklch(0.809 0.105 251.813)" : "oklch(0.708 0 0)",
                            }}
                          >
                            {t.icon}
                          </span>
                          <span className="text-sm font-semibold text-white">{t.label}</span>
                          <span className="text-xs leading-snug" style={{ color: "oklch(0.556 0 0)" }}>{t.description}</span>
                        </button>
                      );
                    })}
                  </div>
                  {typeError && <p className="mt-1.5 text-xs text-red-400">Please select a parking type.</p>}
                </Field>

                {/* Spot Size — card picker */}
                <Field>
                  <FieldLabel className="text-xs font-medium" style={{ color: "oklch(0.708 0 0)" }}>
                    Spot Size *
                  </FieldLabel>
                  <div className="mt-1.5 grid grid-cols-3 gap-3">
                    {spotSizes.map((s) => {
                      const isSelected = formData.size === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => { setFormData(p => ({ ...p, size: s.value as any })); setSizeError(false); }}
                          className="relative flex flex-col items-start gap-1.5 rounded-xl p-4 text-left transition-all duration-150"
                          style={{
                            background: isSelected ? "oklch(0.488 0.243 264.376 / 15%)" : "oklch(1 0 0 / 5%)",
                            border: isSelected ? "1px solid oklch(0.623 0.214 259.815 / 60%)" : "1px solid oklch(1 0 0 / 10%)",
                          }}
                        >
                          {isSelected && (
                            <span className="absolute top-3 right-3 flex h-2 w-2 rounded-full"
                              style={{ background: "oklch(0.623 0.214 259.815)" }} />
                          )}
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{
                              background: isSelected ? "oklch(0.488 0.243 264.376 / 25%)" : "oklch(1 0 0 / 8%)",
                              color: isSelected ? "oklch(0.809 0.105 251.813)" : "oklch(0.708 0 0)",
                            }}
                          >
                            {s.icon}
                          </span>
                          <span className="text-sm font-semibold text-white">{s.label}</span>
                          <span className="text-xs leading-snug" style={{ color: "oklch(0.556 0 0)" }}>{s.description}</span>
                        </button>
                      );
                    })}
                  </div>
                  {sizeError && <p className="mt-1.5 text-xs text-red-400">Please select a spot size.</p>}
                </Field>

                {/* Map */}
                <Field>
                  <FieldLabel className="text-xs font-medium" style={{ color: "oklch(0.708 0 0)" }}>
                    Select Location on Map *
                  </FieldLabel>
                  <div className="mt-1.5 overflow-hidden rounded-xl"
                    style={{ border: "1px solid oklch(1 0 0 / 10%)" }}
                  >
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialPosition={
                        formData.coordinates
                          ? [formData.coordinates.lat, formData.coordinates.lng]
                          : null
                      }
                    />
                  </div>
                  {formData.coordinates && (
                    <p className="mt-2 text-xs" style={{ color: "oklch(0.623 0.214 259.815)" }}>
                      ✓ Location selected: {formData.coordinates.lat.toFixed(5)}, {formData.coordinates.lng.toFixed(5)}
                    </p>
                  )}
                </Field>

                {/* Error */}
                {error && (
                  <div className="rounded-lg p-4" style={{ background: "oklch(0.704 0.191 22.216 / 10%)", border: "1px solid oklch(0.704 0.191 22.216 / 25%)" }}>
                    <p className="text-sm" style={{ color: "oklch(0.704 0.191 22.216)" }}>{error}</p>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="rounded-lg p-4" style={{ background: "oklch(0.546 0.245 262.881 / 10%)", border: "1px solid oklch(0.546 0.245 262.881 / 25%)" }}>
                    <p className="text-sm" style={{ color: "oklch(0.809 0.105 251.813)" }}>
                      ✓ Parking spot added successfully!
                    </p>
                  </div>
                )}

              </FieldGroup>

              {/* Actions */}
              <div className="mt-7 flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold"
                  style={{
                    background: "oklch(0.87 0 0)",
                    color: "oklch(0.145 0 0)",
                    height: "42px",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Adding spot...
                    </span>
                  ) : 'Add Parking Spot'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFormData({ address: '', title: '', description: '', pricePerHour: '', type: 'open', size: 'medium', coordinates: null })}
                  className="w-full text-sm"
                  style={{ color: "oklch(0.556 0 0)" }}
                >
                  Clear form
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs" style={{ color: "oklch(0.556 0 0)" }}>
              Want to manage existing spots?{" "}
              <Link href="/owner/spots" className="font-medium text-white underline-offset-4 hover:underline">
                View my spots
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}