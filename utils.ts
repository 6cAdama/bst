import { Student, ClassMetadata, ClassStats, AppDB } from './types';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle, PageOrientation, VerticalAlign } from 'docx';
import saveAs from 'file-saver';

export const CLASS_OPTIONS = [
  '3T1', '3T2', '3MAB', '3ART', '3MSD',
  '4T1', '4T2', '4MAB', '4ART', '4MSD'
];

export const SUBJECT_OPTIONS = ['SVT', 'PC', 'EFS', 'TECHNO'];

export const calculateMention = (average: number): string => {
  if (average < 10) return 'Insuffisant';
  if (average < 12) return 'Passable';
  if (average < 14) return 'Assez Bien';
  if (average < 16) return 'Bien';
  if (average < 18) return 'Très Bien';
  return 'Excellent';
};

export const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

// Recalculates all derived fields for a list of students
export const recalculateGrades = (students: Student[], coefficient: number, s1Students: Student[] = []): Student[] => {
  
  // 1. Calculate Individual Averages
  const calculatedStudents = students.map(student => {
    const devNotes = [student.d1, student.d2, student.d3].filter(n => n !== '') as number[];
    const moyDev = devNotes.length > 0 
      ? devNotes.reduce((a, b) => a + b, 0) / devNotes.length 
      : 0;

    const comp = student.comp === '' ? 0 : student.comp;
    
    // If no grades, average is 0
    const hasAnyGrade = devNotes.length > 0 || student.comp !== '';
    const finalMoy = hasAnyGrade ? (moyDev + comp) / 2 : 0;

    // Calculate MoyG (Moyenne Générale / Annuelle) if S1 students are provided
    let moyG = undefined;
    if (s1Students.length > 0) {
      // Find matching student in S1 by Name (case insensitive)
      const match = s1Students.find(s1 => 
        s1.noms.trim().toLowerCase() === student.noms.trim().toLowerCase() && 
        s1.prenoms.trim().toLowerCase() === student.prenoms.trim().toLowerCase()
      );

      if (match) {
        // (S1 + S2) / 2
        moyG = roundToTwo((match.moyenne + finalMoy) / 2);
      } else {
        // If not found in S1, assume S1 was 0 or strictly math: (0 + S2) / 2
        moyG = roundToTwo(finalMoy / 2);
      }
    }

    return {
      ...student,
      moyDev: roundToTwo(moyDev),
      moyenne: roundToTwo(finalMoy),
      moyCoef: roundToTwo(finalMoy * coefficient),
      moyG: moyG,
      mention: hasAnyGrade ? calculateMention(finalMoy) : '',
    };
  });

  // 2. Assign Ranks
  const sortedForRank = [...calculatedStudents].sort((a, b) => b.moyenne - a.moyenne);
  const rankMap = new Map<string, number>();
  
  let currentRank = 1;
  for (let i = 0; i < sortedForRank.length; i++) {
    if (i > 0 && sortedForRank[i].moyenne === sortedForRank[i-1].moyenne) {
       rankMap.set(sortedForRank[i].id, rankMap.get(sortedForRank[i-1].id)!);
    } else {
       rankMap.set(sortedForRank[i].id, currentRank);
    }
    currentRank++;
  }

  return calculatedStudents.map(s => ({
    ...s,
    rang: rankMap.get(s.id) || 0
  }));
};

export const calculateClassStats = (students: Student[]): ClassStats => {
  // Filter active students (those who have a name or a grade)
  const activeStudents = students.filter(s => 
    (s.noms.trim() !== '' || s.prenoms.trim() !== '') && 
    (s.moyenne > 0 || s.d1 !== '' || s.comp !== '')
  );
  
  const count = activeStudents.length;
  
  if (count === 0) {
    return {
      totalStudents: 0,
      passCount: 0,
      failCount: 0,
      femaleCount: 0,
      maleCount: 0,
      femalePassCount: 0,
      malePassCount: 0,
      classAverage: 0
    };
  }

  const pass = activeStudents.filter(s => s.moyenne >= 10);
  const fail = activeStudents.filter(s => s.moyenne < 10);
  const females = activeStudents.filter(s => s.sexe === 'F');
  const males = activeStudents.filter(s => s.sexe === 'M');
  const passFemales = pass.filter(s => s.sexe === 'F');
  const passMales = pass.filter(s => s.sexe === 'M');
  
  const sumAverage = activeStudents.reduce((acc, curr) => acc + curr.moyenne, 0);

  return {
    totalStudents: count,
    passCount: pass.length,
    failCount: fail.length,
    femaleCount: females.length,
    maleCount: males.length,
    femalePassCount: passFemales.length,
    malePassCount: passMales.length,
    classAverage: sumAverage / count
  };
};

