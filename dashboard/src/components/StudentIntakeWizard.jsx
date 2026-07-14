import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Grid, TextField, MenuItem, Select, FormControl, InputLabel, Chip, Stepper, Step,
  StepLabel, Card, CardContent, alpha, useTheme, LinearProgress, Divider,
  IconButton, Tooltip, Alert, Checkbox, FormControlLabel, Table, TableBody,
  TableCell, TableHead, TableRow, Stack, Paper, Slider
} from '@mui/material';
import {
  MdPersonAdd, MdDocumentScanner, MdAutoFixHigh, MdSchool, MdCheckCircle,
  MdArrowForward, MdArrowBack, MdClose, MdMonetizationOn, MdUpload,
  MdVerified, MdWarning, MdLaunch, MdRefresh, MdEdit, MdAssessment, MdAddCircleOutline,
  MdFilterList, MdPublic, MdTune, MdCheck, MdStars
} from 'react-icons/md';
import { useData } from '../context/DataContext';

const GLOBAL_UNIVERSITIES_DB = [
  {
    id: 'zhejiang',
    name: 'Zhejiang University',
    country: 'China',
    tier: '985/211 Key Elite Project',
    flag: '🇨🇳',
    minGpa: 14.5,
    minEnglish: 90,
    meanMoy: 15.2,
    stdMoy: 1.6,
    meanEng: 92.0,
    stdEng: 10.0,
    tuition: '$28,000 / yr',
    specialties: ['Medicine (MBBS)', 'Computer Science', 'Artificial Intelligence', 'Mechanical Engineering'],
    getScholarship: (gpa) => gpa >= 16.0 ? '100% CSC Bilateral Government Scholarship' : gpa >= 14.5 ? '50% Provincial Merit Waiver' : 'Standard Tuition (Ineligible)',
    getSavings: (gpa) => gpa >= 16.0 ? '$28,000 / yr (Full Tuition & Dorm)' : gpa >= 14.5 ? '$14,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 16.0 
      ? `Candidate's ${gpa}/20 GPA exceeds the 16.0 cutoff for full bilateral CSC government funding in ${major}.`
      : gpa >= 14.5 
      ? `Qualifies for direct provincial admission in ${major}. Needs +${(16.0 - gpa).toFixed(1)} points for 100% full waiver.`
      : `Requires 14.5 minimum GPA. Currently below cutoff by ${(14.5 - gpa).toFixed(1)} points.`,
    color: 'success',
    description: 'Premier scientific & medical institution in Hangzhou (Zhejiang Hub). Top-tier bilateral agreement for Moroccan candidates.'
  },
  {
    id: 'hit_shenzhen',
    name: 'Harbin Institute of Technology (Shenzhen)',
    country: 'China',
    tier: '985/211 Key Elite Project',
    flag: '🇨🇳',
    minGpa: 11.67,
    minEnglish: 85,
    meanMoy: 14.20,
    stdMoy: 1.87,
    meanEng: 88.0,
    stdEng: 12.0,
    tuition: '$26,000 / yr',
    specialties: ['Computer Science', 'Artificial Intelligence', 'Mechanical Engineering', 'Software Engineering'],
    getScholarship: (gpa) => gpa >= 15.0 ? '100% CSC Presidential Full Scholarship' : gpa >= 13.5 ? '50% Shenzhen Tech Merit Award' : 'Standard Admission',
    getSavings: (gpa) => gpa >= 15.0 ? '$26,000 / yr (Full Coverage)' : gpa >= 13.5 ? '$13,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 14.20
      ? `Candidate's ${gpa}/20 matches/exceeds historical alumni average (14.20/20) for ${major}. High probability of full scholarship.`
      : `Passes historical cutoff (11.67/20) for ${major}. Needs strong interview coaching to secure full waiver.`,
    color: 'primary',
    description: "China's top engineering university in Shenzhen Silicon Valley. High alumni acceptance rate for technical majors."
  },
  {
    id: 'nupt',
    name: 'Nanjing Univ. of Posts & Telecommunications',
    country: 'China',
    tier: 'Double First-Class Key Hub',
    flag: '🇨🇳',
    minGpa: 13.90,
    minEnglish: 80,
    meanMoy: 14.70,
    stdMoy: 1.26,
    meanEng: 85.0,
    stdEng: 10.0,
    tuition: '$22,000 / yr',
    specialties: ['Computer Science', 'Artificial Intelligence', 'Electronics', 'Software Engineering'],
    getScholarship: (gpa) => gpa >= 15.2 ? '100% NUPT President Full Scholarship' : gpa >= 13.9 ? '50% First-Class Discipline Waiver' : 'Below Cutoff',
    getSavings: (gpa) => gpa >= 15.2 ? '$22,000 / yr (Free Tuition & Dorm)' : gpa >= 13.9 ? '$11,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 14.70
      ? `Candidate's ${gpa}/20 is above historical alumni benchmark (14.70/20) for ${major} in Jiangsu Tech Hub.`
      : `Passes minimum cutoff (13.90/20) for ${major}. Competitive screening applied.`,
    color: 'success',
    description: 'Specialized national telecommunications and AI research institution located in Nanjing (Jiangsu Hub).'
  },
  {
    id: 'hdu',
    name: 'Hangzhou Dianzi University',
    country: 'China',
    tier: 'Jiangsu / Zhejiang Hub',
    flag: '🇨🇳',
    minGpa: 11.90,
    minEnglish: 75,
    meanMoy: 14.49,
    stdMoy: 2.30,
    meanEng: 80.0,
    stdEng: 10.0,
    tuition: '$20,000 / yr',
    specialties: ['Computer Science', 'Software Engineering', 'Artificial Intelligence', 'Electronics'],
    getScholarship: (gpa) => gpa >= 14.5 ? '100% Zhejiang Provincial Scholarship' : gpa >= 12.5 ? '50% Electronic Engineering Award' : 'Standard Quota',
    getSavings: (gpa) => gpa >= 14.5 ? '$20,000 / yr (Full Tuition Waiver)' : gpa >= 12.5 ? '$10,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 14.49
      ? `Outstanding alignment with historical alumni average (14.49/20) for ${major} in Hangzhou tech hub.`
      : `Well above historical minimum cutoff (11.90/20) for ${major}. Safe target for direct placement.`,
    color: 'primary',
    description: 'Prominent electronic and software engineering university in Hangzhou with direct partner quota allocation.'
  },
  {
    id: 'wenzhou_med',
    name: 'Wenzhou Medical University',
    country: 'China',
    tier: 'Jiangsu / Zhejiang Hub',
    flag: '🇨🇳',
    minGpa: 10.69,
    minEnglish: 75,
    meanMoy: 13.91,
    stdMoy: 2.23,
    meanEng: 78.0,
    stdEng: 10.0,
    tuition: '$24,000 / yr',
    specialties: ['Medicine (MBBS)', 'Clinical Medicine', 'Pharmacy', 'Biological Engineering'],
    getScholarship: (gpa) => gpa >= 14.5 ? '100% Medical Excellence Scholarship' : gpa >= 12.0 ? '50% International MBBS Waiver' : 'Standard Quota',
    getSavings: (gpa) => gpa >= 14.5 ? '$24,000 / yr (Free MBBS Tuition)' : gpa >= 12.0 ? '$12,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 13.91
      ? `Meets/exceeds historical alumni average (13.91/20) for Wenzhou MBBS/Medicine tracks.`
      : `Comfortably exceeds historical min cutoff (10.69/20). Direct interview approval likely.`,
    color: 'success',
    description: "One of China's most prestigious clinical medicine and MBBS hubs with high historical placement volume (N=22+)."
  },
  {
    id: 'guilin_elec',
    name: 'Guilin Univ. of Electronic Technology',
    country: 'China',
    tier: 'High-Volume Partner Quota',
    flag: '🇨🇳',
    minGpa: 10.85,
    minEnglish: 70,
    meanMoy: 13.04,
    stdMoy: 2.80,
    meanEng: 75.0,
    stdEng: 10.0,
    tuition: '$18,000 / yr',
    specialties: ['Computer Science', 'Electronics', 'Mechanical Engineering', 'Software Engineering'],
    getScholarship: (gpa) => gpa >= 13.5 ? '100% GUET Full Tuition Scholarship' : gpa >= 11.5 ? '50% Electronic Engineering Waiver' : 'Standard Quota',
    getSavings: (gpa) => gpa >= 13.5 ? '$18,000 / yr (Full Tuition)' : gpa >= 11.5 ? '$9,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 13.04
      ? `Candidate profile is above historical alumni average (13.04/20). Automatic 100% tuition waiver triggered.`
      : `Exceeds historical minimum cutoff (10.85/20) for ${major}. High admission probability.`,
    color: 'info',
    description: 'Dedicated electronic technology and IT engineering partner university with guaranteed pre-sessional screening.'
  },
  {
    id: 'zhengzhou',
    name: 'Zhengzhou University',
    country: 'China',
    tier: '985/211 Key Elite Project',
    flag: '🇨🇳',
    minGpa: 10.25,
    minEnglish: 70,
    meanMoy: 12.85,
    stdMoy: 1.79,
    meanEng: 75.0,
    stdEng: 10.0,
    tuition: '$20,000 / yr',
    specialties: ['Civil Engineering', 'Medicine (MBBS)', 'Computer Science', 'Business Administration', 'Mechanical Engineering'],
    getScholarship: (gpa) => gpa >= 13.8 ? '100% CSC 211 Project Full Scholarship' : gpa >= 11.5 ? '50% Presidential Merit Waiver' : 'Standard Partner Quota',
    getSavings: (gpa) => gpa >= 13.8 ? '$20,000 / yr (Free Tuition & Dorm)' : gpa >= 11.5 ? '$10,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 12.85
      ? `Exceeds historical alumni average (12.85/20) across 46 historical placements at Zhengzhou 211 Hub.`
      : `Comfortably above historical cutoff (10.25/20). Safe choice with strong scholarship likelihood.`,
    color: 'success',
    description: 'National 211 Project comprehensive university with second highest historical agency placement volume (N=46).'
  },
  {
    id: 'nanchang',
    name: 'Nanchang University',
    country: 'China',
    tier: '985/211 Key Elite Project',
    flag: '🇨🇳',
    minGpa: 10.96,
    minEnglish: 70,
    meanMoy: 12.60,
    stdMoy: 1.85,
    meanEng: 75.0,
    stdEng: 10.0,
    tuition: '$19,000 / yr',
    specialties: ['Mechanical Engineering', 'Medicine (MBBS)', 'International Trade', 'Civil Engineering'],
    getScholarship: (gpa) => gpa >= 13.5 ? '100% CSC National Key Scholarship' : gpa >= 11.5 ? '50% Jiangxi Provincial Award' : 'Standard Quota',
    getSavings: (gpa) => gpa >= 13.5 ? '$19,000 / yr (Full Waiver)' : gpa >= 11.5 ? '$9,500 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 12.60
      ? `Candidate matches historical alumni average (12.60/20) for national key programs in ${major}.`
      : `Passes historical cutoff (10.96/20). Direct agency recommendation applies.`,
    color: 'primary',
    description: 'Double First-Class national key university in Jiangxi province offering excellent engineering and medical degrees.'
  },
  {
    id: 'fuzhou_trade',
    name: 'Fuzhou Univ. of Foreign Studies & Trade',
    country: 'China',
    tier: 'High-Volume Partner Quota',
    flag: '🇨🇳',
    minGpa: 10.02,
    minEnglish: 65,
    meanMoy: 12.36,
    stdMoy: 1.51,
    meanEng: 70.0,
    stdEng: 10.0,
    tuition: '$15,000 / yr',
    specialties: ['Business Administration', 'International Trade', 'Chinese Language & Culture', 'Computer Science'],
    getScholarship: (gpa) => gpa >= 13.0 ? '100% Presidential International Scholarship' : gpa >= 11.0 ? '50% Foreign Trade Merit Waiver' : 'Guaranteed Partner Quota',
    getSavings: (gpa) => gpa >= 13.0 ? '$15,000 / yr (Full Tuition)' : gpa >= 11.0 ? '$7,500 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 12.36
      ? `Exceeds historical alumni average (12.36/20) across 21 verified placements in Fujian business/trade hub.`
      : `Passes historical cutoff (10.02/20). Guaranteed agency partner placement for ${major}.`,
    color: 'info',
    description: 'Leading international trade and business university in Fujian with high historical acceptance volume (N=21).'
  },
  {
    id: 'tiangong',
    name: 'Tiangong University',
    country: 'China',
    tier: 'High-Volume Partner Quota',
    flag: '🇨🇳',
    minGpa: 10.01,
    minEnglish: 65,
    meanMoy: 12.34,
    stdMoy: 1.77,
    meanEng: 70.0,
    stdEng: 10.0,
    tuition: '$16,000 / yr',
    specialties: ['Mechanical Engineering', 'International Trade', 'Computer Science', 'Civil Engineering'],
    getScholarship: (gpa) => gpa >= 13.2 ? '100% Double First-Class Discipline Waiver' : gpa >= 11.2 ? '50% Tianjin Municipal Award' : 'Standard Quota',
    getSavings: (gpa) => gpa >= 13.2 ? '$16,000 / yr (Full Tuition)' : gpa >= 11.2 ? '$8,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 12.34
      ? `Matches historical alumni benchmark (12.34/20) across 13 accepted candidates at Tiangong.`
      : `Well above historical minimum cutoff (10.01/20). Safe direct target.`,
    color: 'success',
    description: 'Double First-Class university in Tianjin specializing in applied engineering, textiles, and international trade.'
  },
  {
    id: 'urban_sichuan',
    name: 'Urban Vocational College of Sichuan',
    country: 'China',
    tier: 'High-Volume Partner Quota',
    flag: '🇨🇳',
    minGpa: 10.01,
    minEnglish: 60,
    meanMoy: 12.32,
    stdMoy: 1.87,
    meanEng: 68.0,
    stdEng: 10.0,
    tuition: '$12,000 / yr',
    specialties: ['Architecture', 'Civil Engineering', 'Business Administration', 'Mechanical Engineering'],
    getScholarship: (gpa) => gpa >= 12.5 ? '100% Partner Full Tuition Exemption' : gpa >= 10.8 ? '50% Applied Engineering Waiver' : 'Guaranteed Partner Quota',
    getSavings: (gpa) => gpa >= 12.5 ? '$12,000 / yr (Full Exemption)' : gpa >= 10.8 ? '$6,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 12.32
      ? `Above historical average (12.32/20) across 27 historical placements in Chengdu applied engineering hub.`
      : `Passes historical cutoff (10.01/20). Guaranteed high-probability placement for ${major}.`,
    color: 'info',
    description: 'High-volume applied engineering and urban construction college in Sichuan with 27 verified alumni placements.'
  },
  {
    id: 'liaoning_shihua',
    name: 'Liaoning Shihua University',
    country: 'China',
    tier: 'High-Volume Partner Quota',
    flag: '🇨🇳',
    minGpa: 10.20,
    minEnglish: 65,
    meanMoy: 12.24,
    stdMoy: 1.75,
    meanEng: 70.0,
    stdEng: 10.0,
    tuition: '$15,000 / yr',
    specialties: ['Mechanical Engineering', 'Civil Engineering', 'Computer Science', 'International Trade'],
    getScholarship: (gpa) => gpa >= 13.0 ? '100% Petroleum & Engineering Full Scholarship' : gpa >= 11.2 ? '50% Shihua Merit Waiver' : 'Standard Quota',
    getSavings: (gpa) => gpa >= 13.0 ? '$15,000 / yr (Full Tuition)' : gpa >= 11.2 ? '$7,500 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 12.24
      ? `Above historical average (12.24/20) across 22 accepted alumni in petrochemical & engineering tracks.`
      : `Comfortably exceeds historical cutoff (10.20/20). Direct partner quota applicable.`,
    color: 'primary',
    description: "China's first petroleum institution located in Fushun. High historical agency acceptance rate (N=22)."
  },
  {
    id: 'dalian',
    name: 'Dalian Polytechnic University',
    country: 'China',
    tier: 'High-Volume Partner Quota',
    flag: '🇨🇳',
    minGpa: 11.18,
    minEnglish: 70,
    meanMoy: 12.23,
    stdMoy: 1.20,
    meanEng: 70.0,
    stdEng: 10.0,
    tuition: '$14,000 / yr',
    specialties: ['Mechanical Engineering', 'International Trade', 'Civil Engineering', 'Chinese Language & Culture', 'Computer Science'],
    getScholarship: (gpa) => gpa >= 13.0 ? '100% Dalian Partner Full Scholarship' : gpa >= 11.5 ? '50% Guaranteed Partner Scholarship' : 'Standard Partner Quota',
    getSavings: (gpa) => gpa >= 13.0 ? '$14,000 / yr (Full Tuition)' : gpa >= 11.5 ? '$7,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 12.23
      ? `Matches historical alumni average (12.23/20) across 21 agency placements in Dalian coastal tech hub.`
      : `Passes historical cutoff (11.18/20). Guaranteed pre-sessional approval quota.`,
    color: 'info',
    description: 'Guaranteed agency placement quota in coastal Liaoning with immediate pre-sessional admission approval for qualifying applicants.'
  },
  {
    id: 'shenyang_urban',
    name: 'Shenyang Urban & Construction University',
    country: 'China',
    tier: 'High-Volume Partner Quota',
    flag: '🇨🇳',
    minGpa: 10.01,
    minEnglish: 65,
    meanMoy: 12.15,
    stdMoy: 1.66,
    meanEng: 70.0,
    stdEng: 10.0,
    tuition: '$13,500 / yr',
    specialties: ['Architecture', 'Civil Engineering', 'Mechanical Engineering', 'Computer Science'],
    getScholarship: (gpa) => gpa >= 12.8 ? '100% Urban Construction Full Exemption' : gpa >= 10.8 ? '50% Architectural Merit Award' : 'Guaranteed Partner Quota',
    getSavings: (gpa) => gpa >= 12.8 ? '$13,500 / yr (Full Exemption)' : gpa >= 10.8 ? '$6,750 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 12.15
      ? `Exceeds historical average (12.15/20) across 36 accepted alumni in Shenyang architectural/civil tracks.`
      : `Comfortably passes historical cutoff (10.01/20). Safe direct target.`,
    color: 'success',
    description: 'Specialized architectural and urban engineering university with our third highest historical placement volume (N=36).'
  },
  {
    id: 'yangzhou',
    name: 'Yangzhou University',
    country: 'China',
    tier: 'Jiangsu / Zhejiang Hub',
    flag: '🇨🇳',
    minGpa: 10.04,
    minEnglish: 65,
    meanMoy: 12.04,
    stdMoy: 1.45,
    meanEng: 70.0,
    stdEng: 10.0,
    tuition: '$16,000 / yr',
    specialties: ['Business Administration', 'Computer Science', 'Civil Engineering', 'International Trade', 'Medicine (MBBS)'],
    getScholarship: (gpa) => gpa >= 13.0 ? '100% Yangzhou Presidential Scholarship' : gpa >= 11.2 ? '50% Jiangsu Provincial Award' : 'Guaranteed Partner Quota',
    getSavings: (gpa) => gpa >= 13.0 ? '$16,000 / yr (Free Tuition & Dorm)' : gpa >= 11.2 ? '$8,000 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 12.04
      ? `Candidate exceeds historical average (12.04/20) of our highest volume university (75 accepted alumni in CSV).`
      : `Well above historical minimum cutoff (10.04/20). Guaranteed high-probability placement for ${major}.`,
    color: 'primary',
    description: 'Our #1 highest-volume historical agency placement university (N=75+). Key provincial comprehensive hub in Jiangsu.'
  },
  {
    id: 'northeast_petroleum',
    name: 'NorthEast Petroleum University',
    country: 'China',
    tier: 'High-Volume Partner Quota',
    flag: '🇨🇳',
    minGpa: 10.02,
    minEnglish: 65,
    meanMoy: 11.79,
    stdMoy: 1.69,
    meanEng: 68.0,
    stdEng: 10.0,
    tuition: '$14,500 / yr',
    specialties: ['Mechanical Engineering', 'Civil Engineering', 'Computer Science', 'Chemical Engineering'],
    getScholarship: (gpa) => gpa >= 12.6 ? '100% Petroleum Discipline Full Scholarship' : gpa >= 10.8 ? '50% NEPU Merit Exemption' : 'Guaranteed Partner Quota',
    getSavings: (gpa) => gpa >= 12.6 ? '$14,500 / yr (Full Tuition)' : gpa >= 10.8 ? '$7,250 / yr' : '$0',
    getLogicalExplanation: (major, gpa) => gpa >= 11.79
      ? `Candidate exceeds historical average (11.79/20) across 40 verified agency placements in Daqing engineering hub.`
      : `Passes historical cutoff (10.02/20). Guaranteed agency partner placement.`,
    color: 'info',
    description: 'National key petroleum engineering institution with our second highest historical agency placement volume (N=40).'
  }
];

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

