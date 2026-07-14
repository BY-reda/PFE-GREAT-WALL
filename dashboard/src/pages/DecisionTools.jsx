import React, { useState, useMemo, useEffect } from 'react';
import {
  Grid, Card, CardContent, Box, Typography, Button, Divider,
  Chip, Alert, alpha, useTheme, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { useData } from '../context/DataContext';
import StudentIntakeWizard from '../components/StudentIntakeWizard';
import {
  MdAutoFixHigh, MdMessage, MdCompareArrows,
  MdContentCopy, MdCheck, MdEmail, MdDocumentScanner
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

export default function DecisionTools() {
  const { students } = useData();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam ? parseInt(tabParam, 10) : 0);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(null);

  useEffect(() => {
    if (tabParam !== null) {
      const tabNum = parseInt(tabParam, 10);
      setActiveTab(tabNum);
      if (tabNum === 0 || tabNum === 1) {
        setWizardStep(tabNum === 1 ? 0 : 2);
        setIsWizardOpen(true);
      }
    }
  }, [tabParam]);

  const toolHeaders = {
    0: {
      title: "AI Candidate Matcher & Simulator",
      subtitle: "Simulate admission probability Z-scores and eligibility matrices across 16 CSC partner hubs."
    },
    1: {
      title: "AI Vision OCR Document Scanner",
      subtitle: "Automatically extract candidate GPA and academic notes directly from Baccalaureate & High School transcripts."
    },
    2: {
      title: "Automated Reminder Generator",
      subtitle: "Identify missing document compliance gaps and generate instant follow-up communications for candidates."
    },
    3: {
      title: "University Head-to-Head Comparator",
      subtitle: "Compare placement metrics, scholarship rates, and English benchmarks across partner universities."
    }
  };

  const currentHeader = toolHeaders[activeTab] || toolHeaders[0];

  // --- TAB 2: REMINDER GENERATOR STATE ---
  const [remFilter, setRemFilter] = useState('English Certificate');
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // --- TAB 3: HEAD-TO-HEAD COMPARATOR STATE ---
  const [uniA, setUniA] = useState('Shenyang Aerospace University');
  const [uniB, setUniB] = useState('Zhejiang Normal University');

  // Get unique majors and universities from dataset
  const allMajors = useMemo(() => {
    const set = new Set(students.map(s => s.major).filter(m => m && m !== 'Unknown'));
    return Array.from(set).sort();
  }, [students]);

  const allUnis = useMemo(() => {
    const set = new Set(students.map(s => s.university).filter(u => u && u !== 'Unknown'));
    return Array.from(set).sort();
  }, [students]);

  // --- SIMULATOR CALCULATIONS ---
  // --- REMINDER CALCULATIONS ---
  const filteredIncomplete = useMemo(() => {
    return students.filter(s => {
      if (s.docsComplete) return false;
      if (remFilter === 'English Certificate') return !s.hasEnglishCert;
      if (remFilter === 'Physical Exam') return !s.hasPhysical;
      if (remFilter === 'Transcript') return !s.hasTranscript;
      return true;
    }).slice(0, 30);
  }, [students, remFilter]);

  const currentStudent = filteredIncomplete[selectedStudentIdx] || filteredIncomplete[0] || {
    name: 'Younes Benali',
    university: 'Shenyang Aerospace University',
    major: 'Computer Science',
    missingDocs: ['English Certificate', 'Physical Exam'],
  };

  const messageTemplate = useMemo(() => {
    const missingList = (currentStudent.missingDocs || []).join(', ');
    return `Hello ${currentStudent.name},

This is an urgent notification from Great Wall (طريقك نحو الدراسة في الصين) regarding your university application to ${currentStudent.university} (${currentStudent.major}).

Our compliance audit indicates that your application dossier is currently INCOMPLETE. You are missing the following mandatory document(s):
📌 ${missingList}

To ensure your scholarship eligibility and prevent application rejection by the Chinese university admissions board, please submit these documents via our portal within the next 48 hours.

Best regards,
Great Wall Admission Counseling Team`;
  }, [currentStudent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // --- COMPARATOR CALCULATIONS ---
  const compStats = useMemo(() => {
    const getStats = (uniName) => {
      const sub = students.filter(s => s.university === uniName);
      const count = sub.length || 1;
      const withScore = sub.filter(s => s.englishScore !== null);
      const avgScore = withScore.length ? Math.round(withScore.reduce((a, b) => a + b.englishScore, 0) / withScore.length) : 68;
      const fullSc = sub.filter(s => s.scholarship === 'Full Scholarship').length;
      const fullRate = Math.round((fullSc / count) * 100);
      const complete = sub.filter(s => s.docsComplete).length;
      const compRate = Math.round((complete / count) * 100);
      
      // Top major
      const majors = {};
      sub.forEach(s => { if (s.major && s.major !== 'Unknown') majors[s.major] = (majors[s.major] || 0) + 1; });
      const topMajor = Object.entries(majors).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Engineering';

      return { count, avgScore, fullRate, compRate, topMajor };
    };

    return {
      a: getStats(uniA),
      b: getStats(uniB),
    };
  }, [students, uniA, uniB]);

  return (
    <MainLayout title={currentHeader.title}>
      {/* Header Bar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {currentHeader.subtitle}
        </Typography>
      </Box>

      {/* TAB 0 & 1: UNIFIED AI INTAKE, OCR & SIMULATION WIZARD */}
      <AnimatePresence mode="wait">
        {(activeTab === 0 || activeTab === 1) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5, fontWeight: 700, fontSize: '0.95rem', boxShadow: 2 }}>
              ✨ {activeTab === 0 ? "AI Candidate Matcher & Simulator" : "AI Vision OCR Document Scanner"} is powered by our unified neural admission and transcript extraction engine.
            </Alert>
            
            <Card sx={{ p: 5, borderRadius: 4, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.04), border: `2px dashed ${theme.palette.primary.main}`, mb: 4, boxShadow: '0 12px 36px rgba(0,0,0,0.05)' }}>
              <Box sx={{ width: 72, height: 72, borderRadius: 3.5, bgcolor: theme.palette.primary.main, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5, boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)' }}>
                {activeTab === 0 ? <MdAutoFixHigh size={40} /> : <MdDocumentScanner size={40} />}
              </Box>
              <Typography variant="h4" fontWeight={900} gutterBottom>
                {activeTab === 0 ? "⚡ AI University Match & Placement Simulator" : "📑 AI Vision OCR Transcript Extraction Engine"}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680, mx: 'auto', mb: 4, fontSize: '1.05rem', lineHeight: 1.6 }}>
                {activeTab === 0 
                  ? "Simulate candidate admission Z-scores, major fit probabilities, and ranking matrices across Harbin, Zhejiang, and 14 CSC elite institutions using our unified intake engine."
                  : "Upload high school transcripts (Baccalaureate or Continuous Control) for instant automated mark extraction and GPA locking directly connected to the admission simulation matrix."}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={activeTab === 0 ? <MdAutoFixHigh size={26} /> : <MdDocumentScanner size={26} />}
                onClick={() => {
                  setWizardStep(activeTab === 1 ? 0 : 2);
                  setIsWizardOpen(true);
                }}
                sx={{ py: 2, px: 6, borderRadius: 3, fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)' }}
              >
                {activeTab === 0 ? "Launch AI Candidate Matcher & Simulator" : "Launch AI Vision OCR Document Scanner"}
              </Button>
            </Card>

            <StudentIntakeWizard
              open={isWizardOpen}
              initialStep={wizardStep !== null ? wizardStep : (activeTab === 1 ? 0 : 2)}
              onClose={() => {
                setIsWizardOpen(false);
                setWizardStep(null);
              }}
            />
          </motion.div>
        )}

        {/* TAB 2: REMINDER GENERATOR */}
        {activeTab === 2 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MdMessage color={theme.palette.primary.main} size={24} /> Missing Document Filter
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Select a compliance gap to view affected students and generate automated follow-up communications.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                      {['English Certificate', 'Physical Exam', 'Transcript', 'All Incomplete'].map(f => (
                        <Chip
                          key={f}
                          label={f}
                          onClick={() => { setRemFilter(f); setSelectedStudentIdx(0); }}
                          color={remFilter === f ? 'primary' : 'default'}
                          variant={remFilter === f ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                        />
                      ))}
                    </Box>

                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                      Affected Candidates ({filteredIncomplete.length})
                    </Typography>
                    
                    <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {filteredIncomplete.map((s, idx) => (
                        <Box
                          key={s.name + idx}
                          onClick={() => setSelectedStudentIdx(idx)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: selectedStudentIdx === idx ? 'primary.main' : 'divider',
                            bgcolor: selectedStudentIdx === idx ? alpha(theme.palette.primary.main, 0.08) : 'background.default',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s',
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight={selectedStudentIdx === idx ? 800 : 600}>{s.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.university}</Typography>
                          </Box>
                          <Chip label={`${s.docCount || 1}/3 Docs`} size="small" color="error" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                        </Box>
                      ))}
                      {!filteredIncomplete.length && (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                          No candidates found with missing {remFilter}.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 7 }}>
                <Card sx={{ height: '100%', borderTop: `4px solid ${theme.palette.warning.main}` }}>
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight={800}>
                        Automated Follow-up Message Template
                      </Typography>
                      <Chip label="Ready to Send" color="success" size="small" sx={{ fontWeight: 700 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Personalized reminder generated dynamically for <strong>{currentStudent.name}</strong>.
                    </Typography>

                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: 'background.default',
                        border: `1px solid ${theme.palette.divider}`,
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        flex: 1,
                        mb: 3,
                        color: 'text.primary',
                        position: 'relative',
                      }}
                    >
                      {messageTemplate}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant={copied ? "contained" : "outlined"}
                        color={copied ? "success" : "primary"}
                        startIcon={copied ? <MdCheck /> : <MdContentCopy />}
                        onClick={handleCopy}
                        size="large"
                        sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
                      >
                        {copied ? 'Copied to Clipboard!' : 'Copy WhatsApp / Email Text'}
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<MdEmail />}
                        onClick={() => window.open(`mailto:?subject=Urgent: Missing Documents for ${currentStudent.university}&body=${encodeURIComponent(messageTemplate)}`)}
                        size="large"
                        sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
                      >
                        Launch Email Client
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* TAB 3: HEAD-TO-HEAD COMPARATOR */}
        {activeTab === 3 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCompareArrows color={theme.palette.primary.main} size={26} /> University Head-to-Head Comparator
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Compare key placement metrics, scholarship rates, and English score benchmarks between partner institutions.
                </Typography>

                <Grid container spacing={4} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Institution A</InputLabel>
                      <Select value={uniA} label="Select Institution A" onChange={(e) => setUniA(e.target.value)}>
                        {allUnis.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Institution B</InputLabel>
                      <Select value={uniB} label="Select Institution B" onChange={(e) => setUniB(e.target.value)}>
                        {allUnis.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Comparison Matrix Table */}
                <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                  <Grid container sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), py: 2, px: 3, fontWeight: 800, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Grid size={{ xs: 4 }}><Typography variant="subtitle2" fontWeight={800}>Performance Metric</Typography></Grid>
                    <Grid size={{ xs: 4 }}><Typography variant="subtitle2" fontWeight={800} color="primary.main">{uniA}</Typography></Grid>
                    <Grid size={{ xs: 4 }}><Typography variant="subtitle2" fontWeight={800} color="secondary.main">{uniB}</Typography></Grid>
                  </Grid>

                  {[
                    { label: 'Total Historical Applicants', a: compStats.a.count, b: compStats.b.count, unit: ' students' },
                    { label: 'Average English Score Required', a: compStats.a.avgScore, b: compStats.b.avgScore, unit: ' pts' },
                    { label: 'Full Scholarship Award Rate', a: compStats.a.fullRate, b: compStats.b.fullRate, unit: '%' },
                    { label: 'Document Compliance Rate', a: compStats.a.compRate, b: compStats.b.compRate, unit: '%' },
                    { label: 'Most Requested Major', a: compStats.a.topMajor, b: compStats.b.topMajor, unit: '' },
                  ].map((row, idx) => (
                    <Grid
                      container
                      key={row.label}
                      sx={{
                        py: 2.5,
                        px: 3,
                        borderBottom: idx < 4 ? `1px solid ${theme.palette.divider}` : 'none',
                        alignItems: 'center',
                        bgcolor: idx % 2 === 0 ? 'background.default' : 'transparent',
                      }}
                    >
                      <Grid size={{ xs: 4 }}>
                        <Typography variant="body2" fontWeight={700} color="text.secondary">{row.label}</Typography>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Typography variant="h6" fontWeight={800} color="primary.main">
                          {row.a}{row.unit}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Typography variant="h6" fontWeight={800} color="secondary.main">
                          {row.b}{row.unit}
                        </Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
