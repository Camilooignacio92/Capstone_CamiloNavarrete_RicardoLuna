import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1. LISTA DE CATEGORÍAS
const CATEGORIES = [
  { id: '1', name: 'Tolva', icon: 'bus-outline' },
  { id: '2', name: 'Cama Baja', icon: 'car-outline' },
  { id: '3', name: 'Aljibe', icon: 'water-outline' },
  { id: '4', name: 'Pluma', icon: 'build-outline' },
  { id: '5', name: 'Excavadora', icon: 'hardware-chip-outline' },
];

// 2. LISTA INICIAL DE MAQUINARIA
const INITIAL_MACHINES = [
  {
    id: '1',
    name: 'CAMIÓN TOLVA 15M3',
    category: 'Tolva',
    status: 'Disponible',
    capacity: '15 T',
    plate: 'AA-10-20',
  },
  {
    id: '2',
    name: 'CAMIÓN RAMPLA CAMA BAJA',
    category: 'Cama Baja',
    status: 'En Servicio',
    capacity: '30 T',
    plate: 'BB-30-40',
  },
  {
    id: '3',
    name: 'CAMIÓN ALJIBE 10.000L',
    category: 'Aljibe',
    status: 'Disponible',
    capacity: '10 T',
    plate: 'CC-50-60',
  },
  {
    id: '4',
    name: 'CAMIÓN PLUMA 8T',
    category: 'Pluma',
    status: 'Disponible',
    capacity: '8 T',
    plate: 'DD-70-80',
  },
  {
    id: '5',
    name: 'EXCAVADORA CAT 320',
    category: 'Excavadora',
    status: 'En Servicio',
    capacity: '22 T',
    plate: 'EE-90-00',
  },
];

export default function HomeScreen() {
  // ESTADOS PRINCIPALES
  const [userRole, setUserRole] = useState('client'); // 'client' o 'admin'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [machines, setMachines] = useState(INITIAL_MACHINES);

  // MANEJADOR DE SELECCIÓN DE CATEGORÍAS
  const handleCategoryPress = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null); // Si presiona la misma, limpia el filtro
    } else {
      setSelectedCategory(categoryName); // Filtra por la categoría seleccionada
    }
  };

  // FILTRADO COMBINADO (Por categoría seleccionada y por buscador)
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

  // ACCIONES EXCLUSIVAS DE ADMINISTRADOR
  const handleChangeStatus = (machineId, currentStatus) => {
    const newStatus =
      currentStatus === 'Disponible' ? 'En Servicio' : 'Disponible';
    setMachines(
      machines.map((m) =>
        m.id === machineId ? { ...m, status: newStatus } : m
      )
    );
    Alert.alert('Estado Actualizado', `La maquinaria ahora está: ${newStatus}`);
  };

  const handleAddMachine = () => {
    Alert.alert(
      'Añadir Maquinaria',
      'Aquí se abrirá el formulario para registrar un nuevo equipo en Supabase.'
    );
  };

  // ACCIONES EXCLUSIVAS DE CLIENTE
  const handleRequestMachine = (machine) => {
    Alert.alert(
      'Solicitud Enviada',
      `Has solicitado el arriendo de la maquinaria con patente: ${machine.plate}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* BARRA SUPERIOR PARA CAMBIAR ROL (DEMO PARA EL PROFESOR) */}
      <View style={styles.roleBar}>
        <Text style={styles.roleText}>
          Rol Activo:{' '}
          <Text style={styles.roleHighlight}>{userRole.toUpperCase()}</Text>
        </Text>
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() =>
            setUserRole(userRole === 'client' ? 'admin' : 'client')
          }
        >
          <Text style={styles.switchButtonText}>
            Cambiar a {userRole === 'client' ? 'Admin' : 'Cliente'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* BARRA DE BÚSQUEDA */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="¿A dónde envías o necesitas maquinaria?"
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

        {/* SECCIÓN DE MAQUINARIA Y ACCIÓN ADMIN */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>
              {selectedCategory
                ? `Maquinaria: ${selectedCategory}`
                : 'Maquinaria Disponible'}
            </Text>
            <Text style={styles.itemCount}> ({filteredMachines.length})</Text>
          </View>

          {/* BOTÓN EXCLUSIVO DE ADMINISTRADOR */}
          {userRole === 'admin' && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddMachine}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Nueva</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LISTA DE TARJETAS DE MAQUINARIA */}
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
                  {machine.category.toUpperCase()}
                </Text>
                <Text style={styles.machinePlate}>{machine.plate}</Text>
                <Text style={styles.machineDetail}>
                  Capacidad: {machine.capacity}
                </Text>

                {/* BOTONES SEGÚN EL ROL DEL USUARIO */}
                {userRole === 'client' ? (
                  /* VISTA CLIENTE */
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
                  /* VISTA ADMINISTRADOR */
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
                No se encontraron maquinarias en esta sección.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  roleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleText: {
    fontSize: 12,
    color: '#475569',
  },
  roleHighlight: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  switchButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
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