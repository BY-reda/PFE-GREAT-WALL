import React, { useMemo } from 'react';
import { Grid, Box, Typography, Card, CardContent } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { InsightCard, RecommendationCard } from '../components/InsightCard';
import { useData } from '../context/DataContext';
import { computeKPIs, generateInsights, generateRecommendations } from '../utils/dataUtils';
import { MdLightbulb, MdAutoGraph, MdAssessment } from 'react-icons/md';

export default function Insights() {
  const { students } = useData();
  const kpis = useMemo(() => computeKPIs(students), [students]);
  const insights = useMemo(() => generateInsights(students, kpis), [students, kpis]);
  const recommendations = useMemo(() => generateRecommendations(students), [students]);

  return (
    <MainLayout title="Smart Insights & Recommendations">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex' }}>
                  <MdLightbulb size={24} />
                </Box>
                <Typography variant="h6" fontWeight={800} sx={{ whiteSpace: 'nowrap' }}>
                  Automated Data Insights
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ ml: 'auto', bgcolor: 'action.hover', px: 1.5, py: 0.5, borderRadius: 2, whiteSpace: 'nowrap' }}>
                  {insights.length} detected
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                These insights are dynamically synthesized from your student database, highlighting statistical patterns, anomalies, and operational bottlenecks.
              </Typography>
              {insights.map((ins, i) => (
                <InsightCard key={i} {...ins} index={i} />
              ))}
              {!insights.length && (
                <Typography color="text.secondary" variant="body2">
                  No insights detected.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex' }}>
                  <MdAutoGraph size={24} />
                </Box>
                <Typography variant="h6" fontWeight={800} sx={{ whiteSpace: 'nowrap' }}>
                  Strategic Recommendations
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ ml: 'auto', bgcolor: 'action.hover', px: 1.5, py: 0.5, borderRadius: 2, whiteSpace: 'nowrap' }}>
                  {recommendations.length} action items
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Prescriptive action items derived from data patterns, prioritized by operational impact and urgency for admission counselors.
              </Typography>
              {recommendations.map((rec, i) => (
                <RecommendationCard key={i} {...rec} index={i} />
              ))}
              {!recommendations.length && (
                <Typography color="text.secondary" variant="body2">
                  No recommendations available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Key Statistics Summary */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex' }}>
                  <MdAssessment size={24} />
                </Box>
                <Typography variant="h6" fontWeight={800} sx={{ whiteSpace: 'nowrap' }}>
                  Executive Performance Summary Matrix
                </Typography>
              </Box>
              <Grid container spacing={2.5}>
                {[
                  { label: 'Total Applicants', value: kpis.totalStudents, color: '#6366f1' },
                  { label: 'Partner Institutions', value: kpis.totalUniversities, color: '#06b6d4' },
                  { label: 'Academic Programs', value: kpis.totalPrograms, color: '#10b981' },
                  { label: 'Scholarship Recipients', value: kpis.scholarshipStudents, color: '#f59e0b' },
                  { label: 'Complete Portfolios', value: kpis.completeFiles, color: '#10b981' },
                  { label: 'Action Required', value: kpis.incompleteFiles, color: '#ef4444' },
                  { label: 'Mean English Score', value: `${kpis.avgEnglishScore}`, color: '#8b5cf6' },
                  { label: 'Missing English Certs', value: kpis.missingEnglishCert, color: '#f97316' },
                ].map((stat) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'center',
                        bgcolor: 'background.default',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: stat.color, transform: 'translateY(-2px)' },
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{ color: stat.color, mb: 0.5, whiteSpace: 'nowrap' }}
                      >
                        {stat.value?.toLocaleString?.() || stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ whiteSpace: 'nowrap', display: 'block' }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
}
