import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/** Export array of objects to Excel */
export function exportToExcel(data, fileName = 'export.xlsx', sheetName = 'Data') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

/** Export array of objects to PDF table */
export function exportToPDF(data, columns, fileName = 'export.pdf', title = 'Report') {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.setTextColor(99, 102, 241);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23);

  const tableData = data.map((row) => columns.map((col) => row[col.key] ?? ''));
  autoTable(doc, {
    head: [columns.map((c) => c.label)],
    body: tableData,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 255] },
  });

  doc.save(fileName);
}
