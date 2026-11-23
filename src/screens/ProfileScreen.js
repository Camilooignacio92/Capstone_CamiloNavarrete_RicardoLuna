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
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { user, activeRole, toggleRole } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mi Cuenta</Text>
      </View>

      {/* TARJETA DE PERFIL */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.badgeBg }]}>
          <Ionicons name="person" size={32} color={theme.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.emailText, { color: theme.text }]}>
            {user?.email || 'Usuario Vectum'}
          </Text>
          <View style={[styles.roleTag, { backgroundColor: theme.iconBox }]}>
            <Text style={[styles.roleTagText, { color: theme.subtext }]}>
              {isAdmin ? 'Vista: Administrador de Flota' : 'Vista: Cliente / Explorador'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.subtext }]}>CONFIGURACIONES</Text>

      {/* INTERRUPTOR MODO ADMINISTRADOR (ESTILO AIRBNB) */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.switchHeader}>
          <View style={[styles.switchIconBox, { backgroundColor: theme.iconBox }]}>
            <Ionicons
              name={isAdmin ? 'construct' : 'swap-horizontal'}
              size={22}
              color={theme.text}
            />
          </View>
          <View style={styles.switchTextContainer}>
            <Text style={[styles.switchTitle, { color: theme.text }]}>Modo Administrador</Text>
            <Text style={[styles.switchDescription, { color: theme.subtext }]}>
              Gestiona tu flota, publica maquinaria y sube fichas técnicas.
            </Text>
          </View>
          <Switch
            value={isAdmin}
            onValueChange={toggleRole}
            trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* INTERRUPTOR MODO OSCURO / MODO CLARO */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.switchHeader}>
          <View style={[styles.switchIconBox, { backgroundColor: theme.iconBox }]}>
            <Ionicons
              name={isDarkMode ? 'moon' : 'sunny'}
              size={22}
              color={isDarkMode ? '#facc15' : '#f59e0b'}
            />
          </View>
          <View style={styles.switchTextContainer}>
            <Text style={[styles.switchTitle, { color: theme.text }]}>
              {isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}
            </Text>
            <Text style={[styles.switchDescription, { color: theme.subtext }]}>
              Cambia la apariencia visual de toda la aplicación.
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* ACCESO DIRECTO SI ES ADMIN */}
      {isAdmin && (
        <TouchableOpacity
          style={[styles.adminActionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Publicar')}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
          <View style={styles.adminActionText}>
            <Text style={[styles.adminActionTitle, { color: theme.text }]}>
              Publicar nueva maquinaria
            </Text>
            <Text style={[styles.adminActionSub, { color: theme.subtext }]}>
              Agregar equipo por categoría y adjuntar ficha
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
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
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  switchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
  },
  switchDescription: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  adminActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 20,
  },
  adminActionText: {
    flex: 1,
    marginLeft: 12,
  },
  adminActionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  adminActionSub: {
    fontSize: 12,
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