import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Modal,
  Portal,
  Card,
  Title,
  Button,
  SegmentedButtons,
  List,
  Divider,
  Switch,
  Slider,
} from 'react-native-paper';
import { SearchFilters } from '../types';

interface FilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  filters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onDismiss,
  filters,
  onApplyFilters,
}) => {
  const [tempFilters, setTempFilters] = useState<SearchFilters>(filters);

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onDismiss();
  };

  const handleReset = () => {
    const defaultFilters: SearchFilters = {
      fuelType: 'both',
      maxDistance: 25,
      sortBy: 'distance',
      showOpenOnly: true,
    };
    setTempFilters(defaultFilters);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card>
          <Card.Content>
            <Title style={styles.title}>Filter Stations</Title>

            <List.Subheader>Fuel Type</List.Subheader>
            <SegmentedButtons
              value={tempFilters.fuelType}
              onValueChange={(value) => 
                setTempFilters({ ...tempFilters, fuelType: value as any })
              }
              buttons={[
                { value: 'petrol', label: 'Petrol' },
                { value: 'diesel', label: 'Diesel' },
                { value: 'both', label: 'Both' },
              ]}
            />

            <List.Subheader style={styles.sectionHeader}>
              Maximum Distance: {tempFilters.maxDistance} km
            </List.Subheader>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={100}
                value={tempFilters.maxDistance}
                onValueChange={(value) =>
                  setTempFilters({ ...tempFilters, maxDistance: Math.round(value) })
                }
                step={5}
                thumbColor="#ff6b35"
                minimumTrackTintColor="#ff6b35"
              />
            </View>

            <List.Subheader>Sort By</List.Subheader>
            <SegmentedButtons
              value={tempFilters.sortBy}
              onValueChange={(value) => 
                setTempFilters({ ...tempFilters, sortBy: value as any })
              }
              buttons={[
                { value: 'distance', label: 'Distance' },
                { value: 'price', label: 'Price' },
                { value: 'rating', label: 'Rating' },
              ]}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Show Open Stations Only"
              right={() => (
                <Switch
                  value={tempFilters.showOpenOnly}
                  onValueChange={(value) =>
                    setTempFilters({ ...tempFilters, showOpenOnly: value })
                  }
                />
              )}
            />
          </Card.Content>

          <Card.Actions style={styles.actions}>
            <Button onPress={handleReset}>Reset</Button>
            <Button onPress={onDismiss}>Cancel</Button>
            <Button mode="contained" onPress={handleApply}>
              Apply
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
  sectionHeader: {
    marginTop: 16,
  },
  sliderContainer: {
    paddingHorizontal: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    justifyContent: 'flex-end',
  },
});

export default FilterModal;