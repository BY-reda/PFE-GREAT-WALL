import React, { useState, useMemo } from 'react';
import { Grid, Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, LinearProgress, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import GlobalFilters from '../components/GlobalFilters';
import DataTable from '../components/DataTable';
import { useData } from '../context/DataContext';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { generateRecommendationReport, UNIVERSITY_REQUIREMENTS } from '../utils/dataUtils';

const COLUMNS = [
  { key: 'name', label: 'Student Name', sortable: true },
  { key: 'degree', label: 'Degree', chip: true },
  { key: 'major', label: 'Program' },
  { key: 'university', label: 'University' },
  { key: 'scholarship', label: 'Scholarship', chip: true },
  { key: 'englishSummary', label: 'English Score', sortable: true },
  { key: 'dossierStatus', label: 'Dossier Compliance', dossierChip: true },
];

export default function Students() {
  const { students, loading } = useData();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Combine redundant boolean & score columns into clean, single-line summaries
  const enrichedStudents = useMemo(() => {
    return students.map((s) => {
      const missing = [];
      if (!s.hasTranscript) missing.push('Transcript');
      if (!s.hasPhysical) missing.push('Physical Exam');
      if (!s.hasEnglishCert) missing.push('English Cert');

      return {
        ...s,
        englishSummary: s.englishScore !== null && s.englishScore !== undefined
          ? `${s.englishScore} pts (${s.englishTestType || 'Test'})`
          : '—',
        dossierStatus: s.docsComplete
          ? 'Complete (3/3)'
          : `Missing: ${missing[0] || 'Docs'} (${3 - missing.length}/3)`,
      };
    });
  }, [students]);

  const handleExcelExport = (data) => {
    const exportData = data.map((s) => ({
      'Student Name': s.name,
      Degree: s.degree,
      Program: s.major,
      University: s.university,
      Scholarship: s.scholarship,
      'English Score': s.englishScore,
      'Test Type': s.englishTestType,
      Age: s.age,
      'Has Transcript': s.hasTranscript ? 'Yes' : 'No',
      'Has Physical': s.hasPhysical ? 'Yes' : 'No',
      'Has English Cert': s.hasEnglishCert ? 'Yes' : 'No',
      'File Complete': s.docsComplete ? 'Yes' : 'No',
    }));
    exportToExcel(exportData, 'students.xlsx', 'Students');
  };

  return (
    <MainLayout title="Student Analytics">
      <GlobalFilters />
      <DataTable
        title="All Students (Click any row for AI Recommendation Report)"
        rows={enrichedStudents}
        columns={COLUMNS}
        loading={loading}
        defaultRowsPerPage={25}
        onExport={handleExcelExport}
        onRowClick={(row) => setSelectedStudent(row)}
      />

      {/* AI Recommendation & Eligibility Report Card Modal */}
      <Dialog
        open={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1, backgroundImage: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))' }
        }}
      >
        {selectedStudent && (() => {
          const report = generateRecommendationReport(selectedStudent);
          const reqs = UNIVERSITY_REQUIREMENTS[report.acceptedUniversity] || UNIVERSITY_REQUIREMENTS["DEFAULT"];
          const isSuccess = report.matchScore >= 80;
          const isWarning = report.matchScore >= 60 && report.matchScore < 80;

          return (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'primary.light', fontWeight: 800, letterSpacing: 1.2 }}>
                    🤖 AI RECOMMENDATION & ELIGIBILITY REPORT
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {report.studentName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Applying for <b>{report.degree}</b> in <b>{report.major}</b> @ <b>{report.acceptedUniversity}</b>
                  </Typography>
                </Box>
                <Chip
                  label={report.decision}
                  color={isSuccess ? 'success' : isWarning ? 'warning' : 'error'}
                  variant="filled"
                  sx={{ fontWeight: 800, fontSize: '0.85rem', py: 2.5, px: 1.5 }}
                />
              </DialogTitle>
              
              <Divider sx={{ my: 1 }} />

              <DialogContent sx={{ py: 2 }}>
                {/* Match Score & Confidence Banner */}
                <Paper sx={{ p: 2.5, mb: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                        AI Match Score (Decision Support)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 0.5 }}>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: isSuccess ? 'success.main' : isWarning ? 'warning.main' : 'error.main' }}>
                          {report.matchScore}%
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          ({report.displayLabel})
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={report.matchScore}
                        color={isSuccess ? 'success' : isWarning ? 'warning' : 'error'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={7}>
                      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                        <Chip label={`Data Confidence: ${report.dataConfidence}`} color={report.dataConfidence === 'Good' ? 'success' : 'warning'} variant="outlined" sx={{ fontWeight: 700 }} />
                        <Chip label={`Program Difficulty: ${report.programDifficulty}`} color="info" variant="outlined" sx={{ fontWeight: 700 }} />
                        <Chip label={`Min GPA Cutoff: ${reqs.minGpa.toFixed(2)}/20`} color="secondary" variant="outlined" sx={{ fontWeight: 700 }} />
                      </Stack>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontStyle: 'italic' }}>
                        * Score is evaluated against official institutional cutoffs & 3-year transcript notes.
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Strengths vs Warnings Two-Column Section */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, height: '100%', bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        ✅ MAIN STRENGTHS ({report.mainStrengths.length})
                      </Typography>
                      <Stack spacing={1}>
                        {report.mainStrengths.map((str, idx) => (
                          <Typography key={idx} variant="body2" sx={{ color: 'text.primary', fontWeight: 500, display: 'flex', gap: 1 }}>
                            <span>•</span> <span>{str}</span>
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, height: '100%', bgcolor: 'rgba(245, 158, 11, 0.05)', borderRadius: 2, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f59e0b', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        ⚠️ WARNING POINTS & RISKS ({report.warningPoints.length})
                      </Typography>
                      <Stack spacing={1}>
                        {report.warningPoints.map((warn, idx) => (
                          <Typography key={idx} variant="body2" sx={{ color: 'text.primary', fontWeight: 500, display: 'flex', gap: 1 }}>
                            <span>•</span> <span>{warn}</span>
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>

                {/* Recommendation Summary & Next Action Banner */}
                <Box sx={{ mt: 3, p: 2.5, bgcolor: 'primary.dark', borderRadius: 2, color: 'white' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.8 }}>
                    📌 NEXT RECOMMENDED ACTION
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {report.nextAction}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9, fontStyle: 'italic' }}>
                    Summary: {report.recommendationSummary}
                  </Typography>
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setSelectedStudent(null);
                    navigate('/tools');
                  }}
                  sx={{ fontWeight: 700 }}
                >
                  🚀 Open in AI Simulator & OCR Scanner
                </Button>
                <Button variant="contained" onClick={() => setSelectedStudent(null)} sx={{ fontWeight: 700, px: 4 }}>
                  Close Report
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </MainLayout>
  );
}
