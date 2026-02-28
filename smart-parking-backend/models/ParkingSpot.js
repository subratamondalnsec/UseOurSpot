// ParkingSpot Model — Smart Parking System
const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    photos: [{ type: String }],
    rules: { type: String },
    pricePerHour: { type: Number, required: true },
    dynamicPricing: {
      enabled: { type: Boolean, default: false },
      multiplier: { type: Number, default: 1.5 }, // applied during events
    },
    availability: [
      {
        day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
        openTime: String,
        closeTime: String,
      },
    ],
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    totalSlots: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Geospatial index for real-time map queries
parkingSpotSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);
