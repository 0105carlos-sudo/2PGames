import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined' && document.documentElement.dataset.theme) {
      return document.documentElement.dataset.theme;
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('game-theme', theme);
    } catch {
      /* ignore */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#09090d' : '#f5f5f7');
  }, [theme]);

  const toggleTheme = () => {
    // Suppress transitions for the swap so the flip snaps instead of smearing
    const css = document.createElement('style');
    css.textContent = '*,*::before,*::after{transition:none !important}';
    document.head.appendChild(css);
    void document.body.offsetWidth;
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    requestAnimationFrame(() => requestAnimationFrame(() => css.remove()));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
