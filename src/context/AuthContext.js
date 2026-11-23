import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState('client'); // 'client' | 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setActiveRole('client'); // Si cierra sesión, vuelve a modo Cliente
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleRole = () => {
    setActiveRole((prev) => (prev === 'client' ? 'admin' : 'client'));
  };

  return (
    <AuthContext.Provider value={{ user, activeRole, setActiveRole, toggleRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);