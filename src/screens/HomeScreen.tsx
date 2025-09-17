import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Searchbar,
  FAB,
  Portal,
  Snackbar,
  Paragraph,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import MapView, { Marker, UrlTile } from 'react-native-maps';

import StationCard from '../components/StationCard';
import FilterModal from '../components/FilterModal';
import PriceUpdateModal from '../components/PriceUpdateModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ApiService from '../services/ApiService';
import LocationService from '../services/LocationService';
import { FuelStation, SearchFilters } from '../types';
import { DEFAULT_FILTERS } from '../utils/constants';
import { LocationObjectCoords } from 'expo-location';

const HomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showPriceUpdate, setShowPriceUpdate] = useState(false);
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationObjectCoords | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  // Get user location on mount
  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const coords = await LocationService.getCurrentLocation();
      setCurrentLocation(coords);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Required', 
        'Please enable location services to find nearby fuel stations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: initializeLocation }
        ]
      );
    }
  };

  // Fetch stations query
  const {
    data: stations = [],
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['stations', currentLocation, filters],
    queryFn: () => {
      if (!currentLocation) throw new Error('Location not available');
      return ApiService.getNearbyStations(currentLocation, filters);
    },
    enabled: !!currentLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const handleUpdatePrice = (station: FuelStation) => {
    setSelectedStation(station);
    setShowPriceUpdate(true);
  };

  const handlePriceUpdated = () => {
    refetch();
    showSnackbar('Price updated successfully!');
  };

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  if (error && !currentLocation) {
    return (
      <View style={styles.errorContainer}>
        <Paragraph>Unable to get your location.</Paragraph>
        <Paragraph>Please enable location services and try again.</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search stations..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {showMap && currentLocation ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          {filteredStations.map(station => (
            <Marker
              key={station.osmId.toString()}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              title={station.name}
              description={station.brand}
            />
          ))}
        </MapView>
      ) : (
        <>
          {isLoading && !stations.length ? (
            <LoadingSpinner message="Finding nearby stations..." />
          ) : (
            <FlatList
              data={filteredStations}
              keyExtractor={(item) => item.osmId.toString()}
              renderItem={({ item }) => (
                <StationCard
                  station={item}
                  onUpdatePrice={handleUpdatePrice}
                />
              )}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={refetch} />
              }
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Paragraph>No fuel stations found in your area.</Paragraph>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      <Portal>
        <FAB.Group
          open={fabOpen}
          visible
          icon={fabOpen ? 'close' : 'menu'}
          actions={[
            {
              icon: showMap ? 'view-list' : 'map',
              label: showMap ? 'List View' : 'Map View',
              onPress: () => setShowMap(!showMap),
            },
            {
              icon: 'filter-variant',
              label: 'Filters',
              onPress: () => setShowFilters(true),
            },
            {
              icon: 'refresh',
              label: 'Refresh',
              onPress: () => refetch(),
            },
            {
              icon: 'my-location',
              label: 'My Location',
              onPress: initializeLocation,
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
          fabStyle={{ backgroundColor: '#ff6b35' }}
        />
      </Portal>

      <FilterModal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />

      <PriceUpdateModal
        visible={showPriceUpdate}
        onDismiss={() => setShowPriceUpdate(false)}
        station={selectedStation}
        onUpdate={handlePriceUpdated}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
});

export default HomeScreen;