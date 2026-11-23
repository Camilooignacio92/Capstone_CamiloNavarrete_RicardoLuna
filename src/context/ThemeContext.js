import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext({});

export const lightTheme = {
  dark: false,
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  subtext: '#64748b',
  border: '#e2e8f0',
  chipBg: '#ffffff',
  chipBorder: '#cbd5e1',
  chipActiveBg: '#0f172a',
  chipActiveText: '#ffffff',
  primary: '#2563eb',
  badgeBg: '#eff6ff',
  iconBox: '#f1f5f9',
  tabBar: '#ffffff',
};

export const darkTheme = {
  dark: true,
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  subtext: '#94a3b8',
  border: '#334155',
  chipBg: '#1e293b',
  chipBorder: '#334155',
  chipActiveBg: '#2563eb',
  chipActiveText: '#ffffff',
  primary: '#3b82f6',
  badgeBg: '#172554',
  iconBox: '#334155',
  tabBar: '#1e293b',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);