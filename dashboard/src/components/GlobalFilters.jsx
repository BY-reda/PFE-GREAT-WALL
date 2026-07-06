import React from 'react';
import {
  Box, Card, CardContent, Select, MenuItem, FormControl,
  InputLabel, Button, Typography, Chip, alpha, useTheme
} from '@mui/material';
import { MdFilterAlt, MdClear } from 'react-icons/md';
import { useData } from '../context/DataContext';

export default function GlobalFilters() {
  const theme = useTheme();
  const { filters, filterOptions, updateFilter, resetFilters } = useData();
  const hasFilters = Object.values(filters).some((v) => v !== '');

  const fields = [
    { key: 'university', label: 'University', options: filterOptions.universities },
    { key: 'degree', label: 'Degree', options: filterOptions.degrees },
    { key: 'major', label: 'Program', options: filterOptions.majors },
    { key: 'scholarship', label: 'Scholarship', options: filterOptions.scholarships },
    { key: 'englishTest', label: 'English Test', options: filterOptions.englishTests },
    {
      key: 'docStatus', label: 'File Status',
      options: ['complete', 'incomplete'],
      labels: { complete: '✓ Complete Files', incomplete: '✗ Incomplete Files' },
    },
  ];

  return (
    <Card sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`, bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 1 }}>
            <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, display: 'flex' }}>
              <MdFilterAlt size={18} />
            </Box>
            <Typography variant="caption" fontWeight={800} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem' }}>
              Filter Criteria
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, flex: 1 }}>
            {fields.map((f) => (
              <FormControl key={f.key} size="small" sx={{ minWidth: 150, flexGrow: { xs: 1, sm: 0 } }}>
                <InputLabel sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{f.label}</InputLabel>
                <Select
                  value={filters[f.key] || ''}
                  label={f.label}
                  onChange={(e) => updateFilter(f.key, e.target.value)}
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: 2.5,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                  }}
                >
                  <MenuItem value="" sx={{ fontWeight: 500, fontStyle: 'italic', color: 'text.secondary' }}>All {f.label}s</MenuItem>
                  {(f.options || []).map((o) => (
                    <MenuItem key={o} value={o} sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      {f.labels?.[o] || o}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Box>

          {hasFilters && (
            <Button
              size="small"
              startIcon={<MdClear />}
              onClick={resetFilters}
              color="error"
              variant="outlined"
              sx={{
                ml: 'auto',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 2.5,
                px: 2,
                borderWidth: 1.5,
                '&:hover': { borderWidth: 1.5, bgcolor: alpha(theme.palette.error.main, 0.08) },
              }}
            >
              Reset Filters
            </Button>
          )}
        </Box>

        {/* Active filter chips */}
        {hasFilters && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 2, pt: 1.5, borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}` }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mr: 0.5 }}>
              Active Filters:
            </Typography>
            {fields.map((f) =>
              filters[f.key] ? (
                <Chip
                  key={f.key}
                  label={`${f.label}: ${f.labels?.[filters[f.key]] || filters[f.key]}`}
                  size="small"
                  onDelete={() => updateFilter(f.key, '')}
                  color="primary"
                  variant="filled"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    '& .MuiChip-deleteIcon': { color: theme.palette.primary.main, '&:hover': { color: theme.palette.primary.dark } },
                  }}
                />
              ) : null
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
