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
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, activeRole, toggleRole } = useAuth();
  const isAdmin = activeRole === 'admin';

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Cuenta</Text>
      </View>

      {/* TARJETA DE PERFIL */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#2563eb" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.emailText}>{user?.email || 'Usuario Vectum'}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>
              {isAdmin ? 'Vista: Administrador de Flota' : 'Vista: Cliente / Explorador'}
            </Text>
          </View>
        </View>
      </View>

      {/* INTERRUPTOR ESTILO AIRBNB */}
      <View style={styles.switchCard}>
        <View style={styles.switchHeader}>
          <View style={styles.switchIconBox}>
            <Ionicons
              name={isAdmin ? 'construct' : 'swap-horizontal'}
              size={22}
              color="#0f172a"
            />
          </View>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchTitle}>Modo Administrador</Text>
            <Text style={styles.switchDescription}>
              Activa esta opción para publicar maquinaria, gestionar tu flota y subir fichas técnicas.
            </Text>
          </View>
          <Switch
            value={isAdmin}
            onValueChange={toggleRole}
            trackColor={{ false: '#cbd5e1', true: '#0f172a' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* ACCESO DIRECTO SI ES ADMIN */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.adminActionCard}
          onPress={() => navigation.navigate('Publicar')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#2563eb" />
          <View style={styles.adminActionText}>
            <Text style={styles.adminActionTitle}>Publicar nueva maquinaria</Text>
            <Text style={styles.adminActionSub}>
              Agregar equipo por categoría y adjuntar ficha
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      )}

      {/* BOTÓN CERRAR SESIÓN */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  switchCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  switchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  switchDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
    lineHeight: 17,
  },
  adminActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 20,
  },
  adminActionText: {
    flex: 1,
    marginLeft: 12,
  },
  adminActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  adminActionSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 'auto',
    marginBottom: 24,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});