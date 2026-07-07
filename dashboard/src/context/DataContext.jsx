import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { transformStudent } from '../utils/dataUtils';

const DataCtx = createContext();
export const useData = () => useContext(DataCtx);

const DEFAULT_FILTERS = {
  search: '',
  university: '',
  degree: '',
  major: '',
  scholarship: '',
  englishTest: '',
  docStatus: '',   // 'complete' | 'incomplete' | ''
};

export function DataProvider({ children }) {
  const [rawStudents, setRawStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // ── Load CSVs (younes.csv + younes2.csv) ──────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const fetchCSV = (url) =>
      new Promise((resolve) => {
        Papa.parse(url, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data || []),
          error: (err) => {
            console.warn(`Error loading ${url}:`, err);
            resolve([]);
          },
        });
      });

    Promise.all([fetchCSV('/data/younes.csv'), fetchCSV('/data/younes2.csv')])
      .then(([data1, data2]) => {
        try {
          const rawCombined = [...data1, ...data2];
          const cleaned = rawCombined
            .map((raw, idx) => transformStudent(raw, idx))
            .filter((s) => {
              if (!s.name || s.name === 'Unknown') return false;
              // Enforce working ONLY with Bachelor students as requested
              const deg = String(s.degree || '').trim().toLowerCase();
              return deg.includes('bachelor') || deg === '' || deg === 'unknown';
            });
          let customStudents = [];
          try {
            const saved = localStorage.getItem('gw_custom_students');
            if (saved) customStudents = JSON.parse(saved);
          } catch (err) {
            console.warn('Error reading custom students from localStorage:', err);
          }
          setRawStudents([...customStudents, ...cleaned]);
          setLoading(false);
        } catch (e) {
          setError(e.message);
          setLoading(false);
        }
      });
  }, []);

  // ── Filtered students ─────────────────────────────────────────────────────
  const students = useMemo(() => {
    let arr = rawStudents;
    const { search, university, degree, major, scholarship, englishTest, docStatus } = filters;

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.university.toLowerCase().includes(q) ||
          s.major.toLowerCase().includes(q)
      );
    }
    if (university) arr = arr.filter((s) => s.university === university);
    if (degree) arr = arr.filter((s) => s.degree === degree);
    if (major) arr = arr.filter((s) => s.major === major);
    if (scholarship) arr = arr.filter((s) => s.scholarship === scholarship);
    if (englishTest) arr = arr.filter((s) => s.englishTestType === englishTest);
    if (docStatus === 'complete') arr = arr.filter((s) => s.docsComplete);
    if (docStatus === 'incomplete') arr = arr.filter((s) => !s.docsComplete);

    return arr;
  }, [rawStudents, filters]);

  // ── Unique filter values ──────────────────────────────────────────────────
  const filterOptions = useMemo(() => {
    const uniq = (key) => [...new Set(rawStudents.map((s) => s[key]).filter(Boolean))].sort();
    return {
      universities: uniq('university').filter((u) => u !== 'Unknown'),
      degrees: uniq('degree').filter((d) => d !== 'Unknown'),
      majors: uniq('major').filter((m) => m !== 'Unknown'),
      scholarships: uniq('scholarship').filter((sc) => sc !== 'Unknown'),
      englishTests: uniq('englishTestType'),
    };
  }, [rawStudents]);

  const updateFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // ── Add New Student without Backend (Client-Side Persistence) ────────────
  const addStudent = (newStudentData) => {
    const newStudent = {
      id: `custom_${Date.now()}`,
      name: newStudentData.name || 'New Candidate',
      age: Number(newStudentData.age) || 18,
      degree: newStudentData.degree || 'Bachelor',
      major: newStudentData.major || 'Computer Science',
      university: newStudentData.university || 'Zhejiang University',
      scholarship: newStudentData.scholarship || 'Full Scholarship',
      englishScore: Number(newStudentData.englishScore) || 75,
      englishTestType: newStudentData.englishTestType || 'Duolingo',
      hasTranscript: Boolean(newStudentData.hasTranscript ?? true),
      hasPhysical: Boolean(newStudentData.hasPhysical ?? true),
      hasEnglishCert: Boolean(newStudentData.hasEnglishCert ?? true),
      docsComplete: Boolean(newStudentData.docsComplete ?? true),
      transcriptMention: newStudentData.transcriptMention || 'Très Bien',
      transcriptNotes: newStudentData.transcriptNotes || {},
      ...newStudentData
    };

    setRawStudents((prev) => [newStudent, ...prev]);

    try {
      const existing = JSON.parse(localStorage.getItem('gw_custom_students') || '[]');
      localStorage.setItem('gw_custom_students', JSON.stringify([newStudent, ...existing]));
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }
    return newStudent;
  };

  return (
    <DataCtx.Provider
      value={{
        rawStudents,
        students,
        loading,
        error,
        filters,
        filterOptions,
        updateFilter,
        resetFilters,
        addStudent,
      }}
    >
      {children}
    </DataCtx.Provider>
  );
}
