import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

// Driver API
export const driverAPI = {
  searchSpots: (params: { lat: number; lng: number; radius?: number }) =>
    axios.get(`${API_BASE_URL}/driver/search`, { params }),
  
  getSpot: (spotId: string) =>
    axios.get(`${API_BASE_URL}/driver/spot/${spotId}`),
};

// Booking API
export const bookingAPI = {
  create: (data: {
    spotId: string;
    startTime: string;
    endTime: string;
    carLocation: { lat: number; lng: number };
  }) => axios.post(`${API_BASE_URL}/booking/create`, data),

  getBooking: (bookingId: string) =>
    axios.get(`${API_BASE_URL}/booking/${bookingId}`),

  myBookings: () =>
    axios.get(`${API_BASE_URL}/booking/my-bookings`),

  endSession: (bookingId: string) =>
    axios.post(`${API_BASE_URL}/booking/end-session`, { bookingId }),

  extendTime: (bookingId: string, extraMinutes: number) =>
    axios.post(`${API_BASE_URL}/booking/extend`, { bookingId, extraMinutes }),

  rateSpot: (bookingId: string, rating: number) =>
    axios.post(`${API_BASE_URL}/booking/rate`, { bookingId, rating }),

  scanQR: (qrCode: string) =>
    axios.post(`${API_BASE_URL}/booking/scan-qr`, { qrCode }),

  findMyCar: (bookingId: string) =>
    axios.get(`${API_BASE_URL}/booking/find-my-car/${bookingId}`),
};

// Payment API
export const paymentAPI = {
  createOrder: (amount: number) =>
    axios.post(`${API_BASE_URL}/payment/create-order`, { amount }),

  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingId: string;
  }) => axios.post(`${API_BASE_URL}/payment/verify`, data),
};
