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
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RoleSwitchPill from '../components/RoleSwitchPill';

const CATEGORIES = [
  { label: 'Todas las categorías', value: 'Todas', icon: 'apps-outline' },
  { label: 'Tolva', value: 'Tolva', icon: 'cube-outline' },
  { label: 'Cama Baja', value: 'Cama Baja', icon: 'car-sport-outline' },
  { label: 'Aljibe', value: 'Aljibe', icon: 'water-outline' },
  { label: 'Pluma', value: 'Pluma', icon: 'construct-outline' },
  { label: 'Excavadora', value: 'Excavadora', icon: 'hammer-outline' },
];

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAYS_ES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export default function HomeScreen({ navigation }) {
  const { user, activeRole } = useAuth();
  const { theme } = useTheme();
  const isAdminMode = user && activeRole === 'admin';

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Favoritos
  const [savedIds, setSavedIds] = useState([]);
  const [showOnlySaved, setShowOnlySaved] = useState(false);

  // Calificación con estrellas
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [machineToRate, setMachineToRate] = useState(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Edición de precio (Admin)
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [machineToEditPrice, setMachineToEditPrice] = useState(null);
  const [newPriceInput, setNewPriceInput] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Calendario de Arriendo
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [machineToBook, setMachineToBook] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('rating', { ascending: false, nullsFirst: false })
        .order('rating_count', { ascending: false })
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

  const toggleSaveMachine = (id) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatCLP = (amount) => {
    const num = Number(amount) || 180000;
    return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // --- LÓGICA DEL CALENDARIO DE ARRIENDO ---
  const openBookingModal = (machine) => {
    setMachineToBook(machine);
    setCalendarDate(new Date());
    setSelectedDayStr(null);
    setBookingModalVisible(true);
  };

  const changeMonth = (offset) => {
    const next = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1);
    setCalendarDate(next);
  };

  const getCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  };

  const formatDateDisplay = (isoStr) => {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-');
    return `${d} de ${MONTHS_ES[parseInt(m, 10) - 1]} de ${y}`;
  };

  const handleConfirmBookingPrompt = () => {
    if (!selectedDayStr || !machineToBook) {
      Alert.alert('Selecciona un día', 'Por favor toca un día en el calendario para continuar.');
      return;
    }

    const formattedDate = formatDateDisplay(selectedDayStr);
    const priceText = formatCLP(machineToBook.price_per_day);

    Alert.alert(
      '¿Estás seguro?',
      `Vas a solicitar el arriendo de:\n\n• Equipo: ${machineToBook.name}\n• Arrendador: ${machineToBook.owner_name || 'Propietario Vectum'}\n• Fecha: ${formattedDate}\n• Tarifa diaria: ${priceText}\n\n¿Deseas confirmar esta fecha?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, confirmar arriendo',
          onPress: executeBooking,
        },
      ]
    );
  };

  const executeBooking = async () => {
    setSubmittingBooking(true);
    try {
      const { error } = await supabase.from('bookings').insert([
        {
          machine_id: machineToBook.id,
          machine_name: machineToBook.name,
          owner_name: machineToBook.owner_name || 'Propietario Vectum',
          client_email: user?.email || 'Cliente Invitado',
          rental_date: selectedDayStr,
          daily_price: Number(machineToBook.price_per_day) || 180000,
          status: 'Confirmada',
        },
      ]);

      if (error) throw error;

      setBookingModalVisible(false);
      Alert.alert(
        '¡Arriendo Agendado!',
        `Tu solicitud para el ${formatDateDisplay(selectedDayStr)} ha sido registrada con éxito.`
      );
    } catch (err) {
      Alert.alert('Error', 'No se pudo registrar el arriendo. Verifica la tabla bookings en Supabase.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  // --- CALIFICACIÓN ---
  const openRatingModal = (machine) => {
    setMachineToRate(machine);
    setSelectedStars(5);
    setRatingModalVisible(true);
  };

  const handleSubmitRating = async () => {
    if (!machineToRate) return;
    setSubmittingRating(true);

    try {
      const currentRating = Number(machineToRate.rating) || 0;
      const currentCount = Number(machineToRate.rating_count) || 0;

      const newCount = currentCount + 1;
      const newAverage = Number(
        ((currentRating * currentCount + selectedStars) / newCount).toFixed(1)
      );

      const { error } = await supabase
        .from('machines')
        .update({ rating: newAverage, rating_count: newCount })
        .eq('id', machineToRate.id);

      if (error) throw error;

      setRatingModalVisible(false);
      setMachineToRate(null);
      await fetchMachines();
      Alert.alert('¡Gracias!', `Calificación registrada: ${selectedStars} estrellas.`);
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la calificación.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // --- EDICIÓN DE PRECIO (ADMIN) ---
  const openPriceModal = (machine) => {
    setMachineToEditPrice(machine);
    setNewPriceInput((machine.price_per_day || '').toString());
    setPriceModalVisible(true);
  };

  const handleUpdatePrice = async () => {
    const numericPrice = parseInt(newPriceInput.replace(/\D/g, ''), 10);
    if (!numericPrice || numericPrice <= 0) {
      Alert.alert('Aviso', 'Ingresa un precio válido mayor a 0.');
      return;
    }

    setSavingPrice(true);
    try {
      const { error } = await supabase
        .from('machines')
        .update({ price_per_day: numericPrice })
        .eq('id', machineToEditPrice.id);

      if (error) throw error;

      setPriceModalVisible(false);
      setMachineToEditPrice(null);
      await fetchMachines();
      Alert.alert('Actualizado', 'Tarifa diaria modificada correctamente.');
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el precio.');
    } finally {
      setSavingPrice(false);
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
    if (showOnlySaved && !savedIds.includes(item.id)) return false;

    const matchesCategory =
      selectedCategory === 'Todas' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.plate && item.plate.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.owner_name && item.owner_name.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (catValue) => {
    if (catValue === 'Todas') return machines.length;
    return machines.filter((m) => m.category === catValue).length;
  };

  const renderMachineCard = ({ item }) => {
    const ratingValue = Number(item.rating) || 0;
    const ratingCount = Number(item.rating_count) || 0;
    const isSaved = savedIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        activeOpacity={0.85}
        onPress={() => openBookingModal(item)}
      >
        {/* FILA SUPERIOR: CATEGORÍA, ESTRELLAS, DISPONIBLE Y CORAZÓN */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeftBadges}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.badgeBg }]}>
              <Text style={[styles.categoryBadgeText, { color: theme.primary }]}>
                {item.category || 'Maquinaria'}
              </Text>
            </View>

            <View style={[styles.ratingBadge, { backgroundColor: theme.iconBox }]}>
              <Ionicons name="star" size={13} color="#f59e0b" />
              <Text style={[styles.ratingBadgeText, { color: theme.text }]}>
                {ratingCount > 0 ? ratingValue.toFixed(1) : 'Nuevo'}
              </Text>
              {ratingCount > 0 && (
                <Text style={[styles.ratingCountText, { color: theme.subtext }]}>
                  ({ratingCount})
                </Text>
              )}
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{item.status || 'Disponible'}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.heartButton,
                { backgroundColor: isSaved ? '#ffe4e6' : theme.iconBox },
              ]}
              onPress={() => toggleSaveMachine(item.id)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={18}
                color={isSaved ? '#e11d48' : theme.subtext}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* NOMBRE DEL EQUIPO */}
        <Text style={[styles.machineName, { color: theme.text }]}>{item.name}</Text>

        {/* PRECIO POR DÍA DE USO */}
        <View style={styles.priceRow}>
          <Text style={[styles.priceValue, { color: theme.text }]}>
            {formatCLP(item.price_per_day)}
          </Text>
          <Text style={[styles.priceUnit, { color: theme.subtext }]}> / día de uso</Text>
        </View>

        {/* ESPECIFICACIONES */}
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

        {/* PIE DE TARJETA: NOMBRE DEL ARRENDADOR Y ACCIONES */}
        <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
          <View style={styles.ownerInfoBox}>
            <Ionicons name="person-circle-outline" size={19} color={theme.primary} />
            <Text
              style={[styles.ownerNameText, { color: theme.subtext }]}
              numberOfLines={1}
            >
              {item.owner_name || 'Propietario Vectum'}
            </Text>
          </View>

          <View style={styles.footerRightActions}>
            {!isAdminMode && (
              <TouchableOpacity
                style={[styles.rateActionButton, { borderColor: theme.border }]}
                onPress={() => openRatingModal(item)}
              >
                <Ionicons name="star-outline" size={15} color="#f59e0b" />
                <Text style={[styles.rateActionText, { color: theme.text }]}>Calificar</Text>
              </TouchableOpacity>
            )}

            {isAdminMode && (
              <>
                <TouchableOpacity
                  style={[styles.rateActionButton, { borderColor: theme.border }]}
                  onPress={() => openPriceModal(item)}
                >
                  <Ionicons name="create-outline" size={15} color={theme.primary} />
                  <Text style={[styles.rateActionText, { color: theme.text }]}>Precio</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMachine(item.id, item.name)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ENCABEZADO DINÁMICO */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View>
          <Text style={[styles.brandTitle, { color: theme.text }]}>Vectum</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {isAdminMode
              ? 'Panel de Gestión de Flota'
              : 'Toca un equipo para agendar fecha de arriendo'}
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
          placeholder="Buscar equipo, categoría, patente o dueño..."
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

      {/* FILA DE FILTROS: CATEGORÍAS + GUARDADOS */}
      <View style={styles.filterBarRow}>
        <TouchableOpacity
          style={[
            styles.categoryDropdownBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => setCategoryModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.categoryDropdownLeft}>
            <Ionicons name="filter-outline" size={17} color={theme.primary} />
            <Text style={[styles.categoryDropdownLabel, { color: theme.subtext }]}>
              Categorías:
            </Text>
            <View style={[styles.selectedPill, { backgroundColor: theme.badgeBg }]}>
              <Text style={[styles.selectedPillText, { color: theme.primary }]}>
                {selectedCategory}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={17} color={theme.subtext} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.savedFilterBtn,
            {
              backgroundColor: showOnlySaved ? '#ffe4e6' : theme.card,
              borderColor: showOnlySaved ? '#fda4af' : theme.border,
            },
          ]}
          onPress={() => setShowOnlySaved((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={showOnlySaved || savedIds.length > 0 ? 'heart' : 'heart-outline'}
            size={18}
            color={showOnlySaved || savedIds.length > 0 ? '#e11d48' : theme.subtext}
          />
          <Text
            style={[
              styles.savedFilterText,
              { color: showOnlySaved ? '#be123c' : theme.text },
            ]}
          >
            {savedIds.length}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL CALENDARIO DE ARRIENDO */}
      <Modal
        visible={bookingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setBookingModalVisible(false)}
        >
          <View
            style={[
              styles.bookingModalBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.bookingHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bookingTitle, { color: theme.text }]}>
                  Agendar Arriendo
                </Text>
                <Text style={[styles.bookingMachineName, { color: theme.primary }]}>
                  {machineToBook?.name}
                </Text>
                <Text style={[styles.bookingOwnerText, { color: theme.subtext }]}>
                  Publicado por: {machineToBook?.owner_name || 'Propietario Vectum'} •{' '}
                  {formatCLP(machineToBook?.price_per_day)}/día
                </Text>
              </View>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            {/* NAVEGACIÓN DE MES */}
            <View style={[styles.calendarNav, { backgroundColor: theme.iconBox }]}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthArrow}>
                <Ionicons name="chevron-back" size={20} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: theme.text }]}>
                {MONTHS_ES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthArrow}>
                <Ionicons name="chevron-forward" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* CABECERA DÍAS DE LA SEMANA */}
            <View style={styles.weekRow}>
              {WEEKDAYS_ES.map((day) => (
                <Text key={day} style={[styles.weekDayText, { color: theme.subtext }]}>
                  {day}
                </Text>
              ))}
            </View>

            {/* CUADRÍCULA DE DÍAS */}
            <View style={styles.daysGrid}>
              {getCalendarDays().map((dayNum, idx) => {
                if (!dayNum) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }

                const cellDate = new Date(
                  calendarDate.getFullYear(),
                  calendarDate.getMonth(),
                  dayNum
                );
                const isPast = cellDate < today;
                const isoStr = `${calendarDate.getFullYear()}-${String(
                  calendarDate.getMonth() + 1
                ).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedDayStr === isoStr;

                return (
                  <TouchableOpacity
                    key={isoStr}
                    disabled={isPast}
                    onPress={() => setSelectedDayStr(isoStr)}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: theme.primary, borderRadius: 10 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        { color: isPast ? '#94a3b8' : theme.text },
                        isPast && { opacity: 0.4 },
                        isSelected && { color: '#ffffff', fontWeight: '800' },
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* RESUMEN FECHA ELEGIDA */}
            <View style={[styles.selectedDateBanner, { backgroundColor: theme.badgeBg }]}>
              <Ionicons name="calendar" size={18} color={theme.primary} />
              <Text style={[styles.selectedDateText, { color: theme.primary }]}>
                {selectedDayStr
                  ? `Día elegido: ${formatDateDisplay(selectedDayStr)}`
                  : 'Toca un día disponible en el calendario'}
              </Text>
            </View>

            {/* BOTÓN FIJAR DÍA */}
            <TouchableOpacity
              style={[
                styles.confirmBookingBtn,
                {
                  backgroundColor: selectedDayStr ? theme.primary : '#94a3b8',
                },
              ]}
              onPress={handleConfirmBookingPrompt}
              disabled={submittingBooking}
            >
              {submittingBooking ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.confirmBookingBtnText}>Fijar Día de Arriendo</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DESPLEGABLE DE CATEGORÍAS */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Filtrar por Categoría
              </Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              const count = getCategoryCount(cat.value);
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.modalOption,
                    isSelected && { backgroundColor: theme.badgeBg },
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat.value);
                    setCategoryModalVisible(false);
                  }}
                >
                  <View style={styles.modalOptionLeft}>
                    <Ionicons
                      name={cat.icon}
                      size={20}
                      color={isSelected ? theme.primary : theme.subtext}
                    />
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: isSelected ? theme.primary : theme.text },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </View>

                  <View style={styles.modalOptionRight}>
                    <View style={[styles.countBadge, { backgroundColor: theme.iconBox }]}>
                      <Text style={[styles.countBadgeText, { color: theme.subtext }]}>
                        {count}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={theme.primary}
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DE CALIFICACIÓN CON ESTRELLAS */}
      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRatingModalVisible(false)}
        >
          <View
            style={[
              styles.ratingModalBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.ratingModalTitle, { color: theme.text }]}>
              Calificar Maquinaria
            </Text>
            <Text style={[styles.ratingModalSubtitle, { color: theme.subtext }]}>
              {machineToRate?.name}
            </Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedStars(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= selectedStars ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= selectedStars ? '#f59e0b' : theme.subtext}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.selectedStarsLabel, { color: theme.text }]}>
              {selectedStars} {selectedStars === 1 ? 'estrella' : 'estrellas'}
            </Text>

            <View style={styles.ratingModalButtons}>
              <TouchableOpacity
                style={[styles.cancelRateBtn, { borderColor: theme.border }]}
                onPress={() => setRatingModalVisible(false)}
              >
                <Text style={[styles.cancelRateText, { color: theme.subtext }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmRateBtn, { backgroundColor: theme.primary }]}
                onPress={handleSubmitRating}
                disabled={submittingRating}
              >
                {submittingRating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmRateText}>Enviar Voto</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL EDITAR PRECIO (ADMIN) */}
      <Modal
        visible={priceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPriceModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPriceModalVisible(false)}
        >
          <View
            style={[
              styles.ratingModalBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.ratingModalTitle, { color: theme.text }]}>
              Editar Tarifa Diaria
            </Text>
            <Text style={[styles.ratingModalSubtitle, { color: theme.subtext }]}>
              {machineToEditPrice?.name}
            </Text>

            <TextInput
              style={[
                styles.priceEditInput,
                {
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              keyboardType="numeric"
              placeholder="Ej: 250000"
              placeholderTextColor={theme.subtext}
              value={newPriceInput}
              onChangeText={setNewPriceInput}
            />

            <View style={styles.ratingModalButtons}>
              <TouchableOpacity
                style={[styles.cancelRateBtn, { borderColor: theme.border }]}
                onPress={() => setPriceModalVisible(false)}
              >
                <Text style={[styles.cancelRateText, { color: theme.subtext }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmRateBtn, { backgroundColor: theme.primary }]}
                onPress={handleUpdatePrice}
                disabled={savingPrice}
              >
                {savingPrice ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmRateText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CONTADOR DE RESULTADOS */}
      <View style={styles.resultsBar}>
        <Text style={[styles.resultsText, { color: theme.subtext }]}>
          {showOnlySaved
            ? `Maquinarias guardadas (${filteredMachines.length})`
            : `Equipos disponibles (${filteredMachines.length})`}
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
              <Ionicons
                name={showOnlySaved ? 'heart-dislike-outline' : 'construct-outline'}
                size={48}
                color={theme.subtext}
              />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {showOnlySaved
                  ? 'Aún no tienes equipos guardados'
                  : 'No hay maquinaria en esta vista'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
                {showOnlySaved
                  ? 'Toca el corazón en cualquier maquinaria para guardarla aquí.'
                  : isAdminMode
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  brandTitle: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 13, marginLeft: 4 },
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
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  filterBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 10,
  },
  categoryDropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryDropdownLeft: { flexDirection: 'row', alignItems: 'center' },
  categoryDropdownLabel: { fontSize: 13, fontWeight: '600', marginLeft: 6, marginRight: 6 },
  selectedPill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  selectedPillText: { fontSize: 12, fontWeight: '700' },
  savedFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  savedFilterText: { fontSize: 13, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bookingModalBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bookingTitle: { fontSize: 18, fontWeight: '800' },
  bookingMachineName: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  bookingOwnerText: { fontSize: 12, marginTop: 2 },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  monthArrow: { padding: 4 },
  monthTitle: { fontSize: 15, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellText: { fontSize: 14, fontWeight: '600' },
  selectedDateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  selectedDateText: { fontSize: 13, fontWeight: '700' },
  confirmBookingBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBookingBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  modalContent: {
    borderRadius: 18,
    borderWidth: 1,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  modalOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  modalOptionText: { fontSize: 15, marginLeft: 12 },
  modalOptionRight: { flexDirection: 'row', alignItems: 'center' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countBadgeText: { fontSize: 12, fontWeight: '700' },
  ratingModalBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
  },
  ratingModalTitle: { fontSize: 18, fontWeight: '800' },
  ratingModalSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 18,
    textAlign: 'center',
  },
  priceEditInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    fontSize: 16,
  },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  starButton: { padding: 4 },
  selectedStarsLabel: { fontSize: 14, fontWeight: '700', marginBottom: 20 },
  ratingModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelRateBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelRateText: { fontSize: 14, fontWeight: '700' },
  confirmRateBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmRateText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  resultsBar: { paddingHorizontal: 20, marginTop: 14, marginBottom: 6 },
  resultsText: { fontSize: 13, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 95 },
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
  headerLeftBadges: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  categoryBadgeText: { fontSize: 12, fontWeight: '700' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  ratingBadgeText: { fontSize: 12, fontWeight: '700' },
  ratingCountText: { fontSize: 11, fontWeight: '600' },
  headerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  statusText: { color: '#15803d', fontSize: 11, fontWeight: '600' },
  heartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  machineName: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  priceValue: { fontSize: 18, fontWeight: '800' },
  priceUnit: { fontSize: 13, fontWeight: '500' },
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 13, marginLeft: 5 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  ownerInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  ownerNameText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  footerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rateActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  rateActionText: { fontSize: 12, fontWeight: '700' },
  deleteButton: { padding: 6, backgroundColor: '#fef2f2', borderRadius: 8 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 14 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
  },
});