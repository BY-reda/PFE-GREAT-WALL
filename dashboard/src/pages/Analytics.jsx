import React, { useMemo, useState } from 'react';
import {
  Grid, Card, CardContent, Box, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Tabs, Tab, alpha, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import GlobalFilters from '../components/GlobalFilters';
import BarChartWidget from '../charts/BarChartWidget';
import ScatterWidget from '../charts/ScatterWidget';
import DonutChartWidget from '../charts/DonutChartWidget';
import { useData } from '../context/DataContext';
import { countBy, histogram, avgBy, computeUniversityMatrix, detectDataAnomalies } from '../utils/dataUtils';
import {
  MdAnalytics, MdSchool, MdWarning, MdCheckCircle, MdArrowForward,
  MdFilterList, MdSearch, MdTableChart, MdInsights
} from 'react-icons/md';

export default function Analytics() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { students, updateFilter } = useData();
  const [drillTab, setDrillTab] = useState(0); // 0: All, 1: Stalled Docs, 2: Upgrade Eligible, 3: Low English

  const uniMatrix = useMemo(() => computeUniversityMatrix(students), [students]);
  const anomalies = useMemo(() => detectDataAnomalies(students), [students]);

  const engTestDist = useMemo(() => countBy(students.filter(s => s.englishTestType), 'englishTestType'), [students]);
  const engProfDist = useMemo(() => countBy(students.filter(s => s.englishProficiency), 'englishProficiency'), [students]);
  const ageDist = useMemo(() => histogram(students.filter(s => s.age !== null), 'age', 1), [students]);

  const transcriptMentionDist = useMemo(() =>
    countBy(students.filter(s => s.transcriptMention), 'transcriptMention'), [students]);

  // Scatter: English score vs age
  const scatterGroups = useMemo(() => {
    const types = [...new Set(students.map(s => s.scholarship).filter(Boolean))];
    return types.map(sc => ({
      name: sc,
      data: students
        .filter(s => s.scholarship === sc && s.englishScore !== null && s.age !== null)
        .map(s => ({ x: s.age, y: s.englishScore, name: s.name }))
        .slice(0, 100),
    }));
  }, [students]);

  const avgEngByMajor = useMemo(() =>
    avgBy(students.filter(s => s.englishScore !== null), 'major', 'englishScore').slice(0, 10),
    [students]
  );

  const engScoreHist = useMemo(() =>
    histogram(students.filter(s => s.englishScore !== null), 'englishScore', 10),
    [students]
  );

  // Dossier Bottleneck Heatmap across Top 8 Majors
  const docBottleneckByMajor = useMemo(() => {
    const topMajors = countBy(students, 'major').slice(0, 8).map(m => m.name);
    return topMajors.map(m => {
      const cohort = students.filter(s => s.major === m);
      const total = cohort.length || 1;
      return {
        name: m.length > 18 ? m.slice(0, 16) + '...' : m,
        Transcript: Math.round((cohort.filter(s => s.hasTranscript).length / total) * 100),
        'Physical Exam': Math.round((cohort.filter(s => s.hasPhysical).length / total) * 100),
        'English Cert': Math.round((cohort.filter(s => s.hasEnglishCert).length / total) * 100),
      };
    });
  }, [students]);

  // Interactive Drill-Down Table Candidates
  const filteredCandidates = useMemo(() => {
    if (drillTab === 1) return students.filter(s => !s.docsComplete).slice(0, 15);
    if (drillTab === 2) return students.filter(s => (s.scholarship === 'Partial' || s.scholarship === 'Self Support') && (s.transcriptMention === 'Très Bien' || s.gpa >= 15.0)).slice(0, 15);
    if (drillTab === 3) return students.filter(s => s.englishScore !== null && s.englishScore < 60).slice(0, 15);
    return students.slice(0, 15);
  }, [students, drillTab]);

  const handleInspectStudent = (name) => {
    updateFilter('search', name);
    navigate('/students');
  };

  return (
    <MainLayout title="Deep BI Analytics & University Matrix">
      <Box sx={{ mb: 3 }}>
        <GlobalFilters />
      </Box>

      {/* University Competitiveness & Scholarship Allocation Matrix */}
      <Card sx={{ mb: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                <MdTableChart size={24} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Partner University Competitiveness & Scholarship Allocation Matrix
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cross-tab analysis showing application concentration, scholarship tiers, and academic cutoff intelligence.
                </Typography>
              </Box>
            </Box>
            <Chip label={`${uniMatrix.length} Institutions Analyzed`} color="primary" sx={{ fontWeight: 700 }} />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <Table sx={{ minWidth: 700 }} size="small">
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>University Partner</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Total Applications</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Competitiveness Tier</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Full Scholarship %</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Free Tuition %</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Avg English Score</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Dossier Completion</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uniMatrix.slice(0, 8).map((u) => {
                  let tierColor = 'default';
                  if (u.competitiveness.includes('Tier 1')) tierColor = 'error';
                  else if (u.competitiveness.includes('Tier 2')) tierColor = 'warning';
                  else if (u.competitiveness.includes('Tier 3')) tierColor = 'success';

                  return (
                    <TableRow key={u.name} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 700 }}>
                        {u.name}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{u.total}</TableCell>
                      <TableCell align="center">
                        <Chip label={u.competitiveness} size="small" color={tierColor} sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>{u.fullPct}%</TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>{u.freeTuitionPct}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{u.avgEnglish}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{u.completionRate}%</Typography>
                          <Box sx={{ width: 40, height: 6, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3, overflow: 'hidden' }}>
                            <Box sx={{ width: `${u.completionRate}%`, height: '100%', bgcolor: theme.palette.primary.main }} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="text"
                          endIcon={<MdArrowForward />}
                          onClick={() => { updateFilter('university', u.name); navigate('/students'); }}
                          sx={{ fontWeight: 700, textTransform: 'none' }}
                        >
                          Filter
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Row 1: Dossier Bottleneck Heatmap & English Score Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <BarChartWidget
            title="Dossier Document Bottleneck Heatmap by Major (%)"
            subtitle="Verification rates for Transcript vs Physical Exam vs English Certificate across top programs"
            data={docBottleneckByMajor}
            multiBar
            bars={[
              { key: 'Transcript', label: 'Transcript Verified' },
              { key: 'Physical Exam', label: 'Physical Exam Completed' },
              { key: 'English Cert', label: 'English Cert Attached' },
            ]}
            height={360}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DonutChartWidget
            title="Baccalaureate Honors Distribution"
            subtitle="High school transcript mention classification"
            data={transcriptMentionDist.slice(0, 6)}
            height={360}
            innerText="Honors"
          />
        </Grid>
      </Grid>

      {/* Row 2: English Test Types & Score Frequency */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <DonutChartWidget
            title="English Test Type Share"
            subtitle="EFSET vs Duolingo vs TOEFL vs IELTS"
            data={engTestDist}
            height={340}
            innerText="Tests"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <BarChartWidget
            title="English Score Distribution"
            subtitle="Frequency distribution across 10-point score intervals"
            data={engScoreHist}
            height={340}
            showLabel
          />
        </Grid>
      </Grid>

      {/* Interactive Data Analyst Anomaly Drill-Down Table */}
      <Card sx={{ mb: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                <MdInsights size={24} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Interactive Data Analyst Anomaly Drill-Down Table
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click a category below to instantly inspect stalled dossiers, upgrade opportunities, or at-risk applicants.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Tabs
            value={drillTab}
            onChange={(e, val) => setDrillTab(val)}
            sx={{ mb: 3, borderBottom: `1px solid ${theme.palette.divider}`, '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minHeight: 44 } }}
          >
            <Tab label="All Candidates Sample" />
            <Tab
              label="🚨 Stalled Dossiers (Missing Docs)"
              icon={<Chip label={students.filter(s => !s.docsComplete).length} size="small" color="error" sx={{ ml: 1, height: 20, fontSize: '0.7rem', fontWeight: 700 }} />}
              iconPosition="end"
            />
            <Tab
              label="💡 Scholarship Upgrade Eligible"
              icon={<Chip label={students.filter(s => (s.scholarship === 'Partial' || s.scholarship === 'Self Support') && (s.transcriptMention === 'Très Bien' || s.gpa >= 15.0)).length} size="small" color="secondary" sx={{ ml: 1, height: 20, fontSize: '0.7rem', fontWeight: 700 }} />}
              iconPosition="end"
            />
            <Tab
              label="⚠️ Low English Score (<60)"
              icon={<Chip label={students.filter(s => s.englishScore !== null && s.englishScore < 60).length} size="small" color="warning" sx={{ ml: 1, height: 20, fontSize: '0.7rem', fontWeight: 700 }} />}
              iconPosition="end"
            />
          </Tabs>

          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Applied University</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Major</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Degree</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Scholarship</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>English</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Dossier Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Inspect</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCandidates.map((s) => (
                  <TableRow key={s.name} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{s.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{s.university}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{s.major}</TableCell>
                    <TableCell align="center">
                      <Chip label={s.degree} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={s.scholarship || 'Partial'}
                        size="small"
                        color={s.scholarship && s.scholarship.includes('Full') ? 'success' : s.scholarship && s.scholarship.includes('Free') ? 'info' : 'default'}
                        sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: s.englishScore && s.englishScore >= 80 ? theme.palette.success.main : s.englishScore && s.englishScore < 60 ? theme.palette.error.main : 'inherit' }}>
                      {s.englishScore ? `${s.englishScore}/100` : 'None'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={s.docsComplete ? 'Complete' : `Missing ${s.missingDocs?.length || 1}`}
                        size="small"
                        color={s.docsComplete ? 'success' : 'error'}
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleInspectStudent(s.name)}
                        sx={{ fontWeight: 700, borderRadius: 1.5, py: 0.25, px: 1.5, fontSize: '0.75rem' }}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCandidates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No candidates found matching this anomaly filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Row 3: Age Distribution & Scatter Matrix */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarChartWidget
            title="Average English Score by Program (Top 10)"
            subtitle="Mean proficiency test score per academic discipline"
            data={avgEngByMajor}
            horizontal
            showLabel
            height={360}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ScatterWidget
            title="Age vs English Score Correlation Matrix"
            subtitle="Individual candidate mapping grouped by scholarship tier"
            groups={scatterGroups}
            xLabel="Age (years)"
            yLabel="English Score"
            height={360}
          />
        </Grid>
      </Grid>
    </MainLayout>
  );
}
