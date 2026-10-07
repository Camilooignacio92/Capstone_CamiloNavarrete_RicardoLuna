import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../config/supabase';

export default function AddVehicleScreen({ navigation }) {
  const [patente, setPatente] = useState('');
  const [tipo, setTipo] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!patente.trim() || !tipo.trim() || !capacidad.trim()) {
      Alert.alert('Atención', 'Por favor completa todos los campos.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('transportes')
        .insert([
          {
            patente: patente.toUpperCase().trim(),
            tipo: tipo.trim(),
            capacidad_ton: parseFloat(capacidad),
            estado: 'Disponible',
          },
        ]);

      if (error) throw error;

      Alert.alert('Éxito', 'Registro D agregado correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Transporte (Registro D)</Text>

      <Text style={styles.label}>Patente</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: AB-12-34"
        value={patente}
        onChangeText={setPatente}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Tipo de Vehículo / Maquinaria</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Camión Cama Baja 25T"
        value={tipo}
        onChangeText={setTipo}
      />

      <Text style={styles.label}>Capacidad (Toneladas)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 25.0"
        keyboardType="numeric"
        value={capacidad}
        onChangeText={setCapacidad}
      />

      <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Guardar en Supabase</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 20, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  btnSave: { backgroundColor: '#16a34a', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});