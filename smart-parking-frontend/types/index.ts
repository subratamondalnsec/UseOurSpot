// Location and Coordinates Types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  lat: number;
  lng: number;
}

// Parking Spot Types
export interface ParkingSpot {
  _id: string;
  owner: string;
  address: string;
  title?: string;
  description?: string;
  pricePerHour: number;
  type: 'open' | 'covered' | 'garage';
  size: 'small' | 'medium' | 'large';
  photos?: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  status?: 'free' | 'occupied';
  distance?: number;
  averageRating?: number;
  isAvailable: boolean;
  isApproved?: boolean;
  score?: number;
  rank?: number;
  label?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Route Data from OSRM
export interface RouteData {
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
  distance: number; // in meters
  duration: number; // in seconds
}

// Filter Types
export interface ParkingFilters {
  maxPrice: string;
  type: string;
  size: string;
}

// Form Data Types
export interface AddSpotFormData {
  address: string;
  title: string;
  description: string;
  pricePerHour: string;
  type: 'open' | 'covered' | 'garage';
  size: 'small' | 'medium' | 'large';
  coordinates: Coordinates | null;
}

// Component Props Types
export interface MapComponentProps {
  spots?: ParkingSpot[] | null;
  driverLocation?: Location | null;
  selectedSpot?: ParkingSpot | null;
  onSpotSelect?: ((spot: ParkingSpot | null) => void) | null;
}

export interface SpotCardProps {
  spot: ParkingSpot;
  isNearest?: boolean;
  onClick: () => void;
}

export interface LocationPickerProps {
  onLocationSelect: (coords: Coordinates) => void;
  initialPosition?: [number, number] | null;
}

// Booking Types
export interface Booking {
  _id: string;
  driverId: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  spotId: string | ParkingSpot;
  startTime: string;
  endTime: string;
  actualEndTime?: string;
  qrCode?: string;
  paymentStatus: 'pending' | 'paid';
  status: 'active' | 'completed' | 'cancelled';
  baseAmount: number;
  overstayCharge: number;
  finalAmount: number;
  carLocation?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
}
