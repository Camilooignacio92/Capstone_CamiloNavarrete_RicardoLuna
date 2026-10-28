import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, profile, activeRole, toggleRole, signOut } = useAuth();

  const isAdminUser = profile?.role === 'admin';

  const handleSignOut = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person-outline" size={40} color="#2563eb" />
        </View>
        <Text style={styles.userName}>
          {profile?.full_name || user?.email || 'Usuario'}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, isAdminUser ? styles.adminBadge : styles.clientBadge]}>
            <Text style={styles.badgeText}>
              {isAdminUser ? 'Cuenta Administrador' : 'Cuenta Cliente'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* CONMUTADOR DE MODO (Solo visible para Administradores) */}
        {isAdminUser && (
          <View style={styles.switchCard}>
            <View style={styles.switchTextContainer}>
              <Ionicons
                name={activeRole === 'admin' ? 'briefcase' : 'search'}
                size={22}
                color="#2563eb"
                style={{ marginRight: 10 }}
              />
              <View>
                <Text style={styles.switchTitle}>Modo Administrador</Text>
                <Text style={styles.switchSubtitle}>
                  {activeRole === 'admin'
                    ? 'Gestionando y publicando equipos'
                    : 'Explorando catálogo como cliente'}
                </Text>
              </View>
            </View>
            <Switch
              value={activeRole === 'admin'}
              onValueChange={toggleRole}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
              thumbColor={activeRole === 'admin' ? '#2563eb' : '#f8fafc'}
            />
          </View>
        )}

        {/* BOTÓN DE CERRAR SESIÓN */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  badgeContainer: {
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#dbeafe',
  },
  clientBadge: {
    backgroundColor: '#f1f5f9',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  content: {
    padding: 20,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  switchTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingVertical: 14,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: 'bold',
  },
});