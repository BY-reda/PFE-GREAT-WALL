import React from 'react';
import { Card, CardContent, Box, Typography, alpha, useTheme } from '@mui/material';
import { Treemap, ResponsiveContainer, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#3b82f6', '#a855f7'
];

const TreemapContent = ({ x, y, width, height, name, value, index, colors }) => {
  if (width < 35 || height < 25) return null;
  return (
    <g>
      <rect
        x={x + 2} y={y + 2}
        width={width - 4} height={height - 4}
        fill={colors[index % colors.length]}
        rx={8} ry={8}
        opacity={0.9}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      {width > 65 && height > 35 && (
        <text
          x={x + width / 2} y={y + height / 2 - 6}
          textAnchor="middle"
          fill="#ffffff"
          style={{ fontSize: Math.min(13, width / 9), fontWeight: 700, pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          {name}
        </text>
      )}
      {width > 65 && height > 50 && (
        <text
          x={x + width / 2} y={y + height / 2 + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          style={{ fontSize: 11, fontWeight: 600, pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          {value.toLocaleString()}
        </text>
      )}
    </g>
  );
};

export function TreemapWidget({ title, subtitle, data = [], height = 320 }) {
  const theme = useTheme();
  const mapped = data.map((d) => ({ name: d.name, size: d.value }));

  const TooltipContent = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload;
    return (
      <Box sx={{
        background: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(12px)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        p: 2,
        boxShadow: '0 12px 30px -10px rgba(0,0,0,0.4)',
      }}>
        <Typography variant="body2" color="text.primary" fontWeight={700}>
          {p?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Students: <strong style={{ color: theme.palette.text.primary, fontSize: '0.85rem' }}>{p?.size?.toLocaleString()}</strong>
        </Typography>
      </Box>
    );
  };

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
              <Treemap
                data={mapped}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="none"
                content={<TreemapContent colors={COLORS} />}
              >
                <Tooltip content={<TooltipContent />} />
              </Treemap>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RadarChartWidget({ title, subtitle, data = [], dataKeys = [], nameKey = 'name', height = 320 }) {
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
              {/* Positive margins & adjusted outerRadius (68%) so radar points and labels never collide with borders/legend */}
              <RadarChart data={data} cx="50%" cy="46%" outerRadius="68%" margin={{ top: 16, right: 24, bottom: 28, left: 24 }}>
                <PolarGrid stroke={alpha(theme.palette.text.primary, 0.1)} />
                <PolarAngleAxis dataKey={nameKey} tick={{ fontSize: 12, fill: theme.palette.text.primary, fontWeight: 600 }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} angle={30} />
                {dataKeys.map((dk, i) => (
                  <Radar
                    key={dk.key}
                    name={dk.label}
                    dataKey={dk.key}
                    stroke={COLORS[i % COLORS.length]}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.25}
                    strokeWidth={2.5}
                  />
                ))}
                {dataKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 16 }} />}
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
