// Factory functions to create icons on demand (client-side only)
export const getDriverIcon = () => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  return L.divIcon({
    className: 'driver-marker',
    html: '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 18px;">🧍</div>',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    popupAnchor: [0, -17.5],
  });
};

export const getNearestSpotIcon = () => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  return L.divIcon({
    className: 'nearest-spot-marker',
    html: '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px;">🅿️</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

export const getSpotIcon = () => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  return L.divIcon({
    className: 'spot-marker',
    html: '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 18px;">🅿️</div>',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    popupAnchor: [0, -17.5],
  });
};

// Legacy exports for backward compatibility
export const driverIcon = typeof window !== 'undefined' ? getDriverIcon() : null;
export const nearestSpotIcon = typeof window !== 'undefined' ? getNearestSpotIcon() : null;
export const spotIcon = typeof window !== 'undefined' ? getSpotIcon() : null;
