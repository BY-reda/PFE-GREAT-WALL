import React, { useMemo } from 'react';
import { Grid, Box } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import GlobalFilters from '../components/GlobalFilters';
import BarChartWidget from '../charts/BarChartWidget';
import DonutChartWidget from '../charts/DonutChartWidget';
import { TreemapWidget, RadarChartWidget } from '../charts/TreemapRadarWidget';
import { useData } from '../context/DataContext';
import { countBy, crossTab } from '../utils/dataUtils';

export default function Programs() {
  const { students } = useData();

  const byMajor = useMemo(() => countBy(students, 'major'), [students]);

  const majorByDegree = useMemo(() => {
    const cross = crossTab(students, 'major', 'degree');
    return Object.entries(cross).map(([major, degs]) => ({
      name: major.length > 22 ? major.slice(0, 22) + '…' : major,
      Bachelor: degs.Bachelor || 0,
      Language: degs.Language || 0,
      Master: degs.Master || 0,
    })).sort((a, b) => (b.Bachelor + b.Language + b.Master) - (a.Bachelor + a.Language + a.Master)).slice(0, 10);
  }, [students]);

  const majorByScholarship = useMemo(() => {
    const cross = crossTab(students, 'major', 'scholarship');
    return Object.entries(cross)
      .map(([major, scs]) => ({
        name: major.length > 22 ? major.slice(0, 22) + '…' : major,
        Partial: scs['Partial'] || 0,
        'Free Tuition': scs['Free Tuition'] || 0,
        'Full Scholarship': scs['Full Scholarship'] || 0,
        'Self Support': scs['Self Support'] || 0,
      }))
      .sort((a, b) => (b.Partial + b['Free Tuition'] + b['Full Scholarship']) - (a.Partial + a['Free Tuition'] + a['Full Scholarship']))
      .slice(0, 10);
  }, [students]);

  // Radar: compare top 6 programs across key metrics
  const radarData = useMemo(() => {
    const top6 = byMajor.slice(0, 6).map((m) => m.name);
    const metrics = ['Students', 'Avg Score', 'With Cert'];
    return metrics.map((metric) => {
      const row = { name: metric };
      top6.forEach((prog) => {
        const sub = students.filter((s) => s.major === prog);
        if (metric === 'Students') row[prog] = sub.length;
        else if (metric === 'Avg Score') {
          const ws = sub.filter((s) => s.englishScore !== null);
          row[prog] = ws.length ? Math.round(ws.reduce((a, b) => a + b.englishScore, 0) / ws.length) : 0;
        } else {
          row[prog] = sub.filter((s) => s.hasEnglishCert).length;
        }
      });
      return row;
    });
  }, [students, byMajor]);

  const top6Names = byMajor.slice(0, 6).map((m) => m.name);

  return (
    <MainLayout title="Program Analytics">
      <GlobalFilters />
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <TreemapWidget
            title="Academic Program Demand (Treemap)"
            subtitle="Area proportional to number of student applications per discipline"
            data={byMajor}
            height={360}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DonutChartWidget
            title="Top Programs Market Share"
            subtitle="Concentration among top 8 disciplines"
            data={byMajor.slice(0, 8)}
            height={360}
            innerText="Majors"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarChartWidget
            title="Program Demand by Degree Level"
            subtitle="Bachelor / Language / Master breakdown per major"
            data={majorByDegree}
            multiBar
            bars={[
              { key: 'Bachelor', label: 'Bachelor' },
              { key: 'Language', label: 'Language' },
              { key: 'Master', label: 'Master' },
            ]}
            height={380}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarChartWidget
            title="Program Demand by Scholarship Award"
            subtitle="Financial aid distribution per major"
            data={majorByScholarship}
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
          <RadarChartWidget
            title="Top Programs Multi-Metric Comparison"
            subtitle="Comparative radar analysis of volume, English score, and certification"
            data={radarData}
            dataKeys={top6Names.map((n) => ({ key: n, label: n }))}
            height={380}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <BarChartWidget
            title="Complete Program Popularity Ranking"
            subtitle="Total applications submitted per academic program"
            data={byMajor}
            horizontal
            showLabel
            height={420}
          />
        </Grid>
      </Grid>
    </MainLayout>
  );
}
