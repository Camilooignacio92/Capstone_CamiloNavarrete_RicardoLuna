import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen() {
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleAuth = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      Alert.alert('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        Alert.alert(
          '¡Cuenta creada!',
          'Revisa tu correo para confirmar tu cuenta o inicia sesión directamente.'
        );
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      Alert.alert('Error de acceso', err.message || 'Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert(
        'Ingresa tu correo',
        'Escribe tu correo electrónico en el campo de arriba y luego presiona "¿Olvidaste tu contraseña?" para enviarte el enlace de recuperación.'
      );
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) throw error;

      Alert.alert(
        'Correo enviado',
        `Hemos enviado un enlace de recuperación de contraseña a:\n\n${cleanEmail}\n\nRevisa tu bandeja de entrada o carpeta de spam.`
      );
    } catch (err) {
      Alert.alert(
        'No se pudo enviar',
        err.message || 'Verifica que el correo esté bien escrito e inténtalo nuevamente.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        {/* LOGO Y BIENVENIDA */}
        <View style={styles.brandSection}>
          <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
            <Ionicons name="construct" size={34} color="#ffffff" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Vectum</Text>
          <Text style={[styles.tagline, { color: theme.subtext }]}>
            {isSignUp
              ? 'Crea tu cuenta para arrendar o gestionar flota'
              : 'Inicia sesión para explorar y arrendar maquinaria'}
          </Text>
        </View>

        {/* FORMULARIO */}
        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text }]}>Correo electrónico</Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <Ionicons name="mail-outline" size={20} color={theme.subtext} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="ejemplo@correo.com"
              placeholderTextColor={theme.subtext}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={[styles.label, { color: theme.text, marginTop: 14 }]}>Contraseña</Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={20} color={theme.subtext} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="••••••••"
              placeholderTextColor={theme.subtext}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.subtext}
              />
            </TouchableOpacity>
          </View>

          {/* BOTÓN ¿OLVIDASTE TU CONTRASEÑA? */}
          {!isSignUp && (
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPassword}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text style={[styles.forgotText, { color: theme.primary }]}>
                  ¿Olvidaste tu contraseña?
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* BOTÓN PRINCIPAL */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? 'Registrarme' : 'Iniciar Sesión'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* CAMBIAR ENTRE LOGIN Y REGISTRO */}
        <TouchableOpacity
          style={styles.switchAuthMode}
          onPress={() => setIsSignUp((prev) => !prev)}
        >
          <Text style={[styles.switchAuthText, { color: theme.subtext }]}>
            {isSignUp ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta en Vectum? '}
            <Text style={{ color: theme.primary, fontWeight: '700' }}>
              {isSignUp ? 'Inicia sesión' : 'Regístrate'}
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 6,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  switchAuthMode: {
    marginTop: 22,
    alignItems: 'center',
  },
  switchAuthText: {
    fontSize: 14,
  },
});