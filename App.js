import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider } from './src/context/AuthContext';

import HomeScreen from './src/screens/HomeScreen';
import AddVehicleScreen from './src/screens/AddVehicleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';

// --- LOGS DE DIAGNÓSTICO ---
console.log('AuthProvider:', AuthProvider);
console.log('HomeScreen:', HomeScreen);
console.log('AddVehicleScreen:', AddVehicleScreen);
console.log('ProfileScreen:', ProfileScreen);
console.log('LoginScreen:', LoginScreen);
// ----------------------------

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home" 
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ presentation: 'modal', headerShown: true, title: 'Autenticación' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}