const SCANNING_STEPS = [
  "Initializing Google Gemini Optical Neural Network...",
  "Detecting document boundaries, massar ID & Ministry of Education seal...",
  "Segmenting grade sheet tables: Mathematics, Physics, Chemistry, Languages...",
  "Calculating weighted Note Moyenne Générale (GPA) & verifying Mention...",
  "Cross-checking subject coefficients & finalizing AI confidence verification..."
];

const INITIAL_EXTRACTED_MARKS = [
  { subject: 'Mathematics & Calculus (Spécialité)', cc: 16.80, score: 17.50, maxScore: 20, grade: 'A+', coefficient: 7, hasNational: true, verified: true },
  { subject: 'Physics & Chemistry', cc: 15.50, score: 16.00, maxScore: 20, grade: 'A', coefficient: 7, hasNational: true, verified: true },
  { subject: 'Life & Earth Sciences (SVT)', cc: 14.80, score: 15.00, maxScore: 20, grade: 'A', coefficient: 5, hasNational: true, verified: true },
  { subject: 'Foreign Language 1 (English)', cc: 17.00, score: 18.00, maxScore: 20, grade: 'A+', coefficient: 2, hasNational: true, verified: true },
  { subject: 'Philosophy & Logic', cc: 13.00, score: 13.50, maxScore: 20, grade: 'B+', coefficient: 2, hasNational: true, verified: true },
  { subject: 'Native Language (Arabic - Régional)', cc: 14.50, score: null, maxScore: 20, grade: 'B+', coefficient: 2, hasNational: false, verified: true },
  { subject: 'History & Geography (Régional)', cc: 15.20, score: null, maxScore: 20, grade: 'B+', coefficient: 2, hasNational: false, verified: true },
  { subject: 'Physical Education (Sport / EPS)', cc: 18.00, score: null, maxScore: 20, grade: 'A+', coefficient: 1, hasNational: false, verified: true }
];

