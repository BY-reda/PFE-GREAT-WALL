import React from 'react';
import { Card, CardContent, Box, Typography, alpha, useTheme } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, LabelList
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#3b82f6', '#a855f7'
];

const formatTick = (val, maxLen = 22) => {
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
      minWidth: 160,
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

export default function BarChartWidget({
  title, subtitle, data = [], dataKey = 'value', nameKey = 'name',
  color, height = 320, horizontal = false, showLabel = false,
  multiBar = false, bars = [], loading = false
}) {
  const theme = useTheme();

  if (loading || !data.length) {
    return (
      <Card sx={{ height: height + 100 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height }}>
            <Typography color="text.secondary" fontWeight={500}>No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 20);

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
              {horizontal ? (
                /* Horizontal bars: Generous right margin (60px) so value numbers/labels are NEVER cropped */
                <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 60, top: 12, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.08)} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: theme.palette.text.secondary, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey={nameKey}
                    tick={{ fontSize: 12, fill: theme.palette.text.primary, fontWeight: 600 }}
                    width={180}
                    tickFormatter={(val) => formatTick(val, 24)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }} />
                  <Bar dataKey={dataKey} radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                    {showLabel && (
                      <LabelList
                        dataKey={dataKey}
                        position="right"
                        style={{ fontSize: 11, fontWeight: 700, fill: theme.palette.text.primary }}
                        formatter={(v) => v.toLocaleString()}
                      />
                    )}
                  </Bar>
                </BarChart>
              ) : multiBar ? (
                /* Multi Bar: Positive left margin (12px) & bottom margin (76px) so Y-axis numbers and rotated X-axis words are NEVER cropped */
                <BarChart data={chartData} margin={{ left: 12, right: 24, top: 20, bottom: 76 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.08)} vertical={false} />
                  <XAxis
                    dataKey={nameKey}
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary, fontWeight: 600 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    tickFormatter={(val) => formatTick(val, 18)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 20 }} />
                  {bars.map((b, i) => (
                    <Bar key={b.key} dataKey={b.key} name={b.label} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} maxBarSize={32} />
                  ))}
                </BarChart>
              ) : (
                /* Standard Vertical Bar: Positive left margin (12px) & bottom margin (76px) to eliminate cropping */
                <BarChart data={chartData} margin={{ left: 12, right: 24, top: 24, bottom: 76 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.08)} vertical={false} />
                  <XAxis
                    dataKey={nameKey}
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary, fontWeight: 600 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    tickFormatter={(val) => formatTick(val, 18)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }} />
                  <Bar dataKey={dataKey} radius={[8, 8, 0, 0]} maxBarSize={44}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                    {showLabel && (
                      <LabelList
                        dataKey={dataKey}
                        position="top"
                        style={{ fontSize: 11, fontWeight: 700, fill: theme.palette.text.primary }}
                        formatter={(v) => v.toLocaleString()}
                      />
                    )}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
