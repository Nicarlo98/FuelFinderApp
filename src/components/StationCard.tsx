import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FuelStation } from '../types';
import { formatDistance, parseISO } from 'date-fns';

interface StationCardProps {
  station: FuelStation;
  onUpdatePrice: (station: FuelStation) => void;
}

const StationCard: React.FC<StationCardProps> = ({ station, onUpdatePrice }) => {

  const handleNavigation = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${station.latitude},${station.longitude}`,
      android: `geo:0,0?q=${station.latitude},${station.longitude}(${station.name})`
    });

    if (url) {
      Linking.openURL(url).catch(err => console.error('An error occurred', err));
    }
  };

  const timeAgo = station.lastUpdated
    ? formatDistance(parseISO(station.lastUpdated), new Date(), { addSuffix: true })
    : 'N/A';

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.stationName}>{station.name}</Title>
          <Paragraph style={styles.brand}>{station.brand}</Paragraph>
        </View>

        <Paragraph style={styles.address}>{station.address}</Paragraph>

        <View style={styles.pricesContainer}>
          <View style={styles.priceItem}>
            <Icon name="gas-station" size={20} color="#ff6b35" />
            <Paragraph style={styles.priceLabel}>Petrol</Paragraph>
            <Title style={styles.price}>
              {station.petrolPrice ? `N$ ${station.petrolPrice.toFixed(2)}` : 'N/A'}
            </Title>
          </View>
          <View style={styles.priceItem}>
            <Icon name="tanker-truck" size={20} color="#2196f3" />
            <Paragraph style={styles.priceLabel}>Diesel</Paragraph>
            <Title style={styles.price}>
              {station.dieselPrice ? `N$ ${station.dieselPrice.toFixed(2)}` : 'N/A'}
            </Title>
          </View>
        </View>

        <Paragraph style={styles.lastUpdated}>
          Price updated: {timeAgo}
        </Paragraph>

        <Card.Actions style={styles.actions}>
          <Button 
            icon="directions"
            mode="outlined" 
            onPress={handleNavigation}
            style={styles.actionButton}
          >
            Directions
          </Button>
          <Button 
            icon="upload"
            mode="contained" 
            onPress={() => onUpdatePrice(station)}
            style={styles.actionButton}
          >
            Update Price
          </Button>
        </Card.Actions>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    marginBottom: 8,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  brand: {
    fontSize: 14,
    color: '#666',
  },
  address: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  pricesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    marginTop: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default StationCard;