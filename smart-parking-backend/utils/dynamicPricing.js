const Booking = require('../models/Booking');

/**
 * Calculate dynamic price based on current demand.
 * @param {number} basePrice - Spot's base price per hour
 * @param {string} spotId    - ParkingSpot ID (reserved for area-based demand in future)
 * @returns {number} Final price per hour
 */
const calculateDynamicPrice = async (basePrice, spotId) => {
  const demand = await Booking.countDocuments({ status: 'active' });

  let price;
  if (demand > 10)     price = basePrice * 1.6;
  else if (demand > 5) price = basePrice * 1.3;
  else                 price = basePrice;

  return price;
};

module.exports = calculateDynamicPrice;
