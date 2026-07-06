import React from 'react';
import { Card, CardContent, Box, Typography, alpha, useTheme, LinearProgress, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { MdInfo, MdCheckCircle, MdWarning, MdError } from 'react-icons/md';

const TYPE_CONFIG = {
  info: { bg: 'primary', border: '#6366f1', icon: MdInfo },
  success: { bg: 'success', border: '#10b981', icon: MdCheckCircle },
  warning: { bg: 'warning', border: '#f59e0b', icon: MdWarning },
  error: { bg: 'error', border: '#ef4444', icon: MdError },
};

export function InsightCard({ title, text, type = 'info', index = 0 }) {
  const theme = useTheme();
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const color = theme.palette[cfg.bg]?.main || cfg.border;
  const IconComponent = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `1px solid ${alpha(color, 0.3)}`,
          background: alpha(color, theme.palette.mode === 'dark' ? 0.08 : 0.04),
          borderLeft: `4px solid ${color}`,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(color, 0.15),
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconComponent size={22} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              color="text.primary"
              sx={{
                mb: 0.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {text}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

export function RecommendationCard({ title, text, priority = 'medium', index = 0 }) {
  const theme = useTheme();
  const pMap = {
    urgent: { color: '#ef4444', label: 'Urgent Priority' },
    high: { color: '#f59e0b', label: 'High Priority' },
    medium: { color: '#6366f1', label: 'Medium Priority' },
    low: { color: '#10b981', label: 'Low Priority' },
  };
  const p = pMap[priority] || pMap.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card sx={{ mb: 2, borderLeft: `4px solid ${p.color}`, height: '100%' }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {title}
            </Typography>
            <Chip
              label={p.label}
              size="small"
              sx={{
                bgcolor: alpha(p.color, 0.15),
                color: p.color,
                fontWeight: 700,
                fontSize: '0.72rem',
                flexShrink: 0,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {text}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatBar({ label, value, max, color = '#6366f1', unit = '' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={600}
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mr: 1,
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={800} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          {(value ?? 0).toLocaleString()}{unit} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({pct}%)</span>
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
    </Box>
  );
}
