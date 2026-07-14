import React, { useState, useMemo } from 'react';
import {
  Grid, Box, Typography, Button, Card, CardContent, Chip, alpha, useTheme,
  ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, IconButton, Tooltip, LinearProgress, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import GlobalFilters from '../components/GlobalFilters';
import KPICard from '../components/KPICard';
import BarChartWidget from '../charts/BarChartWidget';
import DonutChartWidget from '../charts/DonutChartWidget';
import { useData } from '../context/DataContext';
import {
  computeKPIs, countBy, topN,
  computeFunnelVelocity, detectDataAnomalies
} from '../utils/dataUtils';
import {
  MdPeople, MdAccountBalance, MdSchool, MdCheckCircle,
  MdLanguage, MdPublic, MdAutoFixHigh, MdArrowForward,
  MdTrendingUp, MdWarning, MdLightbulb,
  MdFilterList, MdSecurity, MdPersonAdd,
  MdDescription, MdAssessment, MdVisibility, MdPhone,
  MdDashboard, MdAssignmentLate, MdPlaylistAddCheck, MdLaunch
} from 'react-icons/md';

export default function DashboardHome() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { students, loading, updateFilter } = useData();

  const kpis = useMemo(() => computeKPIs(students), [students]);
  const funnelData = useMemo(() => computeFunnelVelocity(students), [students]);
  const anomalies = useMemo(() => detectDataAnomalies(students), [students]);

  const uniCount = useMemo(() => countBy(students, 'university'), [students]);
  const majorCount = useMemo(() => countBy(students, 'major'), [students]);
  const scholarshipCount = useMemo(() => countBy(students, 'scholarship'), [students]);

  const topUnis = useMemo(() => topN(uniCount, 10), [uniCount]);
  const topMajors = useMemo(() => topN(majorCount, 10), [majorCount]);

  // Take latest 8 students for the Live Dossier Feed
  const recentStudents = useMemo(() => {
    return (students || []).slice(0, 8);
  }, [students]);

  const handleAnomalyAction = (key, val) => {
    if (key && val) {
      if (key === 'docsComplete') {
        navigate('/documents');
        return;
      }
      updateFilter(key, val);
    }
    navigate('/students');
  };

  return (
    <MainLayout title="Executive Agency Command Center">
      <Box sx={{ mb: 3 }}>
        <GlobalFilters />
      </Box>

      {/* ── Top Strip: Quick Agency Shortcuts ────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              boxShadow: '0 4px 20px -5px rgba(0,0,0,0.08)',
            }}
          >
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', display: 'flex' }}>
                    <MdDashboard size={26} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="text.primary">
                      Agency Operational Shortcuts & Intelligence Tools
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Instant one-click navigation across student intake, AI scholarship matching, document compliance, and analytical reporting.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    color="primary"
                    startIcon={<MdPersonAdd size={22} />}
                    onClick={() => navigate('/students?add=true')}
                    sx={{ py: 1.6, fontWeight: 800, borderRadius: 2.5, textTransform: 'none', fontSize: '0.95rem', boxShadow: '0 6px 16px rgba(99, 102, 241, 0.3)' }}
                  >
                    Add New Student
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    color="warning"
                    startIcon={<MdDescription size={22} />}
                    onClick={() => navigate('/documents')}
                    sx={{ py: 1.6, fontWeight: 800, borderRadius: 2.5, textTransform: 'none', fontSize: '0.95rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                  >
                    Document Vault
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    color="info"
                    startIcon={<MdAssessment size={22} />}
                    onClick={() => navigate('/reports')}
                    sx={{ py: 1.6, fontWeight: 800, borderRadius: 2.5, textTransform: 'none', fontSize: '0.95rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                  >
                    Executive Reports
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Operational Pulse (4 Compact KPIs) ─────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Total Active Dossiers"
            value={kpis.totalStudents}
            subtitle="Candidates in placement pipeline"
            icon={<MdPeople size={24} />}
            color="primary"
            trend={14.2}
            trendLabel="vs last intake"
            sparkData={[120, 140, 135, 180, 210, 250, kpis.totalStudents || 300]}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="File Completion Rate"
            value={kpis.completePct}
            suffix="%"
            subtitle={`${kpis.completeFiles} verified complete dossiers`}
            icon={<MdCheckCircle size={24} />}
            color="warning"
            trend={-2.1}
            trendLabel="needs document follow-up"
            sparkData={[65, 70, 72, 68, 71, 74, kpis.completePct || 75]}
            loading={loading}
            decimals={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Full Scholarship Awards"
            value={kpis.scholarshipStudents}
            subtitle="100% tuition & dorm waivers"
            icon={<MdSchool size={24} />}
            color="success"
            trend={8.7}
            trendLabel="high success placement"
            sparkData={[20, 25, 30, 45, 50, 60, kpis.scholarshipStudents || 70]}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Avg. English Proficiency"
            value={kpis.avgEnglishScore}
            subtitle="Mean language test score"
            icon={<MdLanguage size={24} />}
            color="info"
            trend={3.4}
            trendLabel="improving cohort readiness"
            sparkData={[68, 69, 70, 71, 72, 73, kpis.avgEnglishScore || 74]}
            loading={loading}
            decimals={1}
          />
        </Grid>
      </Grid>

      {/* ── Section 1: Daily Counselor Action Queue (AI Sentinel) ──────────── */}
      <Card
        sx={{
          mb: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: theme.palette.primary.main,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                }}
              >
                <MdPlaylistAddCheck size={28} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="h6" fontWeight={800} color="text.primary">
                    Daily Counselor Action Queue & AI Sentinel Alerts
                  </Typography>
                  <Chip label={`${anomalies.length} Priority Tasks`} size="small" color="primary" sx={{ fontWeight: 700 }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Interactive operational tasks: resolve stalled files, upgrade scholarship tiers, and mitigate university quota bottlenecks.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {anomalies.map((alert) => {
              let alertColor = theme.palette.info.main;
              let alertBg = alpha(theme.palette.info.main, 0.08);
              if (alert.severity === 'critical') {
                alertColor = theme.palette.error.main;
                alertBg = alpha(theme.palette.error.main, 0.08);
              } else if (alert.severity === 'warning') {
                alertColor = theme.palette.warning.main;
                alertBg = alpha(theme.palette.warning.main, 0.08);
              } else if (alert.severity === 'opportunity') {
                alertColor = theme.palette.secondary.main;
                alertBg = alpha(theme.palette.secondary.main, 0.08);
              }

              return (
                <Grid size={{ xs: 12, md: 6 }} key={alert.id}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      bgcolor: alertBg,
                      border: `1px solid ${alpha(alertColor, 0.3)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha(alertColor, 0.15)}`,
                      }
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">{alert.icon}</Typography>
                          <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                            {alert.title}
                          </Typography>
                        </Box>
                        <Chip label={alert.badge} size="small" sx={{ bgcolor: alertColor, color: '#fff', fontWeight: 700 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {alert.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1, borderTop: `1px solid ${alpha(alertColor, 0.15)}` }}>
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={<MdArrowForward />}
                        onClick={() => handleAnomalyAction(alert.filterKey, alert.filterVal)}
                        sx={{
                          bgcolor: alertColor,
                          color: '#fff',
                          fontWeight: 700,
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: alpha(alertColor, 0.85) }
                        }}
                      >
                        {alert.actionLabel}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* ── Section 2: Streamlined Core Agency Workflow Charts ─────────────── */}
      <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <MdAssessment color={theme.palette.primary.main} /> Core Agency Placement & Scholarship Performance
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left: Conversion Funnel & Velocity */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <BarChartWidget
            title="Agency Conversion Funnel & Stage Velocity"
            subtitle="Real-time candidate progression from initial lead to confirmed scholarship placement"
            data={funnelData}
            height={360}
            showLabel
          />
        </Grid>
        {/* Right: Scholarship Allocation Share */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <DonutChartWidget
            title="Scholarship Allocation Share"
            subtitle="Distribution of financial aid awards"
            data={scholarshipCount}
            height={360}
            innerText="Awards"
          />
        </Grid>

        {/* Row 2: Top Target Universities & Top Target Majors */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarChartWidget
            title="Top 10 Destination Universities"
            subtitle="Most preferred Chinese institutions by Moroccan applicants"
            data={topUnis}
            height={380}
            horizontal
            showLabel
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarChartWidget
            title="Top 10 Requested Academic Programs"
            subtitle="Most popular majors and degree disciplines"
            data={topMajors}
            height={380}
            horizontal
            showLabel
          />
        </Grid>
      </Grid>

      {/* ── Section 3: Live Student Dossier Feed (Recent Applicants Table) ─── */}
      <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, mb: 4, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', display: 'flex' }}>
                <MdPeople size={24} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} color="text.primary">
                  Live Candidate Dossier Feed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recent student applications submitted to the Great Wall placement database
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              endIcon={<MdLaunch />}
              onClick={() => navigate('/students')}
              sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
            >
              View Full Student Database ({(students?.length || 0).toLocaleString()} Records)
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <Table size="medium">
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>Candidate Name</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>Bac Honor (Mention)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>Desired Major</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>Target University</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>English Score</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>Scholarship Award</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: 'text.primary' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentStudents.map((s, idx) => {
                  const mention = s.transcriptMention || 'Bien';
                  let mentionColor = 'default';
                  if (mention.includes('Très Bien')) mentionColor = 'success';
                  else if (mention.includes('Bien')) mentionColor = 'primary';
                  else if (mention.includes('Assez Bien')) mentionColor = 'info';

                  const scholarship = s.scholarship || 'Partial';
                  let schColor = 'warning';
                  if (scholarship.toLowerCase().includes('full')) schColor = 'success';
                  else if (scholarship.toLowerCase().includes('free')) schColor = 'info';

                  return (
                    <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: theme.palette.primary.main,
                              fontSize: '0.85rem',
                              fontWeight: 700,
                            }}
                          >
                            {(s.name || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                              {s.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {s.degree || 'Bachelor'} • Age {s.age || 18}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={mention} size="small" color={mentionColor} sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {s.major || 'Computer Science'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {s.university || 'Zhejiang University'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(s.englishScore || 70, 100)}
                            color={s.englishScore >= 75 ? 'success' : s.englishScore >= 60 ? 'primary' : 'warning'}
                            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" fontWeight={800} color="text.primary">
                            {s.englishScore || 70}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={scholarship}
                          size="small"
                          color={schColor}
                          variant={schColor === 'warning' ? 'outlined' : 'filled'}
                          sx={{ fontWeight: 700, borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Student Dossier & Documents">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              updateFilter('search', s.name);
                              navigate('/students');
                            }}
                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) } }}
                          >
                            <MdVisibility size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {recentStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No student records currently loaded.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
