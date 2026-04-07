import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage immediately
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') || 'light';
      // Apply theme immediately to prevent flash
      document.documentElement.setAttribute('data-theme', storedTheme);
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return storedTheme;
    }
    return 'light';
  });

  useEffect(() => {
    // Ensure theme is applied on mount
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Force re-render of all components
    setTimeout(() => {
      // IE11 compatibility: CustomEvent/StorageEvent constructors may not exist.
      try {
        let themeEvent;
        if (typeof window.CustomEvent === 'function') {
          themeEvent = new window.CustomEvent('themeChanged', { detail: newTheme });
        } else {
          themeEvent = document.createEvent('CustomEvent');
          themeEvent.initCustomEvent('themeChanged', false, false, newTheme);
        }
        window.dispatchEvent(themeEvent);
      } catch (e) {
        // No-op: theme listeners will still see the updated state via React.
      }

      // Best-effort cross-tab sync; IE11 may not fully support StorageEvent payloads.
      try {
        if (typeof window.StorageEvent === 'function') {
          window.dispatchEvent(new window.StorageEvent('storage', {
            key: 'theme',
            newValue: newTheme,
            oldValue: theme
          }));
        } else if (typeof window.Event === 'function') {
          window.dispatchEvent(new window.Event('storage'));
        }
      } catch (e) {
        // No-op
      }
    }, 10);
  };

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'theme' && e.newValue) {
        const newTheme = e.newValue;
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
