import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '../theme/muiTheme';

const ThemeCtx = createContext();
export const useThemeMode = () => useContext(ThemeCtx);

export function AppThemeProvider({ children }) {
  const stored = localStorage.getItem('themeMode') || 'dark';
  const [mode, setMode] = useState(stored);

  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem('themeMode', next);
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeCtx.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  );
}
