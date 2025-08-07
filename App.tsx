import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import CheapestScreen from './src/screens/CheapestScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#ff6b35',
    primaryContainer: '#ffeee6',
    secondary: '#2196f3',
  },
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <StatusBar barStyle="light-content" backgroundColor="#ff6b35" />
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName: string;

                  switch (route.name) {
                    case 'Home':
                      iconName = 'local-gas-station';
                      break;
                    case 'Cheapest':
                      iconName = 'trending-down';
                      break;
                    case 'Favorites':
                      iconName = 'favorite';
                      break;
                    case 'Profile':
                      iconName = 'person';
                      break;
                    default:
                      iconName = 'help';
                  }

                  return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#ff6b35',
                tabBarInactiveTintColor: 'gray',
                headerStyle: {
                  backgroundColor: '#ff6b35',
                },
                headerTintColor: '#fff',
              })}
            >
              <Tab.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ title: 'Fuel Stations' }}
              />
              <Tab.Screen 
                name="Cheapest" 
                component={CheapestScreen}
                options={{ title: 'Cheapest' }}
              />
              <Tab.Screen 
                name="Favorites" 
                component={FavoritesScreen}
                options={{ title: 'Favorites' }}
              />
              <Tab.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ title: 'Profile' }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default App;