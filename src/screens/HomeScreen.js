import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';

export default function HomeScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Categorías de maquinaria con iconos estilo marketplace
  const categories = [
    { id: '1', name: 'Tolva', icon: 'bus-outline' },
    { id: '2', name: 'Cama Baja', icon: 'car-sport-outline' },
    { id: '3', name: 'Aljibe', icon: 'water-outline' },
    { id: '4', name: 'Pluma', icon: 'construct-outline' },
    { id: '5', name: 'Excavadora', icon: 'hardware-chip-outline' },
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('transportes').select('*');
      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error('Error al cargar transportes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderVehicleCard = ({ item }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="construct-outline" size={36} color="#94A3B8" />
        <View
          style={[
            styles.badge,
            { backgroundColor: item.estado === 'Disponible' ? '#E6F4EA' : '#FEF3C7' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: item.estado === 'Disponible' ? '#137333' : '#B45309' },
            ]}
          >
            {item.estado}
          </Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.brandText}>{item.tipo || 'Maquinaria'}</Text>
        <Text style={styles.titleText}>{item.patente}</Text>
        <Text style={styles.capacityText}>Capacidad: {item.capacidad_ton} T</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Chips de Acceso Rápido (Favoritos, Historial, etc.) */}
      <View style={styles.topChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity style={styles.chipButton}>
            <Ionicons name="heart-outline" size={16} color="#334155" />
            <Text style={styles.chipText}>Favoritos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chipButton}>
            <Ionicons name="time-outline" size={16} color="#334155" />
            <Text style={styles.chipText}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chipButton}>
            <Ionicons name="person-add-outline" size={16} color="#334155" />
            <Text style={styles.chipText}>Seguidos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chipButton}>
            <Ionicons name="document-text-outline" size={16} color="#334155" />
            <Text style={styles.chipText}>Cotizaciones</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 2. Buscador de Ubicación tipo Uber */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="¿A dónde envías o necesitas maquinaria?"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 3. Categorías Circulares (Carrusel Horizontal) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <Ionicons name="chevron-forward" size={18} color="#0F172A" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <View style={[styles.circleAvatar, selectedCategory === cat.name && styles.circleAvatarActive]}>
                <Ionicons
                  name={cat.icon}
                  size={26}
                  color={selectedCategory === cat.name ? '#1E40AF' : '#475569'}
                />
              </View>
              <Text style={styles.categoryLabel}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 4. Listado Principal de Maquinarias */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Maquinaria Disponible</Text>
          <Ionicons name="chevron-forward" size={18} color="#0F172A" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1E40AF" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderVehicleCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsGrid}
          />
        )}
      </ScrollView>

      {/* 5. Barra de Navegación Inferior (Bottom Navigation) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={22} color="#1E40AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => alert('Próximamente')}>
          <Ionicons name="compass-outline" size={22} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItemAdd}
          onPress={() => navigation.navigate('AddVehicle')}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => alert('Próximamente')}>
          <Ionicons name="notifications-outline" size={22} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: StatusBar.currentHeight || 20,
  },
  topChipsContainer: {
    paddingVertical: 10,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 4,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  circleAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  circleAvatarActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  productsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 110,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    padding: 10,
  },
  brandText: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  capacityText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navItem: {
    padding: 8,
  },
  navItemAdd: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});