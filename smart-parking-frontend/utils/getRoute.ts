import { RouteData } from '@/types';

/**
 * Fetch route from OSRM API
 * @param driverLat - Driver's latitude
 * @param driverLng - Driver's longitude
 * @param spotLat - Parking spot's latitude
 * @param spotLng - Parking spot's longitude
 * @param mode - Transportation mode: 'driving' | 'walking' | 'cycling' (default: 'driving')
 * @returns Route data with geometry, distance, and duration
 */
export async function getRoute(
  driverLat: number,
  driverLng: number,
  spotLat: number,
  spotLng: number,
  mode: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<RouteData | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/${mode}/${driverLng},${driverLat};${spotLng},${spotLat}?geometries=geojson&overview=full`;

    const response = await fetch(url);
    
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('OSRM API error:', data);
      return null;
    }

    const route = data.routes[0];

    return {
      geometry: route.geometry,
      distance: route.distance, // meters
      duration: route.duration, // seconds
    };
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      console.warn('Route fetch timed out after 6 seconds.');
    } else {
      console.error('Error fetching route:', error);
    }
    return null;
  }
}
