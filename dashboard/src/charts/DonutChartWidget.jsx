import React from 'react';
import { Card, CardContent, Box, Typography, alpha, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#3b82f6', '#a855f7'
];

const CustomTooltip = ({ active, payload, theme }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const pct = p.payload.total ? ((p.value / p.payload.total) * 100).toFixed(1) : 0;
  return (
    <Box sx={{
      background: alpha(theme.palette.background.paper, 0.95),
      backdropFilter: 'blur(12px)',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 3,
      p: 2,
      boxShadow: '0 12px 30px -10px rgba(0,0,0,0.4)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: p.payload.fill || COLORS[0] }} />
        <Typography variant="body2" color="text.primary" fontWeight={700}>
          {p.name}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Count: <strong style={{ color: theme.palette.text.primary, fontSize: '0.85rem' }}>{p.value.toLocaleString()}</strong>
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        Share: <strong style={{ color: theme.palette.text.primary, fontSize: '0.85rem' }}>{pct}%</strong>
      </Typography>
    </Box>
  );
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.08) return null; // Hide labels for thin slices to prevent overlap
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700, pointerEvents: 'none' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DonutChartWidget({ title, subtitle, data = [], height = 280, innerText }) {
  const theme = useTheme();
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const enriched = data.map((d, i) => ({ ...d, total, fill: COLORS[i % COLORS.length] }));

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
          <Box sx={{ position: 'relative', flex: 1, minHeight: height, mt: 1 }}>
            <ResponsiveContainer width="100%" height={height}>
              {/* Positive margins (top: 10, bottom: 28) and adjusted outerRadius so pie slices and legends are never cropped */}
              <PieChart margin={{ top: 10, right: 10, bottom: 28, left: 10 }}>
                <Pie
                  data={enriched}
                  cx="50%"
                  cy="44%"
                  innerRadius={Math.min(75, height * 0.22)}
                  outerRadius={Math.min(115, height * 0.35)}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={CustomLabel}
                >
                  {enriched.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 16 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {innerText && (
              <Box sx={{
                position: 'absolute',
                top: '44%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}>
                <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.1 }}>
                  {total.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mt: 0.3 }}>
                  {innerText}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
