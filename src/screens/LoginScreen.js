import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Estados para alternar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signIn, signUp, loading } = useAuth();

  const handleSubmit = async () => {
    // 1. Validar campos obligatorios
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atención', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (isRegistering) {
      if (!fullName.trim()) {
        Alert.alert('Atención', 'Por favor ingresa tu nombre completo.');
        return;
      }

      if (!confirmPassword.trim()) {
        Alert.alert('Atención', 'Por favor confirma tu contraseña.');
        return;
      }

      // 2. Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden. Por favor verifica.');
        return;
      }
    }

    try {
      if (isRegistering) {
        await signUp(email.trim(), password, { full_name: fullName.trim() });
        Alert.alert('Éxito', 'Registro completado. Ya puedes acceder.');
      } else {
        await signIn(email.trim(), password);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error de Autenticación', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
      </Text>
      <Text style={styles.subtitle}>
        {isRegistering
          ? 'Únete a VECTUM para gestionar tus vehículos'
          : 'Accede a tu cuenta de VECTUM'}
      </Text>

      {/* Nombre Completo (Solo Registro) */}
      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={fullName}
          onChangeText={setFullName}
        />
      )}

      {/* Correo Electrónico */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Contraseña Principal con Ojo */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {/* Confirmar Contraseña con Ojo (Solo Registro) */}
      {isRegistering && (
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirmar contraseña"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Botón de Acción */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isRegistering ? 'Registrarse' : 'Ingresar'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Cambiar entre Login y Registro */}
      <TouchableOpacity
        onPress={() => {
          setIsRegistering(!isRegistering);
          setConfirmPassword('');
        }}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          {isRegistering
            ? '¿Ya tienes cuenta? Inicia Sesión'
            : '¿No tienes cuenta? Regístrate'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
  },
  eyeButton: {
    paddingHorizontal: 14,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#2563eb',
    fontSize: 14,
  },
});