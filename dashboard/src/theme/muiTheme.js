import { createTheme, alpha } from '@mui/material/styles';

const palette = {
  primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
  secondary: { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2' },
  success: { main: '#10b981', light: '#34d399', dark: '#059669' },
  warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
  error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
  info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
};

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...palette,
      background: {
        default: mode === 'dark' ? '#0b0d14' : '#f4f6fb',
        paper: mode === 'dark' ? '#131622' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#0f172a',
        secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
      },
      divider: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600, fontSize: '1.02rem', letterSpacing: '-0.01em' },
      subtitle2: { fontWeight: 600, fontSize: '0.875rem' },
      body1: { fontSize: '0.95rem', lineHeight: 1.6 },
      body2: { fontSize: '0.85rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'dark' ? '#334155 #0b0d14' : '#cbd5e1 #f4f6fb',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              borderRadius: 8,
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              background: mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? 'rgba(19, 22, 34, 0.85)' : '#ffffff',
            backdropFilter: 'blur(12px)',
            boxShadow:
              mode === 'dark'
                ? '0 4px 20px -2px rgba(0,0,0,0.5), 0 0 1px 1px rgba(255,255,255,0.06)'
                : '0 10px 30px -5px rgba(0,0,0,0.05), 0 0 1px 1px rgba(0,0,0,0.06)',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 18,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow:
                mode === 'dark'
                  ? '0 12px 30px -5px rgba(0,0,0,0.7), 0 0 1px 1px rgba(99,102,241,0.3)'
                  : '0 15px 35px -5px rgba(0,0,0,0.08), 0 0 1px 1px rgba(99,102,241,0.2)',
              borderColor: mode === 'dark' ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)',
            },
          }),
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '24px',
            '&:last-child': { paddingBottom: '24px' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.75rem', borderRadius: 8 },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 18px',
            boxShadow: 'none',
            fontWeight: 600,
            '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.25)' },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? '#0e1017' : '#ffffff',
            borderRight: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 10,
            fontSize: '0.8rem',
            padding: '8px 12px',
            backgroundColor: mode === 'dark' ? '#1e2235' : '#0f172a',
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '14px 18px',
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            fontSize: '0.875rem',
          },
          head: {
            fontWeight: 700,
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            color: mode === 'dark' ? '#cbd5e1' : '#334155',
          },
        },
      },
    },
  });
