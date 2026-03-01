// Factory functions to create icons on demand (client-side only)
export const getDriverIcon = () => {
  if (globalThis.window === undefined) return null;
  
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
  if (globalThis.window === undefined) return null;
  
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
  if (globalThis.window === undefined) return null;
  
  const L = require('leaflet');
  return L.divIcon({
    className: 'spot-marker',
    html: '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 18px;">🅿️</div>',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    popupAnchor: [0, -17.5],
  });
};

export const getCarIcon = () => {
  if (globalThis.window === undefined) return null;
  
  const L = require('leaflet');
  return L.divIcon({
    className: 'car-marker',
    html: '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px;">🚗</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Legacy exports for backward compatibility
export const driverIcon = globalThis.window ? getDriverIcon() : null;
export const nearestSpotIcon = globalThis.window ? getNearestSpotIcon() : null;
export const spotIcon = globalThis.window ? getSpotIcon() : null;
export const carIcon = globalThis.window ? getCarIcon() : null;