export const generateInitialStudents = (count: number): Student[] => {
  const students: Student[] = [];
  
  // Initialize empty students (No pre-filled names or sex)
  for (let i = 0; i < count; i++) {
    students.push({
      id: crypto.randomUUID(),
      prenoms: '',
      noms: '',
      sexe: '', // Start empty
      d1: '', d2: '', d3: '',
      moyDev: 0,
      comp: '',
      moyenne: 0,
      moyCoef: 0,
      rang: 0,
      mention: ''
    });
  }
  return students;
};

// Styles constants
const STYLES = {
  headerLeft: {
    font: { bold: true, sz: 11, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" }
  },
  headerLeftMotto: {
    font: { italic: true, sz: 9, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" }
  },
  headerRightTitle: {
    font: { bold: true, sz: 14, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" }
  },
  headerRightSub: {
    font: { bold: true, sz: 12, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" }
  },
  headerRightNormal: {
    font: { sz: 10, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" }
  },
  tableHeader: {
    fill: { fgColor: { rgb: "A8998A" } },
    font: { bold: true, color: { rgb: "000000" }, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  },
  tableHeaderBeige: {
    fill: { fgColor: { rgb: "BDAEA1" } },
    font: { bold: true, color: { rgb: "000000" }, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  },
  tableHeaderYellow: {
    fill: { fgColor: { rgb: "FEF9C3" } }, // Yellow 100
    font: { bold: true, color: { rgb: "1E3A8A" }, name: "Arial" }, // Blue 900
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  },
  cellNormal: {
    font: { name: "Arial", sz: 11 },
    border: {
      top: { style: "thin", color: { rgb: "888888" } },
      bottom: { style: "thin", color: { rgb: "888888" } },
      left: { style: "thin", color: { rgb: "888888" } },
      right: { style: "thin", color: { rgb: "888888" } }
    },
    alignment: { horizontal: "center", vertical: "center" }
  },
  cellBeige: {
    fill: { fgColor: { rgb: "EFEBE7" } },
    font: { name: "Arial", sz: 11, bold: true },
    border: {
      top: { style: "thin", color: { rgb: "888888" } },
      bottom: { style: "thin", color: { rgb: "888888" } },
      left: { style: "thin", color: { rgb: "888888" } },
      right: { style: "thin", color: { rgb: "888888" } }
    },
    alignment: { horizontal: "center", vertical: "center" }
  },
  cellDarkerBeige: {
    fill: { fgColor: { rgb: "E3DED8" } },
    font: { name: "Arial", sz: 11, bold: true },
    border: {
      top: { style: "thin", color: { rgb: "888888" } },
      bottom: { style: "thin", color: { rgb: "888888" } },
      left: { style: "thin", color: { rgb: "888888" } },
      right: { style: "thin", color: { rgb: "888888" } }
    },
    alignment: { horizontal: "center", vertical: "center" }
  },
  cellYellow: {
    fill: { fgColor: { rgb: "FEFCE8" } }, // Yellow 50
    font: { name: "Arial", sz: 11, bold: true, color: { rgb: "1E3A8A" } },
    border: {
      top: { style: "thin", color: { rgb: "888888" } },
      bottom: { style: "thin", color: { rgb: "888888" } },
      left: { style: "thin", color: { rgb: "888888" } },
      right: { style: "thin", color: { rgb: "888888" } }
    },
    alignment: { horizontal: "center", vertical: "center" }
  }
};

// Internal function to generate a single worksheet, reused by single and global export
const generateClassWorksheet = (metadata: ClassMetadata, students: Student[], stats: ClassStats) => {
  // Filter out completely empty rows
  const validStudents = students.filter(s => s.noms.trim() !== '' || s.prenoms.trim() !== '');
  const isS2 = metadata.semester === 2;
  const numCols = isS2 ? 14 : 13;
  const lastColIndex = numCols - 1;

  // Header Info Rows
  const headerData = [
    ["REPUBLIQUE DU SENEGAL", "", "", "", "INSPECTION D'ACADEMIE DE LOUGA"],
    ["Un Peuple – Un But – Une Foi", "", "", "", "I.E.F DE LOUGA"],
    ["Ministère de l'Education nationale", "", "", "", "BST DE LOUGA"],
    ["", "", "", "", "TEL: 77 521 22 88 / 33 897 96 53"],
    [], // Spacer
    [`CLASSE: ${metadata.classe}`, "", "", "", "", "", "", `DISCIPLINE: ${metadata.discipline}`],
    [`PROFESSEUR: ${metadata.professeur}`, "", "", "", "", "", "", `SEMESTRE: ${metadata.semester}   COEF: ${metadata.coefficient}`],
    [] // Spacer before table
  ];

  // Table Headers
  const baseHeaders = ["N°", "PRENOMS", "NOMS", "SEXE", "D1", "D2", "D3", "MOY DEV", "COMP", "MOYENNE", "MOY*COEF"];
  if (isS2) {
    baseHeaders.push("MOY AN"); // Moyenne Annuelle
  }
  baseHeaders.push("RANG", "MENTION");

  const tableHeaders = [baseHeaders];

  // Student Data
  const studentData = validStudents.map((s, index) => {
    const row = [
      index + 1,
      s.prenoms,
      s.noms,
      s.sexe,
      s.d1,
      s.d2,
      s.d3,
      s.moyDev === 0 && s.d1 === '' ? '' : s.moyDev,
      s.comp,
      s.moyenne === 0 && s.d1 === '' && s.comp === '' ? '' : s.moyenne,
      s.moyCoef === 0 && s.d1 === '' && s.comp === '' ? '' : s.moyCoef
    ];
    
    if (isS2) {
      row.push(s.moyG !== undefined ? s.moyG : '-');
    }

    row.push(s.rang === 0 ? '' : s.rang, s.mention);
    return row;
  });

  // Statistics Footer
  const statsStartRow = headerData.length + tableHeaders.length + studentData.length;
  const statsData = [
    [],
    ["STATISTIQUES"],
    ["Effectif Total", stats.totalStudents],
    ["Moyenne de classe", stats.classAverage],
    ["Admis (>=10)", stats.passCount, "Echecs (<10)", stats.failCount],
    ["Garçons", stats.maleCount, "Admis Garçons", stats.malePassCount],
    ["Filles", stats.femaleCount, "Admis Filles", stats.femalePassCount]
  ];

  // Combine all data
  const wsData = [...headerData, ...tableHeaders, ...studentData, ...statsData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // --- STYLING LOGIC ---
  const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");

  // 1. Column Widths
  const cols = [
    { wch: 5 },  // N°
    { wch: 25 }, // Prenoms
    { wch: 20 }, // Noms
    { wch: 6 },  // Sexe
    { wch: 5 }, { wch: 5 }, { wch: 5 }, // D1-D3
    { wch: 10 }, // Moy Dev
    { wch: 8 },  // Comp
    { wch: 10 }, // Moy
    { wch: 10 }  // MoyCoef
  ];
  if (isS2) cols.push({ wch: 12 }); // Moy AN
  cols.push({ wch: 8 }, { wch: 15 }); // Rang, Mention
  ws['!cols'] = cols;

  // 2. Merges
  ws['!merges'] = [
    // Header Left (Republic)
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    // Header Right (School)
    { s: { r: 0, c: 4 }, e: { r: 0, c: lastColIndex } },
    { s: { r: 1, c: 4 }, e: { r: 1, c: lastColIndex } },
    { s: { r: 2, c: 4 }, e: { r: 2, c: lastColIndex } },
    { s: { r: 3, c: 4 }, e: { r: 3, c: lastColIndex } },
    // Metadata 1
    { s: { r: 5, c: 0 }, e: { r: 5, c: 3 } }, // Classe
    { s: { r: 5, c: 7 }, e: { r: 5, c: lastColIndex } }, // Discipline
    // Metadata 2
    { s: { r: 6, c: 0 }, e: { r: 6, c: 3 } }, // Prof
    { s: { r: 6, c: 7 }, e: { r: 6, c: lastColIndex } }, // Semestre
  ];

  // 3. Iterating Cells for Style
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      
      const cell = ws[cellAddress];
      let style: any = { ...STYLES.cellNormal }; // Default style

      // -- HEADER SECTION (Rows 0-3) --
      if (R <= 3) {
        if (C <= 3) {
            // Left Side
            if (R === 1) style = { ...STYLES.headerLeftMotto };
            else style = { ...STYLES.headerLeft };
        } else {
            // Right Side
            if (R === 0) style = { ...STYLES.headerRightTitle };
            else if (R === 1 || R === 2) style = { ...STYLES.headerRightSub };
            else style = { ...STYLES.headerRightNormal };
        }
      }
      
      // -- METADATA SECTION (Rows 5-6) --
      else if (R >= 5 && R <= 6) {
        style.font = { bold: true, name: "Arial", sz: 12 };
        if (C >= 4 && C < 7) style.font = { name: "Arial" }; // Middle empty cells
        style.border = {}; 
        style.alignment = { horizontal: "left", vertical: "center" };
        if (C >= 7) style.alignment = { horizontal: "right", vertical: "center" };
      }

      // -- TABLE HEADER (Row 8) --
      else if (R === 8) {
        style = { ...STYLES.tableHeader };
        if (C === 7 || C === 9 || C === 10) {
            style = { ...STYLES.tableHeaderBeige };
        } else if (isS2 && C === 11) {
            style = { ...STYLES.tableHeaderYellow };
        }
      }

      // -- DATA ROWS --
      else if (R > 8 && R < statsStartRow) { 
        // Zebra striping for basic cells
        if ((R - 9) % 2 !== 0) {
            style.fill = { fgColor: { rgb: "F9FAFB" } }; // gray-50
        }

        // Column Specific Styling
        if (C === 1 || C === 2) { // Names
           style.alignment = { horizontal: "left", vertical: "center" };
        }
        
        // Moy Dev, Moy Coef -> Beige
        if (C === 7 || C === 10) {
            style = { ...STYLES.cellBeige };
        }
        
        // Comp -> Bold White (Default is white, just bold)
        if (C === 8) {
             style.font = { ...style.font, bold: true };
             style.fill = { fgColor: { rgb: "FFFFFF" } };
        }

        // Moyenne -> Darker Beige
        if (C === 9) {
            style = { ...STYLES.cellDarkerBeige };
        }

        // Moy An -> Yellow
        if (isS2 && C === 11) {
            style = { ...STYLES.cellYellow };
        }

        // Mention -> Color text
        if ((isS2 && C === 13) || (!isS2 && C === 12)) {
             const val = cell.v as string;
             // Check moyenne value for color logic (Moyenne is at index 9)
             const moyCell = ws[XLSX.utils.encode_cell({r: R, c: 9})];
             const moyVal = moyCell ? moyCell.v as number : 0;
             
             if (moyVal < 10) {
                 style.font = { ...style.font, color: { rgb: "DC2626" }, bold: true }; // Red
             } else {
                 style.font = { ...style.font, color: { rgb: "15803D" }, bold: true }; // Green
             }
        }
      }

      // -- STATS SECTION --
      else if (R >= statsStartRow) {
         style.font = { bold: true, name: "Arial" };
         style.border = {}; // Clean look for stats
      }

      // Apply the style
      cell.s = style;
    }
  }

  return ws;
};

export const exportToExcel = (metadata: ClassMetadata, students: Student[], stats: ClassStats) => {
  const ws = generateClassWorksheet(metadata, students, stats);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Relevé");
  XLSX.writeFile(wb, `Releve_${metadata.classe}_${metadata.discipline || 'Note'}_S${metadata.semester}.xlsx`);
};

export const exportFullDbToExcel = (db: AppDB) => {
  const wb = XLSX.utils.book_new();
  let hasContent = false;

  // We need to iterate over all keys, but for S2 we might need S1 data for calculations
  const keys = Object.keys(db).sort();

  keys.forEach(key => {
    const data = db[key];
    // Only export sheets that have actual student data (names or grades)
    const hasData = data.students.some(s => s.noms.trim() !== '' || s.prenoms.trim() !== '');
    if (!hasData) return;

    hasContent = true;

    // Recalculate grades before export
    let s1Students: Student[] = [];
    if (data.metadata.semester === 2) {
       const s1Key = key.replace('_S2', '_S1');
       if (db[s1Key]) {
          // We assume S1 raw data is enough, we need it to match names
          // We run a quick recalc on S1 just to be safe about the averages
          s1Students = recalculateGrades(db[s1Key].students, db[s1Key].metadata.coefficient);
       }
    }
    
    const calculatedStudents = recalculateGrades(data.students, data.metadata.coefficient, s1Students);
    const stats = calculateClassStats(calculatedStudents);
    
    const ws = generateClassWorksheet(data.metadata, calculatedStudents, stats);
    
    // Create a safe sheet name (Max 31 chars, no special chars ideally)
    let sheetName = `${data.metadata.classe}_${data.metadata.discipline}_S${data.metadata.semester}`;
    // Replace invalid chars []*:?/
    sheetName = sheetName.replace(/[[\]*:?/\\]/g, '_');
    if (sheetName.length > 31) sheetName = sheetName.substring(0, 31);
    
    // Ensure unique sheet names if truncated collision occurs
    let uniqueName = sheetName;
    let counter = 1;
    while (wb.SheetNames.includes(uniqueName)) {
      uniqueName = `${sheetName.substring(0, 28)}(${counter})`;
      counter++;
    }

    XLSX.utils.book_append_sheet(wb, ws, uniqueName);
  });
  
  if (hasContent) {
    XLSX.writeFile(wb, "GestClasse_Base_Complete.xlsx");
  } else {
    alert("Aucune donnée à exporter.");
  }
};

export const exportToWord = async (metadata: ClassMetadata, students: Student[], stats: ClassStats) => {
  const isS2 = metadata.semester === 2;
  const validStudents = students.filter(s => s.noms.trim() !== '' || s.prenoms.trim() !== '');

  const commonBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
  const headerFont = "Arial";
  
  // Create Headers Array for Table
  const headers = ["N°", "PRENOMS", "NOMS", "SEXE", "D1", "D2", "D3", "MOY DEV", "COMP", "MOYENNE", "MOY*COEF"];
  if (isS2) headers.push("MOY AN");
  headers.push("RANG", "MENTION");

  // Create Table Rows
  const tableRows = [
    // Header Row
    new TableRow({
      tableHeader: true,
      children: headers.map(text => {
        let fill = "A8998A"; // Default gray-brown
        if (text === "MOY DEV" || text === "MOYENNE" || text === "MOY*COEF") fill = "BDAEA1";
        if (text === "MOY AN") fill = "FEF9C3";

        return new TableCell({
          shading: { fill: fill },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            children: [new TextRun({ text, bold: true, font: headerFont, size: 14 })], // size is half-points, 14 = 7pt
            alignment: AlignmentType.CENTER
          })],
          borders: { top: commonBorder, bottom: commonBorder, left: commonBorder, right: commonBorder }
        });
      })
    })
  ];

  // Data Rows
  validStudents.forEach((s, idx) => {
    const rowData = [
      (idx + 1).toString(),
      s.prenoms,
      s.noms,
      s.sexe,
      s.d1.toString(),
      s.d2.toString(),
      s.d3.toString(),
      s.moyDev > 0 ? s.moyDev.toFixed(2) : (s.d1 === '' ? '' : '0.00'),
      s.comp.toString(),
      s.moyenne > 0 ? s.moyenne.toFixed(2) : (s.comp === '' && s.d1 === '' ? '' : '0.00'),
      s.moyCoef > 0 ? s.moyCoef.toFixed(2) : (s.comp === '' && s.d1 === '' ? '' : '0.00')
    ];

    if (isS2) {
      rowData.push(s.moyG !== undefined ? s.moyG.toFixed(2) : '-');
    }

    rowData.push(s.rang > 0 ? s.rang.toString() : '', s.mention);

    const isFail = s.moyenne < 10;
    
    tableRows.push(new TableRow({
      children: rowData.map((text, colIdx) => {
        let color = "000000";
        let bold = false;
        let fill = "FFFFFF";
        let align = AlignmentType.CENTER;

        if (idx % 2 !== 0) fill = "F9FAFB"; // Zebra

        // Specific colors
        if (colIdx === 7 || colIdx === 10) fill = "EFEBE7"; // MoyDev, MoyCoef
        if (colIdx === 8) { fill = "FFFFFF"; bold = true; } // Comp
        if (colIdx === 9) fill = "E3DED8"; // Moyenne
        if (isS2 && colIdx === 11) fill = "FEFCE8"; // Moy An

        // Mention color
        if ((isS2 && colIdx === 13) || (!isS2 && colIdx === 12)) {
          if (text === 'Insuffisant' || isFail) color = "DC2626";
          else color = "15803D";
          bold = true;
        }

        if (colIdx === 1 || colIdx === 2) align = AlignmentType.LEFT;

        return new TableCell({
          shading: { fill: fill },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            children: [new TextRun({ text: text || "", color: color, bold: bold, font: "Arial", size: 18 })], // 9pt
            alignment: align
          })],
          borders: { top: commonBorder, bottom: commonBorder, left: commonBorder, right: commonBorder }
        });
      })
    }));
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { orientation: PageOrientation.LANDSCAPE },
          margin: { top: 720, right: 720, bottom: 720, left: 720 }
        }
      },
      children: [
        // Header Table (Invisible Borders)
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "REPUBLIQUE DU SENEGAL", bold: true, size: 22 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Un Peuple – Un But – Une Foi", italics: true, size: 18 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ministère de l'Education nationale", size: 20 })] }),
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "INSPECTION D'ACADEMIE DE LOUGA", bold: true, size: 24 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "I.E.F DE LOUGA", bold: true, size: 22 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "BST DE LOUGA", bold: true, size: 20 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TEL: 77 521 22 88 / 33 897 96 53", size: 18 })] }),
                  ]
                })
              ]
            })
          ]
        }),
        
        new Paragraph({ text: "" }), // Spacer

        // Metadata Table
        new Table({
           width: { size: 100, type: WidthType.PERCENTAGE },
           borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
           rows: [
             new TableRow({
               children: [
                 new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `CLASSE: ${metadata.classe}`, bold: true, size: 24 })] })] }),
                 new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `DISCIPLINE: ${metadata.discipline}`, bold: true, size: 24 })] })] })
               ]
             }),
             new TableRow({
               children: [
                 new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `PROFESSEUR: ${metadata.professeur}`, bold: true, size: 24 })] })] }),
                 new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `SEMESTRE: ${metadata.semester}   COEF: ${metadata.coefficient}`, bold: true, size: 24 })] })] })
               ]
             })
           ]
        }),

        new Paragraph({ text: "" }), // Spacer

        // Grades Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows
        }),

        new Paragraph({ text: "" }), // Spacer

        // Stats Header
        new Paragraph({ children: [new TextRun({ text: "STATISTIQUES", bold: true, size: 24 })] }),

        // Stats Content (Simple text list or table)
        new Table({
           width: { size: 50, type: WidthType.PERCENTAGE }, // Smaller table
           borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
           rows: [
             new TableRow({ children: [new TableCell({ children: [new Paragraph(`Effectif Total: ${stats.totalStudents}`)] })] }),
             new TableRow({ children: [new TableCell({ children: [new Paragraph(`Moyenne de classe: ${stats.classAverage.toFixed(2)}`)] })] }),
             new TableRow({ children: [new TableCell({ children: [new Paragraph(`Admis: ${stats.passCount}  |  Echecs: ${stats.failCount}`)] })] }),
             new TableRow({ children: [new TableCell({ children: [new Paragraph(`Garçons: ${stats.maleCount} (Admis: ${stats.malePassCount})`)] })] }),
             new TableRow({ children: [new TableCell({ children: [new Paragraph(`Filles: ${stats.femaleCount} (Admis: ${stats.femalePassCount})`)] })] }),
           ]
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Releve_${metadata.classe}_${metadata.discipline}_S${metadata.semester}.docx`);
};
