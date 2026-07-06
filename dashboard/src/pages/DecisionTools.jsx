import React, { useState, useMemo, useEffect } from 'react';
import {
  Grid, Card, CardContent, Box, Typography, Tabs, Tab, Slider,
  Select, MenuItem, FormControl, InputLabel, Button, Divider,
  Chip, Alert, IconButton, Tooltip, alpha, useTheme, ButtonGroup
} from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { useData } from '../context/DataContext';
import OcrTranscriptScanner from '../components/OcrTranscriptScanner';
import {
  MdAutoFixHigh, MdMessage, MdCompareArrows, MdCalculate,
  MdContentCopy, MdCheck, MdSchool, MdAccountBalance, MdTrendingUp,
  MdEmail, MdShare, MdArrowForward, MdDocumentScanner
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

  useEffect(() => {
    if (tabParam !== null) {
      setActiveTab(parseInt(tabParam, 10));
    }
  }, [tabParam]);

  const toolHeaders = {
    0: {
      title: "AI Candidate Matcher & Simulator",
      subtitle: "Simulate admission probability and scholarship eligibility based on academic records and language proficiency."
    },
    1: {
      title: "AI Vision OCR Transcript Scanner",
      subtitle: "Automatically extract academic grades from high school transcripts using intelligent vision OCR."
    },
    2: {
      title: "Automated Reminder Generator",
      subtitle: "Identify missing document compliance gaps and generate instant follow-up communications for candidates."
    },
    3: {
      title: "University Head-to-Head Comparator",
      subtitle: "Compare placement metrics, scholarship rates, and English benchmarks across partner universities."
    },
    4: {
      title: "Scholarship Financial Estimator",
      subtitle: "Calculate tuition waivers, accommodation savings, and total financial benefits across scholarship tiers."
    }
  };

  const currentHeader = toolHeaders[activeTab] || toolHeaders[0];

  // --- TAB 1: ADMISSION SIMULATOR STATE ---
  const [simAge, setSimAge] = useState(19);
  const [simScore, setSimScore] = useState(72);
  const [simDegree, setSimDegree] = useState('Bachelor');
  const [simMajor, setSimMajor] = useState('Computer Science');
  const [simYear1, setSimYear1] = useState(14.0); // 1st Year GPA (10th / Tronc Commun)
  const [simYear2, setSimYear2] = useState(14.5); // 2nd Year GPA (11th / 1er Bac)
  const [simYear3, setSimYear3] = useState(15.5); // 3rd Year GPA (12th / 2ème Bac)
  const [simInterview, setSimInterview] = useState('Excellent'); // 'Excellent' | 'Passed' | 'Borderline' | 'Failed'

  const [ocrApplied, setOcrApplied] = useState(false);
  const [hasRunSimulation, setHasRunSimulation] = useState(false);
  const [lockedOcrGrades, setLockedOcrGrades] = useState({ y1: false, y2: false, y3: false });

  // Reset simulation results when inputs change
  useEffect(() => {
    setHasRunSimulation(false);
  }, [simAge, simScore, simDegree, simMajor, simYear1, simYear2, simYear3, simInterview]);

  const handleApplyFromOcr = (extractedNotes) => {
    if (!extractedNotes) return;
    let applied = false;

    const newLocks = { ...lockedOcrGrades };

    // Only update sliders when we have a real numeric value; keep existing value if null/undefined
    if (typeof extractedNotes.year1 === 'number') { setSimYear1(extractedNotes.year1); applied = true; newLocks.y1 = true; }
    if (typeof extractedNotes.year2 === 'number') { setSimYear2(extractedNotes.year2); applied = true; newLocks.y2 = true; }
    if (typeof extractedNotes.year3 === 'number') { setSimYear3(extractedNotes.year3); applied = true; newLocks.y3 = true; }

    // If individual years are missing but we have a global GPA, use it for all three years
    if (!applied && typeof extractedNotes.gpa === 'number') {
      setSimYear1(extractedNotes.gpa);
      setSimYear2(extractedNotes.gpa);
      setSimYear3(extractedNotes.gpa);
      applied = true;
      newLocks.y1 = true; newLocks.y2 = true; newLocks.y3 = true;
    }

    if (applied) {
      setLockedOcrGrades(newLocks);
      setOcrApplied(true);
      setHasRunSimulation(false); // Force them to run simulation after data applies
      setTimeout(() => setOcrApplied(false), 4000);
    }
    setActiveTab(0); // Always switch to Simulator tab
    navigate('/tools?tab=0', { replace: true });
  };

  // --- TAB 2: REMINDER GENERATOR STATE ---
  const [remFilter, setRemFilter] = useState('English Certificate');
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // --- TAB 3: HEAD-TO-HEAD COMPARATOR STATE ---
  const [uniA, setUniA] = useState('Shenyang Aerospace University');
  const [uniB, setUniB] = useState('Zhejiang Normal University');

  // --- TAB 4: FINANCIAL CALCULATOR STATE ---
  const [calcDegree, setCalcDegree] = useState('Bachelor');
  const [calcScholarship, setCalcScholarship] = useState('Full Scholarship');
  const [finCurrency, setFinCurrency] = useState('USD'); // 'USD' | 'MAD'

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
  const avg3Year = useMemo(() => Math.round(((simYear1 + simYear2 + simYear3) / 3) * 100) / 100, [simYear1, simYear2, simYear3]);

  const simResults = useMemo(() => {
    if (!students.length) return { chance: 85, level: 'Full Scholarship', matches: [], mention: 'Mention Bien' };
    
    // Find similar students
    const similar = students.filter(s => 
      s.degree === simDegree || 
      s.major === simMajor ||
      (s.englishScore !== null && Math.abs(s.englishScore - simScore) <= 15)
    );

    // Calculate Phase 1 Pre-Selection probability combining 3-Year High School GPA & English Score
    const isExceptional = avg3Year >= 16.5 || simScore >= 88;

    let baseChance = 50;
    
    // 1. 3-Year Academic Notes contribution (out of 20)
    let mention = 'Mention Passable';
    if (avg3Year >= 16.0) { baseChance += 35; mention = 'Mention Très Bien'; }
    else if (avg3Year >= 14.0) { baseChance += 25; mention = 'Mention Bien'; }
    else if (avg3Year >= 12.0) { baseChance += 15; mention = 'Mention Assez Bien'; }
    else if (avg3Year >= 10.0) { baseChance += 5; mention = 'Mention Passable'; }
    else { baseChance -= 15; mention = 'Insuffisant (<10)'; }

    // 2. English Proficiency contribution
    if (simScore >= 80) baseChance += 15;
    else if (simScore >= 65) baseChance += 10;
    else if (simScore >= 50) baseChance += 5;
    else baseChance -= 10;

    // Age eligibility bonus
    if (!isExceptional && simAge >= 17 && simAge <= 23) baseChance += 5;

    // Final chance calculation (Phase 1 Pre-Selection)
    let chance = Math.min(96, Math.max(15, Math.round(baseChance)));
    if (isExceptional) chance = 98;

    // Determine scholarship eligibility for Phase 1
    let level = 'Partial Scholarship';
    if (isExceptional || avg3Year >= 16.0) {
      level = '🏆 Eligible for Full Government Scholarship (100% Tuition + Dorm + Stipend)';
    } else if (avg3Year >= 14.0 || simScore >= 75) {
      level = 'Full Scholarship Eligible (100% Tuition + Dorm)';
    } else if (avg3Year >= 12.0 || simScore >= 65) {
      level = 'Free Tuition Scholarship Eligible (100% Tuition Waiver)';
    } else {
      level = 'Conditional Admission / Partial Scholarship';
    }

    // Recommend top 3 universities for this major/profile
    const uniCounts = {};
    const uniScores = {};
    similar.forEach(s => {
      const u = s.university;
      if (u && u !== 'Unknown') {
        uniCounts[u] = (uniCounts[u] || 0) + 1;
        if (s.englishScore) {
          uniScores[u] = uniScores[u] ? (uniScores[u] + s.englishScore) / 2 : s.englishScore;
        }
      }
    });

    const matches = Object.entries(uniCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => {
        const avgScore = Math.round(uniScores[name] || 68);
        let matchRate = isExceptional ? 98 : Math.min(96, Math.max(15, Math.round(70 + (count * 2) + ((avg3Year - 12) * 4) + (simScore >= avgScore ? 10 : -10))));
        
        const reasons = [];
        if (avg3Year >= 16) {
          reasons.push("Outstanding academic average significantly exceeds typical cutoff.");
        } else if (avg3Year >= 14) {
          reasons.push("Solid academic record meets the priority admission threshold.");
        } else if (avg3Year >= 12) {
          reasons.push("Academic record meets baseline requirements; language score is critical.");
        } else {
          reasons.push("Academic profile is borderline; exceptional English score or interview required.");
        }
        
        if (simScore >= avgScore + 10) {
          reasons.push("English proficiency is well above the university average (strong advantage).");
        } else if (simScore >= avgScore) {
          reasons.push("English proficiency comfortably meets the university average.");
        } else {
          reasons.push(`English score (${simScore}) is below the typical average (${avgScore}), consider an intensive language track.`);
        }
        
        return {
          name,
          applicants: count,
          avgScore,
          matchRate,
          reasons,
        };
      });

    const betterCount = students.filter(s => (s.gpa || 13) > avg3Year).length;
    const cohortRankPct = `Top ${Math.max(1, Math.round((betterCount / (students.length || 1)) * 100))}%`;

    return { chance, level, matches, mention, cohortRankPct };
  }, [students, simAge, simScore, simDegree, simMajor, avg3Year]);

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

  // --- FINANCIAL CALCULATIONS ---
  const finResults = useMemo(() => {
    const years = calcDegree === 'Bachelor' ? 4 : calcDegree === 'Master' ? 3 : 1;
    let annualTuition = 3200; // USD equivalent (~22,000 RMB)
    let annualDorm = 1200;    // USD equivalent (~8,000 RMB)

    let tuitionSaved = 0;
    let dormSaved = 0;

    if (calcScholarship === 'Full Scholarship') {
      tuitionSaved = annualTuition * years;
      dormSaved = annualDorm * years;
    } else if (calcScholarship === 'Free Tuition') {
      tuitionSaved = annualTuition * years;
      dormSaved = 0;
    } else if (calcScholarship === 'Partial') {
      tuitionSaved = annualTuition * years * 0.5;
      dormSaved = 0;
    }

    const totalSaved = tuitionSaved + dormSaved;
    return {
      years, annualTuition, annualDorm, tuitionSaved, dormSaved, totalSaved,
      tuitionSavedMAD: tuitionSaved * 10,
      dormSavedMAD: dormSaved * 10,
      totalSavedMAD: totalSaved * 10,
      annualSaved: Math.round(totalSaved / years),
      annualSavedMAD: Math.round((totalSaved * 10) / years),
    };
  }, [calcDegree, calcScholarship]);

  return (
    <MainLayout title={currentHeader.title}>
      {/* Header Bar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {currentHeader.subtitle}
        </Typography>
      </Box>

      {/* TAB 0: ADMISSION SIMULATOR */}
      <AnimatePresence mode="wait">
        {activeTab === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            {/* OCR Grades Applied Success Banner */}
            <AnimatePresence>
              {ocrApplied && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    severity="success"
                    sx={{ mb: 3, fontWeight: 700, fontSize: '1rem', borderRadius: 2, boxShadow: 3 }}
                    icon={<MdDocumentScanner size={24} />}
                  >
                    ✅ OCR Grades Successfully Applied to Simulator! Sliders updated with real extracted data — run the simulation below.
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            <Grid container spacing={3}>
              {/* Controls Column */}
              <Grid size={{ xs: 12, lg: 5 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MdAutoFixHigh color={theme.palette.primary.main} size={24} /> Candidate Profile Input
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Adjust candidate attributes to simulate Chinese university admission probability and scholarship likelihood.
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justify: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>Applicant Age</Typography>
                        <Typography variant="subtitle2" fontWeight={800} color="primary">{simAge} Years</Typography>
                      </Box>
                      <Slider
                        value={simAge}
                        onChange={(_, v) => setSimAge(v)}
                        min={16}
                        max={28}
                        step={1}
                        marks={[
                          { value: 16, label: '16' },
                          { value: 18, label: '18' },
                          { value: 22, label: '22' },
                          { value: 28, label: '28' },
                        ]}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justify: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>English Proficiency Test Score</Typography>
                        <Typography variant="subtitle2" fontWeight={800} color="primary">{simScore} pts</Typography>
                      </Box>
                      <Slider
                        value={simScore}
                        onChange={(_, v) => setSimScore(v)}
                        min={30}
                        max={100}
                        step={1}
                        marks={[
                          { value: 40, label: '40 (Low)' },
                          { value: 65, label: '65 (Avg)' },
                          { value: 85, label: '85+ (High)' },
                        ]}
                      />
                    </Box>

                    {/* 3-Year High School Academic Record */}
                    <Box sx={{ mb: 3, p: 2, borderRadius: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                          📚 3-Year High School Record (/20)
                        </Typography>
                        <Chip label={`Avg: ${avg3Year} (${simResults.mention})`} size="small" color="primary" sx={{ fontWeight: 800 }} />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" fontWeight={700} color={lockedOcrGrades.y1 ? "success.main" : "text.secondary"}>
                            1st Yr (10th): {simYear1} {lockedOcrGrades.y1 && "🔒"}
                          </Typography>
                          <Slider value={simYear1} onChange={(_, v) => setSimYear1(v)} min={10} max={20} step={0.25} size="small" disabled={lockedOcrGrades.y1} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" fontWeight={700} color={lockedOcrGrades.y2 ? "success.main" : "text.secondary"}>
                            {lockedOcrGrades.y2 ? "Ex. Régional (11th)" : "2nd Yr (11th)"}: {simYear2} {lockedOcrGrades.y2 && "🔒"}
                          </Typography>
                          <Slider value={simYear2} onChange={(_, v) => setSimYear2(v)} min={10} max={20} step={0.25} size="small" disabled={lockedOcrGrades.y2} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" fontWeight={700} color={lockedOcrGrades.y3 ? "success.main" : "text.secondary"}>
                            {lockedOcrGrades.y3 ? "Ex. National (Bac)" : "3rd Yr (Bac)"}: {simYear3} {lockedOcrGrades.y3 && "🔒"}
                          </Typography>
                          <Slider value={simYear3} onChange={(_, v) => setSimYear3(v)} min={10} max={20} step={0.25} size="small" disabled={lockedOcrGrades.y3} />
                        </Grid>
                      </Grid>
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Degree Level</InputLabel>
                          <Select value="Bachelor" label="Degree Level" disabled sx={{ fontWeight: 700 }}>
                            <MenuItem value="Bachelor">🎓 Bachelor Degree (Exclusive Focus)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Target Major</InputLabel>
                          <Select value={simMajor} label="Target Major" onChange={(e) => setSimMajor(e.target.value)} sx={{ fontWeight: 700 }}>
                            {allMajors.slice(0, 20).map(m => (
                              <MenuItem key={m} value={m}>{m}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      size="large" 
                      sx={{ mt: 4, py: 1.5, fontWeight: 800, fontSize: '1.1rem' }}
                      onClick={() => setHasRunSimulation(true)}
                    >
                      🚀 Run Simulation Engine
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Results Column */}
              <Grid size={{ xs: 12, lg: 7 }}>
                <Card sx={{ height: '100%', borderTop: `4px solid ${theme.palette.primary.main}` }}>
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>
                      Phase 1: Initial Pre-Selection & Recommendation Matrix
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Evaluates candidate eligibility based purely on 3-year high school academic notes & language proficiency.
                    </Typography>

                    {!hasRunSimulation ? (
                      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 8 }}>
                        <Typography variant="h5" color="text.secondary" fontWeight={800} sx={{ mb: 1 }}>
                          Ready for Simulation
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                          Please verify the academic grades and adjust the candidate's age and English proficiency score, then click "Run Simulation Engine" to view AI university matches.
                        </Typography>
                        <Button variant="outlined" size="large" onClick={() => setHasRunSimulation(true)} sx={{ fontWeight: 800 }}>
                          Run Simulation Now
                        </Button>
                      </Box>
                    ) : (
                      <>
                        <Alert severity="info" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
                      ℹ️ <b>Admissions Timeline Note:</b> This Phase 1 simulation determines academic pre-selection and best university matches. The official admission interview is scheduled <b>after</b> this initial screening!
                    </Alert>

                    {/* Score Banner */}
                    <Grid container spacing={2.5} sx={{ mb: 4 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.08), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Phase 1 Academic Eligibility
                          </Typography>
                          <Typography variant="h3" fontWeight={800} color="primary.main" sx={{ my: 0.5 }}>
                            {simResults.chance}%
                          </Typography>
                          <Chip label={simResults.chance >= 75 ? 'Pre-Selected / Eligible ✅' : simResults.chance >= 55 ? 'Conditional Match' : 'High Risk'} color={simResults.chance >= 75 ? 'success' : simResults.chance >= 55 ? 'warning' : 'error'} size="small" sx={{ fontWeight: 700 }} />
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Predicted Scholarship Level
                          </Typography>
                          <Typography variant="h6" fontWeight={800} color="success.main" sx={{ my: 1.2 }}>
                            {simResults.level}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Based on academic merit & English score
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Evaluation Breakdown Banner */}
                    <Box sx={{ mb: 4, p: 2.5, borderRadius: 3, bgcolor: 'background.default', border: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>3-Year GPA</Typography>
                        <Typography variant="subtitle1" fontWeight={800} color="primary.main">{avg3Year} / 20</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Bac Honor</Typography>
                        <Typography variant="subtitle1" fontWeight={800} color="secondary.main">{simResults.mention}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Cohort Ranking</Typography>
                        <Typography variant="subtitle1" fontWeight={800} color="info.main">{simResults.cohortRankPct}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Phase 1 Status</Typography>
                        <Typography variant="subtitle1" fontWeight={800} color="success.main">Pre-Selected ✅</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>English Score</Typography>
                        <Typography variant="subtitle1" fontWeight={800}>{simScore} pts</Typography>
                      </Box>
                    </Box>

                    {/* Top Recommended Universities */}
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MdSchool size={20} color={theme.palette.secondary.main} /> Top 3 Recommended Universities for {simMajor}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {simResults.matches.map((match, i) => (
                        <Box
                          key={match.name}
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: 'background.default',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateX(4px)' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                              #{i + 1}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>{match.name}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                {match.applicants} historical placements | Avg score: {match.avgScore} pts
                              </Typography>
                              {match.reasons.map((r, rIdx) => (
                                <Typography key={rIdx} variant="caption" sx={{ display: 'block', color: r.includes('below') || r.includes('borderline') ? 'warning.main' : 'text.secondary', fontWeight: 600, '&:before': { content: '"• "', pr: 0.5 } }}>
                                  {r}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2" fontWeight={800} color="success.main">{match.matchRate}% Match</Typography>
                            <Typography variant="caption" color="text.secondary">Acceptance rate</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* TAB 1: AI OCR TRANSCRIPT SCANNER */}
        {activeTab === 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <OcrTranscriptScanner students={students} onApplyToSimulator={handleApplyFromOcr} />
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

        {/* TAB 4: FINANCIAL ESTIMATOR */}
        {activeTab === 4 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MdCalculate color={theme.palette.primary.main} size={26} /> Scholarship Value Estimator
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                      Calculate total financial aid value and estimated parent cost savings across full degree durations.
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Academic Degree Duration</InputLabel>
                      <Select value={calcDegree} label="Academic Degree Duration" onChange={(e) => setCalcDegree(e.target.value)}>
                        <MenuItem value="Bachelor">Bachelor Degree (4 Years)</MenuItem>
                        <MenuItem value="Master">Master Degree (3 Years)</MenuItem>
                        <MenuItem value="Language">Language Program (1 Year)</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Target Scholarship Award Type</InputLabel>
                      <Select value={calcScholarship} label="Target Scholarship Award Type" onChange={(e) => setCalcScholarship(e.target.value)}>
                        <MenuItem value="Full Scholarship">Full Scholarship (100% Tuition + Free Dorm)</MenuItem>
                        <MenuItem value="Free Tuition">Free Tuition Scholarship (100% Tuition only)</MenuItem>
                        <MenuItem value="Partial">Partial Scholarship (50% Tuition Waiver)</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 7 }}>
                <Card sx={{ height: '100%', borderTop: `4px solid ${theme.palette.success.main}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                      <Typography variant="h6" fontWeight={800}>
                        Estimated 4-Year Financial Benefit Breakdown
                      </Typography>
                      <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                        <Button
                          variant={finCurrency === 'USD' ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => setFinCurrency('USD')}
                          sx={{ fontWeight: 700 }}
                        >
                          USD ($)
                        </Button>
                        <Button
                          variant={finCurrency === 'MAD' ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => setFinCurrency('MAD')}
                          sx={{ fontWeight: 700 }}
                        >
                          MAD (Dirham)
                        </Button>
                      </ButtonGroup>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                      Based on average Chinese university fee schedules ($3,200/yr tuition + $1,200/yr accommodation | 1 USD ≈ 10 MAD).
                    </Typography>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                            Total Estimated Value ({finCurrency})
                          </Typography>
                          <Typography variant="h3" fontWeight={800} color="success.main" sx={{ my: 0.5 }}>
                            {finCurrency === 'USD' ? `$${(finResults?.totalSaved || 0).toLocaleString()}` : `${(finResults?.totalSavedMAD || 0).toLocaleString()} MAD`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total parent savings over {finResults?.years || 4} years
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.default', border: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                          <Box sx={{ display: 'flex', justify: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>Tuition Waiver:</Typography>
                            <Typography variant="body2" fontWeight={800}>
                              {finCurrency === 'USD' ? `$${(finResults?.tuitionSaved || 0).toLocaleString()}` : `${(finResults?.tuitionSavedMAD || 0).toLocaleString()} MAD`}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justify: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>Dormitory Stipend:</Typography>
                            <Typography variant="body2" fontWeight={800}>
                              {finCurrency === 'USD' ? `$${(finResults?.dormSaved || 0).toLocaleString()}` : `${(finResults?.dormSavedMAD || 0).toLocaleString()} MAD`}
                            </Typography>
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justify: 'space-between' }}>
                            <Typography variant="subtitle2" fontWeight={800} color="primary">Annual Benefit:</Typography>
                            <Typography variant="subtitle2" fontWeight={800} color="primary">
                              {finCurrency === 'USD' ? `$${(finResults?.annualSaved || 0).toLocaleString()}/yr` : `${(finResults?.annualSavedMAD || 0).toLocaleString()} MAD/yr`}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Alert severity="info" sx={{ borderRadius: 2.5, fontWeight: 600 }}>
                      💡 Counseling Tip: Presenting this 4-year total savings figure ({finCurrency === 'USD' ? `$${(finResults?.totalSaved || 0).toLocaleString()}` : `${(finResults?.totalSavedMAD || 0).toLocaleString()} MAD`}) to Moroccan parents significantly increases agency enrollment conversion rates!
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
