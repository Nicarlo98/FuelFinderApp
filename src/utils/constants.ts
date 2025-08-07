export const COLORS = {
    primary: '#ff6b35',
    secondary: '#2196f3',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
  };
  
  export const FUEL_BRANDS = [
    'Shell', 'BP', 'Engen', 'Caltex', 'Total', 'Sasol', 'Puma'
  ];
  
  export const DEFAULT_FILTERS: SearchFilters = {
    fuelType: 'both',
    maxDistance: 25,
    sortBy: 'distance',
    showOpenOnly: true,
  };
  
  export const API_ENDPOINTS = {
    STATIONS_NEARBY: '/stations/nearby',
    STATIONS_CHEAPEST: '/stations/cheapest',
    UPDATE_PRICE: '/stations/update-price',
    FAVORITES: '/users/favorites',
  };