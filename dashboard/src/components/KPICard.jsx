import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

function Sparkline({ data = [], color = '#6366f1', height = 36 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 84;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 6) - 3}`)
    .join(' ');
  return (
    <svg width={w} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth={2.5} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TREND_COLORS = { up: '#10b981', down: '#ef4444', neutral: '#94a3b8' };

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  trendLabel,
  sparkData,
  loading = false,
  prefix = '',
  suffix = '',
  decimals = 0,
  delay = 0,
}) {
  const theme = useTheme();
  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };
  const c = colorMap[color] || color;
  const trendDir = trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';
  const trendColor = TREND_COLORS[trendDir];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(145deg, rgba(19, 22, 34, 0.95) 0%, rgba(19, 22, 34, 0.75) 100%)`
            : '#ffffff',
          border: `1px solid ${alpha(c, theme.palette.mode === 'dark' ? 0.2 : 0.15)}`,
          boxShadow: theme.palette.mode === 'dark'
            ? `0 4px 20px -5px ${alpha(c, 0.15)}`
            : `0 10px 25px -5px ${alpha(c, 0.08)}`,
        }}
      >
        {/* Glow Top Bar */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3.5,
            background: `linear-gradient(90deg, ${c}, ${alpha(c, 0.2)})`,
          }}
        />
        <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                sx={{
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 0.5,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </Typography>
              {loading ? (
                <Skeleton width={120} height={42} />
              ) : (
                <Typography
                  variant="h4"
                  fontWeight={800}
                  color="text.primary"
                  sx={{
                    lineHeight: 1.15,
                    fontSize: { xs: '1.6rem', md: '1.85rem' },
                    letterSpacing: '-0.03em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {prefix}
                  <CountUp
                    end={typeof value === 'number' ? value : parseFloat(value) || 0}
                    duration={1.2}
                    decimals={decimals}
                    separator=","
                  />
                  {suffix}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                  sx={{
                    mt: 0.5,
                    display: 'block',
                    fontSize: '0.78rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(c, 0.2)} 0%, ${alpha(c, 0.05)} 100%)`,
                border: `1px solid ${alpha(c, 0.25)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: c,
                flexShrink: 0,
                boxShadow: `0 4px 12px ${alpha(c, 0.15)}`,
              }}
            >
              {icon}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: 2.5, pt: 1.5, borderTop: `1px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
              {trend !== undefined && (
                <Box
                  sx={{
                    px: 1,
                    py: 0.3,
                    borderRadius: 1.5,
                    bgcolor: alpha(trendColor, 0.12),
                    color: trendColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {trend > 0 ? '▲' : trend < 0 ? '▼' : '–'} {Math.abs(trend)}%
                </Box>
              )}
              {trendLabel && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                  sx={{
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {trendLabel}
                </Typography>
              )}
            </Box>
            {sparkData && <Box sx={{ flexShrink: 0, ml: 1 }}><Sparkline data={sparkData} color={c} /></Box>}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
