// Booking Model — Smart Parking System
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    spot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalAmount: { type: Number, required: true },
    qrCode: { type: String }, // base64 QR code data
    vehicleNumber: { type: String },
    // Overstay tracking
    overstayCharge: { type: Number, default: 0 },
    checkedInAt: { type: Date },
    checkedOutAt: { type: Date },
    // GPS pin for "Find My Car"
    carLocation: {
      latitude: Number,
      longitude: Number,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
