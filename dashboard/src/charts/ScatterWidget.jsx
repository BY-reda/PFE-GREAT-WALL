import React from 'react';
import { Card, CardContent, Box, Typography, alpha, useTheme } from '@mui/material';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ZAxis, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const CustomTooltip = ({ active, payload, theme, xLabel, yLabel }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <Box sx={{
      background: alpha(theme.palette.background.paper, 0.95),
      backdropFilter: 'blur(12px)',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 3,
      p: 2,
      boxShadow: '0 12px 30px -10px rgba(0,0,0,0.4)',
    }}>
      {data?.name && (
        <Typography variant="body2" color="text.primary" fontWeight={700} sx={{ display: 'block', mb: 1, borderBottom: `1px solid ${theme.palette.divider}`, pb: 0.5 }}>
          {data.name}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{xLabel || 'X'}:</Typography>
        <Typography variant="caption" color="text.primary" fontWeight={800}>{data?.x}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{yLabel || 'Y'}:</Typography>
        <Typography variant="caption" color="text.primary" fontWeight={800}>{data?.y}</Typography>
      </Box>
    </Box>
  );
};

export default function ScatterWidget({
  title, subtitle, data = [], xKey = 'x', yKey = 'y',
  xLabel = 'X', yLabel = 'Y', height = 320, groups = []
}) {
  const theme = useTheme();
  const useGroups = groups.length > 0;

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
              {/* Positive margins (left: 18, bottom: 36) so Y-axis labels and X-axis numbers are never cropped */}
              <ScatterChart margin={{ left: 18, right: 32, top: 20, bottom: 36 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.08)} />
                <XAxis
                  type="number" dataKey="x" name={xLabel}
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary, fontWeight: 600 }}
                  label={{ value: xLabel, position: 'insideBottom', offset: -16, fontSize: 12, fontWeight: 700, fill: theme.palette.text.primary }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  type="number" dataKey="y" name={yLabel}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary, fontWeight: 500 }}
                  label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 12, fontSize: 12, fontWeight: 700, fill: theme.palette.text.primary }}
                  axisLine={false} tickLine={false}
                />
                <ZAxis range={[40, 80]} />
                <Tooltip content={<CustomTooltip theme={theme} xLabel={xLabel} yLabel={yLabel} />} cursor={{ stroke: alpha(theme.palette.primary.main, 0.2), strokeDasharray: '3 3' }} />
                {useGroups && <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 16 }} />}
                {useGroups ? (
                  groups.map((g, i) => (
                    <Scatter key={g.name} name={g.name} data={g.data} fill={COLORS[i % COLORS.length]} opacity={0.8} />
                  ))
                ) : (
                  <Scatter data={data.map((d) => ({ x: d[xKey], y: d[yKey], name: d.name }))} fill={COLORS[0]} opacity={0.8} />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
