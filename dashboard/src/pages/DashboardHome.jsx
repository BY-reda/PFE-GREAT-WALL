import React, { useState, useMemo } from 'react';
import { Grid, Box, Typography, Button, Card, CardContent, Chip, alpha, useTheme, ButtonGroup } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import GlobalFilters from '../components/GlobalFilters';
import KPICard from '../components/KPICard';
import BarChartWidget from '../charts/BarChartWidget';
import DonutChartWidget from '../charts/DonutChartWidget';
import { AreaChartWidget } from '../charts/LineAreaChartWidget';
import { TreemapWidget } from '../charts/TreemapRadarWidget';
import ScatterWidget from '../charts/ScatterWidget';
import { useData } from '../context/DataContext';
import {
  computeKPIs, countBy, histogram, topN,
  correlationData, computeAgencyFinancials,
  computeFunnelVelocity, detectDataAnomalies
} from '../utils/dataUtils';
import {
  MdPeople, MdAccountBalance, MdSchool, MdCheckCircle,
  MdLanguage, MdPublic, MdAutoFixHigh, MdArrowForward,
  MdMonetizationOn, MdTrendingUp, MdWarning, MdLightbulb,
  MdFilterList, MdSecurity, MdAttachMoney
} from 'react-icons/md';

export default function DashboardHome() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { students, loading, updateFilter } = useData();
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'MAD'

  const kpis = useMemo(() => computeKPIs(students), [students]);
  const financials = useMemo(() => computeAgencyFinancials(students), [students]);
  const funnelData = useMemo(() => computeFunnelVelocity(students), [students]);
  const anomalies = useMemo(() => detectDataAnomalies(students), [students]);

  const uniCount = useMemo(() => countBy(students, 'university'), [students]);
  const majorCount = useMemo(() => countBy(students, 'major'), [students]);
  const scholarshipCount = useMemo(() => countBy(students, 'scholarship'), [students]);
  const degreeCount = useMemo(() => countBy(students, 'degree'), [students]);
  const englishTestCount = useMemo(() => countBy(students, 'englishTest'), [students]);

  const topUnis = useMemo(() => topN(uniCount, 10), [uniCount]);
  const topMajors = useMemo(() => topN(majorCount, 10), [majorCount]);
  const ageHist = useMemo(() => histogram(students, 'age', 1), [students]);
  const englishHist = useMemo(() => histogram(students, 'englishScore', 10), [students]);
  const scatterData = useMemo(() => correlationData(students, 'age', 'englishScore'), [students]);

  const handleAnomalyAction = (key, val) => {
    if (key && val) {
      updateFilter(key, val);
    }
    navigate('/students');
  };

  return (
    <MainLayout title="Executive & Data Analyst Console">
      <Box sx={{ mb: 3 }}>
        <GlobalFilters />
      </Box>

      {/* Agency Business & Financial Valuation Banner (Jury Defense Mode) */}
      <Card
        sx={{
          mb: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  bgcolor: theme.palette.success.main,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  flexShrink: 0,
                }}
              >
                <MdMonetizationOn size={30} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="h6" fontWeight={800} color="text.primary">
                    Agency Financial Valuation & Student ROI Impact
                  </Typography>
                  <Chip label="Jury Defense KPI" size="small" color="success" sx={{ fontWeight: 700 }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Real-time calculation of 4-year tuition waivers generated for candidates and estimated agency processing volume.
                </Typography>
              </Box>
            </Box>
            <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
              <Button
                variant={currency === 'USD' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setCurrency('USD')}
                sx={{ fontWeight: 700, px: 2 }}
              >
                USD ($)
              </Button>
              <Button
                variant={currency === 'MAD' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setCurrency('MAD')}
                sx={{ fontWeight: 700, px: 2 }}
              >
                MAD (Dirham)
              </Button>
            </ButtonGroup>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <KPICard
                title="Total Scholarship Savings"
                value={currency === 'USD' ? financials.totalSavingsUSDFormatted : financials.totalSavingsMADFormatted}
                subtitle="4-Year Tuition & Dormitory Savings"
                icon={<MdMonetizationOn size={24} />}
                color="success"
                trend={18.4}
                trendLabel="vs previous cohort"
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <KPICard
                title="Agency Processing Pipeline"
                value={currency === 'USD' ? financials.agencyRevenueUSDFormatted : financials.agencyRevenueMADFormatted}
                subtitle="Estimated Placement Volume"
                icon={<MdAttachMoney size={24} />}
                color="primary"
                trend={12.5}
                trendLabel="target achievement"
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <KPICard
                title="Avg. Student Financial ROI"
                value={currency === 'USD' ? `$${(financials?.avgSavingsPerStudentUSD || 0).toLocaleString()}` : `${(financials?.avgSavingsPerStudentMAD || 0).toLocaleString()} MAD`}
                subtitle="Average value unlocked per applicant"
                icon={<MdTrendingUp size={24} />}
                color="info"
                loading={loading}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* AI-Sentinel Data Analyst Anomaly & Action Panel */}
      <Card
        sx={{
          mb: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.12) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(168, 85, 247, 0.05) 100%)',
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
                <MdSecurity size={26} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="h6" fontWeight={800} color="text.primary">
                    AI-Sentinel Data Analyst Intelligence & Anomaly Center
                  </Typography>
                  <Chip label={`${anomalies.length} Active Alerts`} size="small" color="primary" sx={{ fontWeight: 700 }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Automated real-time diagnostics detecting application bottlenecks, high-ROI scholarship upgrade opportunities, and quota risks.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<MdAutoFixHigh />}
              onClick={() => navigate('/tools')}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Launch Decision Simulators
            </Button>
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

      {/* Operational KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KPICard
            title="Total Applicants"
            value={kpis.totalStudents}
            subtitle="Active candidates in pipeline"
            icon={<MdPeople size={24} />}
            color="primary"
            trend={14.2}
            trendLabel="vs last intake"
            sparkData={[120, 140, 135, 180, 210, 250, kpis.totalStudents || 300]}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KPICard
            title="Partner Universities"
            value={kpis.totalUniversities}
            subtitle="Chinese institutions"
            icon={<MdAccountBalance size={24} />}
            color="secondary"
            trend={5.0}
            trendLabel="new partner added"
            sparkData={[15, 16, 16, 17, 18, 18, kpis.totalUniversities || 19]}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KPICard
            title="Full Scholarships"
            value={kpis.scholarshipStudents}
            subtitle="100% tuition & dorm awards"
            icon={<MdSchool size={24} />}
            color="success"
            trend={8.7}
            trendLabel="high success rate"
            sparkData={[20, 25, 30, 45, 50, 60, kpis.scholarshipStudents || 70]}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KPICard
            title="File Completion Rate"
            value={kpis.completePct}
            suffix="%"
            subtitle={`${kpis.completeFiles} verified complete dossiers`}
            icon={<MdCheckCircle size={24} />}
            color="warning"
            trend={-2.1}
            trendLabel="needs follow-up"
            sparkData={[65, 70, 72, 68, 71, 74, kpis.completePct || 75]}
            loading={loading}
            decimals={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KPICard
            title="Avg. English Score"
            value={kpis.avgEnglishScore}
            subtitle="Mean proficiency score"
            icon={<MdLanguage size={24} />}
            color="info"
            trend={3.4}
            trendLabel="improving proficiency"
            sparkData={[68, 69, 70, 71, 72, 73, kpis.avgEnglishScore || 74]}
            loading={loading}
            decimals={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KPICard
            title="Top Destination"
            value={topUnis[0]?.name?.split(' ')[0] || 'Zhejiang'}
            subtitle={`${topUnis[0]?.value || 0} applications placed`}
            icon={<MdPublic size={24} />}
            color="primary"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Main Charts Grid */}
      <Grid container spacing={3}>
        {/* Row 1: Agency Conversion Funnel & Scholarship Distribution */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <BarChartWidget
            title="Agency Conversion Funnel & Stage Velocity"
            subtitle="Real-time candidate progression from initial lead to confirmed scholarship placement"
            data={funnelData}
            height={360}
            showLabel
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DonutChartWidget
            title="Scholarship Allocation Share"
            subtitle="Distribution of financial aid awards"
            data={scholarshipCount}
            height={360}
            innerText="Awards"
          />
        </Grid>

        {/* Row 2: Top Universities & Top Majors */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarChartWidget
            title="Top 10 Destination Universities"
            subtitle="Most preferred Chinese institutions by Moroccan students"
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

        {/* Row 3: University Treemap & Degree Donut */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <TreemapWidget
            title="University Application Volume Treemap"
            subtitle="Proportional market share of applications per university"
            data={uniCount}
            height={360}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DonutChartWidget
            title="Degree Level Demand"
            subtitle="Bachelor vs Master vs Language programs"
            data={degreeCount}
            height={360}
            innerText="Degrees"
          />
        </Grid>

        {/* Row 4: English Test Type & English Score Histogram */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <DonutChartWidget
            title="English Proficiency Exam Types"
            subtitle="EFSET vs Duolingo vs TOEFL vs IELTS"
            data={englishTestCount}
            height={340}
            innerText="Tests"
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <BarChartWidget
            title="English Score Distribution"
            subtitle="Score frequency across all test types (10-point bin intervals)"
            data={englishHist}
            height={340}
            showLabel
          />
        </Grid>

        {/* Row 5: Age Histogram & Age vs English Scatter */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarChartWidget
            title="Applicant Age Distribution"
            subtitle="Age profile of Baccalaureate graduates applying to China"
            data={ageHist}
            height={340}
            showLabel
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ScatterWidget
            title="Age vs English Score Correlation"
            subtitle="Individual candidate mapping (X: Age, Y: Score)"
            data={scatterData}
            xKey="x"
            yKey="y"
            xLabel="Age (Years)"
            yLabel="English Score"
            height={340}
          />
        </Grid>
      </Grid>
    </MainLayout>
  );
}
