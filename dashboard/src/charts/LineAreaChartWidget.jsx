import React from 'react';
import { Card, CardContent, Box, Typography, alpha, useTheme } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

const formatTick = (val, maxLen = 18) => {
  if (typeof val !== 'string') return val;
  return val.length > maxLen ? `${val.slice(0, maxLen)}…` : val;
};

const CustomTooltip = ({ active, payload, label, theme }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: alpha(theme.palette.background.paper, 0.95),
      backdropFilter: 'blur(12px)',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 3,
      p: 2,
      boxShadow: '0 12px 30px -10px rgba(0,0,0,0.4)',
      minWidth: 150,
    }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1, borderBottom: `1px solid ${theme.palette.divider}`, pb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((p, idx) => (
        <Box key={p.dataKey || idx} sx={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: 2, mt: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: p.color || COLORS[idx % COLORS.length] }} />
            <Typography variant="body2" color="text.primary" fontWeight={600}>
              {p.name || p.dataKey}:
            </Typography>
          </Box>
          <Typography variant="body2" color="text.primary" fontWeight={800}>
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export function AreaChartWidget({ title, subtitle, data = [], dataKey = 'value', nameKey = 'name', height = 280, areas = [] }) {
  const theme = useTheme();
  const renderAreas = areas.length > 0 ? areas : [{ key: dataKey, label: dataKey }];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom={Boolean(subtitle)}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1, minHeight: height, mt: 1 }}>
            <ResponsiveContainer width="100%" height={height}>
              {/* Positive margins (left: 14, bottom: 54) to eliminate cropped Y-axis numbers & rotated labels */}
              <AreaChart data={data} margin={{ left: 14, right: 24, top: 16, bottom: 54 }}>
                <defs>
                  {renderAreas.map((a, i) => (
                    <linearGradient key={a.key} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.08)} vertical={false} />
                <XAxis
                  dataKey={nameKey}
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary, fontWeight: 600 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tickFormatter={(val) => formatTick(val, 16)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ stroke: alpha(theme.palette.primary.main, 0.2), strokeWidth: 1.5 }} />
                {renderAreas.length > 1 && <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 16 }} />}
                {renderAreas.map((a, i) => (
                  <Area
                    key={a.key}
                    type="monotone"
                    dataKey={a.key}
                    name={a.label}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2.5}
                    fill={`url(#grad-${i})`}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function LineChartWidget({ title, subtitle, data = [], lines = [], nameKey = 'name', height = 280 }) {
  const theme = useTheme();
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom={Boolean(subtitle)}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1, minHeight: height, mt: 1 }}>
            <ResponsiveContainer width="100%" height={height}>
              {/* Positive margins (left: 14, bottom: 54) to prevent cropping */}
              <LineChart data={data} margin={{ left: 14, right: 24, top: 16, bottom: 54 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.08)} vertical={false} />
                <XAxis
                  dataKey={nameKey}
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary, fontWeight: 600 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tickFormatter={(val) => formatTick(val, 16)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ stroke: alpha(theme.palette.primary.main, 0.2), strokeWidth: 1.5 }} />
                {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 16 }} />}
                {lines.map((l, i) => (
                  <Line
                    key={l.key}
                    type="monotone"
                    dataKey={l.key}
                    name={l.label}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={3}
                    dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 0 }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
