import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeRole, setActiveRole] = useState('client'); // 'client' o 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de estado de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setActiveRole('client');
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
        // Si el usuario en BD es admin, su modo por defecto inicia como admin
        if (data.role === 'admin') {
          setActiveRole('admin');
        }
      }
    } catch (err) {
      console.log('Error al cargar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para conmutar el modo de uso
  const toggleRole = () => {
    if (profile?.role !== 'admin') return; // Solo administradores pueden conmutar
    setActiveRole((prev) => (prev === 'admin' ? 'client' : 'admin'));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setActiveRole('client');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeRole,
        toggleRole,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);