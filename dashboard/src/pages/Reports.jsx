import React, { useMemo } from 'react';
import { Grid, Card, CardContent, Box, Typography, Button } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import GlobalFilters from '../components/GlobalFilters';
import DataTable from '../components/DataTable';
import { useData } from '../context/DataContext';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { MdDownload, MdTableChart, MdPictureAsPdf } from 'react-icons/md';
import { computeKPIs } from '../utils/dataUtils';

const STUDENT_COLUMNS = [
  { key: 'name', label: 'Student Name' },
  { key: 'degree', label: 'Degree', chip: true },
  { key: 'major', label: 'Program' },
  { key: 'university', label: 'University' },
  { key: 'scholarship', label: 'Scholarship', chip: true },
  { key: 'englishScore', label: 'Eng. Score', score: true },
  { key: 'docsComplete', label: 'Complete', bool: true },
];

export default function Reports() {
  const { students } = useData();
  const kpis = useMemo(() => computeKPIs(students), [students]);

  const handleExcelFull = () => {
    const data = students.map((s) => ({
      'Student Name': s.name,
      Degree: s.degree,
      Program: s.major,
      University: s.university,
      Scholarship: s.scholarship,
      'English Score': s.englishScore ?? '',
      'English Test': s.englishTestType ?? '',
      'English Proficiency': s.englishProficiency ?? '',
      Age: s.age ?? '',
      'Birth Year': s.dobYear ?? '',
      'Has Transcript': s.hasTranscript ? 'Yes' : 'No',
      'Has Physical Exam': s.hasPhysical ? 'Yes' : 'No',
      'Has English Cert': s.hasEnglishCert ? 'Yes' : 'No',
      'File Complete': s.docsComplete ? 'Yes' : 'No',
      'Missing Docs': s.missingDocs.join('; '),
    }));
    exportToExcel(data, 'full_student_report.xlsx', 'Students');
  };

  const handlePDFKPI = () => {
    const data = [
      { metric: 'Total Students', value: kpis.totalStudents },
      { metric: 'Universities', value: kpis.totalUniversities },
      { metric: 'Programs', value: kpis.totalPrograms },
      { metric: 'Scholarship Students', value: kpis.scholarshipStudents },
      { metric: 'Scholarship Rate', value: `${kpis.scholarshipPct}%` },
      { metric: 'Complete Files', value: kpis.completeFiles },
      { metric: 'Incomplete Files', value: kpis.incompleteFiles },
      { metric: 'Avg. English Score', value: kpis.avgEnglishScore },
      { metric: 'Missing English Certs', value: kpis.missingEnglishCert },
    ];
    exportToPDF(
      data,
      [{ key: 'metric', label: 'KPI' }, { key: 'value', label: 'Value' }],
      'kpi_report.pdf',
      'Agency KPI Report'
    );
  };

  const handleIncompleteExcel = () => {
    const data = students
      .filter((s) => !s.docsComplete)
      .map((s) => ({
        'Student Name': s.name,
        University: s.university,
        Program: s.major,
        Scholarship: s.scholarship,
        'Missing Documents': s.missingDocs.join(', '),
        'Documents Submitted': `${s.docCount}/3`,
      }));
    exportToExcel(data, 'incomplete_files_report.xlsx', 'Incomplete Files');
  };

  const reportOptions = [
    {
      title: 'Full Student Database',
      desc: 'Complete export of all student records including academic background, test scores, and document status.',
      icon: <MdTableChart size={28} />,
      color: '#6366f1',
      actions: [
        { label: 'Export Excel Workbook', icon: <MdDownload size={18} />, fn: handleExcelFull, color: 'primary' },
      ],
    },
    {
      title: 'Executive KPI Report',
      desc: 'High-level summary of agency performance metrics, placement rates, and financial aid statistics in PDF format.',
      icon: <MdPictureAsPdf size={28} />,
      color: '#ef4444',
      actions: [
        { label: 'Export PDF Summary', icon: <MdPictureAsPdf size={18} />, fn: handlePDFKPI, color: 'error' },
      ],
    },
    {
      title: 'Incomplete Portfolios Audit',
      desc: `Targeted audit report of ${students.filter(s => !s.docsComplete).length} candidates missing mandatory application documents.`,
      icon: <MdDownload size={28} />,
      color: '#f59e0b',
      actions: [
        { label: 'Export Audit Excel', icon: <MdDownload size={18} />, fn: handleIncompleteExcel, color: 'warning' },
      ],
    },
  ];

  return (
    <MainLayout title="Reports & Data Export">
      <GlobalFilters />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {reportOptions.map((r) => (
          <Grid size={{ xs: 12, lg: 4 }} key={r.title}>
            <Card sx={{ height: '100%', borderTop: `4px solid ${r.color}`, display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ p: 1.25, borderRadius: 2.5, bgcolor: `${r.color}15`, color: r.color, display: 'flex' }}>
                      {r.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={800}>{r.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>{r.desc}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                  {r.actions.map((a) => (
                    <Button
                      key={a.label}
                      size="medium"
                      variant="contained"
                      color={a.color}
                      startIcon={a.icon}
                      onClick={a.fn}
                      fullWidth
                      sx={{ py: 1, fontWeight: 700 }}
                    >
                      {a.label}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <DataTable
        title="Database Preview – Active Candidates"
        rows={students}
        columns={STUDENT_COLUMNS}
        defaultRowsPerPage={20}
        onExport={handleExcelFull}
      />
    </MainLayout>
  );
}
