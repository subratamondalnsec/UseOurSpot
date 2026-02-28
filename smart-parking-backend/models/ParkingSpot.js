// ParkingSpot Model — Smart Parking System
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ratingSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User' },
  rating:    { type: Number, min: 1, max: 5 },
  comment:   { type: String },
  createdAt: { type: Date, default: Date.now },
});

const parkingSpotSchema = new Schema(
  {
    ownerId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    address:       { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    photos:        [{ type: String }],                         // Cloudinary URLs
    size:          { type: String, enum: ['small', 'medium', 'large'] },
    type:          { type: String, enum: ['open', 'covered','garage'] },
    rules:         { type: String },
    availability:  { type: String, enum: ['always', 'event-based', 'custom'] },
    availableFrom: { type: String },
    availableTo:   { type: String },
    pricePerHour:  { type: Number, required: true },
    status:        { type: String, enum: ['free', 'occupied'], default: 'free' },
    isApproved:    { type: Boolean, default: true },
    ratings:       [ratingSchema],
    averageRating: { type: Number, default: 0 },
    createdAt:     { type: Date, default: Date.now },
  }
);

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);
