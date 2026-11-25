import { GradeValue, PrimaryFAComponents, PrimarySAMarks, HighSchoolFAMarks, ResultClassification } from '../types';

/**
 * Karnataka CCE Grading and Calculation Engine
 * Follows the official Karnataka State Education Department assessment rules
 */

/**
 * Custom rounding according to Karnataka CCE:
 * - Fraction strictly below 0.5: round down (Math.floor)
 * - Fraction of 0.5 or higher: round up (Math.ceil)
 * Examples: 89.4 -> 89, 89.5 -> 90
 */
export function cceRound(val: number): number {
  const floorVal = Math.floor(val);
  const diff = val - floorVal;
  return diff >= 0.5 ? Math.ceil(val) : floorVal;
}

/**
 * Official Karnataka CCE Grade Charts
 * Derived from State Education Department specifications:
 * - Classes 1-9: 5-level grading (A+, A, B+, B, C)
 * - Class 10: 7-level SSLC grading (A+, A, B+, B, C+, C, NC)
 */

// Exact lookup tables for standard max marks (Classes 1-9)
const STANDARD_GRADE_TABLES_1_TO_9: Record<number, { min: number; grade: GradeValue }[]> = {
  5: [
    { min: 5, grade: 'A+' },
    { min: 4, grade: 'A' },
    { min: 3, grade: 'B+' },
    { min: 2, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  10: [
    { min: 9, grade: 'A+' },
    { min: 7, grade: 'A' },
    { min: 5, grade: 'B+' },
    { min: 3, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  15: [
    { min: 14, grade: 'A+' },
    { min: 11, grade: 'A' },
    { min: 8, grade: 'B+' },
    { min: 5, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  20: [
    { min: 18, grade: 'A+' },
    { min: 14, grade: 'A' },
    { min: 10, grade: 'B+' },
    { min: 6, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  25: [
    { min: 23, grade: 'A+' },
    { min: 18, grade: 'A' },
    { min: 13, grade: 'B+' },
    { min: 8, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  30: [
    { min: 27, grade: 'A+' },
    { min: 21, grade: 'A' },
    { min: 15, grade: 'B+' },
    { min: 9, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  40: [
    { min: 36, grade: 'A+' },
    { min: 28, grade: 'A' },
    { min: 20, grade: 'B+' },
    { min: 12, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  50: [
    { min: 45, grade: 'A+' },
    { min: 35, grade: 'A' },
    { min: 25, grade: 'B+' },
    { min: 15, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  60: [
    { min: 54, grade: 'A+' },
    { min: 42, grade: 'A' },
    { min: 30, grade: 'B+' },
    { min: 18, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  70: [
    { min: 63, grade: 'A+' },
    { min: 49, grade: 'A' },
    { min: 35, grade: 'B+' },
    { min: 21, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  80: [
    { min: 72, grade: 'A+' },
    { min: 56, grade: 'A' },
    { min: 40, grade: 'B+' },
    { min: 24, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  90: [
    { min: 81, grade: 'A+' },
    { min: 63, grade: 'A' },
    { min: 45, grade: 'B+' },
    { min: 27, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  100: [
    { min: 90, grade: 'A+' },
    { min: 70, grade: 'A' },
    { min: 50, grade: 'B+' },
    { min: 30, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  200: [
    { min: 180, grade: 'A+' },
    { min: 140, grade: 'A' },
    { min: 100, grade: 'B+' },
    { min: 60, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  300: [
    { min: 270, grade: 'A+' },
    { min: 210, grade: 'A' },
    { min: 150, grade: 'B+' },
    { min: 90, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  400: [
    { min: 360, grade: 'A+' },
    { min: 280, grade: 'A' },
    { min: 200, grade: 'B+' },
    { min: 120, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  500: [
    { min: 450, grade: 'A+' },
    { min: 350, grade: 'A' },
    { min: 250, grade: 'B+' },
    { min: 150, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  600: [
    { min: 540, grade: 'A+' },
    { min: 420, grade: 'A' },
    { min: 300, grade: 'B+' },
    { min: 180, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  700: [
    { min: 630, grade: 'A+' },
    { min: 490, grade: 'A' },
    { min: 350, grade: 'B+' },
    { min: 210, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
  800: [
    { min: 720, grade: 'A+' },
    { min: 560, grade: 'A' },
    { min: 400, grade: 'B+' },
    { min: 240, grade: 'B' },
    { min: 0, grade: 'C' },
  ],
};

// Exact lookup tables for Class 10 (SSLC grading chart)
const STANDARD_GRADE_TABLES_CLASS_10: Record<number, { min: number; grade: GradeValue }[]> = {
  5: [
    { min: 4.5, grade: 'A+' },
    { min: 4.0, grade: 'A' },
    { min: 3.5, grade: 'B+' },
    { min: 3.0, grade: 'B' },
    { min: 2.5, grade: 'C+' },
    { min: 1.5, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
  10: [
    { min: 9.0, grade: 'A+' },
    { min: 8.0, grade: 'A' },
    { min: 7.0, grade: 'B+' },
    { min: 6.0, grade: 'B' },
    { min: 5.0, grade: 'C+' },
    { min: 3.5, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
  20: [
    { min: 18, grade: 'A+' },
    { min: 16, grade: 'A' },
    { min: 14, grade: 'B+' },
    { min: 12, grade: 'B' },
    { min: 10, grade: 'C+' },
    { min: 7, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
  30: [
    { min: 27, grade: 'A+' },
    { min: 24, grade: 'A' },
    { min: 21, grade: 'B+' },
    { min: 18, grade: 'B' },
    { min: 15, grade: 'C+' },
    { min: 11, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
  40: [
    { min: 36, grade: 'A+' },
    { min: 32, grade: 'A' },
    { min: 28, grade: 'B+' },
    { min: 24, grade: 'B' },
    { min: 20, grade: 'C+' },
    { min: 14, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
  50: [
    { min: 45, grade: 'A+' },
    { min: 40, grade: 'A' },
    { min: 35, grade: 'B+' },
    { min: 30, grade: 'B' },
    { min: 25, grade: 'C+' },
    { min: 18, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
  80: [
    { min: 72, grade: 'A+' },
    { min: 64, grade: 'A' },
    { min: 56, grade: 'B+' },
    { min: 48, grade: 'B' },
    { min: 40, grade: 'C+' },
    { min: 28, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
  100: [
    { min: 90, grade: 'A+' },
    { min: 80, grade: 'A' },
    { min: 70, grade: 'B+' },
    { min: 60, grade: 'B' },
    { min: 50, grade: 'C+' },
    { min: 35, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
  125: [
    { min: 112, grade: 'A+' },
    { min: 100, grade: 'A' },
    { min: 87, grade: 'B+' },
    { min: 75, grade: 'B' },
    { min: 63, grade: 'C+' },
    { min: 44, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
  200: [
    { min: 180, grade: 'A+' },
    { min: 160, grade: 'A' },
    { min: 140, grade: 'B+' },
    { min: 120, grade: 'B' },
    { min: 100, grade: 'C+' },
    { min: 70, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
  625: [
    { min: 563, grade: 'A+' },
    { min: 500, grade: 'A' },
    { min: 438, grade: 'B+' },
    { min: 375, grade: 'B' },
    { min: 313, grade: 'C+' },
    { min: 219, grade: 'C' },
    { min: 0, grade: 'NC' },
  ],
};

/**
 * Calculate Grade using official Karnataka state grade charts
 * Supports both Classes 1-9 (5-grade system) and Class 10 (7-grade SSLC system)
 */
export function calculateGrade(marks: number, maxMarks: number, classNumber?: number): GradeValue {
  if (maxMarks <= 0) return classNumber === 10 ? 'NC' : 'C';
  const val = Math.max(0, marks);

  // Class 10 specific grading scale
  if (classNumber === 10) {
    const table = STANDARD_GRADE_TABLES_CLASS_10[maxMarks];
    if (table) {
      for (const row of table) {
        if (val >= row.min) return row.grade;
      }
      return 'NC';
    }

    // Proportionate percentage fallback for non-standard max marks in Class 10
    const pct = (val / maxMarks) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C+';
    if (pct >= 35) return 'C';
    return 'NC';
  }

  // Classes 1 - 9 standard grading scale
  const table = STANDARD_GRADE_TABLES_1_TO_9[maxMarks];
  if (table) {
    for (const row of table) {
      if (val >= row.min) return row.grade;
    }
    return 'C';
  }

  // Standard percentage scale
  const percentage = (val / maxMarks) * 100;
  const roundedPct = cceRound(percentage);

  if (roundedPct >= 90) return 'A+';
  if (roundedPct >= 70) return 'A';
  if (roundedPct >= 50) return 'B+';
  if (roundedPct >= 30) return 'B';
  return 'C';
}

/**
 * Result Classification for Marks Cards:
 * - FCD (Distinction): >= 85%
 * - FC (First Class): >= 60%
 * - SC (Second Class): >= 50%
 * - Pass: >= 35%
 * - Fail: < 35%
 */
export function calculateResultClassification(totalMarks: number, maxMarks: number): ResultClassification {
  if (maxMarks <= 0) return 'Fail';
  const pct = (totalMarks / maxMarks) * 100;
  const rounded = cceRound(pct);

  if (rounded >= 85) return 'FCD';
  if (rounded >= 60) return 'FC';
  if (rounded >= 50) return 'SC';
  if (rounded >= 35) return 'Pass';
  return 'Fail';
}

// -------------------------------------------------------------
// CLASSES 1 - 5 (PRIMARY SCHOOL)
// -------------------------------------------------------------
export function calculatePrimaryFA(components: Omit<PrimaryFAComponents, 'total_raw' | 'converted_fa'>): PrimaryFAComponents {
  const gruha = Math.min(10, Math.max(0, components.gruha_pata || 0));
  const ghataka = Math.min(10, Math.max(0, components.ghataka_pareekshe || 0));
  const yojana = Math.min(10, Math.max(0, components.yojana_karya || 0));
  const chatu = Math.min(10, Math.max(0, components.chatuvatike || 0));
  const bhaga = Math.min(10, Math.max(0, components.bhagavahisuvike || 0));

  const total_raw = gruha + ghataka + yojana + chatu + bhaga; // Max 50
  // Converted FA = Raw FA Marks / 50 * 15 (Max 15)
  const converted_raw = (total_raw / 50) * 15;
  const converted_fa = Number(converted_raw.toFixed(1));

  return {
    gruha_pata: gruha,
    ghataka_pareekshe: ghataka,
    yojana_karya: yojana,
    chatuvatike: chatu,
    bhagavahisuvike: bhaga,
    total_raw,
    converted_fa,
  };
}

export function calculatePrimarySA(written: number, oral: number): PrimarySAMarks {
  const w = Math.min(40, Math.max(0, written || 0));
  const o = Math.min(10, Math.max(0, oral || 0));
  const total_raw = w + o; // Max 50
  // Converted SA = Raw SA Marks / 50 * 20 (Max 20)
  const converted_raw = (total_raw / 50) * 20;
  const converted_sa = Number(converted_raw.toFixed(1));

  return {
    written: w,
    oral: o,
    total_raw,
    converted_sa,
  };
}

// -------------------------------------------------------------
// CLASSES 6 - 8 (MIDDLE SCHOOL / HIGHER PRIMARY)
// -------------------------------------------------------------
export function calculateMiddleFA(components: Omit<PrimaryFAComponents, 'total_raw' | 'converted_fa'>): PrimaryFAComponents {
  const gruha = Math.min(10, Math.max(0, components.gruha_pata || 0));
  const ghataka = Math.min(10, Math.max(0, components.ghataka_pareekshe || 0));
  const yojana = Math.min(10, Math.max(0, components.yojana_karya || 0));
  const chatu = Math.min(10, Math.max(0, components.chatuvatike || 0));
  const bhaga = Math.min(10, Math.max(0, components.bhagavahisuvike || 0));

  const total_raw = gruha + ghataka + yojana + chatu + bhaga; // Max 50
  // Converted FA = Raw FA Marks / 50 * 10 (Max 10)
  const converted_raw = (total_raw / 50) * 10;
  const converted_fa = Number(converted_raw.toFixed(1));

  return {
    gruha_pata: gruha,
    ghataka_pareekshe: ghataka,
    yojana_karya: yojana,
    chatuvatike: chatu,
    bhagavahisuvike: bhaga,
    total_raw,
    converted_fa,
  };
}

export function calculateMiddleSA(written: number, oral: number): PrimarySAMarks {
  const w = Math.min(40, Math.max(0, written || 0));
  const o = Math.min(10, Math.max(0, oral || 0));
  const total_raw = w + o; // Max 50
  // Converted SA = Raw SA Marks / 50 * 30 (Max 30)
  const converted_raw = (total_raw / 50) * 30;
  const converted_sa = Number(converted_raw.toFixed(1));

  return {
    written: w,
    oral: o,
    total_raw,
    converted_sa,
  };
}

// -------------------------------------------------------------
// CLASSES 9 - 10 (HIGH SCHOOL)
// -------------------------------------------------------------
export function calculateHighSchoolActivityStandards(standardsCount: number, standardMarks: number[]): {
  standardsCount: number;
  maxPerStandard: number;
  standards: { standard_no: number; marks: number; max_marks: number }[];
  totalMarks: number;
} {
  const count = Math.min(5, Math.max(2, standardsCount || 3));
  const maxPerStandard = Number((15 / count).toFixed(2));

  const standards = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    const rawVal = standardMarks[i] !== undefined ? standardMarks[i] : 0;
    const validatedMark = Math.min(maxPerStandard, Math.max(0, rawVal));
    standards.push({
      standard_no: i + 1,
      marks: validatedMark,
      max_marks: maxPerStandard,
    });
    total += validatedMark;
  }

  return {
    standardsCount: count,
    maxPerStandard,
    standards,
    totalMarks: Number(total.toFixed(2)),
  };
}

export function calculateHighSchoolFA(
  act1Standards: number[],
  act1Count: number,
  act2Standards: number[],
  act2Count: number,
  sadhanaTest: number
): HighSchoolFAMarks {
  const act1 = calculateHighSchoolActivityStandards(act1Count, act1Standards);
  const act2 = calculateHighSchoolActivityStandards(act2Count, act2Standards);
  const test = Math.min(20, Math.max(0, sadhanaTest || 0));
  const total = Number((act1.totalMarks + act2.totalMarks + test).toFixed(2));

  return {
    activity_1: {
      standards_count: act1.standardsCount,
      standards: act1.standards,
      total_marks: act1.totalMarks,
    },
    activity_2: {
      standards_count: act2.standardsCount,
      standards: act2.standards,
      total_marks: act2.totalMarks,
    },
    sadhana_pareekshe: test,
    total_fa: total,
  };
}

/**
 * High School SA & Annual Formulas as explicitly specified in prompt:
 * First Language:
 * Midterm = SA1 (/100) + ((FA1 + FA2) * 25 / 100)
 * Annual = SA2 (/100) + ((FA1 + FA2 + FA3 + FA4) * 25 / 200)   [Resulting max: 125]
 *
 * Remaining subjects:
 * Midterm = SA1 (/80) + ((FA1 + FA2) * 20 / 100)
 * Annual = SA2 (/80) + ((FA1 + FA2 + FA3 + FA4) * 20 / 200)    [Resulting max: 100]
 */
export function calculateHighSchoolSubjectResults(
  isFirstLanguage: boolean,
  fa1: number,
  fa2: number,
  sa1: number,
  fa3: number,
  fa4: number,
  sa2: number,
  classNumber: number = 10
) {
  if (isFirstLanguage) {
    const validSA1 = Math.min(100, Math.max(0, sa1 || 0));
    const validSA2 = Math.min(100, Math.max(0, sa2 || 0));
    const faSumMid = (fa1 || 0) + (fa2 || 0);
    const faSumAnnual = (fa1 || 0) + (fa2 || 0) + (fa3 || 0) + (fa4 || 0);

    const midterm = validSA1 + (faSumMid * 25) / 100;
    const annual = validSA2 + (faSumAnnual * 25) / 200;

    return {
      maxMarks: 125,
      midterm: Number(midterm.toFixed(1)),
      annual: Number(annual.toFixed(1)),
      grade: calculateGrade(annual, 125, classNumber),
    };
  } else {
    const validSA1 = Math.min(80, Math.max(0, sa1 || 0));
    const validSA2 = Math.min(80, Math.max(0, sa2 || 0));
    const faSumMid = (fa1 || 0) + (fa2 || 0);
    const faSumAnnual = (fa1 || 0) + (fa2 || 0) + (fa3 || 0) + (fa4 || 0);

    const midterm = validSA1 + (faSumMid * 20) / 100;
    const annual = validSA2 + (faSumAnnual * 20) / 200;

    return {
      maxMarks: 100,
      midterm: Number(midterm.toFixed(1)),
      annual: Number(annual.toFixed(1)),
      grade: calculateGrade(annual, 100, classNumber),
    };
  }
}

export interface AnnualAssessmentMarks {
  fa1: number | null;
  fa2: number | null;
  sa1: number | null;
  fa3: number | null;
  fa4: number | null;
  sa2: number | null;
}

export function getAnnualMaximumMarks(classNumber: number, subjectName: string): number {
  return classNumber >= 9 && subjectName.includes('First Language') ? 125 : 100;
}

export function calculateAnnualMarks(
  classNumber: number,
  subjectName: string,
  marks: AnnualAssessmentMarks
): number | null {
  const assessmentMarks = [marks.fa1, marks.fa2, marks.sa1, marks.fa3, marks.fa4, marks.sa2];
  const requiredMarks = classNumber >= 9
    ? [marks.fa1, marks.fa2, marks.fa3, marks.fa4, marks.sa2]
    : assessmentMarks;
  if (requiredMarks.some((mark) => mark === null)) return null;

  const fa1 = marks.fa1 ?? 0;
  const fa2 = marks.fa2 ?? 0;
  const sa1 = marks.sa1 ?? 0;
  const fa3 = marks.fa3 ?? 0;
  const fa4 = marks.fa4 ?? 0;
  const sa2 = marks.sa2 ?? 0;
  if (classNumber >= 9) {
    const annualResult = calculateHighSchoolSubjectResults(
      subjectName.includes('First Language'),
      fa1,
      fa2,
      sa1,
      fa3,
      fa4,
      sa2,
      classNumber
    );
    const annualMaximum = getAnnualMaximumMarks(classNumber, subjectName);
    return Number(((annualResult.annual / annualResult.maxMarks) * annualMaximum).toFixed(1));
  }

  return Number((fa1 + fa2 + sa1 + fa3 + fa4 + sa2).toFixed(1));
}

/**
 * Standard Subject list by Class:
 * Classes 1-5: First Language, Second Language, Mathematics, EVS
 * Classes 6-10: First Language, Second Language, Third Language, Mathematics, Science, Social Science
 */
export function getStandardSubjects(classNumber: number): string[] {
  if (classNumber >= 1 && classNumber <= 5) {
    return ['First Language (Kannada)', 'Second Language (English)', 'Mathematics', 'EVS'];
  }
  return [
    'First Language (Kannada)',
    'Second Language (English)',
    'Third Language (Hindi)',
    'Mathematics',
    'Science',
    'Social Science',
  ];
}
