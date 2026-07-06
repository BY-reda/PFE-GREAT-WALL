import React, { useMemo } from 'react';
import { Grid, Box, Typography, Card, CardContent, useTheme } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import GlobalFilters from '../components/GlobalFilters';
import BarChartWidget from '../charts/BarChartWidget';
import DataTable from '../components/DataTable';
import { StatBar } from '../components/InsightCard';
import { useData } from '../context/DataContext';
import { countBy, avgBy, crossTab } from '../utils/dataUtils';
import { exportToExcel } from '../utils/exportUtils';

export default function Universities() {
  const { students, loading } = useData();
  const theme = useTheme();

  const byUni = useMemo(() => countBy(students, 'university').filter((u) => u.name !== 'Unknown'), [students]);
  const total = students.length || 1;

  const avgEngByUni = useMemo(() => {
    const res = avgBy(students.filter((s) => s.englishScore !== null), 'university', 'englishScore');
    return res.slice(0, 12);
  }, [students]);

  const scholarshipByUni = useMemo(() => {
    const cross = crossTab(students, 'university', 'scholarship');
    const top10unis = byUni.slice(0, 8).map((u) => u.name);
    return top10unis.map((uni) => ({
      name: uni.length > 20 ? uni.slice(0, 20) + '…' : uni,
      Partial: cross[uni]?.['Partial'] || 0,
      'Free Tuition': cross[uni]?.['Free Tuition'] || 0,
      'Full Scholarship': cross[uni]?.['Full Scholarship'] || 0,
      'Self Support': cross[uni]?.['Self Support'] || 0,
    }));
  }, [students, byUni]);

  const degreeByUni = useMemo(() => {
    const cross = crossTab(students, 'university', 'degree');
    const top8 = byUni.slice(0, 8).map((u) => u.name);
    return top8.map((uni) => ({
      name: uni.length > 20 ? uni.slice(0, 20) + '…' : uni,
      Bachelor: cross[uni]?.['Bachelor'] || 0,
      Language: cross[uni]?.['Language'] || 0,
      Master: cross[uni]?.['Master'] || 0,
    }));
  }, [students, byUni]);

  const tableRows = useMemo(() => byUni.slice(0, 30).map((u, i) => {
    const uniStudents = students.filter((s) => s.university === u.name);
    const avgEng = uniStudents.filter((s) => s.englishScore !== null);
    const avg = avgEng.length ? (avgEng.reduce((a, b) => a + b.englishScore, 0) / avgEng.length).toFixed(1) : null;
    const scholarshipCount = uniStudents.filter((s) => s.scholarship !== 'Self Support' && s.scholarship !== 'Unknown').length;
    return {
      rank: i + 1,
      name: u.name,
      students: u.value,
      share: `${Math.round((u.value / total) * 100)}%`,
      avgEnglish: avg,
      scholarshipRate: `${Math.round((scholarshipCount / u.value) * 100)}%`,
    };
  }), [byUni, students, total]);

  const COLUMNS = [
    { key: 'rank', label: '#', sortable: true },
    { key: 'name', label: 'University' },
    { key: 'students', label: 'Students', sortable: true },
    { key: 'share', label: '% Share' },
    { key: 'avgEnglish', label: 'Avg. English', score: true, sortable: true },
    { key: 'scholarshipRate', label: 'Scholarship Rate' },
  ];

  return (
    <MainLayout title="University Analytics">
      <GlobalFilters />
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <BarChartWidget
            title="Applications by University (Top 15)"
            subtitle="Student application volume per partner university"
            data={byUni.slice(0, 15)}
            horizontal
            showLabel
            height={420}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>University Share Ranking</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Top 8 partner institutions by volume</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {byUni.slice(0, 8).map((u, i) => (
                  <StatBar
                    key={u.name}
                    label={u.name.length > 28 ? u.name.slice(0, 28) + '…' : u.name}
                    value={u.value}
                    max={total}
                    color={['#6366f1','#06b6d4','#10b981','#f59e0b','#ec4899','#8b5cf6','#14b8a6','#f97316'][i % 8]}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarChartWidget
            title="Average English Score by University (Top 12)"
            subtitle="Mean EFSET / Duolingo score per university"
            data={avgEngByUni}
            horizontal
            height={380}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarChartWidget
            title="Scholarship Breakdown by University"
            subtitle="Financial aid allocation across top 8 universities"
            data={scholarshipByUni}
            multiBar
            bars={[
              { key: 'Partial', label: 'Partial' },
              { key: 'Free Tuition', label: 'Free Tuition' },
              { key: 'Full Scholarship', label: 'Full Scholarship' },
              { key: 'Self Support', label: 'Self Support' },
            ]}
            height={380}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <BarChartWidget
            title="Degree Level Demand by University"
            subtitle="Bachelor vs Language vs Master distribution per partner university"
            data={degreeByUni}
            multiBar
            bars={[
              { key: 'Bachelor', label: 'Bachelor' },
              { key: 'Language', label: 'Language' },
              { key: 'Master', label: 'Master' },
            ]}
            height={320}
          />
        </Grid>
      </Grid>

      <DataTable
        title="University Performance Matrix"
        rows={tableRows}
        columns={COLUMNS}
        loading={loading}
        onExport={(d) => exportToExcel(d, 'universities.xlsx')}
      />
    </MainLayout>
  );
}
