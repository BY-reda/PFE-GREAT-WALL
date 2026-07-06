import React, { useMemo } from 'react';
import { Grid, Card, CardContent, Box, Typography, useTheme } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import GlobalFilters from '../components/GlobalFilters';
import BarChartWidget from '../charts/BarChartWidget';
import DonutChartWidget from '../charts/DonutChartWidget';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import { StatBar, InsightCard } from '../components/InsightCard';
import { useData } from '../context/DataContext';
import { exportToExcel } from '../utils/exportUtils';
import {
  MdCheckCircle, MdWarning, MdDescription, MdFilePresent
} from 'react-icons/md';

export default function Documents() {
  const { students } = useData();
  const theme = useTheme();
  const total = students.length || 1;

  const transcriptCount = students.filter((s) => s.hasTranscript).length;
  const physicalCount = students.filter((s) => s.hasPhysical).length;
  const engCertCount = students.filter((s) => s.hasEnglishCert).length;
  const completeCount = students.filter((s) => s.docsComplete).length;

  const completionData = [
    { name: 'Transcript', value: transcriptCount, missing: total - transcriptCount },
    { name: 'Physical Exam', value: physicalCount, missing: total - physicalCount },
    { name: 'English Certificate', value: engCertCount, missing: total - engCertCount },
  ];

  const incompleteStudents = useMemo(() =>
    students
      .filter((s) => !s.docsComplete)
      .map((s) => ({
        name: s.name,
        university: s.university,
        major: s.major,
        scholarship: s.scholarship,
        missingDocs: s.missingDocs.join(', '),
        docCount: `${s.docCount}/3`,
      }))
      .sort((a, b) => a.docCount.localeCompare(b.docCount)),
    [students]
  );

  // Clean 6 columns -> NO wrapping, NO scrollbar!
  const COLUMNS = [
    { key: 'name', label: 'Student Name' },
    { key: 'university', label: 'University' },
    { key: 'major', label: 'Program' },
    { key: 'scholarship', label: 'Scholarship', chip: true },
    { key: 'missingDocs', label: 'Missing Documents' },
    { key: 'docCount', label: 'Docs Submitted', chip: true },
  ];

  const donutComplete = [
    { name: 'Complete Files', value: completeCount },
    { name: 'Incomplete Files', value: total - completeCount },
  ];

  return (
    <MainLayout title="Document Analytics">
      <GlobalFilters />

      {/* 2x2 Grid for KPI Cards -> 6 cols each on lg = 12 cols total! Eliminates condensed top space & wrapping */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Complete Files', value: completeCount, color: 'success', icon: <MdCheckCircle size={24} />, subtitle: `${Math.round((completeCount/total)*100)}% verified complete` },
          { title: 'Incomplete Files', value: total - completeCount, color: 'error', icon: <MdWarning size={24} />, subtitle: `${Math.round(((total-completeCount)/total)*100)}% need follow-up` },
          { title: 'English Certs Missing', value: total - engCertCount, color: 'warning', icon: <MdDescription size={24} />, subtitle: `${Math.round(((total-engCertCount)/total)*100)}% of candidates` },
          { title: 'Transcripts Submitted', value: transcriptCount, color: 'info', icon: <MdFilePresent size={24} />, subtitle: `${Math.round((transcriptCount/total)*100)}% compliance` },
        ].map((k, i) => (
          <Grid size={{ xs: 12, sm: 6, lg: 6 }} key={k.title}>
            <KPICard {...k} delay={i * 0.07} sparkData={[5,8,6,9,10,8,11,13,12,15]} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DonutChartWidget
            title="File Completeness Share"
            subtitle="Complete vs Incomplete student application portfolios"
            data={donutComplete}
            height={380}
            innerText="Files"
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <BarChartWidget
            title="Document Submission Rate by Type"
            subtitle="Submitted vs Missing count across mandatory requirements"
            data={completionData}
            multiBar
            bars={[
              { key: 'value', label: 'Submitted' },
              { key: 'missing', label: 'Missing' },
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
                Document Compliance Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Submission rate per mandatory document</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                {completionData.map((doc, i) => (
                  <StatBar
                    key={doc.name}
                    label={doc.name}
                    value={doc.value}
                    max={total}
                    color={['#10b981','#6366f1','#f59e0b'][i]}
                    unit=""
                  />
                ))}
              </Box>
              <Box sx={{ mt: 3 }}>
                <InsightCard
                  title="Critical Compliance Gap"
                  text={`English proficiency certificates are missing for ${total - engCertCount} applicants (${Math.round(((total-engCertCount)/total)*100)}%). Prioritize automated reminder campaigns for these candidates.`}
                  type="warning"
                  index={0}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <DataTable
            title={`Action Required: Incomplete Files (${incompleteStudents.length})`}
            rows={incompleteStudents}
            columns={COLUMNS}
            defaultRowsPerPage={10}
            onExport={(d) => exportToExcel(d, 'incomplete_files.xlsx')}
          />
        </Grid>
      </Grid>
    </MainLayout>
  );
}
