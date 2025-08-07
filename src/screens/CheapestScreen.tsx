import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { 
  SegmentedButtons, 
  Title, 
  Paragraph,
  Card,
  Chip,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';

import StationCard from '../components/StationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PriceUpdateModal from '../components/PriceUpdateModal';
import ApiService from '../services/ApiService';
import LocationService from '../services/LocationService';
import { FuelStation, Location } from '../types';

const CheapestScreen: React.FC = () => {
  const [fuelType, setFuelType] = useState('petrol');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [showPriceUpdate, setShowPriceUpdate] = useState(false);
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const { 
    data: cheapestStations = [], 
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['cheapest-stations', currentLocation, fuelType],
    queryFn: () => {
      if (!currentLocation) throw new Error('Location not available');
      return ApiService.getCheapestStations(currentLocation, fuelType);
    },
    enabled: !!currentLocation,
    staleTime: 5 * 60 * 1000,
  });

  const handleUpdatePrice = (station: FuelStation) => {
    setSelectedStation(station);
    setShowPriceUpdate(true);
  };

  const handlePriceUpdated = () => {
    refetch();
  };

  const renderSavingsCard = () => {
    if (cheapestStations.length < 2) return null;

    const cheapest = cheapestStations[0];
    const mostExpensive = cheapestStations[cheapestStations.length - 1];
    const savings = (fuelType === 'petrol' 
      ? mostExpensive.petrolPrice - cheapest.petrolPrice 
      : mostExpensive.dieselPrice - cheapest.dieselPrice
    ).toFixed(2);

    return (
      <Card style={styles.savingsCard} mode="elevated">
        <Card.Content style={styles.savingsContent}>
          <Icon name="savings" size={32} color="#4caf50" />
          <View style={styles.savingsText}>
            <Title style={styles.savingsTitle}>Potential Savings</Title>
            <Paragraph style={styles.savingsAmount}>
              Up to N${savings} per liter
            </Paragraph>
            <Paragraph style={styles.savingsDescription}>
              By choosing the cheapest station
            </Paragraph>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderStationWithRank = ({ item, index }: { item: FuelStation; index: number }) => (
    <View style={styles.stationItem}>
      <View style={styles.rankContainer}>
        <View style={[
          styles.rankBadge,
          index === 0 ? styles.goldBadge : 
          index === 1 ? styles.silverBadge : 
          index === 2 ? styles.bronzeBadge : styles.defaultBadge
        ]}>
          {index === 0 && <Icon name="emoji-events" size={16} color="#fff" />}
          <Paragraph style={styles.rankText}>#{index + 1}</Paragraph>
        </View>
        {index === 0 && (
          <Chip mode="flat" style={styles.cheapestChip}>
            Cheapest!
          </Chip>
        )}
      </View>
      <StationCard
        station={item}
        onUpdatePrice={handleUpdatePrice}
        showDistance={true}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Find Cheapest Fuel</Title>
        <SegmentedButtons
          value={fuelType}
          onValueChange={setFuelType}
          buttons={[
            { 
              value: 'petrol', 
              label: 'Petrol',
              icon: 'local-gas-station'
            },
            { 
              value: 'diesel', 
              label: 'Diesel',
              icon: 'local-shipping'
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {isLoading ? (
        <LoadingSpinner message={`Finding cheapest ${fuelType} stations...`} />
      ) : (
        <FlatList
          data={cheapestStations}
          keyExtractor={(item) => item.id}
          renderItem={renderStationWithRank}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          ListHeaderComponent={renderSavingsCard}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="local-gas-station" size={64} color="#ccc" />
              <Paragraph style={styles.emptyText}>
                No stations found for {fuelType}
              </Paragraph>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <PriceUpdateModal
        visible={showPriceUpdate}
        onDismiss={() => setShowPriceUpdate(false)}
        station={selectedStation}
        onUpdate={handlePriceUpdated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  savingsCard: {
    margin: 16,
    marginBottom: 8,
  },
  savingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsText: {
    marginLeft: 12,
    flex: 1,
  },
  savingsTitle: {
    fontSize: 16,
    color: '#4caf50',
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  savingsDescription: {
    fontSize: 12,
    color: '#666',
  },
  stationItem: {
    position: 'relative',
  },
  rankContainer: {
    position: 'absolute',
    top: 16,
    left: 8,
    zIndex: 1,
    alignItems: 'center',
  },
  rankBadge: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    marginBottom: 4,
  },
  goldBadge: {
    backgroundColor: '#ffd700',
  },
  silverBadge: {
    backgroundColor: '#c0c0c0',
  },
  bronzeBadge: {
    backgroundColor: '#cd7f32',
  },
  defaultBadge: {
    backgroundColor: '#ff6b35',
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cheapestChip: {
    backgroundColor: '#4caf50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default CheapestScreen;