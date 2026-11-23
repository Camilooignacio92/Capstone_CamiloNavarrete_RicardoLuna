import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RoleSwitchPill from '../components/RoleSwitchPill';

const CATEGORIES = ['Todas', 'Tolva', 'Cama Baja', 'Aljibe', 'Pluma', 'Excavadora'];

export default function HomeScreen({ navigation }) {
  const { user, activeRole } = useAuth();
  const { theme } = useTheme();
  const isAdminMode = user && activeRole === 'admin';

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMachines(data || []);
    } catch (err) {
      console.error('Error al cargar maquinarias:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMachines();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMachines();
  };

  const handleOpenDocument = async (url) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Aviso', 'No se pudo abrir el enlace del documento.');
      }
    } catch (err) {
      Alert.alert('Error', 'Hubo un problema al abrir la ficha técnica.');
    }
  };

  const handleDeleteMachine = (id, name) => {
    Alert.alert(
      'Eliminar Equipo',
      `¿Estás seguro de eliminar "${name}" de tu flota?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('machines').delete().eq('id', id);
              if (error) throw error;
              fetchMachines();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el registro.');
            }
          },
        },
      ]
    );
  };

  const filteredMachines = machines.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Todas' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.plate && item.plate.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const renderMachineCard = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: theme.badgeBg }]}>
          <Text style={[styles.categoryBadgeText, { color: theme.primary }]}>
            {item.category || 'Maquinaria'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{item.status || 'Disponible'}</Text>
        </View>
      </View>

      <Text style={[styles.machineName, { color: theme.text }]}>{item.name}</Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={16} color={theme.subtext} />
          <Text style={[styles.detailText, { color: theme.subtext }]}>
            Capacidad: {item.capacity || 'N/A'}
          </Text>
        </View>

        {item.plate ? (
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={16} color={theme.subtext} />
            <Text style={[styles.detailText, { color: theme.subtext }]}>
              Patente: {item.plate}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        {item.document_url ? (
          <TouchableOpacity
            style={styles.docButton}
            onPress={() => handleOpenDocument(item.document_url)}
          >
            <Ionicons name="document-text-outline" size={18} color={theme.primary} />
            <Text style={[styles.docButtonText, { color: theme.primary }]}>
              Ver Ficha Técnica
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.noDocText, { color: theme.subtext }]}>Sin ficha adjunta</Text>
        )}

        {isAdminMode && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteMachine(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ENCABEZADO DINÁMICO */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View>
          <Text style={[styles.brandTitle, { color: theme.text }]}>Vectum</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {isAdminMode ? 'Panel de Gestión de Flota' : 'Encuentra maquinaria disponible'}
          </Text>
        </View>

        {isAdminMode && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('AddVehicleScreen')}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Nueva</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* BARRA DE BÚSQUEDA */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Ionicons name="search-outline" size={20} color={theme.subtext} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Buscar por equipo, categoría o patente..."
          placeholderTextColor={theme.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTRO DE CATEGORÍAS */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const active = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { backgroundColor: theme.chipBg, borderColor: theme.chipBorder },
                  active && {
                    backgroundColor: theme.chipActiveBg,
                    borderColor: theme.chipActiveBg,
                  },
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: theme.subtext },
                    active && { color: theme.chipActiveText },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* CONTADOR DE RESULTADOS */}
      <View style={styles.resultsBar}>
        <Text style={[styles.resultsText, { color: theme.subtext }]}>
          Equipos disponibles ({filteredMachines.length})
        </Text>
      </View>

      {/* LISTADO DE MAQUINARIA */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>
            Cargando flota...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMachines}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderMachineCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="construct-outline" size={48} color={theme.subtext} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No hay maquinaria en esta vista
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
                {isAdminMode
                  ? 'Presiona "+ Nueva" para publicar tu primer equipo.'
                  : 'Intenta con otra categoría o término de búsqueda.'}
              </Text>
            </View>
          }
        />
      )}

      {/* BOTÓN FLOTANTE ESTILO AIRBNB */}
      <RoleSwitchPill />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  categoriesWrapper: {
    marginTop: 12,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsBar: {
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 95,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
    marginRight: 5,
  },
  statusText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '600',
  },
  machineName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    marginLeft: 5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  docButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  noDocText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
  },
});