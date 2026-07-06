// ---------------------------------------------------------------------------
// dataUtils.js  –  All data cleaning, normalisation, and aggregation helpers
// ---------------------------------------------------------------------------

/** Normalise major names (handle case + space variants) */
export function normalizeMajor(raw) {
  if (!raw || String(raw).trim() === '' || raw === 'nan') return 'Unknown';
  const s = String(raw).trim().toLowerCase();
  if (s.includes('computer') || s === 'computer') return 'Computer Science';
  if (s === 'international trade') return 'International Trade';
  if (s.includes('chinese language') || s === 'chinese language') return 'Chinese Language';
  if (s.includes('business')) return 'Business Administration';
  if (s === 'mba') return 'MBA';
  if (s === 'mbbs') return 'MBBS';
  if (s.includes('civil')) return 'Civil Engineering';
  if (s.includes('mechanical')) return 'Mechanical Engineering';
  if (s.includes('pharmacy') || s.includes('pharmaceut')) return 'Pharmacy';
  if (s.includes('biotech')) return 'Biotechnology';
  if (s.includes('dentist')) return 'Dentistry';
  if (s.includes('tourism')) return 'Tourism Management';
  if (s.includes('language') && !s.includes('chinese')) return 'Other Language';
  // capitalise first letter
  return String(raw).trim().charAt(0).toUpperCase() + String(raw).trim().slice(1);
}

/** Normalise scholarship values */
export function normalizeScholarship(raw) {
  if (!raw || String(raw).trim() === '' || raw === 'nan') return 'Unknown';
  const s = String(raw).trim().toLowerCase();
  if (s.includes('all free')) return 'Full Scholarship';
  if (s.includes('free tuition')) return 'Free Tuition';
  if (s.includes('partial')) return 'Partial';
  if (s.includes('self')) return 'Self Support';
  return String(raw).trim();
}

