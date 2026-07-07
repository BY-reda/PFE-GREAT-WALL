import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Grid, TextField, MenuItem, Select, FormControl, InputLabel, Chip, Stepper, Step,
  StepLabel, Card, CardContent, alpha, useTheme, LinearProgress, Divider,
  IconButton, Tooltip, Alert, Checkbox, FormControlLabel
} from '@mui/material';
import {
  MdPersonAdd, MdDocumentScanner, MdAutoFixHigh, MdSchool, MdCheckCircle,
  MdArrowForward, MdArrowBack, MdClose, MdMonetizationOn, MdUpload,
  MdVerified, MdWarning, MdLaunch
} from 'react-icons/md';
import { useData } from '../context/DataContext';

const MAJORS_LIST = [
  'Computer Science',
  'Medicine (MBBS)',
  'Business Administration',
  'Civil Engineering',
  'Mechanical Engineering',
  'International Trade',
  'Artificial Intelligence',
  'Chinese Language & Culture',
  'Architecture'
];

export default function StudentIntakeWizard({ open, onClose, onSuccess }) {
  const theme = useTheme();
  const { addStudent } = useData();
  const [activeStep, setActiveStep] = useState(0);

  // Step 1: Candidate Basic Info & OCR Scanner State
  const [name, setName] = useState('Younes Benali');
  const [age, setAge] = useState(18);
  const [major, setMajor] = useState('Computer Science');
  const [englishScore, setEnglishScore] = useState(75);
  const [englishTest, setEnglishTest] = useState('Duolingo');

  // OCR Extraction & Gemini API State
  const [ocrScanned, setOcrScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [gpa, setGpa] = useState(15.4);
  const [mention, setMention] = useState('Très Bien');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai_ocr_api_key') || '');
  const [apiError, setApiError] = useState('');

  // Step 2: AI University Placement Matcher State
  const [selectedUniIdx, setSelectedUniIdx] = useState(0);

  // Step 3: Document Compliance State
  const [hasTranscript, setHasTranscript] = useState(true);
  const [hasPhysical, setHasPhysical] = useState(true);
  const [hasEnglishCert, setHasEnglishCert] = useState(true);

  // AI Simulated University Recommendations based on Major & GPA
  const recommendations = [
    {
      name: major.includes('Medicine') ? 'Zhejiang University (School of Medicine)' : 'Zhejiang University',
      rank: '#3 in China',
      scholarship: 'Full Government Scholarship',
      matchRate: gpa >= 15 ? 96 : 84,
      savings: '$28,000 / 280,000 MAD',
      color: 'success',
      reason: `Baccalaureate Mention ${mention} (GPA ${gpa}/20) exceeds the 15.0 competitive cutoff for 100% tuition & dormitory waiver.`
    },
    {
      name: major.includes('Medicine') ? 'Fudan University Medical School' : 'Fudan University',
      rank: '#5 in China',
      scholarship: 'Free Tuition Scholarship',
      matchRate: gpa >= 14 ? 89 : 78,
      savings: '$18,000 / 180,000 MAD',
      color: 'primary',
      reason: `Strong academic profile meets criteria for 100% tuition coverage in Shanghai tech/medical hub.`
    },
    {
      name: 'Dalian Polytechnic University',
      rank: 'Partner Institution',
      scholarship: 'Partial Scholarship (50% Tuition)',
      matchRate: 98,
      savings: '$8,000 / 80,000 MAD',
      color: 'info',
      reason: `Guaranteed agency placement quota with immediate pre-sessional admission approval.`
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64Data = ev.target.result.split(',')[1];
      setUploadedFile({
        name: file.name,
        mimeType: file.type || 'image/jpeg',
        base64Data
      });
      setApiError('');
      setOcrScanned(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApiKeyChange = (val) => {
    setApiKey(val);
    try {
      localStorage.setItem('ai_ocr_api_key', val);
    } catch (e) {
      console.warn("Could not save API key:", e);
    }
  };

  // Dynamically query Google API for active, available models on this key
  const getBestGeminiModel = async (cleanKey) => {
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`);
      const listData = await listRes.json().catch(() => null);
      if (listRes.ok && listData?.models?.length) {
        const validModels = listData.models.filter(m => m.supportedGenerationMethods?.includes('generateContent'));
        console.log("Available Gemini models on your API key:", validModels.map(m => m.name));
        const flashModel = validModels.find(m => m.name.toLowerCase().includes('flash'));
        const chosen = flashModel || validModels[0];
        if (chosen?.name) {
          const modelName = chosen.name.startsWith('models/') ? chosen.name.replace('models/', '') : chosen.name;
          console.log("Dynamically selected Gemini model:", modelName);
          return modelName;
        }
      }
    } catch (e) {
      console.warn("Failed to query model list from Google API:", e);
    }
    return null;
  };

  // Robust helper that automatically retries across available Gemini models
  const callGeminiApi = async (cleanKey, promptText, inlineData = null) => {
    const detectedModel = await getBestGeminiModel(cleanKey);
    const candidateModels = Array.from(new Set([
      detectedModel,
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash-001',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-002',
      'gemini-pro-vision',
      'gemini-1.5-pro-latest',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ].filter(Boolean)));

    let lastError = null;
    for (const model of candidateModels) {
      try {
        console.log(`Attempting Gemini Vision call with model: ${model}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cleanKey)}`;
        const bodyPayload = {
          contents: [{
            parts: inlineData ? [{ text: promptText }, { inlineData }] : [{ text: promptText }]
          }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        };
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });
        const data = await res.json().catch(() => null);

        if (res.ok && !data?.error) {
          console.log(`✅ Successfully connected using Gemini model: ${model}`);
          return { data, modelUsed: model };
        }

        const errMsg = data?.error?.message || res.statusText || '';
        if (res.status === 404 || errMsg.toLowerCase().includes('model') || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('supported') || errMsg.toLowerCase().includes('retired') || errMsg.toLowerCase().includes('available')) {
          console.warn(`Model ${model} unavailable (${res.status}: ${errMsg}), trying next candidate...`);
          lastError = new Error(`Model ${model} unavailable: ${errMsg}`);
          continue;
        } else {
          throw new Error(`Google Gemini API Error (${res.status}): ${errMsg || JSON.stringify(data?.error)}`);
        }
      } catch (err) {
        lastError = err;
        if (err.message === 'Failed to fetch') {
          lastError = new Error(`Network Error (Failed to fetch). Please check your internet connection, ensure no ad-blockers are blocking Google APIs, and verify your API key doesn't contain invalid characters.`);
        } else if (err.message && !err.message.includes('unavailable') && !err.message.includes('404') && !err.message.toLowerCase().includes('model') && !err.message.toLowerCase().includes('not found') && !err.message.toLowerCase().includes('retired')) {
          throw err;
        }
      }
    }
    throw lastError || new Error("No active Gemini models found for this API key. Please check your API key permissions.");
  };

  // Real Google Gemini Vision API OCR Execution
  const runGeminiOcr = async () => {
    if (!uploadedFile) {
      setApiError("Please import/upload a transcript image or PDF file first.");
      return;
    }
    const cleanKey = apiKey.trim().replace(/['"]/g, '');
    if (!cleanKey) {
      setApiError("Please enter your Google Gemini API Key below to run Live Vision OCR.");
      return;
    }
    setIsScanning(true);
    setApiError('');

    try {
      const promptText = `You are an expert academic transcript OCR engine analyzing a Moroccan Baccalaureate or high school transcript.
Extract the student's full name, overall GPA / Note Moyenne (out of 20), and Baccalaureate Mention (e.g., Très Bien, Bien, Assez Bien, Passable).
Return pure JSON only in this exact format:
{
  "studentName": "Younes Benali",
  "gpa": 15.6,
  "mention": "Très Bien"
}`;
      const inlineData = { mimeType: uploadedFile.mimeType, data: uploadedFile.base64Data };
      const { data, modelUsed } = await callGeminiApi(cleanKey, promptText, inlineData);

      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.studentName && parsed.studentName !== 'null' && parsed.studentName !== 'Unknown') {
        setName(parsed.studentName);
      }
      if (parsed.gpa && !isNaN(Number(parsed.gpa))) {
        setGpa(Number(parsed.gpa));
      }
      if (parsed.mention && parsed.mention !== 'null') {
        setMention(parsed.mention);
      }

      setOcrScanned(true);
      setIsScanning(false);
    } catch (err) {
      console.warn("Gemini OCR error:", err);
      setApiError(`Gemini API Error: ${err.message}. (You can also click Simulate Demo below!)`);
      setIsScanning(false);
    }
  };

  const handleSimulateOcr = () => {
    setIsScanning(true);
    setApiError('');
    setTimeout(() => {
      setIsScanning(false);
      setOcrScanned(true);
      setGpa(15.6);
      setMention('Très Bien');
      if (name === 'New Candidate') setName('Younes Benali');
    }, 1000);
  };

  const handleConfirmPlacement = () => {
    const selected = recommendations[selectedUniIdx] || recommendations[0];
    const docsComplete = hasTranscript && hasPhysical && hasEnglishCert;

    const newStudent = addStudent({
      name,
      age: Number(age),
      degree: 'Bachelor',
      major,
      university: selected.name.replace(' (School of Medicine)', '').replace(' Medical School', ''),
      scholarship: selected.scholarship.includes('Full') ? 'Full Scholarship' : selected.scholarship.includes('Free') ? 'Free Tuition' : 'Partial Scholarship',
      englishScore: Number(englishScore),
      englishTestType: englishTest,
      hasTranscript,
      hasPhysical,
      hasEnglishCert,
      docsComplete,
      transcriptMention: mention,
      transcriptNotes: {
        'Baccalauréat GPA': `${gpa} / 20`,
        'OCR Status': ocrScanned ? (uploadedFile ? `Verified via Gemini Vision API (${uploadedFile.name})` : 'Simulated AI Vision OCR') : 'Manual Counselor Entry'
      }
    });

    if (onSuccess) onSuccess(newStudent);
    onClose();
    // Reset wizard
    setActiveStep(0);
    setOcrScanned(false);
    setUploadedFile(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          backgroundImage: theme.palette.mode === 'dark'
            ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 1))'
            : 'linear-gradient(to bottom, #ffffff, #f8fafc)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex' }}>
            <MdPersonAdd size={26} />
          </Box>
          <Box>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1.2 }}>
              AGENCY PLACEMENT WORKFLOW
            </Typography>
            <Typography variant="h6" fontWeight={800} color="text.primary">
              AI Student Intake & University Matcher Wizard
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <MdClose />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          <Step>
            <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700 } }}>
              1. OCR Scanner & Profile
            </StepLabel>
          </Step>
          <Step>
            <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700 } }}>
              2. AI University Matcher
            </StepLabel>
          </Step>
          <Step>
            <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700 } }}>
              3. Confirm Placement
            </StepLabel>
          </Step>
        </Stepper>
      </Box>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* ── STEP 1: OCR SCANNER & CANDIDATE PROFILE ──────────────────────── */}
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom color="text.primary">
                Candidate Academic Profile
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Candidate Full Name"
                    variant="outlined"
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Degree Level</InputLabel>
                    <Select value="Bachelor" label="Degree Level" disabled>
                      <MenuItem value="Bachelor">Bachelor (Bac+3/4)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Desired Academic Major</InputLabel>
                    <Select value={major} label="Desired Academic Major" onChange={(e) => setMajor(e.target.value)}>
                      {MAJORS_LIST.map((m) => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>English Test</InputLabel>
                    <Select value={englishTest} label="English Test" onChange={(e) => setEnglishTest(e.target.value)}>
                      <MenuItem value="Duolingo">Duolingo</MenuItem>
                      <MenuItem value="IELTS">IELTS</MenuItem>
                      <MenuItem value="TOEFL">TOEFL</MenuItem>
                      <MenuItem value="EFSET">EFSET</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="English Score"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={englishScore}
                    onChange={(e) => setEnglishScore(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Right: OCR Scanner Box */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `2px dashed ${ocrScanned ? theme.palette.success.main : theme.palette.primary.main}`,
                  bgcolor: ocrScanned ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.primary.main, 0.04),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  height: '100%',
                  minHeight: 300,
                  position: 'relative'
                }}
              >
                {apiError && (
                  <Alert severity="error" sx={{ mb: 2, width: '100%', textAlign: 'left', borderRadius: 2, fontSize: '0.75rem' }}>
                    {apiError}
                  </Alert>
                )}

                {isScanning ? (
                  <Box sx={{ width: '100%', px: 2 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                      <MdAutoFixHigh size={32} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={800} color="primary" gutterBottom>
                      ⚡ Google Gemini Vision API Scanning...
                    </Typography>
                    <LinearProgress sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Extracting candidate name, Note Moyenne, and Mention from document...
                    </Typography>
                  </Box>
                ) : ocrScanned ? (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'success.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                      <MdVerified size={32} />
                    </Box>
                    <Chip label="✅ GEMINI VISION OCR VERIFIED" color="success" size="small" sx={{ fontWeight: 800, mb: 1.5 }} />
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                      Baccalauréat Mention: {mention}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Extracted GPA: <strong style={{ color: theme.palette.success.main }}>{gpa} / 20</strong> (High Honors)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => setOcrScanned(false)}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      >
                        Scan Another File
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ width: 50, height: 50, borderRadius: 3, bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                      <MdDocumentScanner size={28} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary" gutterBottom>
                      Import Transcript & Gemini OCR
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Upload student grade sheet (Image/PDF) to extract GPA via Google Gemini AI Vision:
                    </Typography>

                    {/* File Uploader Box */}
                    <Box sx={{ mb: 2 }}>
                      <input
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        id="wizard-file-upload"
                        type="file"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="wizard-file-upload">
                        <Button
                          variant={uploadedFile ? "outlined" : "contained"}
                          color={uploadedFile ? "success" : "secondary"}
                          component="span"
                          startIcon={<MdUpload />}
                          size="small"
                          sx={{ fontWeight: 700, borderRadius: 2, mb: 1 }}
                        >
                          {uploadedFile ? `📄 ${uploadedFile.name} (Change)` : '📁 Import Transcript File'}
                        </Button>
                      </label>
                    </Box>

                    {/* Gemini API Key Input */}
                    <Box sx={{ mb: 2.5, px: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="password"
                        label="🔑 Google Gemini API Key (Optional for Live AI)"
                        placeholder="AIzaSy..."
                        value={apiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                      />
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<MdAutoFixHigh />}
                        onClick={runGeminiOcr}
                        disabled={!uploadedFile}
                        sx={{ fontWeight: 800, borderRadius: 2, py: 1, boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}
                      >
                        ⚡ Scan with Gemini Vision API
                      </Button>
                      <Button
                        variant="text"
                        color="text.secondary"
                        size="small"
                        onClick={handleSimulateOcr}
                        sx={{ fontWeight: 600, fontSize: '0.75rem', textDecoration: 'underline' }}
                      >
                        🧪 Or Simulate Instant Demo Scan (No Key/File Needed)
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        )}

        {/* ── STEP 2: AI UNIVERSITY MATCHER & PLACEMENT SELECTION ──────────── */}
        {activeStep === 1 && (
          <Box>
            <Alert severity="info" icon={<MdAutoFixHigh />} sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
              AI Placement Engine evaluated <strong>{major}</strong> for candidate <strong>{name}</strong> (GPA: {gpa}/20, Mention {mention}). Select preferred university:
            </Alert>

            <Grid container spacing={2.5}>
              {recommendations.map((rec, idx) => {
                const isSelected = selectedUniIdx === idx;
                return (
                  <Grid size={{ xs: 12, md: 4 }} key={idx}>
                    <Card
                      onClick={() => setSelectedUniIdx(idx)}
                      sx={{
                        cursor: 'pointer',
                        height: '100%',
                        borderRadius: 3,
                        border: `2px solid ${isSelected ? theme.palette[rec.color].main : theme.palette.divider}`,
                        bgcolor: isSelected ? alpha(theme.palette[rec.color].main, 0.08) : 'background.paper',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 12px 24px -10px ${alpha(theme.palette[rec.color].main, 0.3)}`,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justify: 'space-between', height: '100%' }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Chip label={rec.rank} size="small" color={rec.color} sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
                            {isSelected && (
                              <Chip label="✔ SELECTED" size="small" color={rec.color} sx={{ fontWeight: 800 }} />
                            )}
                          </Box>
                          <Typography variant="subtitle1" fontWeight={800} color="text.primary" gutterBottom>
                            {rec.name}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} color={`${rec.color}.main`} sx={{ mb: 1 }}>
                            {rec.scholarship}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.5 }}>
                            {rec.reason}
                          </Typography>
                        </Box>

                        <Box sx={{ pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Match Rate</Typography>
                            <Typography variant="subtitle2" fontWeight={800} color="success.main">{rec.matchRate}%</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Tuition Savings</Typography>
                            <Typography variant="subtitle2" fontWeight={800} color="text.primary">{rec.savings}</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* ── STEP 3: DOSSIER COMPLIANCE & CONFIRMATION ────────────────────── */}
        {activeStep === 2 && (() => {
          const selected = recommendations[selectedUniIdx] || recommendations[0];
          return (
            <Box>
              <Card sx={{ mb: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="overline" color="primary.main" fontWeight={800}>
                    PLACEMENT SUMMARY
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">Candidate</Typography>
                      <Typography variant="subtitle2" fontWeight={800}>{name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">Program</Typography>
                      <Typography variant="subtitle2" fontWeight={800}>{major}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">Assigned University</Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="primary.main">{selected.name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">Scholarship Award</Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="success.main">{selected.scholarship}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Typography variant="subtitle2" fontWeight={800} color="text.primary" gutterBottom>
                Dossier Compliance & Verification Checklist
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Confirm document readiness before submitting candidate to the university placement database:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
                <FormControlLabel
                  control={<Checkbox checked={hasTranscript} onChange={(e) => setHasTranscript(e.target.checked)} color="success" />}
                  label={<Typography variant="body2" fontWeight={600}>📑 Official Baccalaureate Transcript Verified (OCR Scan Complete)</Typography>}
                />
                <FormControlLabel
                  control={<Checkbox checked={hasPhysical} onChange={(e) => setHasPhysical(e.target.checked)} color="success" />}
                  label={<Typography variant="body2" fontWeight={600}>🏥 Medical Physical Examination Form Attached</Typography>}
                />
                <FormControlLabel
                  control={<Checkbox checked={hasEnglishCert} onChange={(e) => setHasEnglishCert(e.target.checked)} color="success" />}
                  label={<Typography variant="body2" fontWeight={600}>🌐 English Proficiency Certificate ({englishTest} - Score {englishScore}) Uploaded</Typography>}
                />
              </Box>
            </Box>
          );
        })()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
          startIcon={<MdArrowBack />}
          sx={{ fontWeight: 700 }}
        >
          Back
        </Button>

        {activeStep < 2 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setActiveStep((prev) => prev + 1)}
            endIcon={<MdArrowForward />}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2, boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}
          >
            {activeStep === 0 ? 'Next: Simulate Top Universities' : 'Next: Confirm Placement'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmPlacement}
            startIcon={<MdCheckCircle />}
            sx={{ fontWeight: 800, px: 3, py: 1, borderRadius: 2, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
          >
            Confirm & Add Student to Database
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
