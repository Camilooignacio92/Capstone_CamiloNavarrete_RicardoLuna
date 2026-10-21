import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';

// 1. CATEGORÍAS DE MAQUINARIA
const CATEGORIES = [
  { id: '1', name: 'Tolva', icon: 'bus-outline' },
  { id: '2', name: 'Cama Baja', icon: 'car-outline' },
  { id: '3', name: 'Aljibe', icon: 'water-outline' },
  { id: '4', name: 'Pluma', icon: 'build-outline' },
  { id: '5', name: 'Excavadora', icon: 'hardware-chip-outline' },
];

export default function HomeScreen() {
  // ESTADOS DE LA APLICACIÓN
  const [userRole, setUserRole] = useState('client'); // 'client' o 'admin'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. EFECTO INICIAL: CARGA DE DATOS Y ROL DE USUARIO
  useEffect(() => {
    fetchMachines();
    fetchUserProfile();
  }, []);

  // Consultar lista de maquinarias desde Supabase
  const fetchMachines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Error al cargar datos', error.message);
      } else {
        setMachines(data || []);
      }
    } catch (err) {
      console.error('Error de conexión con máquinas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Consultar perfil del usuario autenticado para asignar su Rol
  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (data && data.role) {
          setUserRole(data.role);
        }
      }
    } catch (err) {
      console.log('Sesión no encontrada o error al consultar perfil:', err);
    }
  };

  // 3. ACCIONES DE ADMINISTRADOR
  const handleChangeStatus = async (machineId, currentStatus) => {
    const newStatus = currentStatus === 'Disponible' ? 'En Servicio' : 'Disponible';

    const { error } = await supabase
      .from('machines')
      .update({ status: newStatus })
      .eq('id', machineId);

    if (error) {
      Alert.alert('Error de actualización', error.message);
    } else {
      setMachines(
        machines.map((m) => (m.id === machineId ? { ...m, status: newStatus } : m))
      );
      Alert.alert('Estado Actualizado', `La maquinaria ahora está: ${newStatus}`);
    }
  };

  const handleAddMachine = () => {
    Alert.alert(
      'Agregar Maquinaria',
      'Aquí se desplegará el formulario para ingresar un nuevo equipo.'
    );
  };

  // 4. ACCIONES DE CLIENTE
  const handleRequestMachine = (machine) => {
    Alert.alert(
      'Solicitud de Arriendo',
      `Has solicitado la maquinaria con patente: ${machine.plate}`
    );
  };

  // 5. FILTRADO DINÁMICO (Categoría + Buscador)
  const handleCategoryPress = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
    }
  };

  const filteredMachines = machines.filter((machine) => {
    const matchesCategory = selectedCategory
      ? machine.category === selectedCategory
      : true;
    const matchesSearch =
      machine.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* BARRA DE BÚSQUEDA */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué maquinaria estás buscando?"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* SECCIÓN DE CATEGORÍAS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          {selectedCategory && (
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Text style={styles.clearFilterText}>Ver todas</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => handleCategoryPress(cat.name)}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    isSelected && styles.iconCircleSelected,
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={24}
                    color={isSelected ? '#fff' : '#2563eb'}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryName,
                    isSelected && styles.categoryNameSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ENCABEZADO DE SECCIÓN DE MAQUINARIA + BOTÓN ADMIN */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>
              {selectedCategory
                ? `Maquinaria: ${selectedCategory}`
                : 'Maquinaria Disponible'}
            </Text>
            <Text style={styles.itemCount}> ({filteredMachines.length})</Text>
          </View>

          {/* BOTÓN VISIBLE SÓLO PARA ADMINISTRADORES */}
          {userRole === 'admin' && (
            <TouchableOpacity style={styles.addBtn} onPress={handleAddMachine}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Nueva</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* VISTA DE CARGA O REJILLA DE MAQUINARIAS */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Cargando catálogo...</Text>
          </View>
        ) : (
          <View style={styles.machinesGrid}>
            {filteredMachines.length > 0 ? (
              filteredMachines.map((machine) => (
                <View key={machine.id} style={styles.machineCard}>
                  <View style={styles.badgeContainer}>
                    <Text
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            machine.status === 'Disponible'
                              ? '#dcfce7'
                              : '#fef3c7',
                          color:
                            machine.status === 'Disponible'
                              ? '#15803d'
                              : '#b45309',
                        },
                      ]}
                    >
                      {machine.status}
                    </Text>
                  </View>

                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="build-outline" size={36} color="#2563eb" />
                  </View>

                  <Text style={styles.categorySubText}>
                    {machine.category?.toUpperCase()}
                  </Text>
                  <Text style={styles.machinePlate}>{machine.plate}</Text>
                  <Text style={styles.machineDetail}>
                    Capacidad: {machine.capacity}
                  </Text>

                  {/* VISTAS Y BOTONES ADAPTATIVOS SEGÚN EL ROL */}
                  {userRole === 'client' ? (
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor:
                            machine.status === 'Disponible'
                              ? '#2563eb'
                              : '#94a3b8',
                        },
                      ]}
                      disabled={machine.status !== 'Disponible'}
                      onPress={() => handleRequestMachine(machine)}
                    >
                      <Text style={styles.actionBtnText}>
                        {machine.status === 'Disponible'
                          ? 'Solicitar / Rentar'
                          : 'En Servicio'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#334155' }]}
                      onPress={() =>
                        handleChangeStatus(machine.id, machine.status)
                      }
                    >
                      <Text style={styles.actionBtnText}>Cambiar Estado</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No se encontraron equipos registrados en esta vista.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0f172a',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  clearFilterText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 13,
  },
  itemCount: {
    color: '#64748b',
    fontWeight: '500',
    fontSize: 14,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 2,
  },
  categoriesContainer: {
    paddingLeft: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    minWidth: 75,
  },
  categoryCardSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircleSelected: {
    backgroundColor: '#2563eb',
  },
  categoryName: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  categoryNameSelected: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 13,
  },
  machinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  machineCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  categorySubText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  machinePlate: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  machineDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 8,
  },
  actionBtn: {
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});