export interface FuelStation {
    id: string;
    name: string;
    brand: string;
    address: string;
    latitude: number;
    longitude: number;
    petrolPrice: number;
    dieselPrice: number;
    lastUpdated: string;
    amenities: string[];
    rating: number;
    reviews: number;
    isOpen: boolean;
    openingHours: {
      [key: string]: string;
    };
    distance?: number;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    preferredFuelType: 'petrol' | 'diesel';
    maxDistance: number;
    favoriteStations: string[];
  }
  
  export interface SearchFilters {
    fuelType: 'petrol' | 'diesel' | 'both';
    maxDistance: number;
    sortBy: 'price' | 'distance' | 'rating';
    showOpenOnly: boolean;
  }
  
  export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
  }
  
  export interface PriceUpdate {
    stationId: string;
    fuelType: 'petrol' | 'diesel';
    price: number;
    reportedBy: string;
  }