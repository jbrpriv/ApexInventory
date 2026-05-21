import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('apex_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('apex_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      // Set background on html/body directly so it matches instantly
      document.documentElement.style.background = '#0F0F11';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.background = 'var(--bg)';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
