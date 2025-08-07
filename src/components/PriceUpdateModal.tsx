import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Modal,
  Portal,
  Card,
  Title,
  Button,
  TextInput,
  SegmentedButtons,
  Paragraph,
} from 'react-native-paper';
import { FuelStation, PriceUpdate } from '../types';
import ApiService from '../services/ApiService';

interface PriceUpdateModalProps {
  visible: boolean;
  onDismiss: () => void;
  station: FuelStation | null;
  onUpdate: () => void;
}

const PriceUpdateModal: React.FC<PriceUpdateModalProps> = ({
  visible,
  onDismiss,
  station,
  onUpdate,
}) => {
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('petrol');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!station || !price) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      
      const update: PriceUpdate = {
        stationId: station.id,
        fuelType,
        price: numPrice,
        reportedBy: 'user', // In real app, use actual user ID
      };

      await ApiService.updateStationPrice(update);
      
      Alert.alert('Success', 'Price updated successfully!', [
        { text: 'OK', onPress: () => {
          onUpdate();
          onDismiss();
          setPrice('');
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = station ? (fuelType === 'petrol' ? station.petrolPrice : station.dieselPrice) : 0;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card>
          <Card.Content>
            <Title style={styles.title}>Update Fuel Price</Title>
            
            {station && (
              <>
                <Paragraph style={styles.stationInfo}>
                  {station.name} - {station.brand}
                </Paragraph>
                <Paragraph style={styles.address}>{station.address}</Paragraph>

                <View style={styles.section}>
                  <Paragraph style={styles.label}>Fuel Type:</Paragraph>
                  <SegmentedButtons
                    value={fuelType}
                    onValueChange={setFuelType}
                    buttons={[
                      { value: 'petrol', label: 'Petrol' },
                      { value: 'diesel', label: 'Diesel' },
                    ]}
                  />
                </View>

                <View style={styles.section}>
                  <Paragraph style={styles.currentPrice}>
                    Current {fuelType} price: N${currentPrice.toFixed(2)}
                  </Paragraph>
                </View>

                <View style={styles.section}>
                  <TextInput
                    label="New Price (N$)"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    mode="outlined"
                    placeholder="0.00"
                    left={<TextInput.Affix text="N$" />}
                  />
                </View>

                <Paragraph style={styles.disclaimer}>
                  Please ensure the price is accurate. False reporting may result in account suspension.
                </Paragraph>
              </>
            )}
          </Card.Content>

          <Card.Actions style={styles.actions}>
            <Button onPress={onDismiss} disabled={loading}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !price}
            >
              Update Price
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  stationInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    color: '#666',
    marginBottom: 16,
  },
  section: {
    marginVertical: 12,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  currentPrice: {
    fontSize: 16,
    color: '#2e7d2e',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  actions: {
    justifyContent: 'flex-end',
  },
});

export default PriceUpdateModal;