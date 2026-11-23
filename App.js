import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';
import AddVehicleScreen from './src/screens/AddVehicleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ClientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminFleetScreen" component={HomeScreen} />
      <Stack.Screen name="AddVehicleScreen" component={AddVehicleScreen} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      ) : (
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

function MainNavigator() {
  const { user, activeRole } = useAuth();
  const { theme } = useTheme();
  const isAdminMode = user && activeRole === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme?.dark ? '#60a5fa' : isAdminMode ? '#0f172a' : '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopColor: theme?.border || '#e2e8f0',
          backgroundColor: theme?.tabBar || '#ffffff',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Explorar') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Mi Flota') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Publicar') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Cuenta') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {isAdminMode ? (
        <>
          <Tab.Screen name="Mi Flota" component={AdminStack} />
          <Tab.Screen name="Publicar" component={AddVehicleScreen} />
        </>
      ) : (
        <Tab.Screen name="Explorar" component={ClientStack} />
      )}

      <Tab.Screen name="Cuenta" component={AccountStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}