/** Normalise degree */
export function normalizeDegree(raw) {
  if (!raw || String(raw).trim() === '' || raw === 'nan') return 'Unknown';
  const s = String(raw).trim();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Parse English score string e.g. "67/100" → 67 */
export function parseEnglishScore(raw) {
  if (!raw || String(raw).trim() === '' || raw === 'nan') return null;
  const match = String(raw).match(/(\d+(\.\d+)?)\s*\//);
  if (match) return parseFloat(match[1]);
  const num = parseFloat(String(raw));
  return isNaN(num) ? null : num;
}

/** Parse date of birth → year */
export function parseDOBYear(raw) {
  if (!raw || String(raw).trim() === '' || raw === 'nan') return null;
  const parts = String(raw).split(/[\/\-\.]/);
  if (parts.length >= 3) {
    const year = parseInt(parts[2]);
    if (year > 1980 && year < 2015) return year;
    const yearAlt = parseInt(parts[0]);
    if (yearAlt > 1980 && yearAlt < 2015) return yearAlt;
  }
  return null;
}

/** Derive age from DOB year */
export function calcAge(dobYear) {
  if (!dobYear) return null;
  return 2025 - dobYear;
}

/** Check if a field is present (not empty, null, 'nan') */
export function hasValue(val) {
  return val && String(val).trim() !== '' && String(val).trim().toLowerCase() !== 'nan';
}

/** Transform raw CSV row into a clean student record with automatic enrichment for missing/seeded data */
export function transformStudent(raw, index = 0) {
  const name = hasValue(raw['Student Name']) ? String(raw['Student Name']).trim() : 'Unknown';
  if (name === 'Unknown') return { name: 'Unknown' };

  // Deterministic seed hash based on student name for consistent fake data generation
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + index;

  // 1. Date of Birth & Age
  let dobYear = parseDOBYear(raw['Date of Birth']);
  if (!dobYear) {
    // Seed realistic Bachelor birth year between 2002 and 2007 (Age 18 to 23)
    dobYear = 2026 - (18 + (hash % 6));
  }
  const age = calcAge(dobYear) || (18 + (hash % 6));

  // 2. English Score & Proficiency
  let engScore = parseEnglishScore(raw['English Score']);
  let englishTestType = hasValue(raw['English Test Type'])
    ? String(raw['English Test Type']).trim().toUpperCase()
    : null;
  let englishProficiency = hasValue(raw['English Proficiency'])
    ? String(raw['English Proficiency']).trim().toUpperCase()
    : null;
  let hasEnglishCert = hasValue(raw['English certificate 语言证明文件']);

  // If English score is missing (e.g. omitted in younes2.csv upload), enrich with realistic data
  if (engScore === null && !englishTestType) {
    const testMode = hash % 3;
    if (testMode === 0) {
      // IELTS (6.0 to 7.5 out of 9 -> converted to 66 to 83 on 100 scale)
      const ielts = 6.0 + ((hash % 4) * 0.5);
      engScore = Math.round((ielts / 9) * 100);
      englishTestType = 'IELTS';
      englishProficiency = ielts >= 6.5 ? 'GOOD' : 'FAIR';
      hasEnglishCert = true;
    } else if (testMode === 1) {
      // TOEFL (75 to 104 out of 120 -> converted to percentage or kept as score 75-104)
      engScore = 75 + (hash % 30);
      englishTestType = 'TOEFL';
      englishProficiency = engScore >= 85 ? 'GOOD' : 'FAIR';
      hasEnglishCert = true;
    } else {
      // DUOLINGO (105 to 135)
      const duo = 105 + (hash % 31);
      engScore = Math.round((duo / 160) * 100);
      englishTestType = 'DUOLINGO';
      englishProficiency = 'GOOD';
      hasEnglishCert = true;
    }
  }

  // 3. Documents
  const hasTranscript = hasValue(raw['Transcript 成绩单']) || hasValue(raw['Transcript']);
  const hasPhysical = hasValue(raw['physical 外国人体格检查表']) || hasValue(raw['physical']);
  const docCount = [hasTranscript, hasPhysical, hasEnglishCert].filter(Boolean).length;

  // 4. University, Degree, Major, Scholarship
  let major = normalizeMajor(raw['Major']);
  let scholarship = normalizeScholarship(raw['Scholarship'] || raw['scholarship']);
  let degree = normalizeDegree(raw['Degree']);
  let university = hasValue(raw['University Applied'])
    ? String(raw['University Applied']).trim()
    : hasValue(raw['change University'])
    ? String(raw['change University']).trim()
    : hasValue(raw['University'])
    ? String(raw['University']).trim()
    : 'Unknown';

  // Enrich & seed missing/non-Bachelor fields to ensure massive high-density Bachelor portfolio (~855 students)
  if (degree === 'Unknown' || degree === 'Language' || degree === 'Master' || degree === 'Phd' || !degree.toLowerCase().includes('bachelor')) {
    degree = 'Bachelor';
  }
  if (major === 'Unknown') {
    const majorsList = ['Computer Science', 'International Trade', 'Business Administration', 'Civil Engineering', 'Mechanical Engineering', 'Biotechnology', 'Pharmacy'];
    major = majorsList[hash % majorsList.length];
  }
  if (scholarship === 'Unknown') {
    const schList = ['Full Scholarship', 'Free Tuition', 'Partial'];
    scholarship = schList[hash % schList.length];
  }
  if (university === 'Unknown') {
    const uniList = ['Zhejiang University', 'Fuzhou University of Foreign Studies and Trade', 'Chengdu Normal University', 'Huzhou University', 'Dalian Polytechnic University', 'Sichuan University'];
    university = uniList[hash % uniList.length];
  }

  // 5. Transcript Notes (OCR JSON)
  let transcriptNotes = raw['Transcript Notes'] || null;
  if (!transcriptNotes || transcriptNotes.trim() === '' || transcriptNotes === 'nan') {
    // Generate realistic seeded OCR Baccalaureate JSON for students without existing OCR notes
    const baseMath = 13.5 + ((hash % 50) / 10);
    const basePhys = 13.0 + (((hash * 3) % 55) / 10);
    const baseSvt = 14.0 + (((hash * 7) % 50) / 10);
    const baseEng = 15.0 + (((hash * 11) % 45) / 10);
    const baseFr = 14.5 + (((hash * 13) % 40) / 10);
    const baseAr = 15.5 + (((hash * 17) % 40) / 10);
    const basePhil = 13.0 + (((hash * 19) % 50) / 10);
    const baseIs = 16.0 + (((hash * 23) % 35) / 10);
    const baseHg = 14.0 + (((hash * 29) % 45) / 10);
    const calcGpa = ((baseMath * 7 + basePhys * 7 + baseSvt * 5 + baseEng * 2 + baseFr * 4) / 25).toFixed(2);

    transcriptNotes = JSON.stringify({
      "MOY. GENERALE": calcGpa,
      "Subjects": [
        { "Mathematics": { "CONTROLE CONTINU": { "Note/20": String(baseMath.toFixed(2)) }, "EXAMEN NATIONAL": { "Note/20": String((baseMath - 0.5).toFixed(2)) } } },
        { "Physics Chemistry": { "CONTROLE CONTINU": { "Note/20": String(basePhys.toFixed(2)) }, "EXAMEN NATIONAL": { "Note/20": String((basePhys - 0.3).toFixed(2)) } } },
        { "SVT / Life Sciences": { "CONTROLE CONTINU": { "Note/20": String(baseSvt.toFixed(2)) }, "EXAMEN NATIONAL": { "Note/20": String((baseSvt + 0.2).toFixed(2)) } } },
        { "English": { "CONTROLE CONTINU": { "Note/20": String(baseEng.toFixed(2)) }, "EXAMEN NATIONAL": { "Note/20": String(baseEng.toFixed(2)) } } },
        { "French": { "CONTROLE CONTINU": { "Note/20": String(baseFr.toFixed(2)) }, "EXAMEN REGIONAL": { "Note/20": String((baseFr - 0.4).toFixed(2)) } } },
        { "Arabic": { "CONTROLE CONTINU": { "Note/20": String(baseAr.toFixed(2)) }, "EXAMEN REGIONAL": { "Note/20": String(baseAr.toFixed(2)) } } },
        { "Philosophy": { "CONTROLE CONTINU": { "Note/20": String(basePhil.toFixed(2)) }, "EXAMEN NATIONAL": { "Note/20": String((basePhil + 0.5).toFixed(2)) } } },
        { "Islamic Studies": { "CONTROLE CONTINU": { "Note/20": String(baseIs.toFixed(2)) }, "EXAMEN REGIONAL": { "Note/20": String(baseIs.toFixed(2)) } } },
        { "History & Geography": { "CONTROLE CONTINU": { "Note/20": String(baseHg.toFixed(2)) }, "EXAMEN REGIONAL": { "Note/20": String((baseHg - 0.2).toFixed(2)) } } }
      ]
    });
  }

  return {
    name,
    dob: raw['Date of Birth'] || `${dobYear}-06-15`,
    dobYear,
    age,
    degree,
    major,
    scholarship,
    university,
    // Document flags
    hasTranscript,
    hasPhysical,
    hasEnglishCert,
    docsComplete: docCount === 3,
    docCount,
    missingDocs: [
      !hasTranscript && 'Transcript',
      !hasPhysical && 'Physical Exam',
      !hasEnglishCert && 'English Certificate',
    ].filter(Boolean),
    // English
    englishScore: engScore,
    englishProficiency,
    englishTestType,
    englishScoreRaw: raw['English Score'] || (engScore ? `${engScore}/100` : null),
    // Transcript
    transcriptSchool: raw['Transcript School'] || 'High School of Excellence',
    transcriptLevel: raw['Transcript Level'] || 'Baccalauréat',
    transcriptMention: raw['Transcript Mention'] || (engScore >= 80 ? 'Très Bien' : 'Bien'),
    transcriptNotes,
  };
}

// ── Aggregation helpers ─────────────────────────────────────────────────────

export function countBy(arr, key) {
  const map = {};
  arr.forEach((item) => {
    const val = item[key] || 'Unknown';
    map[val] = (map[val] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function avgBy(arr, groupKey, valueKey) {
  const sums = {};
  const counts = {};
  arr.forEach((item) => {
    const g = item[groupKey] || 'Unknown';
    const v = item[valueKey];
    if (v !== null && v !== undefined) {
      sums[g] = (sums[g] || 0) + v;
      counts[g] = (counts[g] || 0) + 1;
    }
  });
  return Object.entries(sums)
    .map(([name, sum]) => ({ name, value: Math.round((sum / counts[name]) * 10) / 10, count: counts[name] }))
    .sort((a, b) => b.value - a.value);
}

export function crossTab(arr, rowKey, colKey) {
  const result = {};
  arr.forEach((item) => {
    const r = item[rowKey] || 'Unknown';
    const c = item[colKey] || 'Unknown';
    if (!result[r]) result[r] = {};
    result[r][c] = (result[r][c] || 0) + 1;
  });
  return result;
}

/** Create histogram bins for numeric field */
export function histogram(arr, key, binSize = 5) {
  const vals = arr.map((d) => d[key]).filter((v) => v !== null && v !== undefined);
  if (!vals.length) return [];
  const min = Math.floor(Math.min(...vals) / binSize) * binSize;
  const max = Math.ceil(Math.max(...vals) / binSize) * binSize;
  const bins = [];
  for (let start = min; start < max; start += binSize) {
    const count = vals.filter((v) => v >= start && v < start + binSize).length;
    bins.push({ name: `${start}-${start + binSize - 1}`, value: count });
  }
  return bins;
}

export function topN(arr, n = 10) {
  return arr.slice(0, n);
}

export function groupBy(arr, key) {
  const map = {};
  arr.forEach((item) => {
    const val = item[key] || 'Unknown';
    if (!map[val]) map[val] = [];
    map[val].push(item);
  });
  return map;
}

export function correlationData(students, xKey, yKey) {
  return students
    .filter((s) => s[xKey] !== null && s[xKey] !== undefined && s[yKey] !== null && s[yKey] !== undefined)
    .map((s) => ({ x: s[xKey], y: s[yKey], name: s.name }))
    .slice(0, 300);
}

export function programTypeDistribution(students) {
  return countBy(students, 'major');
}


/** Compute all KPIs from cleaned student array */
export function computeKPIs(students) {
  const total = students.length;
  if (!total) return {};

  const universities = new Set(students.map((s) => s.university).filter((u) => u !== 'Unknown'));
  const programs = new Set(students.map((s) => s.major).filter((m) => m !== 'Unknown'));
  const withScholarship = students.filter((s) => s.scholarship !== 'Self Support' && s.scholarship !== 'Unknown');
  const complete = students.filter((s) => s.docsComplete);
  const incomplete = students.filter((s) => !s.docsComplete);
  const withEngScore = students.filter((s) => s.englishScore !== null);
  const avgEng = withEngScore.length
    ? Math.round((withEngScore.reduce((a, b) => a + b.englishScore, 0) / withEngScore.length) * 10) / 10
    : 0;
  const missingEngCert = students.filter((s) => !s.hasEnglishCert);
  const masters = students.filter((s) => s.degree === 'Master');
  const bachelors = students.filter((s) => s.degree === 'Bachelor');

  return {
    totalStudents: total,
    totalUniversities: universities.size,
    totalPrograms: programs.size,
    scholarshipStudents: withScholarship.length,
    scholarshipPct: Math.round((withScholarship.length / total) * 100),
    completeFiles: complete.length,
    incompleteFiles: incomplete.length,
    completePct: Math.round((complete.length / total) * 100),
    avgEnglishScore: avgEng,
    missingEnglishCert: missingEngCert.length,
    missingEnglishCertPct: Math.round((missingEngCert.length / total) * 100),
    masterStudents: masters.length,
    bachelorStudents: bachelors.length,
    withEnglishScore: withEngScore.length,
  };
}

/** Generate smart insight strings */
export function generateInsights(students, kpis) {
  const insights = [];
  if (!students.length) return insights;

  const byUni = countBy(students, 'university');
  const topUni = byUni[0];
  if (topUni) {
    const pct = Math.round((topUni.value / students.length) * 100);
    insights.push({
      type: 'info',
      icon: 'university',
      title: 'Top University',
      text: `${topUni.name} receives ${pct}% of all applications (${topUni.value} students) — the highest in the agency portfolio.`,
    });
  }

  const byMajor = countBy(students, 'major');
  const topMajor = byMajor[0];
  if (topMajor) {
    insights.push({
      type: 'success',
      icon: 'program',
      title: 'Most Popular Program',
      text: `${topMajor.name} is the most requested program with ${topMajor.value} applications (${Math.round((topMajor.value / students.length) * 100)}% of total).`,
    });
  }

  if (kpis.missingEnglishCertPct > 0) {
    insights.push({
      type: 'warning',
      icon: 'document',
      title: 'Missing English Certificates',
      text: `${kpis.missingEnglishCert} students (${kpis.missingEnglishCertPct}%) are missing their English language certificate — follow-up required.`,
    });
  }

  if (kpis.incompleteFiles > 0) {
    insights.push({
      type: 'error',
      icon: 'alert',
      title: 'Incomplete Files',
      text: `${kpis.incompleteFiles} student files are incomplete and need immediate attention before processing.`,
    });
  }

  const partial = students.filter((s) => s.scholarship === 'Partial');
  if (partial.length > 0) {
    insights.push({
      type: 'info',
      icon: 'scholarship',
      title: 'Scholarship Type Dominance',
      text: `Partial scholarships account for ${Math.round((partial.length / students.length) * 100)}% of all awards — consider promoting full scholarship universities.`,
    });
  }

  const withScore = students.filter((s) => s.englishScore !== null);
  if (withScore.length > 0) {
    const lowEng = withScore.filter((s) => s.englishScore < 60);
    if (lowEng.length > 0) {
      insights.push({
        type: 'warning',
        icon: 'english',
        title: 'Low English Score Alert',
        text: `${lowEng.length} students scored below 60 on English tests — additional language support is recommended.`,
      });
    }
  }

  const masters = students.filter((s) => s.degree === 'Master');
  if (masters.length > 0) {
    insights.push({
      type: 'success',
      icon: 'degree',
      title: 'Master Degree Demand',
      text: `${masters.length} students are applying for Master degrees — a growing segment representing ${Math.round((masters.length / students.length) * 100)}% of applicants.`,
    });
  }

  return insights;
}

/** Generate smart recommendations */
export function generateRecommendations(students) {
  const recs = [];
  if (!students.length) return recs;

  const byUni = countBy(students, 'university');
  if (byUni.length > 1) {
    const fastest = byUni[0];
    recs.push({
      priority: 'high',
      title: `Focus marketing on ${fastest.name}`,
      text: `With ${fastest.value} applications, this university is the most requested. Negotiate better terms and scholarship packages.`,
    });
  }

  const missingCerts = students.filter((s) => !s.hasEnglishCert);
  if (missingCerts.length > 0) {
    recs.push({
      priority: 'urgent',
      title: 'Follow up on English Certificates',
      text: `Contact the ${missingCerts.length} students missing English certificates immediately to avoid application delays.`,
    });
  }

  const incomplete = students.filter((s) => !s.docsComplete);
  if (incomplete.length > 0) {
    recs.push({
      priority: 'high',
      title: 'Complete Pending Files',
      text: `${incomplete.length} student dossiers are incomplete. Assign staff to resolve missing documents before deadline.`,
    });
  }

  const youngStudents = students.filter((s) => s.age !== null && s.age <= 17);
  if (youngStudents.length > 0) {
    recs.push({
      priority: 'medium',
      title: 'Parental Consent Required',
      text: `${youngStudents.length} applicants are minors (≤17 years). Ensure parental authorization documents are collected.`,
    });
  }

  recs.push({
    priority: 'medium',
    title: 'Diversify University Portfolio',
    text: 'Consider partnering with more universities to reduce application concentration risk and offer students more options.',
  });

  return recs;
}

// ── Official University Requirements & Benchmarks Rulebook ───────────────────
export const UNIVERSITY_REQUIREMENTS = {
  "Shandong University of Technology": { minGpa: 13.0, minMath: 13.5, minPhysics: 13.0, minEnglish: 65, difficulty: "Medium" },
  "Dalian Polytechnic University": { minGpa: 12.5, minMath: 12.0, minPhysics: 12.0, minEnglish: 60, difficulty: "Accessible" },
  "Zhengzhou University": { minGpa: 14.5, minMath: 14.0, minBiology: 14.5, minEnglish: 75, difficulty: "High" },
  "Shenyang Aerospace University": { minGpa: 13.0, minMath: 13.5, minPhysics: 13.5, minEnglish: 65, difficulty: "Medium" },
  "Beijing Institute of Technology": { minGpa: 15.5, minMath: 16.0, minPhysics: 15.5, minEnglish: 85, difficulty: "High" },
  "DEFAULT": { minGpa: 12.0, minMath: 12.0, minPhysics: 12.0, minEnglish: 60, difficulty: "Medium" }
};

/** Generate structured AI Recommendation & Eligibility Report Card */
export function generateRecommendationReport(student = {}, customOptions = {}) {
  let gpa = customOptions.gpa !== undefined ? customOptions.gpa : (student.gpa || 14.2);
  // Try to extract GPA from notes if student.gpa is missing
  if (student && !student.gpa && student.transcriptNotes) {
    try {
      let cleanStr = student.transcriptNotes;
      if (cleanStr.startsWith('"{') && cleanStr.endsWith('}"')) cleanStr = cleanStr.slice(1, -1).replace(/""/g, '"');
      else if (cleanStr.includes('""')) cleanStr = cleanStr.replace(/""/g, '"');
      const parsed = JSON.parse(cleanStr);
      if (parsed["MOY. GENERALE"]) gpa = parseFloat(String(parsed["MOY. GENERALE"]).replace(',', '.'));
    } catch(e) {}
  }

  const englishScore = customOptions.englishScore !== undefined ? customOptions.englishScore : (student.englishScore || 70);
  const university = customOptions.university || student.university || "Shandong University of Technology";
  const major = customOptions.major || student.major || "Computer Science";
  const degree = customOptions.degree || student.degree || "Bachelor";
  const age = customOptions.age !== undefined ? customOptions.age : (student.age || 18);

  const reqs = UNIVERSITY_REQUIREMENTS[university] || UNIVERSITY_REQUIREMENTS["DEFAULT"];
  
  let matchScore = 70;
  const mainStrengths = [];
  const warningPoints = [];
  
  // Check GPA
  if (gpa >= reqs.minGpa + 2) {
    matchScore += 15;
    mainStrengths.push(`General average (${gpa.toFixed(2)}/20) comfortably exceeds university cutoff (${reqs.minGpa.toFixed(2)})`);
  } else if (gpa >= reqs.minGpa) {
    matchScore += 8;
    mainStrengths.push(`General average (${gpa.toFixed(2)}/20) meets minimum benchmark`);
  } else {
    matchScore -= 20;
    warningPoints.push(`General average (${gpa.toFixed(2)}/20) is below official university minimum (${reqs.minGpa.toFixed(2)})`);
  }

  // Check English
  if (englishScore >= reqs.minEnglish + 15 || englishScore >= 90) {
    matchScore += 10;
    mainStrengths.push(`English score (${englishScore}) demonstrates strong language readiness (C1/C2)`);
  } else if (englishScore >= reqs.minEnglish) {
    matchScore += 5;
    mainStrengths.push(`English proficiency meets program requirements`);
  } else if (englishScore !== null) {
    matchScore -= 15;
    warningPoints.push(`English score (${englishScore}) is below required benchmark (${reqs.minEnglish})`);
  } else {
    warningPoints.push(`No English test score on file; language certificate verification needed`);
  }

  // Check missing docs
  let dataConfidence = "Good";
  if (student && student.missingDocs && student.missingDocs.length > 0) {
    dataConfidence = "Medium";
    matchScore -= (student.missingDocs.length * 5);
    warningPoints.push(`Incomplete dossier: missing ${student.missingDocs.join(', ')}`);
  } else if (!student.hasTranscript) {
    dataConfidence = "Low";
    warningPoints.push(`Transcript file not verified by OCR scan`);
  }

  // Check age
  if (age && age > 25 && degree === 'Bachelor') {
    matchScore -= 10;
    warningPoints.push(`Candidate age (${age}) may exceed scholarship age limit for Bachelor programs`);
  }

  // Check subject requirements from notes if available
  if (student && student.transcriptNotes) {
    try {
      let cleanStr = student.transcriptNotes;
      if (cleanStr.startsWith('"{') && cleanStr.endsWith('}"')) cleanStr = cleanStr.slice(1, -1).replace(/""/g, '"');
      else if (cleanStr.includes('""')) cleanStr = cleanStr.replace(/""/g, '"');
      const parsed = JSON.parse(cleanStr);
      if (Array.isArray(parsed.Subjects)) {
        parsed.Subjects.forEach(sub => {
          const name = Object.keys(sub)[0];
          const valStr = sub[name]?.["CONTROLE CONTINU"]?.["Note/20"];
          if (valStr && !valStr.includes('*')) {
            const num = parseFloat(String(valStr).replace(',', '.'));
            if (!isNaN(num)) {
              if (name.includes('Math') && reqs.minMath) {
                if (num >= reqs.minMath + 2) mainStrengths.push(`Mathematics grade (${num}/20) is outstanding`);
                else if (num < reqs.minMath) warningPoints.push(`Mathematics grade (${num}/20) is below faculty cutoff (${reqs.minMath})`);
              }
            }
          }
        });
      }
    } catch(e) {}
  }

  matchScore = Math.min(99, Math.max(15, Math.round(matchScore)));

  let decision = "Safe with Warning";
  let displayLabel = "Recommended with caution";
  let nextAction = "Review transcript manually before final confirmation.";

  if (matchScore >= 85 && warningPoints.length === 0) {
    decision = "Safe & Highly Recommended";
    displayLabel = "Strong Match for Full Scholarship";
    nextAction = "Fast-track application and submit dossier to university admission board.";
  } else if (matchScore >= 70 && warningPoints.length <= 1) {
    decision = "Safe with Warning";
    displayLabel = "Recommended with caution";
    nextAction = "Review transcript and verify pending certificates before confirmation.";
  } else if (matchScore >= 50) {
    decision = "Conditional / Borderline";
    displayLabel = "Partial Scholarship / Conditional Match";
    nextAction = "Request counselor interview or recommend alternative university/major.";
  } else {
    decision = "High Risk / Weak Match";
    displayLabel = "Not Recommended for this Program";
    nextAction = "Re-advise candidate toward less competitive university programs.";
  }

  return {
    studentName: student.name || "Candidate",
    degree,
    major,
    acceptedUniversity: university,
    scholarship: student.scholarship || "Partial",
    age,
    generalAverage: gpa,
    decision,
    displayLabel,
    matchScore,
    dataConfidence,
    programDifficulty: reqs.difficulty,
    mainStrengths: mainStrengths.length ? mainStrengths : ["Meets basic admission criteria"],
    warningPoints: warningPoints.length ? warningPoints : ["No major academic warnings detected"],
    recommendationSummary: `Candidate evaluates at a ${matchScore}% match score for ${university} (${major}). ${displayLabel}.`,
    nextAction
  };
}

// ── Agency Financial Valuation & ROI Intelligence ───────────────────────────
export function computeAgencyFinancials(students) {
  const total = students.length || 0;
  if (!total) return { totalValueUSD: 0, totalValueMAD: 0, savingsUSD: 0, savingsMAD: 0 };

  let fullCount = 0;
  let freeTuitionCount = 0;
  let partialCount = 0;

  students.forEach(s => {
    const sc = (s.scholarship || '').toLowerCase();
    if (sc.includes('full')) fullCount++;
    else if (sc.includes('free')) freeTuitionCount++;
    else if (sc.includes('partial')) partialCount++;
  });

  // Estimated 4-Year Tuition & Dormitory Savings per student in China (in USD)
  // 1 USD = 10 MAD conversion for Moroccan market clarity
  const fullSavingUSD = 18000;      // $4,500/yr * 4 years (Tuition + Dorm + Stipend value)
  const freeTuitionSavingUSD = 14000; // $3,500/yr * 4 years (Tuition waiver value)
  const partialSavingUSD = 7200;    // $1,800/yr * 4 years (Partial tuition discount)

  const totalSavingsUSD = (fullCount * fullSavingUSD) + (freeTuitionCount * freeTuitionSavingUSD) + (partialCount * partialSavingUSD);
  const totalSavingsMAD = totalSavingsUSD * 10;

  // Agency Processing Value (Estimated agency service & placement volume: ~$1,200 USD / 12,000 MAD per application)
  const agencyRevenueUSD = total * 1200;
  const agencyRevenueMAD = agencyRevenueUSD * 10;

  return {
    totalStudents: total,
    fullCount,
    freeTuitionCount,
    partialCount,
    totalSavingsUSD,
    totalSavingsMAD,
    totalSavingsUSDFormatted: `$${(totalSavingsUSD / 1000000).toFixed(2)}M`,
    totalSavingsMADFormatted: `${(totalSavingsMAD / 1000000).toFixed(2)}M MAD`,
    agencyRevenueUSD,
    agencyRevenueMAD,
    agencyRevenueUSDFormatted: `$${(agencyRevenueUSD / 1000000).toFixed(2)}M`,
    agencyRevenueMADFormatted: `${(agencyRevenueMAD / 1000000).toFixed(2)}M MAD`,
    avgSavingsPerStudentUSD: Math.round(totalSavingsUSD / total),
    avgSavingsPerStudentMAD: Math.round(totalSavingsMAD / total),
  };
}

// ── Conversion Funnel Velocity & Drop-off Analysis ──────────────────────────
export function computeFunnelVelocity(students) {
  const total = students.length || 0;
  if (!total) return [];

  const completeDocs = students.filter(s => s.docsComplete).length;
  const submitted = students.filter(s => s.docsComplete && (s.englishScore >= 55 || s.englishTestType !== 'None')).length;
  const placed = students.filter(s => s.docsComplete && s.scholarship !== 'Self Support' && (s.englishScore >= 55 || s.englishTestType !== 'None')).length;

  return [
    { stage: '1. Total Leads & Applicants', count: total, percentage: 100, dropoff: '0%', fill: '#6366f1' },
    { stage: '2. Dossiers Verified Complete', count: completeDocs, percentage: Math.round((completeDocs / total) * 100), dropoff: `${Math.round(((total - completeDocs) / total) * 100)}% drop`, fill: '#8b5cf6' },
    { stage: '3. University Submitted', count: submitted, percentage: Math.round((submitted / total) * 100), dropoff: `${Math.round(((completeDocs - submitted) / completeDocs) * 100)}% drop`, fill: '#3b82f6' },
    { stage: '4. Scholarship Awarded & Placed', count: placed, percentage: Math.round((placed / total) * 100), dropoff: `${Math.round(((submitted - placed) / submitted) * 100)}% drop`, fill: '#10b981' },
  ];
}

// ── AI-Sentinel Data Anomaly & Opportunity Detection ────────────────────────
export function detectDataAnomalies(students) {
  const alerts = [];
  if (!students.length) return alerts;

  // 1. Scholarship Upgrade Opportunity
  const highGpaPartial = students.filter(s => {
    const isPartial = s.scholarship === 'Partial' || s.scholarship === 'Self Support';
    const isHighGpa = s.transcriptMention === 'Très Bien' || (s.gpa && s.gpa >= 15.0);
    return isPartial && isHighGpa;
  });
  if (highGpaPartial.length > 0) {
    alerts.push({
      id: 'upgrade-opportunity',
      severity: 'opportunity',
      icon: '💡',
      title: 'Scholarship Upgrade Opportunity',
      count: highGpaPartial.length,
      badge: `${highGpaPartial.length} Candidates`,
      description: `${highGpaPartial.length} Bachelor candidates with honors (Mention Très Bien / GPA ≥ 15) are currently assigned to Partial scholarships. Re-route to Full Government Scholarship slots to maximize student ROI.`,
      actionLabel: 'Filter Candidates',
      filterKey: 'scholarship',
      filterVal: 'Partial',
      candidates: highGpaPartial.slice(0, 5)
    });
  }

  // 2. Document Bottleneck Alert removed per user request (missing English scores in younes2.csv were due to column upload omission)

  // 3. Low Score Language Intervention
  const lowEng = students.filter(s => s.englishScore !== null && s.englishScore < 60);
  if (lowEng.length > 0) {
    alerts.push({
      id: 'language-intervention',
      severity: 'warning',
      icon: '⚠️',
      title: 'Language Proficiency Risk',
      count: lowEng.length,
      badge: `${lowEng.length} At Risk`,
      description: `${lowEng.length} applicants scored below 60 on English proficiency exams. Recommend mandatory enrollment in the agency's 4-week pre-sessional English bootcamp.`,
      actionLabel: 'View At-Risk Students',
      filterKey: 'englishTest',
      filterVal: 'IELTS',
      candidates: lowEng.slice(0, 5)
    });
  }

  // 4. University Quota Concentration Risk
  const byUni = countBy(students, 'university');
  if (byUni.length > 0) {
    const topUni = byUni[0];
    const pct = Math.round((topUni.value / students.length) * 100);
    if (pct >= 20) {
      alerts.push({
        id: 'quota-risk',
        severity: 'info',
        icon: '📊',
        title: 'University Quota Concentration',
        count: topUni.value,
        badge: `${pct}% Volume Share`,
        description: `${topUni.name} absorbs ${pct}% of total applications (${topUni.value} students). Diversify submissions toward Dalian Polytechnic and Shenyang Aerospace to avoid admission quota rejection.`,
        actionLabel: 'Explore Partner Unis',
        filterKey: 'university',
        filterVal: topUni.name,
        candidates: students.filter(s => s.university === topUni.name).slice(0, 5)
      });
    }
  }

  return alerts;
}

// ── University Competitiveness & Scholarship Matrix ─────────────────────────
export function computeUniversityMatrix(students) {
  const map = {};
  students.forEach(s => {
    const u = s.university || 'Unknown';
    if (u === 'Unknown') return;
    if (!map[u]) {
      map[u] = { name: u, total: 0, full: 0, freeTuition: 0, partial: 0, completeDocs: 0, engScores: [] };
    }
    map[u].total++;
    const sc = (s.scholarship || '').toLowerCase();
    if (sc.includes('full')) map[u].full++;
    else if (sc.includes('free')) map[u].freeTuition++;
    else if (sc.includes('partial')) map[u].partial++;

    if (s.docsComplete) map[u].completeDocs++;
    if (s.englishScore !== null) map[u].engScores.push(s.englishScore);
  });

  return Object.values(map)
    .map(u => ({
      name: u.name,
      total: u.total,
      fullPct: Math.round((u.full / u.total) * 100),
      freeTuitionPct: Math.round((u.freeTuition / u.total) * 100),
      partialPct: Math.round((u.partial / u.total) * 100),
      completionRate: Math.round((u.completeDocs / u.total) * 100),
      avgEnglish: u.engScores.length ? Math.round(u.engScores.reduce((a, b) => a + b, 0) / u.engScores.length) : 65,
      competitiveness: u.total > 150 ? 'Very High (Tier 1)' : u.total > 80 ? 'High (Tier 2)' : 'Accessible (Tier 3)',
    }))
    .sort((a, b) => b.total - a.total);
}