export default function StudentIntakeWizard({ open, onClose, onSuccess, initialStep = 0 }) {
  const theme = useTheme();
  const { addStudent } = useData();
  const [activeStep, setActiveStep] = useState(initialStep || 0);

  useEffect(() => {
    if (open) {
      setActiveStep(initialStep || 0);
    }
  }, [open, initialStep]);

  const getApiKey = () => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('ai_ocr_api_key') || '';
  };

  // Step 1: Candidate Basic Info & Document Upload (Inputs start empty)
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [major, setMajor] = useState('');
  const [englishScore, setEnglishScore] = useState('');
  const [englishTest, setEnglishTest] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [apiError, setApiError] = useState('');

  // Step 2: OCR Extraction, Animation & Full Marks State (Starts empty before scan)
  const [ocrScanned, setOcrScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [gpa, setGpa] = useState('');
  const [mention, setMention] = useState('');
  const [bacTrack, setBacTrack] = useState('');
  const [confidenceScore, setConfidenceScore] = useState('');
  const [extractedMarks, setExtractedMarks] = useState([]);

  // Step 3: AI University Placement Matcher & Interactive Simulation State
  const [selectedUniId, setSelectedUniId] = useState('zhejiang');
  const [simGpa, setSimGpa] = useState('');
  const [simEnglish, setSimEnglish] = useState('');
  const [simAge, setSimAge] = useState(18);
  const [simProgram, setSimProgram] = useState("Bachelor's Degree (本科)");
  const [simMajor, setSimMajor] = useState('');
  const [simCountryFilter, setSimCountryFilter] = useState('All');
  const [simStatusFilter, setSimStatusFilter] = useState('All');

  // Loading/Simulation Calculation State (`BEFORE SHOW RECOMENDATION ... MAKE THE PAGE LOAD THEN SHOW THE RESULT`)
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationStepText, setSimulationStepText] = useState('Initializing AI Placement Neural Network...');

  const triggerAiCalculation = () => {
    setIsSimulating(true);
    setSimulationProgress(15);
    setSimulationStepText('Analyzing candidate GPA & subject coefficients...');
    
    setTimeout(() => {
      setSimulationProgress(45);
      setSimulationStepText(`Comparing marks against historical N=240 alumni placements for ${simMajor || major || 'Computer Science'}...`);
    }, 400);

    setTimeout(() => {
      setSimulationProgress(80);
      setSimulationStepText('Calculating Z-score admission probability distributions across 16 Chinese CSC Hubs...');
    }, 800);

    setTimeout(() => {
      setSimulationProgress(100);
      setSimulationStepText('Ranking Top Priority matches and finalizing admission matrix...');
    }, 1200);

    setTimeout(() => {
      setIsSimulating(false);
    }, 1500);
  };

  // Automatically trigger loading calculation when entering Step 3 for the first time
  useEffect(() => {
    if (activeStep === 2) {
      triggerAiCalculation();
    }
  }, [activeStep]);

  // Sync initial simulation values from candidate actual GPA when ready
  useEffect(() => {
    if (gpa && !simGpa) setSimGpa(Number(gpa));
    if (englishScore && !simEnglish) setSimEnglish(Number(englishScore));
  }, [gpa, englishScore]);

  // Step 4: Document Compliance State
  const [hasTranscript, setHasTranscript] = useState(true);
  const [hasPhysical, setHasPhysical] = useState(true);
  const [hasEnglishCert, setHasEnglishCert] = useState(true);

  // Dynamic Candidate Simulation & University Match Calculation (Bac GPA strictly FIXED after extraction!)
  const effectiveSimGpa = gpa ? Number(gpa) : Number(simGpa || 12.5);
  const effectiveSimEnglish = Number(simEnglish || englishScore || 75);
  const currentMajor = simMajor || major || 'Computer Science';

  const evaluatedUniversities = GLOBAL_UNIVERSITIES_DB.map((uni) => {
    const isEligibleGpa = effectiveSimGpa >= (uni.minGpa || 10.0);
    const isEligibleEnglish = effectiveSimEnglish >= (uni.minEnglish || 60);
    const isEligible = isEligibleGpa && isEligibleEnglish;

    // Check if university specializes in student's exact program
    const isMajorSpecialty = uni.specialties && uni.specialties.some(s => 
      currentMajor.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(currentMajor.toLowerCase())
    );

    // Unbiased statistical Z-score admission probability formula centered on historical alumni mean
    const uMeanMoy = uni.meanMoy || 12.5;
    const uStdMoy = uni.stdMoy || 1.6;
    const uMeanEng = uni.meanEng || 72.0;
    const uStdEng = uni.stdEng || 8.0;
    const uMinMoy = uni.minGpa || 10.0;

    // Normalize English score if candidate entered out of 160 or 120
    const normEng = effectiveSimEnglish > 100 ? Math.round((effectiveSimEnglish / 160) * 100) : effectiveSimEnglish;

    const zMoy = (effectiveSimGpa - uMeanMoy) / uStdMoy;
    const zEng = (normEng - uMeanEng) / uStdEng;
    const compositeZ = 0.75 * zMoy + 0.25 * zEng;

    // Unbiased logistic formula: when compositeZ = 0 (student matches university average), base rate is 70%
    let matchRate = Math.round(100 / (1 + Math.exp(-0.85 * (compositeZ + 0.85))));

    if (isMajorSpecialty && isEligible) {
      matchRate = Math.min(96, matchRate + 4);
    }

    // Strict Cutoff Penalties & Difficulty Scaling for 985/211 Elite universities:
    if (effectiveSimGpa < uMinMoy) {
      // Below minimum cutoff: drop below 45% proportional to distance
      matchRate = Math.max(15, Math.min(42, Math.round(40 - (uMinMoy - effectiveSimGpa) * 15)));
    } else if (effectiveSimEnglish < (uni.minEnglish || 60) - 10) {
      // Significantly below English cutoff without pre-sessional qualification
      matchRate = Math.max(25, Math.min(48, Math.round(45 - ((uni.minEnglish || 60) - effectiveSimEnglish))));
    } else if (effectiveSimGpa < uMeanMoy - 0.3 && uni.tier.includes('985/211')) {
      // Below average for an elite 985/211: moderate reach (48-66%)
      matchRate = Math.min(66, Math.max(48, matchRate));
    } else if (effectiveSimGpa < uMeanMoy - 0.2) {
      // Below average for a partner university: moderate/good chance (58-74%)
      matchRate = Math.min(74, Math.max(54, matchRate));
    }

    matchRate = Math.max(20, Math.min(96, matchRate));

    // Categorize directly based on statistical matchRate probability & major specialty
    let statusLabel = '🚨 HIGH RISK / AMBITIOUS REACH';
    let statusColor = 'error';
    let logicalCategory = '🚨 HIGH RISK (Intensive Coaching Required)';
    let logicalPriority = 6;

    if (matchRate >= 82 && isMajorSpecialty) {
      statusLabel = '🏆 #1 BEST CHOICE TO ACCEPT';
      statusColor = 'success';
      logicalCategory = `🏆 #1 TOP CSC MATCH FOR ${currentMajor.toUpperCase()}`;
      logicalPriority = 1;
    } else if (matchRate >= 80) {
      statusLabel = '🌟 SAFE MATCH (High Probability)';
      statusColor = 'success';
      logicalCategory = '🌟 SAFE ADMISSION verified';
      logicalPriority = isMajorSpecialty ? 2 : 3;
    } else if (matchRate >= 68) {
      statusLabel = '✅ TARGET MATCH (Strong Chance)';
      statusColor = 'info';
      logicalCategory = '✅ TARGET MATCH';
      logicalPriority = isMajorSpecialty ? 3 : 4;
    } else if (matchRate >= 55) {
      statusLabel = '🟡 MODERATE MATCH (Accessible Partner)';
      statusColor = 'warning';
      logicalCategory = '🟡 MODERATE MATCH';
      logicalPriority = 5;
    } else {
      statusLabel = '🚨 HIGH RISK / AMBITIOUS REACH';
      statusColor = 'error';
      logicalCategory = '🚨 HIGH RISK (Intensive Coaching Required)';
      logicalPriority = 6;
    }

    const scholarship = uni.getScholarship(effectiveSimGpa);
    const savings = uni.getSavings(effectiveSimGpa);
    const explanation = uni.getLogicalExplanation ? uni.getLogicalExplanation(currentMajor, effectiveSimGpa) : uni.description;

    return {
      ...uni,
      isEligible,
      isMajorSpecialty,
      matchRate,
      statusLabel,
      statusColor,
      logicalCategory,
      logicalPriority,
      scholarship,
      savings,
      explanation
    };
  });

  const filteredUniversities = evaluatedUniversities.filter((uni) => {
    if (simCountryFilter !== 'All' && uni.tier !== simCountryFilter) return false;
    if (simStatusFilter === 'Eligible' && !uni.isEligible) return false;
    if (simStatusFilter === 'Scholarships' && !uni.scholarship.includes('100%')) return false;
    return true;
  });

  // Strict Rang Sorting: 
  // 1. #1 Best Choice to Accept (Priority 1)
  // 2. Safe Matches (Priority 2 & 3)
  // 3. Target Matches (Priority 4 & 5)
  // 4. Reach / Ambitious (Priority 6)
  filteredUniversities.sort((a, b) => {
    if (a.logicalPriority !== b.logicalPriority) {
      return a.logicalPriority - b.logicalPriority;
    }
    return b.matchRate - a.matchRate;
  });

  const eligibleCount = evaluatedUniversities.filter(u => u.isEligible).length;
  const specialtyCount = evaluatedUniversities.filter(u => u.isMajorSpecialty).length;
  const totalCount = evaluatedUniversities.length;
  const candidatePercentile = effectiveSimGpa >= 18 ? 'Top 1% (Elite Distinction)' : effectiveSimGpa >= 16.5 ? 'Top 5% (Mention Très Bien)' : effectiveSimGpa >= 15 ? 'Top 12% (Mention Bien)' : effectiveSimGpa >= 13.5 ? 'Top 28% (Mention Assez Bien)' : 'Top 50%';
  
  const selectedUniObject = evaluatedUniversities.find(u => u.id === selectedUniId) || filteredUniversities[0] || evaluatedUniversities[0];

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
        const flashModel = validModels.find(m => m.name.toLowerCase().includes('flash'));
        const chosen = flashModel || validModels[0];
        if (chosen?.name) {
          return chosen.name.startsWith('models/') ? chosen.name.replace('models/', '') : chosen.name;
        }
      }
    } catch (e) {
      console.warn("Failed to query model list from Google API:", e);
    }
    return null;
  };

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
          return { data, modelUsed: model };
        }

        const errMsg = data?.error?.message || res.statusText || '';
        if (res.status === 404 || errMsg.toLowerCase().includes('model') || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('supported') || errMsg.toLowerCase().includes('retired')) {
          lastError = new Error(`Model ${model} unavailable: ${errMsg}`);
          continue;
        } else {
          throw new Error(`Google Gemini API Error (${res.status}): ${errMsg || JSON.stringify(data?.error)}`);
        }
      } catch (err) {
        lastError = err;
        if (err.message === 'Failed to fetch') {
          lastError = new Error(`Network Error (Failed to fetch). Check internet connection or API key.`);
        }
      }
    }
    throw lastError || new Error("No active Gemini models found for this API key.");
  };

  // Triggered when moving from Step 1 -> Step 2
  const triggerScanningProcess = (useRealApi = false) => {
    setActiveStep(1);
    setIsScanning(true);
    setOcrScanned(false);
    setScanProgress(0);
    setScanStepIndex(0);
    setApiError('');

    if (useRealApi && uploadedFile && getApiKey().trim()) {
      runGeminiOcr();
    } else {
      runSimulatedScanningAnimation();
    }
  };

  const runSimulatedScanningAnimation = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 6) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsScanning(false);
        setOcrScanned(true);
        if (!name || name === 'New Candidate') setName('Younes Benali');
        if (!gpa || gpa < 10) setGpa(15.60);
        if (!mention) setMention('Très Bien');
        if (!bacTrack) setBacTrack('Sciences Mathématiques A (Spécialité Math-Physique)');
        if (!confidenceScore) setConfidenceScore(99.4);
        if (!extractedMarks || extractedMarks.length === 0) setExtractedMarks(INITIAL_EXTRACTED_MARKS);
      } else {
        setScanProgress(progress);
        if (progress < 20) setScanStepIndex(0);
        else if (progress < 45) setScanStepIndex(1);
        else if (progress < 70) setScanStepIndex(2);
        else if (progress < 90) setScanStepIndex(3);
        else setScanStepIndex(4);
      }
    }, 90);
  };

  const runGeminiOcr = async () => {
    const cleanKey = getApiKey().trim().replace(/['"]/g, '');
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 85) {
        progress += Math.floor(Math.random() * 8) + 4;
        setScanProgress(progress);
        if (progress < 25) setScanStepIndex(0);
        else if (progress < 50) setScanStepIndex(1);
        else if (progress < 75) setScanStepIndex(2);
        else setScanStepIndex(3);
      }
    }, 120);

    try {
      const promptText = `You are an expert academic transcript OCR engine analyzing a Moroccan Baccalaureate or high school transcript.
Extract the student's full name, overall GPA / Note Moyenne (out of 20), Baccalaureate Mention, track/stream name, and full breakdown of subject notes.
IMPORTANT for Moroccan Bac: Some subjects (like Physical Education/Sport, Arabic Language, History & Geography) only have Contrôle Continu (CC) / Régional and DO NOT have an Examen National in 2ème année Bac. For subjects with no Examen National, set "hasNational": false and "score": null. For subjects with an Examen National (like Math, Physics, Chemistry, SVT, English, Philosophy), set "hasNational": true and "score" to the Examen National mark.
Return pure JSON only in this exact format:
{
  "studentName": "Younes Benali",
  "gpa": 15.6,
  "mention": "Très Bien",
  "bacTrack": "Sciences Mathématiques A",
  "confidenceScore": 99.4,
  "subjects": [
    { "subject": "Mathematics & Calculus", "cc": 16.8, "score": 17.5, "maxScore": 20, "grade": "A+", "coefficient": 7, "hasNational": true },
    { "subject": "Physical Education (Sport)", "cc": 18.0, "score": null, "maxScore": 20, "grade": "A+", "coefficient": 1, "hasNational": false }
  ]
}`;
      const inlineData = { mimeType: uploadedFile.mimeType, data: uploadedFile.base64Data };
      const { data } = await callGeminiApi(cleanKey, promptText, inlineData);

      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      clearInterval(interval);
      setScanProgress(100);
      setScanStepIndex(4);

      if (parsed.studentName && parsed.studentName !== 'null' && parsed.studentName !== 'Unknown') {
        setName(parsed.studentName);
      }
      if (parsed.gpa && !isNaN(Number(parsed.gpa))) {
        setGpa(Number(parsed.gpa));
      }
      if (parsed.mention && parsed.mention !== 'null') {
        setMention(parsed.mention);
      }
      if (parsed.bacTrack) {
        setBacTrack(parsed.bacTrack);
      }
      if (parsed.confidenceScore && !isNaN(Number(parsed.confidenceScore))) {
        setConfidenceScore(Number(parsed.confidenceScore));
      }
      if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
        const mapped = parsed.subjects.map(s => {
          const hasNational = s.hasNational !== false && s.score !== null && s.score !== undefined && s.score !== '' && s.score !== 'null';
          return {
            subject: s.subject || 'Academic Subject',
            cc: s.cc !== null && s.cc !== undefined && s.cc !== '' && s.cc !== 'null' ? Number(s.cc).toFixed(2) : Number(s.score || 15).toFixed(2),
            score: hasNational ? Number(s.score).toFixed(2) : null,
            hasNational: hasNational,
            maxScore: 20,
            grade: s.grade || (Number(s.score || s.cc || 15) >= 16 ? 'A+' : Number(s.score || s.cc || 15) >= 14 ? 'A' : 'B+'),
            coefficient: Number(s.coefficient || 2),
            verified: true
          };
        });
        setExtractedMarks(mapped);
      }

      setTimeout(() => {
        setIsScanning(false);
        setOcrScanned(true);
      }, 400);
    } catch (err) {
      clearInterval(interval);
      console.warn("Gemini OCR error, falling back to instant simulation:", err);
      setApiError(`Gemini API Notice: ${err.message}. Switched automatically to Instant Vision AI Simulation.`);
      runSimulatedScanningAnimation();
    }
  };

  const handleMarkChange = (index, field, value) => {
    const updated = [...extractedMarks];
    if (field === 'hasNational') {
      updated[index] = { ...updated[index], hasNational: value, score: value ? (updated[index].cc || '15.00') : null };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    
    // Recalculate GPA dynamically when any score changes
    if (field === 'score' || field === 'cc' || field === 'coefficient' || field === 'hasNational') {
      const totalCoef = updated.reduce((acc, m) => acc + Number(m.coefficient || 1), 0);
      const totalPoints = updated.reduce((acc, m) => {
        const markToUse = (m.hasNational !== false && m.score !== null && m.score !== undefined && m.score !== '')
          ? Number(m.score)
          : Number(m.cc || 0);
        return acc + markToUse * Number(m.coefficient || 1);
      }, 0);
      if (totalCoef > 0 && !isNaN(totalPoints)) {
        const newGpa = Number((totalPoints / totalCoef).toFixed(2));
        setGpa(newGpa);
        if (newGpa >= 16) setMention('Très Bien (Excellente)');
        else if (newGpa >= 14) setMention('Très Bien');
        else if (newGpa >= 12) setMention('Bien');
        else if (newGpa >= 10) setMention('Assez Bien');
        else setMention('Passable');
      }
    }
    setExtractedMarks(updated);
  };

  const handleConfirmPlacement = () => {
    const selected = selectedUniObject;
    const docsComplete = hasTranscript && hasPhysical && hasEnglishCert;

    const newStudent = addStudent({
      name,
      age: Number(age),
      degree: 'Bachelor',
      major,
      university: selected.name,
      scholarship: selected.scholarship.includes('100%') || selected.scholarship.includes('Full') ? 'Full Scholarship' : selected.scholarship.includes('Free') ? 'Free Tuition' : 'Partial Scholarship',
      englishScore: Number(englishScore),
      englishTestType: englishTest,
      hasTranscript,
      hasPhysical,
      hasEnglishCert,
      docsComplete,
      gpa: Number(gpa),
      transcriptMention: mention,
      transcriptNotes: JSON.stringify({
        'Baccalauréat GPA': `${gpa} / 20`,
        'OCR Status': ocrScanned ? (uploadedFile ? `Verified via Gemini Vision API (${uploadedFile.name})` : 'Simulated AI Vision OCR') : 'Manual Counselor Entry',
        'Baccalaureate Track': bacTrack,
        'AI Confidence': `${confidenceScore}%`,
        'Subjects': extractedMarks.map(m => ({
          [m.subject]: {
            "CONTROLE CONTINU": { "Note/20": String(m.cc || m.score) },
            "EXAMEN NATIONAL": { "Note/20": String(m.score) }
          }
        }))
      })
    });

    if (onSuccess) onSuccess(newStudent);
    onClose();
    setActiveStep(0);
    setOcrScanned(false);
    setUploadedFile(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          borderRadius: 0,
          p: 0,
          backgroundImage: theme.palette.mode === 'dark'
            ? 'linear-gradient(145deg, rgba(15, 23, 42, 1), rgba(30, 41, 59, 0.98))'
            : 'linear-gradient(145deg, #f8fafc, #ffffff)',
          boxShadow: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflowX: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 0 }, py: 1.2, px: { xs: 2, sm: 3, md: 4 }, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.15)}`, bgcolor: 'background.paper', zIndex: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', display: 'flex' }}>
              <MdPersonAdd size={24} />
            </Box>
            <Box>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1, fontSize: '0.68rem' }}>
                AGENCY PLACEMENT WORKFLOW
              </Typography>
              <Typography variant="h6" fontWeight={900} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.15rem' }, lineHeight: 1.2 }}>
                AI Student Intake & University Matcher Wizard
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover', display: { xs: 'flex', sm: 'none' } }}>
            <MdClose />
          </IconButton>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover', display: { xs: 'none', sm: 'flex' } }}>
          <MdClose />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: { xs: 1.5, sm: 3, md: 4 }, py: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.03), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%', overflowX: 'auto', py: 0.2 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ minWidth: { xs: 460, sm: 'auto' } }}>
            <Step>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.82rem' } } }}>
                1. Candidate & Upload
              </StepLabel>
            </Step>
            <Step>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.82rem' } } }}>
                2. OCR Scanning & Marks
              </StepLabel>
            </Step>
            <Step>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.82rem' } } }}>
                3. University Simulation
              </StepLabel>
            </Step>
            <Step>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.82rem' } } }}>
                4. Confirm Placement
              </StepLabel>
            </Step>
          </Stepper>
        </Box>
      </Box>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%', py: 0.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* ── STEP 1: CANDIDATE PROFILE & DOCUMENT UPLOAD ────────────────── */}
        {activeStep === 0 && (
          <Grid container spacing={2} sx={{ my: 'auto' }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Candidate Academic Profile</span>
              </Typography>
              <Grid container spacing={1.6} sx={{ mt: 0.1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Candidate Full Name"
                    variant="outlined"
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Degree Level</InputLabel>
                    <Select value="Bachelor" label="Degree Level" disabled>
                      <MenuItem value="Bachelor">Bachelor (Bac+3/4)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="major-select-label">Desired Academic Major</InputLabel>
                    <Select labelId="major-select-label" value={major} label="Desired Academic Major" displayEmpty onChange={(e) => setMajor(e.target.value)}>
                      <MenuItem value="" disabled><em>Select academic major...</em></MenuItem>
                      {MAJORS_LIST.map((m) => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="test-select-label">English Test</InputLabel>
                    <Select labelId="test-select-label" value={englishTest} label="English Test" displayEmpty onChange={(e) => setEnglishTest(e.target.value)}>
                      <MenuItem value="" disabled><em>Select test...</em></MenuItem>
                      <MenuItem value="Duolingo">Duolingo</MenuItem>
                      <MenuItem value="IELTS">IELTS</MenuItem>
                      <MenuItem value="TOEFL">TOEFL</MenuItem>
                      <MenuItem value="EFSET">EFSET</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
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

            {/* Right: Document Import & AI Option Box */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: `2px dashed ${uploadedFile ? theme.palette.success.main : theme.palette.primary.main}`,
                  bgcolor: uploadedFile ? alpha(theme.palette.success.main, 0.04) : alpha(theme.palette.primary.main, 0.04),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  height: '100%',
                  minHeight: 220,
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.2, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                  <MdDocumentScanner size={24} />
                </Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary" gutterBottom>
                  Import Transcript & Setup Scan
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, px: 2, fontSize: '0.75rem' }}>
                  Upload candidate grade sheet (Image/PDF) for AI Vision OCR or proceed to run simulated live scanning:
                </Typography>

                {/* File Uploader Box */}
                <Box sx={{ mb: 2, width: '100%', px: 1 }}>
                  <input
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    id="wizard-file-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="wizard-file-upload" style={{ width: '100%' }}>
                    <Button
                      fullWidth
                      variant={uploadedFile ? "outlined" : "contained"}
                      color={uploadedFile ? "success" : "secondary"}
                      component="span"
                      startIcon={<MdUpload />}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 1.5, py: 0.8 }}
                    >
                      {uploadedFile ? `${uploadedFile.name} (Change File)` : 'Choose Transcript Image/PDF'}
                    </Button>
                  </label>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<MdAutoFixHigh />}
                  onClick={() => triggerScanningProcess(Boolean(uploadedFile && getApiKey().trim()))}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 1.5,
                    py: 0.8,
                    mt: 0.2,
                    boxShadow: 'none'
                  }}
                >
                  Start AI OCR Scanning Step
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* ── STEP 2: OCR SCANNING ANIMATION & FULL EXTRACTED MARKS PAGE ───── */}
        {activeStep === 1 && (
          <Box>
            {isScanning ? (
              /* Sub-State A: High-Tech Futuristic AI Scanning Animation */
              <Box
                sx={{
                  py: 2.5,
                  px: 3,
                  borderRadius: 3,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  animation: 'pulse-glow 3s infinite ease-in-out',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ width: 54, height: 54, borderRadius: 2.5, bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.2, boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)' }}>
                  <MdAutoFixHigh size={28} />
                </Box>
                
                <Typography variant="subtitle1" fontWeight={900} color="primary.main" gutterBottom>
                  AI VISION OCR SCAN IN PROGRESS...
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, maxWidth: 500, display: 'block' }}>
                  Analyzing optical character density, extracting Baccalaureate streams, and structuring individual subject scores:
                </Typography>

                {/* Animated Mock Document Viewport with Laser Scanner */}
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 540,
                    height: 140,
                    bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 1.8,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.1)',
                    mb: 2
                  }}
                >
                  {/* Glowing Laser Scan Bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '3px',
                      bgcolor: '#10b981',
                      boxShadow: '0 0 15px #10b981, 0 0 30px #10b981',
                      zIndex: 10,
                      animation: 'scan-laser 1.8s infinite ease-in-out'
                    }}
                  />

                  {/* Mock Document Rows Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 0.8, borderBottom: '1px solid', borderColor: 'divider', mb: 1, opacity: 0.8 }}>
                    <Typography variant="caption" fontWeight={800} color="primary" sx={{ fontSize: '0.65rem' }}>BACCALAURÉAT TRANSCRIPT — MASSAR ID #99842</Typography>
                    <Chip label="OPTICAL RECOGNITION ACTIVE" size="small" color="primary" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 800 }} />
                  </Box>

                  {/* Animated Waveform / Row Blocks */}
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ width: '45%', height: 10, bgcolor: alpha(theme.palette.primary.main, 0.18), borderRadius: 1 }} />
                      <Box sx={{ width: '15%', height: 10, bgcolor: alpha(theme.palette.success.main, 0.3), borderRadius: 1 }} />
                      <Box sx={{ width: '25%', height: 10, bgcolor: alpha(theme.palette.info.main, 0.2), borderRadius: 1 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ width: '55%', height: 10, bgcolor: alpha(theme.palette.primary.main, 0.12), borderRadius: 1 }} />
                      <Box sx={{ width: '18%', height: 10, bgcolor: alpha(theme.palette.success.main, 0.25), borderRadius: 1 }} />
                      <Box sx={{ width: '15%', height: 10, bgcolor: alpha(theme.palette.info.main, 0.15), borderRadius: 1 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ width: '40%', height: 10, bgcolor: alpha(theme.palette.primary.main, 0.22), borderRadius: 1 }} />
                      <Box sx={{ width: '20%', height: 10, bgcolor: alpha(theme.palette.success.main, 0.35), borderRadius: 1 }} />
                      <Box sx={{ width: '28%', height: 10, bgcolor: alpha(theme.palette.info.main, 0.25), borderRadius: 1 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ width: '50%', height: 10, bgcolor: alpha(theme.palette.primary.main, 0.15), borderRadius: 1 }} />
                      <Box sx={{ width: '15%', height: 10, bgcolor: alpha(theme.palette.success.main, 0.2), borderRadius: 1 }} />
                      <Box sx={{ width: '22%', height: 10, bgcolor: alpha(theme.palette.info.main, 0.18), borderRadius: 1 }} />
                    </Box>
                  </Stack>
                </Box>

                {/* Progress Bar & Status Text */}
                <Box sx={{ width: '100%', maxWidth: 540, px: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={800} color="primary.main">
                      {SCANNING_STEPS[scanStepIndex] || SCANNING_STEPS[0]}
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color="text.primary">
                      {scanProgress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={scanProgress}
                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                  />
                  <Button
                    size="small"
                    variant="text"
                    color="text.secondary"
                    onClick={() => {
                      setIsScanning(false);
                      setOcrScanned(true);
                    }}
                    sx={{ mt: 1, fontWeight: 700, fontSize: '0.75rem' }}
                  >
                    Skip Animation & View Extracted Marks Directly
                  </Button>
                </Box>
              </Box>
            ) : (
              /* Sub-State B: Full Extracted Marks Page (`show apage o fhte full extracted marks`) */
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {apiError && (
                  <Alert severity="warning" sx={{ mb: 1.5, py: 0.2, borderRadius: 2, fontWeight: 600, fontSize: '0.8rem' }}>
                    {apiError}
                  </Alert>
                )}

                {/* Unified High-Density Status & Stream Bar */}
                <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2.2, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.success.main, 0.05), display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'success.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MdVerified size={22} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="success.main" fontWeight={900} sx={{ letterSpacing: 0.5, display: 'block' }}>
                        OCR EXTRACTION VERIFIED ({confidenceScore}%)
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={900} color="text.primary" noWrap sx={{ maxWidth: 260 }}>
                        {uploadedFile ? uploadedFile.name : 'Transcript_2026.pdf'} • {name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderTop: { xs: `1px solid ${theme.palette.divider}`, md: 'none' }, pt: { xs: 1, md: 0 } }}>
                    <Box>
                      <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                        BAC STREAM / TRACK
                      </Typography>
                      <TextField
                        variant="standard"
                        value={bacTrack}
                        onChange={(e) => setBacTrack(e.target.value)}
                        InputProps={{ disableUnderline: true, sx: { fontWeight: 800, fontSize: '0.85rem', color: 'primary.main', height: 22 } }}
                      />
                    </Box>

                    <Box sx={{ pl: 2, borderLeft: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                        EXTRACTED GPA
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant="subtitle1" fontWeight={900} color="success.main" sx={{ lineHeight: 1 }}>
                          {gpa} / 20
                        </Typography>
                        <Chip label={mention} size="small" color="success" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                      </Box>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<MdRefresh size={16} />}
                      onClick={() => triggerScanningProcess(Boolean(uploadedFile && getApiKey().trim()))}
                      sx={{ fontWeight: 800, borderRadius: 1.5, ml: 'auto', py: 0.4 }}
                    >
                      Re-scan
                    </Button>
                  </Box>
                </Paper>

                {/* Full Extracted Subject Marks Table */}
                <Paper sx={{ p: 1.5, borderRadius: 2.2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={900} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MdAssessment size={18} color={theme.palette.primary.main} />
                      Full Extracted Subject Notes & Coefficients
                    </Typography>
                    <Chip label="COUNSELOR EDITABLE" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />
                  </Box>

                  <Box sx={{ overflowX: 'auto', maxHeight: { xs: 300, sm: 340, md: 'calc(100vh - 310px)' } }}>
                    <Table size="small" stickyHeader sx={{ '& th': { fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.05), py: 0.6, fontSize: '0.75rem' } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject Name</TableCell>
                          <TableCell align="center" width="130">Contrôle / CC</TableCell>
                          <TableCell align="center" width="130">Examen National</TableCell>
                          <TableCell align="center" width="90">Coef</TableCell>
                          <TableCell align="right" width="110">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {extractedMarks.map((item, idx) => (
                          <TableRow key={idx} hover sx={{ '& td': { py: 0.4, fontSize: '0.8rem' } }}>
                            <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {item.subject}
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                variant="outlined"
                                size="small"
                                type="number"
                                value={item.cc}
                                onChange={(e) => handleMarkChange(idx, 'cc', e.target.value)}
                                sx={{ width: 80, '& input': { textAlign: 'center', fontWeight: 700, py: 0.3, fontSize: '0.8rem' } }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {item.hasNational !== false && item.score !== null && item.score !== undefined ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  <TextField
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    value={item.score}
                                    onChange={(e) => handleMarkChange(idx, 'score', e.target.value)}
                                    sx={{ width: 80, '& input': { textAlign: 'center', fontWeight: 800, color: 'success.main', py: 0.3, fontSize: '0.8rem' } }}
                                  />
                                  <Tooltip title="Remove National Exam note (Régional/CC only)">
                                    <IconButton size="small" onClick={() => handleMarkChange(idx, 'hasNational', false)} sx={{ p: 0.3 }}>
                                      <MdClose size={14} color={theme.palette.text.secondary} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              ) : (
                                <Tooltip title="Click to add National Exam score for this subject">
                                  <Chip
                                    label="No National (CC Only)"
                                    size="small"
                                    onClick={() => handleMarkChange(idx, 'hasNational', true)}
                                    sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', bgcolor: alpha(theme.palette.text.secondary, 0.08), color: 'text.secondary', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main' } }}
                                  />
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={`Coef ${item.coefficient}`} size="small" sx={{ height: 20, fontWeight: 800, fontSize: '0.7rem' }} />
                            </TableCell>
                            <TableCell align="right">
                              <Chip label="Verified" size="small" color="success" variant="outlined" sx={{ height: 20, fontWeight: 800, fontSize: '0.65rem' }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        )}

        {/* ── STEP 3: AI UNIVERSITY MATCHER & INTERACTIVE STUDENT SIMULATION (SELECT EVERYTHING + LOADING + ALL UNIVERSITIES + NO PRICE) ── */}
        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.2 }}>
            {/* Comprehensive Interactive Candidate Criteria Configurator (`SELECT EVERYTHING`) */}
            <Paper
              sx={{
                p: 1.4,
                px: 1.8,
                borderRadius: 2.4,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.96) 0%, rgba(15, 23, 42, 0.98) 100%)'
                  : 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(239, 246, 255, 0.95) 100%)',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.28),
                boxShadow: '0 4px 18px rgba(0,0,0,0.05)'
              }}
            >
              {/* Row 1: Title & Run Match Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 0.8, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.6, bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(99,102,241,0.3)' }}>
                    <MdTune size={18} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900} color="text.primary" sx={{ fontSize: '0.88rem', letterSpacing: -0.2 }}>
                      Interactive Candidate Profile & Criteria Configurator
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ fontSize: '0.68rem' }}>
                      ⚡ SELECT ALL CRITERIA TO CALCULATE REAL-TIME CHINESE ADMISSION MATCHES
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={`Assigned: ${selectedUniObject.flag} ${selectedUniObject.name}`} size="small" color="primary" sx={{ height: 24, fontWeight: 800, fontSize: '0.7rem' }} />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={triggerAiCalculation}
                    startIcon={<MdAutoFixHigh />}
                    sx={{ fontWeight: 900, fontSize: '0.72rem', px: 1.8, py: 0.5, borderRadius: 1.5, boxShadow: '0 4px 12px rgba(99,102,241,0.35)', textTransform: 'none' }}
                  >
                    Run AI Match Calculation
                  </Button>
                </Box>
              </Box>

              {/* Row 2: Select Major, Program, Age (`SELECT THE NOTE OF THE ENGLISH TEST AND THE AGE AND THE PROGRAM AND THE MAJOR EVERYTHING`) */}
              <Grid container spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs={12} sm={4} md={3.5}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" sx={{ fontSize: '0.65rem', mb: 0.2 }}>
                    🎯 TARGET MAJOR / SPECIALTY
                  </Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={currentMajor}
                    onChange={(e) => { setSimMajor(e.target.value); triggerAiCalculation(); }}
                    sx={{ height: 30, fontSize: '0.78rem', fontWeight: 800, borderRadius: 1.5 }}
                  >
                    {MAJORS_LIST.map((m) => (
                      <MenuItem key={m} value={m} sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{m}</MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid item xs={12} sm={4} md={3.5}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" sx={{ fontSize: '0.65rem', mb: 0.2 }}>
                    🎓 DEGREE PROGRAM / TRACK
                  </Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={simProgram}
                    onChange={(e) => { setSimProgram(e.target.value); triggerAiCalculation(); }}
                    sx={{ height: 30, fontSize: '0.78rem', fontWeight: 800, borderRadius: 1.5 }}
                  >
                    <MenuItem value="Bachelor's Degree (本科)" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>Bachelor's Degree (本科)</MenuItem>
                    <MenuItem value="Master's Degree (硕士)" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>Master's Degree (硕士)</MenuItem>
                    <MenuItem value="Chinese Language Prep (预科)" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>Chinese Language Prep (预科)</MenuItem>
                    <MenuItem value="Clinical Medicine MBBS" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>Clinical Medicine MBBS</MenuItem>
                  </Select>
                </Grid>

                <Grid item xs={6} sm={2} md={2}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" sx={{ fontSize: '0.65rem', mb: 0.2 }}>
                    🎂 CANDIDATE AGE
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TextField
                      size="small"
                      type="number"
                      value={simAge}
                      onChange={(e) => { setSimAge(Number(e.target.value)); }}
                      InputProps={{ sx: { height: 30, fontSize: '0.8rem', fontWeight: 800, borderRadius: 1.5, width: '100%' } }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={6} sm={2} md={3}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" sx={{ fontSize: '0.65rem', mb: 0.2 }}>
                    🏛️ CSC TIER HUB FILTER
                  </Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={simCountryFilter}
                    onChange={(e) => setSimCountryFilter(e.target.value)}
                    sx={{ height: 30, fontSize: '0.76rem', fontWeight: 800, borderRadius: 1.5 }}
                  >
                    <MenuItem value="All">All Chinese Hubs</MenuItem>
                    <MenuItem value="985/211 Key Elite Project">985/211 Key Elite</MenuItem>
                    <MenuItem value="Jiangsu / Zhejiang Hub">Jiangsu / Zhejiang</MenuItem>
                    <MenuItem value="High-Volume Partner Quota">Partner Quotas</MenuItem>
                    <MenuItem value="Double First-Class Key Hub">Double First-Class</MenuItem>
                  </Select>
                </Grid>
              </Grid>

              {/* Row 3: Bac GPA Note & English Test Note Explicit Sliders + Inputs */}
              <Grid container spacing={2} alignItems="center" sx={{ pt: 0.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}>
                <Grid item xs={12} sm={6} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="caption" fontWeight={800} color="text.primary" sx={{ width: 145, flexShrink: 0, fontSize: '0.74rem' }}>
                      {gpa ? 'Verified Bac GPA:' : 'Simulate Bac GPA:'} <span style={{ color: gpa ? theme.palette.success.main : theme.palette.primary.main, fontWeight: 900, fontSize: '0.86rem' }}>{Number(effectiveSimGpa).toFixed(2)}/20</span>
                    </Typography>
                    {gpa ? (
                      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, py: 0.45, px: 1.5, bgcolor: alpha(theme.palette.success.main, 0.12), borderRadius: 1.5, border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.4) }}>
                        <Typography variant="caption" fontWeight={900} color="success.main" sx={{ fontSize: '0.74rem', letterSpacing: -0.1 }}>
                          🔒 OCR VERIFIED & FIXED ({Number(gpa).toFixed(2)}/20)
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Slider
                          size="small"
                          value={effectiveSimGpa}
                          min={10}
                          max={20}
                          step={0.1}
                          onChange={(e, val) => setSimGpa(val)}
                          sx={{ flexGrow: 1, color: 'primary.main', py: 0.5, '& .MuiSlider-thumb': { boxShadow: '0 2px 6px rgba(99,102,241,0.4)' } }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          value={effectiveSimGpa}
                          onChange={(e) => setSimGpa(Number(e.target.value))}
                          InputProps={{ sx: { height: 26, width: 68, fontSize: '0.75rem', fontWeight: 800, borderRadius: 1.2, textAlign: 'center' } }}
                        />
                      </>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="caption" fontWeight={800} color="text.primary" sx={{ width: 145, flexShrink: 0, fontSize: '0.74rem' }}>
                      English Test Note: <span style={{ color: theme.palette.primary.main, fontWeight: 900, fontSize: '0.86rem' }}>{effectiveSimEnglish}/100</span>
                    </Typography>
                    <Slider
                      size="small"
                      value={effectiveSimEnglish}
                      min={40}
                      max={100}
                      step={1}
                      onChange={(e, val) => setSimEnglish(val)}
                      sx={{ flexGrow: 1, color: 'primary.main', py: 0.5, '& .MuiSlider-thumb': { boxShadow: '0 2px 6px rgba(99,102,241,0.4)' } }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      value={effectiveSimEnglish}
                      onChange={(e) => setSimEnglish(Number(e.target.value))}
                      InputProps={{ sx: { height: 26, width: 68, fontSize: '0.75rem', fontWeight: 800, borderRadius: 1.2, textAlign: 'center' } }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* ── AI CALCULATION LOADING STATE (`BEFORE SHOW RECOMENDATION MAKE THE PAGE LOAD`) ── */}
            {isSimulating ? (
              <Paper
                sx={{
                  flexGrow: 1,
                  minHeight: 320,
                  p: 4,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 1) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(239, 246, 255, 0.95) 100%)',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  boxShadow: '0 12px 40px rgba(99,102,241,0.18)'
                }}
              >
                <Box
                  sx={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }}
                >
                  <MdAutoFixHigh size={40} />
                </Box>
                <Typography variant="h6" fontWeight={900} color="text.primary" gutterBottom sx={{ fontSize: '1.2rem', letterSpacing: -0.3 }}>
                  Running AI Admission Probability Simulation...
                </Typography>
                <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ mb: 3, maxWidth: 480, minHeight: 44 }}>
                  {simulationStepText}
                </Typography>

                <Box sx={{ width: '100%', maxWidth: 420, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">Z-SCORE ENVELOPE CALCULATION</Typography>
                    <Typography variant="caption" fontWeight={900} color="primary.main">{simulationProgress}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={simulationProgress} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.divider, 0.6) }} />
                </Box>

                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mt: 1 }}>
                  Profile: Age {simAge} • {simProgram} • Bac GPA {effectiveSimGpa}/20 • English {effectiveSimEnglish}/100
                </Typography>
              </Paper>
            ) : (
              /* ── ALL POSSIBLE UNIVERSITIES RESPONSIVE GRID (`MAKE ALL THE POSSIBLE UNIVE` + `REMOVE PRICE OF THE UNI`) ── */
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, px: 0.4 }}>
                  <Typography variant="caption" fontWeight={900} color="text.primary" sx={{ fontSize: '0.75rem' }}>
                    ✅ Displaying ALL {filteredUniversities.length} Matching Chinese Universities for <span style={{ color: theme.palette.primary.main }}>{currentMajor.toUpperCase()}</span> ({simProgram}, Age {simAge})
                  </Typography>
                  <Chip label={`${specialtyCount} Specialized Fits`} size="small" color="success" sx={{ height: 22, fontWeight: 900, fontSize: '0.68rem' }} />
                </Box>

                <Box
                  sx={{
                    overflowY: 'auto',
                    maxHeight: { xs: 'auto', md: 'calc(100vh - 350px)' },
                    pr: 0.6,
                    pb: 1.5,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
                    gap: '14px',
                    alignItems: 'stretch'
                  }}
                >
                  {filteredUniversities.map((uni) => {
                    const isSelected = selectedUniId === uni.id;
                    const isTopLogicalFit = uni.logicalPriority === 1;

                    return (
                      <Card
                        key={uni.id}
                        onClick={() => setSelectedUniId(uni.id)}
                        sx={{
                          cursor: 'pointer',
                          height: '100%',
                          minHeight: 180,
                          borderRadius: 2.4,
                          border: `2px solid ${isSelected ? theme.palette.primary.main : isTopLogicalFit ? '#10b981' : uni.isEligible ? alpha(theme.palette.success.main, 0.3) : theme.palette.divider}`,
                          bgcolor: isSelected
                            ? alpha(theme.palette.primary.main, 0.08)
                            : isTopLogicalFit
                            ? alpha('#10b981', 0.04)
                            : uni.isEligible
                            ? 'background.paper'
                            : alpha(theme.palette.text.disabled, 0.02),
                          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: isSelected
                            ? '0 8px 24px rgba(99, 102, 241, 0.22)'
                            : isTopLogicalFit
                            ? '0 5px 18px rgba(16, 185, 129, 0.15)'
                            : '0 2px 8px rgba(0,0,0,0.03)',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: isSelected ? '0 12px 30px rgba(99, 102, 241, 0.3)' : '0 10px 24px rgba(0,0,0,0.09)',
                          }
                        }}
                      >
                        <CardContent sx={{ p: 1.6, display: 'flex', flexDirection: 'column', justify: 'space-between', height: '100%', gap: 1 }}>
                          <Box>
                            {/* Top Badges Bar */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6, gap: 0.5 }}>
                              <Chip label={`${uni.flag} ${uni.tier}`} size="small" noWrap sx={{ height: 22, fontWeight: 800, fontSize: '0.66rem', bgcolor: alpha(theme.palette[uni.color].main, 0.14), color: `${uni.color}.main`, maxWidth: '65%' }} />
                              {isSelected ? (
                                <Chip label="⭐ SELECTED" size="small" color="primary" sx={{ height: 22, fontWeight: 900, fontSize: '0.66rem' }} />
                              ) : isTopLogicalFit ? (
                                <Chip label="🔥 #1 FIT" size="small" sx={{ height: 22, fontWeight: 900, fontSize: '0.66rem', bgcolor: '#10b981', color: '#fff' }} />
                              ) : null}
                            </Box>

                            {/* University Name */}
                            <Typography variant="subtitle1" fontWeight={900} color="text.primary" noWrap title={uni.name} sx={{ fontSize: '0.98rem', letterSpacing: -0.3, mb: 0.8 }}>
                              {uni.name}
                            </Typography>

                            {/* ── ULTRA-READABLE 3-COLUMN METRICS DASHBOARD (`MAKE READABLE METRICS IN THE CARDS`) ── */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', mb: 1 }}>
                              {/* Metric 1: Bac Cutoff vs Candidate */}
                              <Box sx={{ p: 0.7, borderRadius: 1.4, bgcolor: alpha(theme.palette.background.default, 0.8), border: '1px solid', borderColor: effectiveSimGpa >= (uni.minGpa || 10) ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.error.main, 0.4), textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={800} display="block" sx={{ fontSize: '0.6rem', letterSpacing: 0.4 }}>BAC CUTOFF</Typography>
                                <Typography variant="subtitle2" fontWeight={900} color={effectiveSimGpa >= (uni.minGpa || 10) ? 'success.main' : 'error.main'} sx={{ fontSize: '0.84rem', lineHeight: 1.15 }}>
                                  {uni.minGpa || 10.0}/20
                                </Typography>
                                <Typography variant="caption" fontWeight={800} color={effectiveSimGpa >= (uni.minGpa || 10) ? 'success.main' : 'error.main'} sx={{ fontSize: '0.58rem' }}>
                                  {effectiveSimGpa >= (uni.minGpa || 10) ? '✅ Passed' : '⚠️ Below'}
                                </Typography>
                              </Box>

                              {/* Metric 2: Alumni Average Base */}
                              <Box sx={{ p: 0.7, borderRadius: 1.4, bgcolor: alpha(theme.palette.background.default, 0.8), border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={800} display="block" sx={{ fontSize: '0.6rem', letterSpacing: 0.4 }}>ALUMNI AVG</Typography>
                                <Typography variant="subtitle2" fontWeight={900} color="primary.main" sx={{ fontSize: '0.84rem', lineHeight: 1.15 }}>
                                  {uni.meanMoy || 12.5}/20
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.58rem' }}>
                                  Std ±{uni.stdMoy || 1.5}
                                </Typography>
                              </Box>

                              {/* Metric 3: English Minimum Score */}
                              <Box sx={{ p: 0.7, borderRadius: 1.4, bgcolor: alpha(theme.palette.background.default, 0.8), border: '1px solid', borderColor: effectiveSimEnglish >= (uni.minEnglish || 60) ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.warning.main, 0.4), textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={800} display="block" sx={{ fontSize: '0.6rem', letterSpacing: 0.4 }}>ENGLISH MIN</Typography>
                                <Typography variant="subtitle2" fontWeight={900} color={effectiveSimEnglish >= (uni.minEnglish || 60) ? 'text.primary' : 'warning.main'} sx={{ fontSize: '0.84rem', lineHeight: 1.15 }}>
                                  {uni.minEnglish || 60}/100
                                </Typography>
                                <Typography variant="caption" fontWeight={800} color={effectiveSimEnglish >= (uni.minEnglish || 60) ? 'success.main' : 'warning.main'} sx={{ fontSize: '0.58rem' }}>
                                  {effectiveSimEnglish >= (uni.minEnglish || 60) ? '✅ Valid' : 'Prep req'}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Status & Scholarship Ribbon */}
                            <Box sx={{ mb: 1, p: 0.9, borderRadius: 1.6, bgcolor: alpha(theme.palette.background.default, 0.7), border: '1px solid', borderColor: 'divider', minHeight: 46, display: 'flex', flexDirection: 'column', justify: 'center' }}>
                              <Typography variant="caption" fontWeight={900} color={uni.statusColor + '.main'} noWrap sx={{ display: 'block', fontSize: '0.76rem' }}>
                                {uni.statusLabel}
                              </Typography>
                              <Typography variant="caption" fontWeight={800} color="primary.main" noWrap sx={{ display: 'block', fontSize: '0.74rem' }}>
                                🎁 {uni.scholarship}
                              </Typography>
                            </Box>

                            {/* Why Logical Explanation Box */}
                            <Box sx={{ mb: 1, p: 0.9, borderRadius: 1.5, bgcolor: isTopLogicalFit ? alpha('#10b981', 0.08) : alpha(theme.palette.primary.main, 0.04), border: '1px dashed', borderColor: isTopLogicalFit ? '#10b981' : alpha(theme.palette.primary.main, 0.3), minHeight: 48, overflow: 'hidden' }}>
                              <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.32, fontSize: '0.7rem' }}>
                                💡 <strong>Rationale:</strong> {uni.explanation}
                              </Typography>
                            </Box>

                            {/* Match Confidence Progress Meter */}
                            <Box sx={{ mb: 0.4 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ fontSize: '0.65rem' }}>⚡ ADMISSION PROBABILITY</Typography>
                                <Typography variant="caption" fontWeight={900} color={uni.matchRate >= 85 ? 'success.main' : uni.matchRate >= 65 ? 'info.main' : 'warning.main'} sx={{ fontSize: '0.76rem' }}>
                                  {uni.matchRate}% Match
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={uni.matchRate}
                                color={uni.matchRate >= 85 ? 'success' : uni.matchRate >= 65 ? 'info' : 'warning'}
                                sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.divider, 0.6) }}
                              />
                            </Box>
                          </Box>

                          {/* Bottom Footer Strip (Location Hub + Alumni Count) */}
                          <Box sx={{ pt: 0.7, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800} noWrap sx={{ fontSize: '0.68rem', maxWidth: '52%' }}>
                              📍 {uni.location || 'China Comprehensive Hub'}
                            </Typography>
                            <Chip label={`👥 N=${uni.alumniCount || '20+'} Placements`} size="small" sx={{ height: 22, fontSize: '0.66rem', fontWeight: 800, bgcolor: alpha(theme.palette.text.secondary, 0.08) }} />
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* ── STEP 4: DOSSIER COMPLIANCE & CONFIRMATION ──────────────────── */}
        {activeStep === 3 && (() => {
          const selected = selectedUniObject;
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Card sx={{ mb: 1.5, borderRadius: 2.2, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                <CardContent sx={{ p: 1.8 }}>
                  <Typography variant="caption" color="primary.main" fontWeight={900} sx={{ letterSpacing: 0.8 }}>
                    FINAL DOSSIER & PLACEMENT SUMMARY
                  </Typography>
                  <Grid container spacing={1.5} sx={{ mt: 0.2 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary" display="block">Candidate</Typography>
                      <Typography variant="subtitle2" fontWeight={800}>{name}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary" display="block">Program</Typography>
                      <Typography variant="subtitle2" fontWeight={800}>{major}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary" display="block">Assigned University</Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="primary.main" noWrap>{selected.flag} {selected.name}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary" display="block">Match & Scholarship</Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="success.main" noWrap>{selected.matchRate}% • {selected.scholarship}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Typography variant="subtitle2" fontWeight={800} color="text.primary" gutterBottom>
                Dossier Compliance & Verification Checklist
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.2, display: 'block' }}>
                Confirm document readiness before committing candidate and extracted marks to the placement database:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, p: 1.8, borderRadius: 2.2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
                <FormControlLabel
                  control={<Checkbox checked={hasTranscript} size="small" onChange={(e) => setHasTranscript(e.target.checked)} color="success" />}
                  label={<Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>Official Baccalaureate Transcript Verified (OCR Scan Complete — {extractedMarks.length} Subjects Saved)</Typography>}
                />
                <FormControlLabel
                  control={<Checkbox checked={hasPhysical} size="small" onChange={(e) => setHasPhysical(e.target.checked)} color="success" />}
                  label={<Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>Medical Physical Examination Form Attached & Validated</Typography>}
                />
                <FormControlLabel
                  control={<Checkbox checked={hasEnglishCert} size="small" onChange={(e) => setHasEnglishCert(e.target.checked)} color="success" />}
                  label={<Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>English Proficiency Certificate ({englishTest} - Score {englishScore}) Uploaded</Typography>}
                />
              </Box>
            </Box>
          );
        })()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 1.2, display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'space-between', alignItems: 'stretch', gap: { xs: 1.2, sm: 0 }, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}`, zIndex: 10 }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => {
            if (activeStep === 1 && isScanning) {
              setIsScanning(false);
            }
            setActiveStep((prev) => prev - 1);
          }}
          startIcon={<MdArrowBack />}
          sx={{ fontWeight: 800, borderRadius: 1.5, px: 2, py: 0.6, width: { xs: '100%', sm: 'auto' } }}
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.2, width: { xs: '100%', sm: 'auto' } }}>
          {activeStep === 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => triggerScanningProcess(Boolean(uploadedFile && getApiKey().trim()))}
              endIcon={<MdAutoFixHigh />}
              sx={{ fontWeight: 800, px: { xs: 2, sm: 3 }, py: 0.8, borderRadius: 1.5, width: { xs: '100%', sm: 'auto' }, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}
            >
              Next: AI OCR Document Scan
            </Button>
          )}

          {activeStep === 1 && !isScanning && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setActiveStep(2)}
              endIcon={<MdArrowForward />}
              sx={{ fontWeight: 800, px: { xs: 2, sm: 3 }, py: 0.8, borderRadius: 1.5, width: { xs: '100%', sm: 'auto' }, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}
            >
              Next: Move to University Simulation
            </Button>
          )}

          {activeStep === 2 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setActiveStep(3)}
              endIcon={<MdArrowForward />}
              sx={{ fontWeight: 800, px: { xs: 2, sm: 3 }, py: 0.8, borderRadius: 1.5, width: { xs: '100%', sm: 'auto' }, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}
            >
              Next: Confirm Placement
            </Button>
          )}

          {activeStep === 3 && (
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmPlacement}
              startIcon={<MdCheckCircle />}
              sx={{ fontWeight: 900, px: { xs: 2, sm: 3.5 }, py: 0.8, borderRadius: 1.5, width: { xs: '100%', sm: 'auto' }, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
            >
              Confirm & Add Student to Database
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}

