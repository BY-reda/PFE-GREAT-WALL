import React from 'react';
import {
  AppBar, Toolbar, Box, IconButton, InputBase, Badge, Avatar,
  Typography, Tooltip, Chip, alpha, useTheme
} from '@mui/material';
import { MdSearch, MdDarkMode, MdLightMode, MdNotifications } from 'react-icons/md';
import { useThemeMode } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';

export default function Topbar({ title = 'Dashboard' }) {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const { students, loading, filters, updateFilter } = useData();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.appBar,
        transition: 'all 0.2s ease',
      }}
    >
      <Toolbar sx={{ gap: 2.5, minHeight: 72, px: { xs: 2, md: 3 } }}>
        {/* Title Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mt: 0.2 }}>
            {loading ? 'Synchronizing database…' : `Analyzing ${students.length.toLocaleString()} active student applications`}
          </Typography>
        </Box>

        {/* Global Search Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            background: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.06 : 0.04),
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            px: 2,
            py: 0.75,
            minWidth: { xs: 180, sm: 260, md: 320 },
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
              background: theme.palette.background.paper,
            },
          }}
        >
          <MdSearch size={20} color={theme.palette.text.secondary} />
          <InputBase
            placeholder="Search students, universities, majors…"
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            sx={{ fontSize: '0.9rem', fontWeight: 500, flex: 1, color: 'text.primary' }}
          />
        </Box>

        {/* Record Badge */}
        {!loading && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Chip
              size="small"
              label={`${students.length} Records`}
              color="primary"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: 2,
                px: 0.5,
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            />
          </motion.div>
        )}

        {/* Theme Mode Toggle */}
        <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} arrow>
          <IconButton
            onClick={toggleMode}
            size="small"
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              color: 'text.primary',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main },
            }}
          >
            {mode === 'dark' ? <MdLightMode size={20} color="#fbbf24" /> : <MdDarkMode size={20} color="#6366f1" />}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="System Alerts" arrow>
          <IconButton
            size="small"
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              color: 'text.primary',
              '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) },
            }}
          >
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 700 } }}>
              <MdNotifications size={20} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Profile Avatar */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            fontSize: '0.95rem',
            fontWeight: 800,
            border: `2px solid ${theme.palette.background.paper}`,
            boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
            cursor: 'pointer',
          }}
        >
          A
        </Avatar>
      </Toolbar>
    </AppBar>
  );
}
