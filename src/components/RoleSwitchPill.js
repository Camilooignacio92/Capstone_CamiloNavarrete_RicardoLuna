import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function RoleSwitchPill() {
  const { user, activeRole, toggleRole } = useAuth();

  // Solo se muestra si el usuario ha iniciado sesión
  if (!user) return null;

  const isAdmin = activeRole === 'admin';

  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={toggleRole}
      activeOpacity={0.85}
    >
      <Ionicons
        name={isAdmin ? 'search-outline' : 'swap-horizontal'}
        size={18}
        color="#ffffff"
      />
      <Text style={styles.pillText}>
        {isAdmin ? 'Cambiar a modo Cliente' : 'Cambiar a modo Admin'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b', // Tono oscuro elegante tipo Airbnb
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 100,
  },
  pillText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});