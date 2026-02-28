// QR code generator utility
const QRCode = require('qrcode');

/**
 * Generate a QR code as a base64 data URL for a booking.
 * @param {Object} data - The booking data to encode (bookingId, driver, spot, etc.)
 * @returns {Promise<string>} base64 data URL string
 */
const generateQRCode = async (data) => {
  try {
    const qrString = JSON.stringify(data);
    const qrDataURL = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'H',
      width: 300,
    });
    return qrDataURL;
  } catch (error) {
    throw new Error('QR code generation failed: ' + error.message);
  }
};

module.exports = generateQRCode;
