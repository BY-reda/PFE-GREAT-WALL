import React, { useState, useMemo } from 'react';
import {
  Card, CardContent, Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TableSortLabel, Chip, TextField,
  InputAdornment, IconButton, Tooltip, alpha, useTheme
} from '@mui/material';
import { MdSearch, MdFileDownload } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function DataTable({
  title, rows = [], columns = [], loading = false,
  defaultRowsPerPage = 10, onExport, searchable = true, onRowClick,
}) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(q))
    );
  }, [rows, search, columns]);

  const sorted = useMemo(() => {
    if (!orderBy) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[orderBy] ?? '';
      const bv = b[orderBy] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') {
        return order === 'asc' ? av - bv : bv - av;
      }
      return order === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, order, orderBy]);

  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (col) => {
    if (orderBy === col) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(col);
      setOrder('asc');
    }
    setPage(0);
  };

  const chipColorMap = {
    'Full Scholarship': 'success',
    'Free Tuition': 'info',
    Partial: 'warning',
    'Self Support': 'default',
    Unknown: 'default',
    Bachelor: 'primary',
    Language: 'secondary',
    Master: 'error',
  };

  const renderCell = (row, col) => {
    const val = row[col.key];
    if (col.chip) {
      return (
        <Chip
          label={val || '—'}
          size="small"
          color={chipColorMap[val] || 'default'}
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap', height: 24 }}
        />
      );
    }
    if (col.dossierChip) {
      const isComplete = val === 'Complete (3/3)';
      return (
        <Chip
          label={val || '—'}
          size="small"
          color={isComplete ? 'success' : 'error'}
          variant={isComplete ? 'filled' : 'outlined'}
          sx={{ fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap', height: 24 }}
        />
      );
    }
    if (col.bool) {
      return val ? (
        <Chip label="Yes" size="small" color="success" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22, minWidth: 42 }} />
      ) : (
        <Chip label="No" size="small" color="error" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22, minWidth: 42 }} />
      );
    }
    if (col.score) {
      return val !== null && val !== undefined ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: Math.min(48, Math.max(12, (val / 100) * 48)),
            height: 5, borderRadius: 2.5,
            bgcolor: val >= 70 ? '#10b981' : val >= 55 ? '#f59e0b' : '#ef4444',
            flexShrink: 0,
          }} />
          <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ fontSize: '0.78rem' }}>{val}</Typography>
        </Box>
      ) : <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>—</Typography>;
    }
    return (
      <Typography
        variant="body2"
        color="text.primary"
        fontWeight={col.key === 'name' ? 700 : 500}
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
          fontSize: '0.8rem',
        }}
      >
        {val ?? '—'}
      </Typography>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Card sx={{ overflow: 'hidden', width: '100%' }}>
        <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">{title}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {filtered.length.toLocaleString()} records loaded
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {searchable && (
                <TextField
                  size="small"
                  placeholder="Search table…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MdSearch size={18} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: { xs: 180, sm: 220 } }}
                />
              )}
              {onExport && (
                <Tooltip title="Export to Excel">
                  <IconButton
                    size="small"
                    onClick={() => onExport(sorted)}
                    sx={{
                      p: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                    }}
                  >
                    <MdFileDownload size={20} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Table Container: Width 100%, No forced scrollbar, fits perfectly on page */}
          <TableContainer
            sx={{
              width: '100%',
              overflowX: 'auto',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Table sx={{ width: '100%', tableLayout: 'auto' }} size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col) => {
                    const isName = col.key === 'name';
                    const isUni = col.key === 'university';
                    const isMajor = col.key === 'major';
                    const isDossier = col.dossierChip;
                    return (
                      <TableCell
                        key={col.key}
                        sortDirection={orderBy === col.key ? order : false}
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.06),
                          color: 'text.primary',
                          py: 1.25,
                          px: { xs: 1, md: 1.5 },
                          borderBottom: `2px solid ${theme.palette.divider}`,
                          minWidth: isName ? 220 : isUni ? 260 : isMajor ? 160 : isDossier ? 150 : 80,
                        }}
                      >
                        {col.sortable !== false ? (
                          <TableSortLabel
                            active={orderBy === col.key}
                            direction={orderBy === col.key ? order : 'asc'}
                            onClick={() => handleSort(col.key)}
                          >
                            {col.label}
                          </TableSortLabel>
                        ) : col.label}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((row, i) => (
                  <TableRow
                    key={i}
                    hover
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 0.15s',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                    }}
                  >
                    {columns.map((col) => {
                      const isName = col.key === 'name';
                      const isUni = col.key === 'university';
                      const isMajor = col.key === 'major';
                      const isDossier = col.dossierChip;
                      return (
                        <TableCell
                          key={col.key}
                          sx={{
                            py: 1.2,
                            px: { xs: 1, md: 1.5 },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            minWidth: isName ? 220 : isUni ? 260 : isMajor ? 160 : isDossier ? 150 : 80,
                            maxWidth: isName ? 320 : isUni ? 380 : isMajor ? 240 : 200,
                          }}
                        >
                          {renderCell(row, col)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {!loading && paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 6, fontWeight: 600 }}>
                        No matching student records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontWeight: 600,
                  fontSize: '0.85rem',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
