import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Card, Title, Paragraph, Chip, Button, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FuelStation } from '../types';

interface StationCardProps {
  station: FuelStation;
  onUpdatePrice: (station: FuelStation) => void;
  showDistance?: boolean;
}

const StationCard: React.FC<StationCardProps> = ({ 
  station, 
  onUpdatePrice,
  showDistance = true 
}) => {

  const handleNavigation = () => {
    const url = Platform.select({
      ios: `maps:${station.latitude},${station.longitude}`,
      android: `geo:${station.latitude},${station.longitude}?q=${station.latitude},${station.longitude}(${station.name})`
    });

    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          const webUrl = `https://maps.google.com/?q=${station.latitude},${station.longitude}`;
          Linking.openURL(webUrl);
        }
      });
    }
  };

  const handleFavorite = () => {
    Alert.alert('Favorite', 'Added to favorites!');
  };

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Title style={styles.stationName}>{station.name}</Title>
            <Paragraph style={styles.brand}>{station.brand}</Paragraph>
          </View>
          <View style={styles.statusContainer}>
            <Chip 
              mode="outlined" 
              style={[
                styles.statusChip,
                { backgroundColor: station.isOpen ? '#e8f5e8' : '#ffe8e8' }
              ]}
              textStyle={{ color: station.isOpen ? '#2e7d2e' : '#d32f2f' }}
            >
              {station.isOpen ? 'Open' : 'Closed'}
            </Chip>
            {station.rating > 0 && (
              <View style={styles.rating}>
                <Icon name="star" size={16} color="#ffa726" />
                <Paragraph style={styles.ratingText}>{station.rating.toFixed(1)}</Paragraph>
              </View>
            )}
          </View>
        </View>

        <Paragraph style={styles.address}>{station.address}</Paragraph>
        
        {showDistance && station.distance && (
          <Paragraph style={styles.distance}>
            <Icon name="place" size={14} color="#666" />
            {` ${station.distance.toFixed(1)} km away`}
          </Paragraph>
        )}

        <View style={styles.pricesContainer}>
          <View style={styles.priceItem}>
            <Icon name="local-gas-station" size={20} color="#ff6b35" />
            <Paragraph style={styles.priceLabel}>Petrol:</Paragraph>
            <Title style={styles.price}>N${station.petrolPrice.toFixed(2)}</Title>
          </View>
          <View style={styles.priceItem}>
            <Icon name="local-shipping" size={20} color="#2196f3" />
            <Paragraph style={styles.priceLabel}>Diesel:</Paragraph>
            <Title style={styles.price}>N${station.dieselPrice.toFixed(2)}</Title>
          </View>
        </View>

        {station.amenities && station.amenities.length > 0 && (
          <View style={styles.amenities}>
            {station.amenities.slice(0, 3).map((amenity, index) => (
              <Chip key={index} mode="outlined" style={styles.amenityChip}>
                {amenity}
              </Chip>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Button 
            mode="outlined" 
            onPress={handleNavigation}
            style={styles.actionButton}
            icon="directions"
          >
            Navigate
          </Button>
          <Button 
            mode="contained" 
            onPress={() => onUpdatePrice(station)}
            style={styles.actionButton}
          >
            Update Price
          </Button>
        </View>

        <View style={styles.quickActions}>
          <IconButton 
            icon="favorite-border" 
            size={20} 
            onPress={handleFavorite}
          />
          <Paragraph style={styles.lastUpdated}>
            Updated: {new Date(station.lastUpdated).toLocaleDateString()}
          </Paragraph>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brand: {
    color: '#666',
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
  },
  address: {
    color: '#666',
    marginBottom: 8,
  },
  distance: {
    color: '#666',
    fontSize: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  priceItem: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d2e',
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  amenityChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 0.48,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
  },
});

export default StationCard;