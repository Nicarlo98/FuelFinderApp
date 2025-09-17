import * as Location from 'expo-location';
import { LocationObjectCoords } from 'expo-location';

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return false;
    }
    return true;
  }

  async getCurrentLocation(): Promise<LocationObjectCoords> {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    const location = await Location.getCurrentPositionAsync({});
    return location.coords;
  }

  async watchPosition(
    callback: (coords: LocationObjectCoords) => void
  ): Promise<Location.LocationSubscription> {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    return await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000,
        distanceInterval: 100,
      },
      (location) => {
        callback(location.coords);
      }
    );
  }

  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export default new LocationService();