const mongoose = require('mongoose');
const { Schema } = mongoose;

const carSchema = new Schema({
  licensePlate: { type: String, required: true, unique: true },
  color: { type: String },
  company: { type: String }, // e.g., Toyota
  model: { type: String }, // e.g., Camry
  year: { type: Number } // Manufacturing year
});

module.exports = mongoose.model('Car', carSchema);