import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FuelStation, SearchFilters, Location, PriceUpdate } from '../types';

const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Use 10.0.2.2 for Android emulator

class ApiService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Add auth token to requests
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async getNearbyStations(
    location: Location, 
    filters: SearchFilters
  ): Promise<FuelStation[]> {
    try {
      const response = await this.api.get('/stations/nearby', {
        params: {
          lat: location.latitude,
          lng: location.longitude,
          radius: filters.maxDistance * 1000,
          fuelType: filters.fuelType,
          sortBy: filters.sortBy,
          openOnly: filters.showOpenOnly
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby stations:', error);
      throw error;
    }
  }

  async getCheapestStations(
    location: Location, 
    fuelType: string,
    limit: number = 5
  ): Promise<FuelStation[]> {
    try {
      const response = await this.api.get('/stations/cheapest', {
        params: {
          lat: location.latitude,
          lng: location.longitude,
          fuelType,
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cheapest stations:', error);
      throw error;
    }
  }

  async updateStationPrice(update: PriceUpdate): Promise<void> {
    try {
      await this.api.post(`/stations/${update.stationId}/update-price`, {
        fuelType: update.fuelType,
        price: update.price,
        reportedBy: update.reportedBy
      });
    } catch (error) {
      console.error('Error updating station price:', error);
      throw error;
    }
  }

  async getFavoriteStations(): Promise<FuelStation[]> {
    try {
      const response = await this.api.get('/users/favorites');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  async addToFavorites(stationId: string): Promise<void> {
    try {
      await this.api.post('/users/favorites', { stationId });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(stationId: string): Promise<void> {
    try {
      await this.api.delete(`/users/favorites/${stationId}`);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }
}

export default new ApiService();