import fs from 'fs';
import Papa from 'papaparse';

const csvText = fs.readFileSync('./public/data/younes.csv', 'utf8');

Papa.parse(csvText, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    const students = results.data;
    console.log(`\n======================================================`);
    console.log(`🤖 GEMINI AI DATA AUDIT & NOTES VERIFICATION REPORT`);
    console.log(`======================================================`);
    console.log(`Total Student Records Analyzed: ${students.length}`);

    let withNotesCount = 0;
    let validJsonCount = 0;
    let invalidJsonCount = 0;
    let formulaExactMatchCount = 0;
    let formulaCloseMatchCount = 0; // within 0.1 discrepancy due to rounding
    let formulaDiscrepancyCount = 0;
    let outOfRangeGrades = [];
    let anomalies = [];
    let topStudents = [];

    students.forEach((s, index) => {
      const name = s['Student Name'] || `Row #${index + 1}`;
      const rawNotes = s['Transcript Notes'];

      if (!rawNotes || rawNotes.trim() === '' || rawNotes.trim().toLowerCase() === 'nan') {
        return;
      }

      withNotesCount++;
      let parsed = null;
      try {
        let cleanStr = rawNotes.trim();
        if (cleanStr.startsWith('"{') && cleanStr.endsWith('}"')) {
          cleanStr = cleanStr.slice(1, -1).replace(/""/g, '"');
        } else if (cleanStr.includes('""')) {
          cleanStr = cleanStr.replace(/""/g, '"');
        }
        parsed = JSON.parse(cleanStr);
        validJsonCount++;
      } catch (err) {
        invalidJsonCount++;
        anomalies.push({ student: name, type: 'JSON Parse Error', note: rawNotes.slice(0, 50) + '...' });
        return;
      }

      // Check grades & Moroccan Baccalaureate formula
      const moyGenStr = parsed['MOY. GENERALE'];
      const regStr = parsed['REGIONAL']?.['MOYENNE'];
      const natStr = parsed['NATIONAL']?.['MOYENNE'];
      const ccStr = parsed['CONT.CONTINU']?.['MOYENNE'];

      if (moyGenStr && regStr && natStr && ccStr) {
        const moyGen = parseFloat(String(moyGenStr).replace(',', '.'));
        const reg = parseFloat(String(regStr).replace(',', '.'));
        const nat = parseFloat(String(natStr).replace(',', '.'));
        const cc = parseFloat(String(ccStr).replace(',', '.'));

        if (!isNaN(moyGen) && !isNaN(reg) && !isNaN(nat) && !isNaN(cc)) {
          // Check out of range
          if (moyGen > 20 || moyGen < 0 || reg > 20 || reg < 0 || nat > 20 || nat < 0 || cc > 20 || cc < 0) {
            outOfRangeGrades.push({ student: name, moyGen, reg, nat, cc });
          }

          // Expected formula: 25% Reg + 50% Nat + 25% CC
          const expected = (reg * 0.25) + (nat * 0.50) + (cc * 0.25);
          const diff = Math.abs(moyGen - expected);

          if (diff < 0.01) {
            formulaExactMatchCount++;
          } else if (diff <= 0.15) {
            formulaCloseMatchCount++;
          } else {
            formulaDiscrepancyCount++;
            anomalies.push({
              student: name,
              type: 'Formula Discrepancy (>0.15)',
              reportedMoy: moyGen,
              calculatedExpected: expected.toFixed(2),
              details: `Reg(${reg})*25% + Nat(${nat})*50% + CC(${cc})*25% = ${expected.toFixed(2)} vs Reported ${moyGen}`
            });
          }

          if (moyGen >= 16.0) {
            topStudents.push({ name, moyGen, mention: 'Très Bien' });
          }
        }
      }

      // Audit subject grades
      if (Array.isArray(parsed.Subjects)) {
        parsed.Subjects.forEach(subItem => {
          const subName = Object.keys(subItem)[0];
          const subData = subItem[subName];
          ['EXAMEN NATIONAL', 'CONTROLE CONTINU'].forEach(examType => {
            const noteVal = subData?.[examType]?.['Note/20'];
            if (noteVal && !String(noteVal).includes('*')) {
              const num = parseFloat(String(noteVal).replace(',', '.'));
              if (!isNaN(num) && (num > 20 || num < 0)) {
                outOfRangeGrades.push({ student: name, subject: subName, exam: examType, grade: num });
              }
            }
          });
        });
      }
    });

    console.log(`\n📊 [Summary Statistics]`);
    console.log(` - Students with Transcript Notes: ${withNotesCount} (${((withNotesCount/students.length)*100).toFixed(1)}%)`);
    console.log(` - Valid JSON Transcripts:         ${validJsonCount}`);
    console.log(` - Invalid / Malformed JSONs:      ${invalidJsonCount}`);
    console.log(`\n🧮 [Baccalaureate Formula Verification (Reg*25% + Nat*50% + CC*25%)]`);
    console.log(` - Exact Formula Match (<0.01 diff): ${formulaExactMatchCount}`);
    console.log(` - Close Match (Roundings <0.15):    ${formulaCloseMatchCount}`);
    console.log(` - Significant Discrepancy (>0.15):  ${formulaDiscrepancyCount}`);
    console.log(`\n⚠️ [Data Integrity & Out-of-Range Checks]`);
    console.log(` - Out-of-Range Grades (>20 or <0):  ${outOfRangeGrades.length}`);
    if (outOfRangeGrades.length > 0) {
      outOfRangeGrades.slice(0, 5).forEach(o => console.log(`    -> ${JSON.stringify(o)}`));
    }
    console.log(` - Total Anomalies Detected:         ${anomalies.length}`);
    if (anomalies.length > 0) {
      console.log(`\n🔎 [Sample Discrepancies / Anomalies (First 5)]`);
      anomalies.slice(0, 5).forEach(a => {
        console.log(`    -> Student: ${a.student} | Type: ${a.type}`);
        if (a.details) console.log(`       Details: ${a.details}`);
      });
    }

    console.log(`\n🏆 [Top Performing Students (Moyenne Générale >= 16.0)]`);
    topStudents.sort((a,b) => b.moyGen - a.moyGen).slice(0, 10).forEach((t, idx) => {
      console.log(`    ${idx+1}. ${t.name.padEnd(25)} | Moyenne: ${t.moyGen.toFixed(2)} / 20 (${t.mention})`);
    });

    console.log(`\n======================================================\n`);
  }
});
