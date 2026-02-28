// Booking Model — Smart Parking System
const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
  driverId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  spotId:        { type: Schema.Types.ObjectId, ref: 'ParkingSpot', required: true },
  startTime:     { type: Date, required: true },
  endTime:       { type: Date, required: true },
  actualEndTime: { type: Date },
  qrCode:        { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  status:        { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  baseAmount:    { type: Number },
  overstayCharge:{ type: Number, default: 0 },
  finalAmount:   { type: Number },
  carLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
