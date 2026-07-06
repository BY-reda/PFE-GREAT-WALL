import React from 'react';
import {
  Grid, Card, CardContent, Box, Typography, Switch, Divider,
  List, ListItem, ListItemText, ListItemSecondaryAction, alpha, useTheme
} from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { useThemeMode } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

export default function Settings() {
  const { mode, toggleMode } = useThemeMode();
  const { rawStudents } = useData();
  const theme = useTheme();

  const stats = [
    { label: 'Total Student Records Loaded', value: (rawStudents?.length || 0).toLocaleString() },
    { label: 'Primary Data Source', value: 'younes.csv + younes2.csv (merged)' },
    { label: 'Parsed CSV Attributes', value: '20 normalized fields' },
    { label: 'Active Theme Preference', value: mode === 'dark' ? 'Dark Mode (Obsidian)' : 'Light Mode (Slate)' },
  ];

  return (
    <MainLayout title="System Settings & Preferences">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Appearance & Visual Theme
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List disablePadding>
                <ListItem sx={{ px: 0 }}>
                  <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: mode === 'dark' ? '#818cf8' : '#f59e0b', mr: 2, display: 'flex' }}>
                    {mode === 'dark' ? <MdDarkMode size={24} /> : <MdLightMode size={24} />}
                  </Box>
                  <ListItemText
                    primary="Dark Mode Interface"
                    secondary={`Currently active: ${mode === 'dark' ? 'Obsidian Dark' : 'Crisp Light'} theme`}
                    primaryTypographyProps={{ fontWeight: 700, fontSize: '0.95rem' }}
                    secondaryTypographyProps={{ fontSize: '0.82rem' }}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={mode === 'dark'}
                      onChange={toggleMode}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Data Source Diagnostics
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List disablePadding>
                {stats.map((stat, idx) => (
                  <ListItem key={stat.label} sx={{ px: 0, py: 1, borderBottom: idx < stats.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                    <ListItemText
                      primary={stat.label}
                      secondary={stat.value}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600, fontSize: '0.78rem' }}
                      secondaryTypographyProps={{ variant: 'body2', fontWeight: 800, color: 'text.primary', fontSize: '0.92rem', mt: 0.2 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                About Great Wall Decision Support System
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                <strong>Great Wall (طريقك نحو الدراسة في الصين)</strong> — An enterprise-grade Business Intelligence
                platform tailored for student admission agency operations in China. Designed as a Final Year Engineering Project (PFE),
                it delivers real-time analytics, predictive candidate profiling, and automated compliance auditing without requiring a backend database.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
                {['React 18', 'Vite 5', 'Material UI v6', 'Recharts 2.12', 'PapaParse', 'Framer Motion', 'CountUp.js'].map((t) => (
                  <Box
                    key={t}
                    sx={{
                      px: 2, py: 0.75,
                      borderRadius: 2.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {t}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
}
