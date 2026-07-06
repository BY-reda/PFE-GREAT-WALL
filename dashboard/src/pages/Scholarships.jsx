import React, { useMemo } from 'react';
import { Grid, Card, CardContent, Box, Typography, useTheme } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import GlobalFilters from '../components/GlobalFilters';
import BarChartWidget from '../charts/BarChartWidget';
import DonutChartWidget from '../charts/DonutChartWidget';
import KPICard from '../components/KPICard';
import { StatBar } from '../components/InsightCard';
import { useData } from '../context/DataContext';
import { countBy, crossTab } from '../utils/dataUtils';
import {
  MdCardMembership, MdStar, MdAccountBalance, MdSchool
} from 'react-icons/md';

export default function Scholarships() {
  const { students } = useData();
  const theme = useTheme();

  const byScholarship = useMemo(() => countBy(students, 'scholarship'), [students]);
  const total = students.length || 1;

  const scholarshipByUni = useMemo(() => {
    const cross = crossTab(students, 'scholarship', 'university');
    return Object.entries(cross).map(([sc, unis]) => {
      const top = Object.entries(unis).sort((a, b) => b[1] - a[1]).slice(0, 5);
      return { scholarship: sc, universities: top };
    });
  }, [students]);

  const scholarshipByMajor = useMemo(() => {
    const cross = crossTab(students, 'major', 'scholarship');
    return Object.entries(cross)
      .map(([major, scs]) => ({
        name: major.length > 22 ? major.slice(0, 22) + '…' : major,
        ...scs,
      }))
      .sort((a, b) => {
        const ta = Object.values(a).filter(v => typeof v === 'number').reduce((s, v) => s + v, 0);
        const tb = Object.values(b).filter(v => typeof v === 'number').reduce((s, v) => s + v, 0);
        return tb - ta;
      })
      .slice(0, 10);
  }, [students]);

  const scholarshipByDegree = useMemo(() => {
    const cross = crossTab(students, 'degree', 'scholarship');
    return Object.entries(cross).map(([deg, scs]) => ({
      name: deg,
      Partial: scs['Partial'] || 0,
      'Free Tuition': scs['Free Tuition'] || 0,
      'Full Scholarship': scs['Full Scholarship'] || 0,
      'Self Support': scs['Self Support'] || 0,
    }));
  }, [students]);

  const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444'];

  const kpis = useMemo(() => {
    const full = students.filter((s) => s.scholarship === 'Full Scholarship').length;
    const freeTuition = students.filter((s) => s.scholarship === 'Free Tuition').length;
    const partial = students.filter((s) => s.scholarship === 'Partial').length;
    const self = students.filter((s) => s.scholarship === 'Self Support').length;
    return { full, freeTuition, partial, self };
  }, [students]);

  return (
    <MainLayout title="Scholarship Analytics">
      <GlobalFilters />

      {/* 2x2 Grid for KPI Cards -> 6 cols each on lg = 12 cols total! Eliminates condensed top space & wrapping */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Full Scholarships', value: kpis.full, color: 'success', icon: <MdStar size={24} />, subtitle: `${Math.round((kpis.full/total)*100)}% of students` },
          { title: 'Free Tuition', value: kpis.freeTuition, color: 'info', icon: <MdCardMembership size={24} />, subtitle: `${Math.round((kpis.freeTuition/total)*100)}% of students` },
          { title: 'Partial Scholarships', value: kpis.partial, color: 'warning', icon: <MdSchool size={24} />, subtitle: `${Math.round((kpis.partial/total)*100)}% of students` },
          { title: 'Self Support', value: kpis.self, color: 'error', icon: <MdAccountBalance size={24} />, subtitle: `${Math.round((kpis.self/total)*100)}% of students` },
        ].map((k, i) => (
          <Grid size={{ xs: 12, sm: 6, lg: 6 }} key={k.title}>
            <KPICard {...k} delay={i * 0.06} sparkData={[4,6,5,8,9,7,10,11,13,15]} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DonutChartWidget
            title="Scholarship Distribution"
            subtitle="Overall financial aid award share"
            data={byScholarship}
            height={380}
            innerText="Awards"
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <BarChartWidget
            title="Scholarship Allocation by Program"
            subtitle="Financial aid breakdown for top 10 academic disciplines"
            data={scholarshipByMajor}
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

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom sx={{ whiteSpace: 'nowrap' }}>
                Scholarship Share Ranking
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Proportional breakdown across all candidates</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                {byScholarship.map((sc, i) => (
                  <StatBar
                    key={sc.name}
                    label={sc.name}
                    value={sc.value}
                    max={total}
                    color={COLORS[i % COLORS.length]}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <BarChartWidget
            title="Scholarship Award by Degree Level"
            subtitle="Bachelor vs Language vs Master financial aid allocation"
            data={scholarshipByDegree}
            multiBar
            bars={[
              { key: 'Partial', label: 'Partial' },
              { key: 'Free Tuition', label: 'Free Tuition' },
              { key: 'Full Scholarship', label: 'Full Scholarship' },
              { key: 'Self Support', label: 'Self Support' },
            ]}
            height={360}
          />
        </Grid>
      </Grid>
    </MainLayout>
  );
}
