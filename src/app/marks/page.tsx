'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardList,
  Save,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  ChevronDown,
  Info,
  Calendar,
  BookOpen,
  X,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  calculatePrimaryFA,
  calculatePrimarySA,
  calculateMiddleFA,
  calculateMiddleSA,
  calculateHighSchoolFA,
  calculateHighSchoolSubjectResults,
  getStandardSubjects,
  calculateGrade,
} from '@/lib/cce/calculations';
import { AssessmentType, GradeValue } from '@/lib/types';
import { getStudentName, getSubjectName } from '@/lib/utils/kannadaNames';
import * as XLSX from 'xlsx';
import { downloadExcelFile } from '@/lib/pdf/documentGenerator';
import { printMarksEntryRegister } from '@/lib/pdf/officialPrintTemplates';

function hasMarksInput(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') return value.trim() !== '' && Number.isFinite(Number(value));
  return false;
}

function isHighSchoolFaComplete(row: Record<string, unknown>, act1Count: number, act2Count: number): boolean {
  const act1 = Array.isArray(row.act1) ? row.act1 : [];
  const act2 = Array.isArray(row.act2) ? row.act2 : [];
  return (
    act1.length === act1Count &&
    act2.length === act2Count &&
    act1.every(hasMarksInput) &&
    act2.every(hasMarksInput) &&
    hasMarksInput(row.sadhana)
  );
}

export default function MarksEntryPage() {
  const { currentSchool, academicYear, currentUser, userRole } = useAuth();
  const { state, saveAssessmentMark, saveCoCurricularGrade } = useAppState();
  const { t, language } = useLanguage();

  // Strict role check: Platform Admin only has access to School Access Management
  if (userRole === 'PLATFORM_ADMIN') {
    return (
      <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 space-y-3">
        <h2 className="text-xl font-black">Platform Admin View Restricted</h2>
        <p className="text-xs sm:text-sm">
          Platform administrators only oversee school institutions and credential approvals. Marks entry and CCE evaluations are restricted to School Admins and Subject Faculty.
        </p>
      </div>
    );
  }

  // Selection states
  const [selectedClass, setSelectedClass] = useState<number>(10);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType>('FA1');

  // Classes 9-10 Standards configuration (2 to 5)
  const [standardsCountAct1, setStandardsCountAct1] = useState<number>(3);
  const [standardsCountAct2, setStandardsCountAct2] = useState<number>(3);

  // Auto-save & Status indicators
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveNotification, setSaveNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const triggerSaveNotification = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setSaveNotification({ show: true, title, message, type });
    // Keep visible for a comfortable 6 seconds so user has plenty of time to read
    setTimeout(() => {
      setSaveNotification((prev) => (prev?.title === title ? null : prev));
    }, 6000);
  };

  // Evaluation Mode: Curricular Subject Marks vs Co-Curricular Grading
  const [evaluationMode, setEvaluationMode] = useState<'CURRICULAR' | 'CO_CURRICULAR'>('CURRICULAR');

  // Co-Curricular Modal
  const [coCurricularModalOpen, setCoCurricularModalOpen] = useState(false);
  const [coGrades, setCoGrades] = useState<
    Record<string, { daihika: GradeValue; moulya: GradeValue; kaaryanubhava: GradeValue; kala: GradeValue }>
  >({});

  // Local table state: studentId -> record
  const [marksGrid, setMarksGrid] = useState<Record<string, any>>({});

  const availableSubjects = getStandardSubjects(selectedClass);

  // Active students for selected class & section
  const activeStudents = state.students.filter(
    (s) =>
      s.school_id === currentSchool?.id &&
      (s.academic_year === academicYear || !s.academic_year || s.academic_year === '2026-27' || s.academic_year === '2024-25') &&
      s.class_number === selectedClass &&
      s.section === selectedSection &&
      s.status === 'ACTIVE'
  );

  // All active enrolled students across school
  const schoolActiveStudents = state.students.filter(
    (s) => s.school_id === currentSchool?.id && s.status === 'ACTIVE'
  );

  // Classes that currently have active enrolled students
  const enrolledClasses = Array.from(
    new Set(
      state.students
        .filter((s) => s.school_id === currentSchool?.id && s.status === 'ACTIVE')
        .map((s) => `${s.class_number}-${s.section}`)
    )
  );

  // Load existing saved marks whenever selection changes
  useEffect(() => {
    const grid: Record<string, any> = {};
    activeStudents.forEach((st) => {
      const existing = state.assessments.find(
        (a) =>
          a.school_id === currentSchool?.id &&
          a.academic_year === academicYear &&
          a.student_id === st.id &&
          a.subject_name === selectedSubject &&
          a.assessment_type === selectedAssessment
      );

      if (existing) {
        grid[st.id] = {
          primary_fa: existing.primary_fa,
          primary_sa: existing.primary_sa,
          high_school_fa: existing.high_school_fa,
          high_school_sa: existing.high_school_sa,
          total_marks: existing.total_marks,
          grade: existing.grade,
          hasSavedMark: true,
          gruha: existing.primary_fa?.gruha_pata ?? '',
          ghataka: existing.primary_fa?.ghataka_pareekshe ?? '',
          yojana: existing.primary_fa?.yojana_karya ?? '',
          chatu: existing.primary_fa?.chatuvatike ?? '',
          bhaga: existing.primary_fa?.bhagavahisuvike ?? '',
          written: existing.primary_sa?.written ?? '',
          oral: existing.primary_sa?.oral ?? '',
          act1: existing.high_school_fa?.activity_1?.standards?.map((standard) => standard.marks) ?? [],
          act2: existing.high_school_fa?.activity_2?.standards?.map((standard) => standard.marks) ?? [],
          sadhana: existing.high_school_fa?.sadhana_pareekshe ?? '',
          sa_marks: existing.high_school_sa ?? '',
          attendance: existing.attendance_count || '',
        };
      } else {
        // Defaults by tier
        if (selectedClass >= 1 && selectedClass <= 5) {
          if (selectedAssessment === 'SA1' || selectedAssessment === 'SA2') {
            grid[st.id] = { written: '', oral: '', attendance: '' };
          } else {
            grid[st.id] = { gruha: '', ghataka: '', yojana: '', chatu: '', bhaga: '', attendance: '' };
          }
        } else if (selectedClass >= 6 && selectedClass <= 8) {
          if (selectedAssessment === 'SA1' || selectedAssessment === 'SA2') {
            grid[st.id] = { written: '', oral: '', attendance: '' };
          } else {
            grid[st.id] = { gruha: '', ghataka: '', yojana: '', chatu: '', bhaga: '', attendance: '' };
          }
        } else {
          // High School 9-10
          if (selectedAssessment === 'SA1' || selectedAssessment === 'SA2') {
            grid[st.id] = { sa_marks: '', attendance: '' };
          } else {
            grid[st.id] = {
              act1: Array(standardsCountAct1).fill(''),
              act2: Array(standardsCountAct2).fill(''),
              sadhana: '',
              attendance: '',
            };
          }
        }
      }
    });

    setMarksGrid(grid);
    setHasUnsavedChanges(false);
  }, [selectedClass, selectedSection, selectedSubject, selectedAssessment, academicYear, currentSchool?.id]);

  // Load co-curricular grades for all active students in school
  useEffect(() => {
    const map: Record<string, { daihika: GradeValue; moulya: GradeValue; kaaryanubhava: GradeValue; kala: GradeValue }> = {};
    schoolActiveStudents.forEach((st) => {
      const existing = state.coCurricular.find(
        (c) => c.student_id === st.id && (c.academic_year === academicYear || !c.academic_year)
      );
      if (existing) {
        map[st.id] = {
          daihika: existing.daihika_arogya || 'A',
          moulya: existing.moulya || 'A+',
          kaaryanubhava: existing.kaaryanubhava || 'A',
          kala: existing.kala || 'A',
        };
      } else {
        map[st.id] = { daihika: 'A', moulya: 'A+', kaaryanubhava: 'A', kala: 'A' };
      }
    });
    setCoGrades((prev) => ({ ...map, ...prev }));
  }, [academicYear, currentSchool?.id, state.students, state.coCurricular]);

  // Handle cell changes for Primary (1-5) and Middle (6-8) FA
  const handlePrimaryFAChange = (studentId: string, field: string, val: string) => {
    const num = val === '' ? 0 : Math.min(10, Math.max(0, Number(val)));
    const current = marksGrid[studentId] || {};
    const updated = { ...current, [field]: val === '' ? '' : num };

    const comp = {
      gruha_pata: Number(updated.gruha) || 0,
      ghataka_pareekshe: Number(updated.ghataka) || 0,
      yojana_karya: Number(updated.yojana) || 0,
      chatuvatike: Number(updated.chatu) || 0,
      bhagavahisuvike: Number(updated.bhaga) || 0,
    };

    const calc =
      selectedClass <= 5 ? calculatePrimaryFA(comp) : calculateMiddleFA(comp);
    const maxMark = selectedClass <= 5 ? 15 : 10;
    const complete = ['gruha', 'ghataka', 'yojana', 'chatu', 'bhaga'].every((key) => hasMarksInput(updated[key]));
    const grade = complete ? calculateGrade(calc.converted_fa, maxMark) : undefined;

    setMarksGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...updated,
        calculatedFA: calc,
        converted: complete ? calc.converted_fa : undefined,
        grade,
        hasSavedMark: false,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Handle Primary / Middle SA change
  const handlePrimarySAChange = (studentId: string, field: 'written' | 'oral', val: string) => {
    const current = marksGrid[studentId] || {};
    const max = field === 'written' ? 40 : 10;
    const num = val === '' ? 0 : Math.min(max, Math.max(0, Number(val)));
    const updated = { ...current, [field]: val === '' ? '' : num };

    const calc =
      selectedClass <= 5
        ? calculatePrimarySA(Number(updated.written) || 0, Number(updated.oral) || 0)
        : calculateMiddleSA(Number(updated.written) || 0, Number(updated.oral) || 0);

    const maxMark = selectedClass <= 5 ? 20 : 30;
    const complete = hasMarksInput(updated.written) && hasMarksInput(updated.oral);
    const grade = complete ? calculateGrade(calc.converted_sa, maxMark) : undefined;

    setMarksGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...updated,
        calculatedSA: calc,
        converted: complete ? calc.converted_sa : undefined,
        grade,
        hasSavedMark: false,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Handlers for independent standards configuration
  const handleAct1CountChange = (newCount: number) => {
    setStandardsCountAct1(newCount);
    setMarksGrid((prev) => {
      const next: Record<string, any> = {};
      Object.keys(prev).forEach((id) => {
        const current = prev[id] || {};
        const oldAct1 = current.act1 || [];
        const maxPerStd = 15 / newCount;
        const newAct1 = Array.from({ length: newCount }, (_, i) =>
          oldAct1[i] !== undefined && hasMarksInput(oldAct1[i])
            ? Math.min(maxPerStd, Number(oldAct1[i]))
            : ''
        );
        const act2 = current.act2 || Array(standardsCountAct2).fill('');
        const test = hasMarksInput(current.sadhana) ? Number(current.sadhana) : '';
        const calc = calculateHighSchoolFA(newAct1.map(Number), newCount, act2.map(Number), standardsCountAct2, Number(test));
        const complete = isHighSchoolFaComplete(
          { ...current, act1: newAct1, act2, sadhana: test },
          newCount,
          standardsCountAct2
        );
        next[id] = {
          ...current,
          act1: newAct1,
          calculatedHSFA: calc,
          total_fa: complete ? calc.total_fa : undefined,
          grade: complete ? calculateGrade(calc.total_fa, 50, selectedClass) : undefined,
          hasSavedMark: false,
        };
      });
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleAct2CountChange = (newCount: number) => {
    setStandardsCountAct2(newCount);
    setMarksGrid((prev) => {
      const next: Record<string, any> = {};
      Object.keys(prev).forEach((id) => {
        const current = prev[id] || {};
        const act1 = current.act1 || Array(standardsCountAct1).fill('');
        const oldAct2 = current.act2 || [];
        const maxPerStd = 15 / newCount;
        const newAct2 = Array.from({ length: newCount }, (_, i) =>
          oldAct2[i] !== undefined && hasMarksInput(oldAct2[i])
            ? Math.min(maxPerStd, Number(oldAct2[i]))
            : ''
        );
        const test = hasMarksInput(current.sadhana) ? Number(current.sadhana) : '';
        const calc = calculateHighSchoolFA(act1.map(Number), standardsCountAct1, newAct2.map(Number), newCount, Number(test));
        const complete = isHighSchoolFaComplete(
          { ...current, act1, act2: newAct2, sadhana: test },
          standardsCountAct1,
          newCount
        );
        next[id] = {
          ...current,
          act2: newAct2,
          calculatedHSFA: calc,
          total_fa: complete ? calc.total_fa : undefined,
          grade: complete ? calculateGrade(calc.total_fa, 50, selectedClass) : undefined,
          hasSavedMark: false,
        };
      });
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Handle High School 9-10 FA change
  const handleHighSchoolFAChange = (
    studentId: string,
    activityType: 'act1' | 'act2',
    stdIndex: number,
    val: string
  ) => {
    const count = activityType === 'act1' ? standardsCountAct1 : standardsCountAct2;
    const maxPerStd = 15 / count;
    const num = val === '' ? 0 : Math.min(maxPerStd, Math.max(0, Number(val)));

    const current = marksGrid[studentId] || {};
    const currentAct = current[activityType] || [];
    const actArr = currentAct.length === count ? [...currentAct] : Array(count).fill('');
    actArr[stdIndex] = val === '' ? '' : num;

    const test = hasMarksInput(current.sadhana) ? Number(current.sadhana) : '';
    const act1Arr = activityType === 'act1' ? actArr : current.act1 || Array(standardsCountAct1).fill('');
    const act2Arr = activityType === 'act2' ? actArr : current.act2 || Array(standardsCountAct2).fill('');

    const calc = calculateHighSchoolFA(act1Arr.map(Number), standardsCountAct1, act2Arr.map(Number), standardsCountAct2, Number(test));
    const updated = { ...current, [activityType]: actArr, act1: act1Arr, act2: act2Arr, sadhana: test };
    const complete = isHighSchoolFaComplete(updated, standardsCountAct1, standardsCountAct2);
    const grade = complete ? calculateGrade(calc.total_fa, 50, selectedClass) : undefined;

    setMarksGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...updated,
        [activityType]: actArr,
        calculatedHSFA: calc,
        total_fa: complete ? calc.total_fa : undefined,
        grade,
        hasSavedMark: false,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Handle High School Test change
  const handleHighSchoolTestChange = (studentId: string, val: string) => {
    const num = val === '' ? 0 : Math.min(20, Math.max(0, Number(val)));
    const current = marksGrid[studentId] || {};
    const act1Arr = current.act1 || Array(standardsCountAct1).fill('');
    const act2Arr = current.act2 || Array(standardsCountAct2).fill('');

    const calc = calculateHighSchoolFA(act1Arr.map(Number), standardsCountAct1, act2Arr.map(Number), standardsCountAct2, num);
    const complete = isHighSchoolFaComplete(
      { ...current, act1: act1Arr, act2: act2Arr, sadhana: val === '' ? '' : num },
      standardsCountAct1,
      standardsCountAct2
    );
    const grade = complete ? calculateGrade(calc.total_fa, 50, selectedClass) : undefined;

    setMarksGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...current,
        sadhana: val === '' ? '' : num,
        calculatedHSFA: calc,
        total_fa: complete ? calc.total_fa : undefined,
        grade,
        hasSavedMark: false,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Handle High School SA change
  const handleHighSchoolSAChange = (studentId: string, val: string) => {
    const isFirstLang = selectedSubject.includes('First Language');
    const maxAllowed = isFirstLang ? 100 : 80;
    const num = val === '' ? 0 : Math.min(maxAllowed, Math.max(0, Number(val)));

    const current = marksGrid[studentId] || {};
    const grade = val === '' ? undefined : calculateGrade(num, maxAllowed);

    setMarksGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...current,
        sa_marks: val === '' ? '' : num,
        grade,
        hasSavedMark: false,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // GENERATE STRUCTURED MARKS EXPORT DATA FOR EXCEL & PDF
  const getMarksExportData = () => {
    const isKn = language === 'kn';
    const isHighSchool = selectedClass >= 9;
    const isSA = selectedAssessment === 'SA1' || selectedAssessment === 'SA2';

    let headers: string[] = [];
    const rows: (string | number)[][] = [];

    if (isHighSchool) {
      if (isSA) {
        headers = [
          isKn ? 'ಕ್ರ.ಸಂ.' : 'Sl No',
          isKn ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು' : 'Student Name',
          'SATS No',
          isKn ? 'ದಾಖಲಾತಿ ಸಂಖ್ಯೆ' : 'Admission No',
          isKn ? 'ಎಸ್‌ಎ ಅಂಕಗಳು' : 'SA Marks',
          isKn ? 'ಗ್ರೇಡ್' : 'Grade',
        ];
      } else {
        const act1Headers = Array.from({ length: standardsCountAct1 }, (_, i) => `Act 1 C${i + 1}`);
        const act2Headers = Array.from({ length: standardsCountAct2 }, (_, i) => `Act 2 C${i + 1}`);
        headers = [
          isKn ? 'ಕ್ರ.ಸಂ.' : 'Sl No',
          isKn ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು' : 'Student Name',
          'SATS No',
          isKn ? 'ದಾಖಲಾತಿ ಸಂಖ್ಯೆ' : 'Admission No',
          ...act1Headers,
          isKn ? 'ಚಟುವಟಿಕೆ 1 ಒಟ್ಟು' : 'Act 1 Total',
          ...act2Headers,
          isKn ? 'ಚಟುವಟಿಕೆ 2 ಒಟ್ಟು' : 'Act 2 Total',
          isKn ? 'ಸಾಧನಾ ಪರೀಕ್ಷೆ /20' : 'Sadhana Test /20',
          isKn ? 'ಒಟ್ಟು ಎಫ್‌ಎ /50' : 'Total FA /50',
          isKn ? 'ಗ್ರೇಡ್' : 'Grade',
        ];
      }
    } else {
      if (isSA) {
        headers = [
          isKn ? 'ಕ್ರ.ಸಂ.' : 'Sl No',
          isKn ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು' : 'Student Name',
          'SATS No',
          isKn ? 'ದಾಖಲಾತಿ ಸಂಖ್ಯೆ' : 'Admission No',
          isKn ? 'ಲಿಖಿತ' : 'Written',
          isKn ? 'ಮೌಖಿಕ' : 'Oral',
          isKn ? 'ಒಟ್ಟು /50' : 'Raw Total /50',
          isKn ? 'ಪರಿವರ್ತಿತ ಅಂಕ' : 'Converted',
          isKn ? 'ಗ್ರೇಡ್' : 'Grade',
        ];
      } else {
        headers = [
          isKn ? 'ಕ್ರ.ಸಂ.' : 'Sl No',
          isKn ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು' : 'Student Name',
          'SATS No',
          isKn ? 'ದಾಖಲಾತಿ ಸಂಖ್ಯೆ' : 'Admission No',
          isKn ? 'ಗೃಹಪಾಠ' : 'Homework',
          isKn ? 'ಘಟಕ ಪರೀಕ್ಷೆ' : 'Unit Test',
          isKn ? 'ಯೋಜನಾ ಕಾರ್ಯ' : 'Project',
          isKn ? 'ಚಟುವಟಿಕೆ' : 'Activity',
          isKn ? 'ಭಾಗವಹಿಸುವಿಕೆ' : 'Participation',
          isKn ? 'ಒಟ್ಟು /50' : 'Raw Total /50',
          isKn ? 'ಪರಿವರ್ತಿತ ಅಂಕ' : 'Converted',
          isKn ? 'ಗ್ರೇಡ್' : 'Grade',
        ];
      }
    }

    activeStudents.forEach((st, idx) => {
      const row = marksGrid[st.id] || {};
      const stName = getStudentName(st, language);

      if (isHighSchool) {
        if (isSA) {
          const saMark = row.sa_marks ?? '';
          const maxSA = selectedSubject.includes('First Language') ? 100 : 80;
          const grade = hasMarksInput(saMark) ? calculateGrade(Number(saMark), maxSA, selectedClass) : '-';
          rows.push([idx + 1, stName, st.sats_no || '-', st.admission_no, saMark, grade]);
        } else {
          const act1Arr: any[] = Array.isArray(row.act1) ? row.act1 : [];
          const act2Arr: any[] = Array.isArray(row.act2) ? row.act2 : [];
          const act1Vals = Array.from({ length: standardsCountAct1 }, (_, i) => act1Arr[i] ?? '');
          const act2Vals = Array.from({ length: standardsCountAct2 }, (_, i) => act2Arr[i] ?? '');
          const act1Tot = act1Vals.reduce((a, b) => a + (Number(b) || 0), 0);
          const act2Tot = act2Vals.reduce((a, b) => a + (Number(b) || 0), 0);
          const sadhana = row.sadhana ?? '';
          const totalFa = row.total_fa ?? (Number(act1Tot) + Number(act2Tot) + (Number(sadhana) || 0));
          const grade = hasMarksInput(totalFa) ? calculateGrade(Number(totalFa), 50, selectedClass) : '-';

          rows.push([
            idx + 1,
            stName,
            st.sats_no || '-',
            st.admission_no,
            ...act1Vals,
            act1Tot,
            ...act2Vals,
            act2Tot,
            sadhana,
            totalFa,
            grade,
          ]);
        }
      } else {
        if (isSA) {
          const w = row.written ?? '';
          const o = row.oral ?? '';
          const raw = row.raw_total ?? (Number(w) || 0) + (Number(o) || 0);
          const maxSA = selectedClass <= 5 ? 20 : 30;
          const conv = row.converted ?? Math.round((Number(raw) / 50) * maxSA);
          const grade = hasMarksInput(conv) ? calculateGrade(Number(conv), maxSA, selectedClass) : '-';
          rows.push([idx + 1, stName, st.sats_no || '-', st.admission_no, w, o, raw, conv, grade]);
        } else {
          const gruha = row.gruha ?? '';
          const ghataka = row.ghataka ?? '';
          const yojana = row.yojana ?? '';
          const chatu = row.chatu ?? '';
          const bhaga = row.bhaga ?? '';
          const raw = row.raw_total ?? ((Number(gruha) || 0) + (Number(ghataka) || 0) + (Number(yojana) || 0) + (Number(chatu) || 0) + (Number(bhaga) || 0));
          const maxFA = selectedClass <= 5 ? 15 : 10;
          const conv = row.converted ?? Math.round((Number(raw) / 50) * maxFA);
          const grade = hasMarksInput(conv) ? calculateGrade(Number(conv), maxFA, selectedClass) : '-';
          rows.push([idx + 1, stName, st.sats_no || '-', st.admission_no, gruha, ghataka, yojana, chatu, bhaga, raw, conv, grade]);
        }
      }
    });

    return { headers, rows };
  };

  // EXPORT ENTERED MARKS TO EXCEL (.xlsx)
  const handleExportMarksExcel = () => {
    const { headers, rows } = getMarksExportData();
    const sheetData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    const sheetName = `${selectedAssessment}_Marks`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const fileName = `${currentSchool?.name?.replace(/\s+/g, '_')}_Class${selectedClass}_${selectedSection}_${selectedSubject.replace(/\s+/g, '_')}_${selectedAssessment}_${academicYear}.xlsx`;
    downloadExcelFile(wb, fileName);
  };

  // EXPORT ENTERED MARKS TO OFFICIAL PRINTABLE PDF (A4 Landscape)
  const handleExportMarksPDF = () => {
    if (!currentSchool) return;
    const { headers, rows } = getMarksExportData();
    printMarksEntryRegister(
      currentSchool,
      selectedClass,
      selectedSection,
      selectedSubject,
      selectedAssessment,
      academicYear,
      activeStudents,
      headers,
      rows,
      language as 'kn' | 'en'
    );
  };

  // SAVE ALL MARKS
  const handleSaveAll = async () => {
    if (!currentSchool) return;
    setIsSaving(true);

    try {
      let skippedIncomplete = 0;
      let savedCount = 0;
      for (const st of activeStudents) {
        const row = marksGrid[st.id];
        if (!row) continue;

        const complete = selectedClass >= 9
          ? selectedAssessment === 'SA1' || selectedAssessment === 'SA2'
            ? hasMarksInput(row.sa_marks)
            : isHighSchoolFaComplete(row, standardsCountAct1, standardsCountAct2)
          : selectedAssessment === 'SA1' || selectedAssessment === 'SA2'
            ? hasMarksInput(row.written) && hasMarksInput(row.oral)
            : ['gruha', 'ghataka', 'yojana', 'chatu', 'bhaga'].every((key) => hasMarksInput(row[key]));
        if (!complete && !row.hasSavedMark) {
          skippedIncomplete++;
          continue;
        }

        let totalMarks = 0;
        let maxMarks = 50;

        if (selectedClass <= 5) {
          if (selectedAssessment === 'SA1' || selectedAssessment === 'SA2') {
            maxMarks = 20;
            totalMarks = row.converted ?? row.calculatedSA?.converted_sa ?? 0;
          } else {
            maxMarks = 15;
            totalMarks = row.converted ?? row.calculatedFA?.converted_fa ?? 0;
          }
        } else if (selectedClass <= 8) {
          if (selectedAssessment === 'SA1' || selectedAssessment === 'SA2') {
            maxMarks = 30;
            totalMarks = row.converted ?? row.calculatedSA?.converted_sa ?? 0;
          } else {
            maxMarks = 10;
            totalMarks = row.converted ?? row.calculatedFA?.converted_fa ?? 0;
          }
        } else {
          // High School 9-10
          if (selectedAssessment === 'SA1' || selectedAssessment === 'SA2') {
            maxMarks = selectedSubject.includes('First Language') ? 100 : 80;
            totalMarks = Number(row.sa_marks) || 0;
          } else {
            maxMarks = 50;
            totalMarks = row.total_fa ?? row.calculatedHSFA?.total_fa ?? 0;
          }
        }

        const grade = calculateGrade(totalMarks, maxMarks);

        await saveAssessmentMark({
          school_id: currentSchool.id,
          academic_year: academicYear,
          student_id: st.id,
          class_number: selectedClass,
          section: selectedSection,
          subject_name: selectedSubject,
          assessment_type: selectedAssessment,
          primary_fa: row.calculatedFA,
          primary_sa: row.calculatedSA,
          high_school_fa: row.calculatedHSFA,
          high_school_sa: Number(row.sa_marks) || undefined,
          total_marks: totalMarks,
          max_marks: maxMarks,
          grade,
          attendance_count: Number(row.attendance) || 0,
          updated_by: currentUser?.name || 'Faculty',
        });
        savedCount++;
      }

      setHasUnsavedChanges(skippedIncomplete > 0);
      if (savedCount > 0) setLastSavedTime(new Date().toLocaleTimeString());
      const noMarksSaved = savedCount === 0;
      triggerSaveNotification(
        noMarksSaved
          ? language === 'kn' ? 'ಯಾವುದೇ ಅಂಕಗಳನ್ನು ಉಳಿಸಲಾಗಿಲ್ಲ' : 'No Marks Saved'
          : language === 'kn' ? 'ಅಂಕಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!' : 'Marks Saved Successfully!',
        noMarksSaved
          ? language === 'kn'
            ? `ಪೂರ್ಣ ಅಂಕಗಳಿಲ್ಲದ ${skippedIncomplete} ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಬಿಟ್ಟುಬಿಡಲಾಗಿದೆ. ಉಳಿಸುವ ಮೊದಲು ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ಅಂಕಗಳನ್ನು ನಮೂದಿಸಿ.`
            : `${skippedIncomplete} student(s) were skipped because their marks are incomplete. Enter all required marks before saving.`
          : language === 'kn'
            ? `ತರಗತಿ ${selectedClass}-${selectedSection} (${selectedSubject}) ಅಂಕಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ.${skippedIncomplete ? ` ಪೂರ್ಣ ಅಂಕಗಳಿಲ್ಲದ ${skippedIncomplete} ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಬಿಟ್ಟುಬಿಡಲಾಗಿದೆ.` : ''}`
            : `Marks for Class ${selectedClass}-${selectedSection} (${selectedSubject}) were saved.${skippedIncomplete ? ` Skipped ${skippedIncomplete} student(s) without complete marks.` : ''}`,
        noMarksSaved ? 'error' : 'success'
      );
    } catch (err) {
      triggerSaveNotification(
        language === 'kn' ? 'ಅಂಕ ಉಳಿಸುವಲ್ಲಿ ದೋಷ' : 'Error Saving Marks',
        language === 'kn' ? 'ಅಂಕಗಳನ್ನು ಉಳಿಸುವಾಗ ಅನಿರೀಕ್ಷಿತ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.' : 'An unexpected error occurred while saving marks. Please retry.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickFillCoGrades = (grade: GradeValue, studentList?: any[]) => {
    const targetList = studentList || (activeStudents.length > 0 ? activeStudents : schoolActiveStudents);
    const updated = { ...coGrades };
    targetList.forEach((st) => {
      updated[st.id] = { daihika: grade, moulya: grade, kaaryanubhava: grade, kala: grade };
    });
    setCoGrades(updated);
    setHasUnsavedChanges(true);
  };

  const handleSaveCoCurricular = async (studentList?: any[]) => {
    if (!currentSchool) return;
    setIsSaving(true);
    let count = 0;
    const targetStudents = studentList || (activeStudents.length > 0 ? activeStudents : schoolActiveStudents);
    for (const st of targetStudents) {
      const g = coGrades[st.id] || { daihika: 'A', moulya: 'A+', kaaryanubhava: 'A', kala: 'A' };
      await saveCoCurricularGrade({
        school_id: currentSchool.id,
        student_id: st.id,
        academic_year: academicYear,
        class_number: st.class_number,
        daihika_arogya: g.daihika,
        moulya: g.moulya,
        kaaryanubhava: g.kaaryanubhava,
        kala: g.kala,
        updated_by: currentUser?.name || 'School Admin',
      });
      count++;
    }
    setIsSaving(false);
    setHasUnsavedChanges(false);
    setLastSavedTime(new Date().toLocaleTimeString());
    setCoCurricularModalOpen(false);
    triggerSaveNotification(
      language === 'kn' ? 'ಪಠ್ಯೇತರ ಚಟುವಟಿಕೆಗಳ ಗ್ರೇಡ್ ಉಳಿಸಲಾಗಿದೆ!' : 'Co-Curricular Grades Saved!',
      language === 'kn'
        ? `${count} ವಿದ್ಯಾರ್ಥಿಗಳ ಪಠ್ಯೇತರ ಗ್ರೇಡ್‌ಗಳನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ ಮತ್ತು ಕ್ಲೌಡ್ ಸಿಂಕ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.`
        : `Co-curricular grades successfully saved for ${count} student(s) and queued for Cloud sync.`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Prominent, readable Save Notification Banner (stays visible for 6 full seconds) */}
      {saveNotification?.show && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-500 shadow-2xl animate-in slide-in-from-top-4 duration-300 flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {saveNotification.title}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Saved (6s)
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {saveNotification.message}
            </p>
            {saveNotification.type === 'success' && (
              <div className="mt-2.5 pt-2 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportMarksExcel}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportMarksPDF}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  PDF / Print
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setSaveNotification(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title & Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#16284F] dark:text-[#2563EB] font-bold text-xs uppercase tracking-wider">
            <ClipboardList className="w-4 h-4" />
            {language === 'kn' ? 'ವಿದ್ಯಾಲಯ ಓಎಸ್ ಸಿಸಿಇ ಮೌಲ್ಯಮಾಪನ ಘಟಕ' : 'Shikshaka Sathi CCE Evaluation Module'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#243449] dark:text-[#F1F5F9] mt-1">
            {t.marks.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">{t.marks.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCoCurricularModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E3EBF3] dark:bg-[#202F42] text-[#16284F] dark:text-[#2563EB] font-semibold text-xs border border-[#D8E1EA] dark:border-[#2A3B50] hover:bg-[#D8E1EA] transition-colors cursor-pointer"
          >
            <Award className="w-4 h-4 text-[#3977A8] dark:text-[#4B8DC2]" />
            {t.marks.coCurricularButton}
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? t.marks.saving : t.marks.saveAll}
          </button>

          {/* DOWNLOAD / EXPORT BUTTONS FOR ENTERED MARKS */}
          <button
            type="button"
            onClick={handleExportMarksExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs shadow-sm transition-all cursor-pointer"
            title={language === 'kn' ? 'ನಮೂದಿಸಿದ ಅಂಕಗಳನ್ನು ಎಕ್ಸೆಲ್ ರೂಪದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' : 'Download entered marks in Excel format (.xlsx)'}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{language === 'kn' ? 'ಎಕ್ಸೆಲ್ ಡೌನ್‌ಲೋಡ್' : 'Download Excel'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarksPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs shadow-sm transition-all cursor-pointer"
            title={language === 'kn' ? 'ನಮೂದಿಸಿದ ಅಂಕಗಳನ್ನು ಅಧಿಕೃತ ಪಿಡಿಎಫ್ ರೂಪದಲ್ಲಿ ಮುದ್ರಿಸಿ / ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' : 'Print / Download entered marks in PDF format'}
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>{language === 'kn' ? 'ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Auto-save & Status Notice */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#2563EB]" />
          <span className="font-semibold text-[#243449] dark:text-[#F1F5F9]">{t.marks.autoSaveEnabled}</span>
          <span className="text-[#8492A6]">•</span>
          <span className="text-[#64748B] dark:text-[#94A3B8]">
            {t.marks.lastSaved}: <strong className="text-[#243449] dark:text-[#F1F5F9]">{lastSavedTime}</strong>
          </span>
        </div>

        {hasUnsavedChanges && (
          <div className="flex items-center gap-1 text-[#D6A13D] font-bold text-[11px] animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{language === 'kn' ? 'ಉಳಿಸದ ಸ್ಥಳೀಯ ಬದಲಾವಣೆಗಳಿವೆ' : 'Unsaved local changes'}</span>
          </div>
        )}
      </div>

      {/* Mode Switcher: Curricular Marks vs Co-Curricular Grading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-[#E3EBF3] dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEvaluationMode('CURRICULAR')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              evaluationMode === 'CURRICULAR'
                ? 'bg-[#16284F] text-white shadow-sm'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#243449] dark:hover:text-[#F1F5F9]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {language === 'kn' ? 'ಪಠ್ಯ ವಿಷಯಗಳ ಅಂಕ ನಮೂದು (FA & SA)' : 'Curricular Subject Marks (FA & SA)'}
          </button>
          <button
            type="button"
            onClick={() => setEvaluationMode('CO_CURRICULAR')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              evaluationMode === 'CO_CURRICULAR'
                ? 'bg-[#16284F] text-white shadow-sm'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#243449] dark:hover:text-[#F1F5F9]'
            }`}
          >
            <Award className="w-4 h-4" />
            {language === 'kn' ? 'ಸಹಪಠ್ಯ ಚಟುವಟಿಕೆಗಳ ಗ್ರೇಡಿಂಗ್ (CCE)' : `Co-Curricular CCE Grading (${activeStudents.length} Students)`}
          </button>
        </div>

        {evaluationMode === 'CO_CURRICULAR' && (
          <div className="flex items-center gap-1.5 px-2 text-xs">
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">Quick Fill All:</span>
            {(['A+', 'A', 'B+', 'B'] as GradeValue[]).map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => handleQuickFillCoGrades(grade)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-[#D8E1EA] dark:border-slate-700 text-[#16284F] dark:text-[#2563EB] font-bold text-[11px] hover:bg-[#16284F] hover:text-white transition-all cursor-pointer shadow-xs"
              >
                {grade}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Students Warning & One-Click Class Switcher */}
      {activeStudents.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600" />
              {language === 'kn'
                ? `ತರಗತಿ ${selectedClass}-${selectedSection} ರಲ್ಲಿ ದಾಖಲಾದ ಸಕ್ರಿಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಲ್ಲ`
                : `No active students currently enrolled in Class ${selectedClass}-${selectedSection}`}
            </div>
            <p className="text-amber-700 dark:text-amber-300 mt-0.5 text-[11px]">
              {language === 'kn'
                ? 'ವಿದ್ಯಾರ್ಥಿಗಳು ದಾಖಲಾಗಿರುವ ಕೆಳಗಿನ ತರಗತಿಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ:'
                : 'Click any class below with active enrolled students to start grading immediately:'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {enrolledClasses.map((clsSec) => {
              const [cls, sec] = clsSec.split('-');
              const count = state.students.filter(
                (s) => s.school_id === currentSchool?.id && s.class_number === Number(cls) && s.section === sec && s.status === 'ACTIVE'
              ).length;
              return (
                <button
                  key={clsSec}
                  onClick={() => {
                    setSelectedClass(Number(cls));
                    setSelectedSection(sec);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-[#16284F] dark:text-[#2563EB] font-bold hover:bg-[#16284F] hover:text-white transition-all shadow-sm cursor-pointer"
                >
                  Class {cls}-{sec} ({count} {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಗಳು' : 'students'})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Workflow Selectors */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Class */}
          <div>
            <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">1. {t.marks.class}</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                const c = Number(e.target.value);
                setSelectedClass(c);
                const subjs = getStandardSubjects(c);
                setSelectedSubject(subjs[0]);
              }}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-bold cursor-pointer text-[#243449] dark:text-[#F1F5F9]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                <option key={c} value={c}>
                  {language === 'kn'
                    ? `ತರಗತಿ ${c} (${c <= 5 ? 'ಪ್ರಾಥಮಿಕ 1-5' : c <= 8 ? 'ಹಿರಿಯ ಪ್ರಾಥಮಿಕ 6-8' : 'ಪ್ರೌಢಶಾಲೆ 9-10'})`
                    : `Class ${c} (${c <= 5 ? 'Primary 1-5' : c <= 8 ? 'Middle 6-8' : 'High School 9-10'})`}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">2. {t.marks.section}</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-bold cursor-pointer text-[#243449] dark:text-[#F1F5F9]"
            >
              <option value="A">{language === 'kn' ? 'ವಿಭಾಗ A' : 'Section A'}</option>
              <option value="B">{language === 'kn' ? 'ವಿಭಾಗ B' : 'Section B'}</option>
              <option value="C">{language === 'kn' ? 'ವಿಭಾಗ C' : 'Section C'}</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">3. {t.marks.subject}</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-bold cursor-pointer truncate text-[#243449] dark:text-[#F1F5F9]"
            >
              {availableSubjects.map((s) => (
                <option key={s} value={s}>
                  {getSubjectName(s, language)}
                </option>
              ))}
            </select>
          </div>

          {/* Assessment */}
          <div>
            <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">4. {t.marks.assessment}</label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value as AssessmentType)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-[#3977A8] dark:text-[#4B8DC2] cursor-pointer"
            >
              <option value="FA1">{language === 'kn' ? 'FA1 (ರಚನಾತ್ಮಕ 1)' : 'FA1 (Formative 1)'}</option>
              <option value="FA2">{language === 'kn' ? 'FA2 (ರಚನಾತ್ಮಕ 2)' : 'FA2 (Formative 2)'}</option>
              <option value="SA1">{language === 'kn' ? 'SA1 (ಸಂಕಲನಾತ್ಮಕ 1 / ಮಧ್ಯವಾರ್ಷಿಕ)' : 'SA1 (Summative 1 / Midterm)'}</option>
              <option value="FA3">{language === 'kn' ? 'FA3 (ರಚನಾತ್ಮಕ 3)' : 'FA3 (Formative 3)'}</option>
              <option value="FA4">{language === 'kn' ? 'FA4 (ರಚನಾತ್ಮಕ 4)' : 'FA4 (Formative 4)'}</option>
              <option value="SA2">{language === 'kn' ? 'SA2 (ಸಂಕಲನಾತ್ಮಕ 2 / ವಾರ್ಷಿಕ)' : 'SA2 (Summative 2 / Annual)'}</option>
            </select>
          </div>

          {/* High School Configurable Standards (Activity 1 and Activity 2 independent) */}
          {selectedClass >= 9 && selectedAssessment !== 'SA1' && selectedAssessment !== 'SA2' && (
            <>
              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">
                  5. {language === 'kn' ? 'ಚಟುವಟಿಕೆ 1 ಮಾನಕಗಳು' : 'Act 1 Standards'}
                </label>
                <select
                  value={standardsCountAct1}
                  onChange={(e) => handleAct1CountChange(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] text-xs font-bold font-mono text-[#243449] dark:text-[#F1F5F9]"
                  title="Standards for Activity 1 (2-5)"
                >
                  <option value={2}>2 {language === 'kn' ? 'ಮಾನಕಗಳು (7.5 ಅಂಕ)' : 'Standards (7.5 ea)'}</option>
                  <option value={3}>3 {language === 'kn' ? 'ಮಾನಕಗಳು (5.0 ಅಂಕ)' : 'Standards (5 ea)'}</option>
                  <option value={4}>4 {language === 'kn' ? 'ಮಾನಕಗಳು (3.75 ಅಂಕ)' : 'Standards (3.75 ea)'}</option>
                  <option value={5}>5 {language === 'kn' ? 'ಮಾನಕಗಳು (3.0 ಅಂಕ)' : 'Standards (3 ea)'}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">
                  6. {language === 'kn' ? 'ಚಟುವಟಿಕೆ 2 ಮಾನಕಗಳು' : 'Act 2 Standards'}
                </label>
                <select
                  value={standardsCountAct2}
                  onChange={(e) => handleAct2CountChange(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] text-xs font-bold font-mono text-[#243449] dark:text-[#F1F5F9]"
                  title="Standards for Activity 2 (2-5)"
                >
                  <option value={2}>2 {language === 'kn' ? 'ಮಾನಕಗಳು (7.5 ಅಂಕ)' : 'Standards (7.5 ea)'}</option>
                  <option value={3}>3 {language === 'kn' ? 'ಮಾನಕಗಳು (5.0 ಅಂಕ)' : 'Standards (5 ea)'}</option>
                  <option value={4}>4 {language === 'kn' ? 'ಮಾನಕಗಳು (3.75 ಅಂಕ)' : 'Standards (3.75 ea)'}</option>
                  <option value={5}>5 {language === 'kn' ? 'ಮಾನಕಗಳು (3.0 ಅಂಕ)' : 'Standards (3 ea)'}</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Dynamic Formula Explanation Banner */}
        <div className="p-3.5 rounded-xl bg-[#E3EBF3] dark:bg-[#202F42] border border-[#D8E1EA] dark:border-[#2A3B50] text-xs text-[#243449] dark:text-[#F1F5F9] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#3977A8] dark:text-[#4B8DC2] mt-0.5 flex-shrink-0" />
          <div className="leading-relaxed">
            {selectedClass <= 5 && (
              <span>
                <strong>{language === 'kn' ? 'ತರಗತಿ 1-5 ಸೂತ್ರ:' : 'Classes 1–5 Formula:'}</strong>{' '}
                {selectedAssessment === 'SA1' || selectedAssessment === 'SA2'
                  ? (language === 'kn' ? 'ಎಸ್‌ಎ = ಲಿಖಿತ (/40) + ಮೌಖಿಕ (/10) → ಒಟ್ಟು 50 ನ್ನು ಗರಿಷ್ಠ 20 ಅಂಕಗಳಿಗೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತದೆ.' : 'SA = Written (/40) + Oral (/10) → Raw 50 converted to Max 20 marks.')
                  : (language === 'kn' ? 'ಎಫ್‌ಎ = ಗೃಹಪಾಠ (10) + ಘಟಕ ಪರೀಕ್ಷೆ (10) + ಯೋಜನಾ ಕಾರ್ಯ (10) + ಚಟುವಟಿಕೆ (10) + ಭಾಗವಹಿಸುವಿಕೆ (10) → ಒಟ್ಟು 50 ನ್ನು ಗರಿಷ್ಠ 15 ಅಂಕಗಳಿಗೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತದೆ.' : 'FA = Gruha Pata (10) + Unit Test (10) + Project (10) + Activity (10) + Participation (10) → Raw 50 converted to Max 15 marks.')}
              </span>
            )}
            {selectedClass >= 6 && selectedClass <= 8 && (
              <span>
                <strong>{language === 'kn' ? 'ತರಗತಿ 6-8 ಸೂತ್ರ:' : 'Classes 6–8 Formula:'}</strong>{' '}
                {selectedAssessment === 'SA1' || selectedAssessment === 'SA2'
                  ? (language === 'kn' ? 'ಎಸ್‌ಎ = ಲಿಖಿತ (/40) + ಮೌಖಿಕ (/10) → ಒಟ್ಟು 50 ನ್ನು ಗರಿಷ್ಠ 30 ಅಂಕಗಳಿಗೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತದೆ.' : 'SA = Written (/40) + Oral (/10) → Raw 50 converted to Max 30 marks.')
                  : (language === 'kn' ? 'ಎಫ್‌ಎ = 5 ಘಟಕಗಳು (ಪ್ರತಿಯೊಂದಕ್ಕೂ 10 ಅಂಕ) → ಒಟ್ಟು 50 ನ್ನು ಗರಿಷ್ಠ 10 ಅಂಕಗಳಿಗೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತದೆ.' : 'FA = 5 Components (each 10 marks) → Raw 50 converted to Max 10 marks.')}
              </span>
            )}
            {selectedClass >= 9 && (
              <span>
                <strong>{language === 'kn' ? 'ಪ್ರೌಢಶಾಲೆ 9-10 ಸೂತ್ರ:' : 'Classes 9–10 High School Formula:'}</strong>{' '}
                {selectedAssessment === 'SA1' || selectedAssessment === 'SA2'
                  ? selectedSubject.includes('First Language')
                    ? (language === 'kn' ? 'ಪ್ರಥಮ ಭಾಷೆ ಎಸ್‌ಎ ಗರಿಷ್ಠ: 100 ಅಂಕಗಳು. ಮಧ್ಯವಾರ್ಷಿಕ = SA1 + ((FA1+FA2)*25/100). ವಾರ್ಷಿಕ = SA2 + ((FA1+..+FA4)*25/200) [ಗರಿಷ್ಠ 150].' : 'First Language SA Max: 100 marks. Midterm = SA1 + ((FA1+FA2)*25/100). Annual = SA2 + ((FA1+..+FA4)*25/200) [Max 150].')
                    : (language === 'kn' ? 'ಇತರ ವಿಷಯಗಳು ಎಸ್‌ಎ ಗರಿಷ್ಠ: 80 ಅಂಕಗಳು. ಮಧ್ಯವಾರ್ಷಿಕ = SA1 + ((FA1+FA2)*20/100). ವಾರ್ಷಿಕ = SA2 + ((FA1+..+FA4)*20/200) [ಗರಿಷ್ಠ 120].' : 'Remaining Subjects SA Max: 80 marks. Midterm = SA1 + ((FA1+FA2)*20/100). Annual = SA2 + ((FA1+..+FA4)*20/200) [Max 120].')
                  : (language === 'kn' ? `ಎಫ್‌ಎ = ಚಟುವಟಿಕೆ 1 (15 ಅಂಕ / ${standardsCountAct1} ಮಾನಕಗಳು) + ಚಟುವಟಿಕೆ 2 (15 ಅಂಕ / ${standardsCountAct2} ಮಾನಕಗಳು) + ಸಾಧನಾ ಪರೀಕ್ಷೆ (20 ಅಂಕ) = ಒಟ್ಟು 50 ಅಂಕಗಳು.` : `FA = Activity 1 (15 marks / ${standardsCountAct1} standards) + Activity 2 (15 marks / ${standardsCountAct2} standards) + Test (20 marks) = Total 50 marks.`)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CONDITIONAL TABLE: CO-CURRICULAR REGISTER vs SPREADSHEET-STYLE MARKS TABLE */}
      {evaluationMode === 'CO_CURRICULAR' ? (
        <div className="rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E1EA] dark:border-[#2A3B50] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#243449] dark:text-[#F1F5F9] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#16284F] dark:text-[#2563EB]" />
                {language === 'kn'
                  ? `ಸಹಪಠ್ಯ ಚಟುವಟಿಕೆಗಳ ಮೌಲ್ಯಮಾಪನ — ತರಗತಿ ${selectedClass}-${selectedSection}`
                  : `Co-Curricular CCE Evaluation Register — Class ${selectedClass}-${selectedSection}`}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                {language === 'kn'
                  ? 'ಕರ್ನಾಟಕ ಸಿಸಿಇ ನಿಯಮಾನುಸಾರ 4 ಕಡ್ಡಾಯ ಕ್ಷೇತ್ರಗಳು: ದೈಹಿಕ & ಆರೋಗ್ಯ ಶಿಕ್ಷಣ, ಮೌಲ್ಯ ಶಿಕ್ಷಣ, ಕಾರ್ಯಾನುಭವ, ಮತ್ತು ಕಲಾ ಶಿಕ್ಷಣ (A+, A, B+, B, C)'
                  : 'Mandated Karnataka CCE Areas: Daihika & Arogya, Moulya Shikshana, Kaaryanubhava, and Kala Shikshana (Grades: A+, A, B+, B, C)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveCoCurricular(activeStudents)}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : `Save Grades (${activeStudents.length} Students)`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#EDF2F7] dark:bg-[#1E2B3C] text-[#243449] dark:text-[#F1F5F9] font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                    {language === 'kn' ? 'ಕ್ರ.ಸಂ.' : 'Sl'}
                  </th>
                  <th className="py-3 px-4 w-48 border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                    {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು' : 'Student Name'}
                  </th>
                  <th className="py-3 px-3 w-28 border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                    {language === 'kn' ? 'ಸ್ಯಾಟ್ಸ್ ಸಂ.' : 'SATS No'}
                  </th>
                  <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] text-[#16284F] dark:text-[#2563EB]">
                    {language === 'kn' ? 'ದೈಹಿಕ & ಆರೋಗ್ಯ' : 'Daihika & Arogya'}
                  </th>
                  <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#EAF0F6] dark:bg-[#1A2636] text-[#3977A8] dark:text-[#4B8DC2]">
                    {language === 'kn' ? 'ಮೌಲ್ಯ ಶಿಕ್ಷಣ' : 'Moulya Shikshana'}
                  </th>
                  <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] text-[#16284F] dark:text-[#2563EB]">
                    {language === 'kn' ? 'ಕಾರ್ಯಾನುಭವ' : 'Kaaryanubhava'}
                  </th>
                  <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#EAF0F6] dark:bg-[#1A2636] text-[#3977A8] dark:text-[#4B8DC2]">
                    {language === 'kn' ? 'ಕಲಾ ಶಿಕ್ಷಣ' : 'Kala Shikshana'}
                  </th>
                  <th className="py-3 px-3 text-center">
                    {language === 'kn' ? 'ದಾಖಲೆ ಸ್ಥಿತಿ' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E1EA] dark:divide-[#2A3B50]">
                {activeStudents.map((st, idx) => {
                  const g = coGrades[st.id] || { daihika: 'A', moulya: 'A+', kaaryanubhava: 'A', kala: 'A' };
                  const gradeOptions: GradeValue[] = ['A+', 'A', 'B+', 'B', 'C'];

                  return (
                    <tr key={st.id} className="hover:bg-[#F3F6F9] dark:hover:bg-[#1E2B3C] transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-[#8492A6] border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#243449] dark:text-[#F1F5F9] border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                        <div>{getStudentName(st, language)}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">{st.admission_no}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#64748B] dark:text-[#94A3B8] border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                        {st.sats_no}
                      </td>

                      {/* Daihika & Arogya */}
                      <td className="py-2.5 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                        <div className="inline-flex rounded-lg border border-[#D8E1EA] dark:border-[#2A3B50] p-0.5 bg-[#F8FAFC] dark:bg-[#111C28]">
                          {gradeOptions.map((gr) => (
                            <button
                              key={gr}
                              type="button"
                              onClick={() => {
                                setCoGrades((prev) => ({
                                  ...prev,
                                  [st.id]: { ...g, daihika: gr },
                                }));
                                setHasUnsavedChanges(true);
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                g.daihika === gr
                                  ? 'bg-[#16284F] text-white shadow-xs'
                                  : 'text-[#64748B] hover:bg-slate-200 dark:hover:bg-slate-800'
                              }`}
                            >
                              {gr}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Moulya Shikshana */}
                      <td className="py-2.5 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                        <div className="inline-flex rounded-lg border border-[#D8E1EA] dark:border-[#2A3B50] p-0.5 bg-[#F8FAFC] dark:bg-[#111C28]">
                          {gradeOptions.map((gr) => (
                            <button
                              key={gr}
                              type="button"
                              onClick={() => {
                                setCoGrades((prev) => ({
                                  ...prev,
                                  [st.id]: { ...g, moulya: gr },
                                }));
                                setHasUnsavedChanges(true);
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                g.moulya === gr
                                  ? 'bg-[#3977A8] text-white shadow-xs'
                                  : 'text-[#64748B] hover:bg-slate-200 dark:hover:bg-slate-800'
                              }`}
                            >
                              {gr}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Kaaryanubhava */}
                      <td className="py-2.5 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                        <div className="inline-flex rounded-lg border border-[#D8E1EA] dark:border-[#2A3B50] p-0.5 bg-[#F8FAFC] dark:bg-[#111C28]">
                          {gradeOptions.map((gr) => (
                            <button
                              key={gr}
                              type="button"
                              onClick={() => {
                                setCoGrades((prev) => ({
                                  ...prev,
                                  [st.id]: { ...g, kaaryanubhava: gr },
                                }));
                                setHasUnsavedChanges(true);
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                g.kaaryanubhava === gr
                                  ? 'bg-[#16284F] text-white shadow-xs'
                                  : 'text-[#64748B] hover:bg-slate-200 dark:hover:bg-slate-800'
                              }`}
                            >
                              {gr}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Kala Shikshana */}
                      <td className="py-2.5 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                        <div className="inline-flex rounded-lg border border-[#D8E1EA] dark:border-[#2A3B50] p-0.5 bg-[#F8FAFC] dark:bg-[#111C28]">
                          {gradeOptions.map((gr) => (
                            <button
                              key={gr}
                              type="button"
                              onClick={() => {
                                setCoGrades((prev) => ({
                                  ...prev,
                                  [st.id]: { ...g, kala: gr },
                                }));
                                setHasUnsavedChanges(true);
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                g.kala === gr
                                  ? 'bg-[#3977A8] text-white shadow-xs'
                                  : 'text-[#64748B] hover:bg-slate-200 dark:hover:bg-slate-800'
                              }`}
                            >
                              {gr}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#EBF3FC] text-[#2563EB] dark:bg-slate-800 dark:text-[#2563EB] border border-[#2563EB]/20">
                          {language === 'kn' ? 'ನಮೂದಿಸಲಾಗಿದೆ' : 'Recorded'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SPREADSHEET-STYLE MARKS TABLE */
        <div className="rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#EDF2F7] dark:bg-[#1E2B3C] text-[#243449] dark:text-[#F1F5F9] font-bold uppercase text-[10px]">
              {selectedClass >= 9 && selectedAssessment !== 'SA1' && selectedAssessment !== 'SA2' ? (
                <>
                  {/* Top Header Row for High School FA */}
                  <tr>
                    <th rowSpan={2} className="py-3 px-3 w-12 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                      {language === 'kn' ? 'ಕ್ರ.ಸಂ.' : 'Sl'}
                    </th>
                    <th rowSpan={2} className="py-3 px-4 w-52 border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                      {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು' : 'Student Name'}
                    </th>
                    <th rowSpan={2} className="py-3 px-3 w-28 border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                      {language === 'kn' ? 'ಸ್ಯಾಟ್ಸ್ ಸಂ.' : 'SATS No'}
                    </th>
                    <th
                      colSpan={standardsCountAct1}
                      className="py-2.5 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] text-[#16284F] dark:text-[#2563EB] font-bold text-xs"
                    >
                      {language === 'kn' ? 'ಚಟುವಟಿಕೆ 1 (15 ಅಂಕಗಳು)' : 'Activity 1 (15 Marks)'}
                    </th>
                    <th
                      colSpan={standardsCountAct2}
                      className="py-2.5 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#EAF0F6] dark:bg-[#1A2636] text-[#3977A8] dark:text-[#4B8DC2] font-bold text-xs"
                    >
                      {language === 'kn' ? 'ಚಟುವಟಿಕೆ 2 (15 ಅಂಕಗಳು)' : 'Activity 2 (15 Marks)'}
                    </th>
                    <th rowSpan={2} className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                      {language === 'kn' ? 'ಸಾಧನಾ ಪರೀಕ್ಷೆ (20)' : 'Sadhana Pareekshe (20)'}
                    </th>
                    <th rowSpan={2} className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] font-bold text-[#16284F] dark:text-[#2563EB]">
                      {language === 'kn' ? 'ಒಟ್ಟು ಎಫ್‌ಎ (50)' : 'Total FA (50)'}
                    </th>
                    <th rowSpan={2} className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                      {language === 'kn' ? 'ಗ್ರೇಡ್' : 'Grade'}
                    </th>
                    <th rowSpan={2} className="py-3 px-3 text-center">
                      {language === 'kn' ? 'ಹಾಜರಾತಿ (ದಿನಗಳು)' : 'Attendance (Days)'}
                    </th>
                  </tr>
                  {/* Sub-header Row for Activity Standards */}
                  <tr className="border-t border-[#D8E1EA] dark:border-[#2A3B50] text-[9px] text-[#64748B] dark:text-[#94A3B8]">
                    {Array.from({ length: standardsCountAct1 }).map((_, i) => (
                      <th
                        key={`sub_act1_${i}`}
                        className="py-1.5 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3]/70 dark:bg-[#202F42]/70 font-semibold"
                      >
                        {language === 'kn'
                          ? `ಮಾನಕ ${i + 1} (${(15 / standardsCountAct1).toFixed(1)})`
                          : `Standard ${i + 1} (${(15 / standardsCountAct1).toFixed(1)})`}
                      </th>
                    ))}
                    {Array.from({ length: standardsCountAct2 }).map((_, i) => (
                      <th
                        key={`sub_act2_${i}`}
                        className="py-1.5 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#EAF0F6]/70 dark:bg-[#1A2636]/70 font-semibold"
                      >
                        {language === 'kn'
                          ? `ಮಾನಕ ${i + 1} (${(15 / standardsCountAct2).toFixed(1)})`
                          : `Standard ${i + 1} (${(15 / standardsCountAct2).toFixed(1)})`}
                      </th>
                    ))}
                  </tr>
                </>
              ) : (
                /* Single Header Row for Primary, Middle or SA */
                <tr>
                  <th className="py-3 px-3 w-12 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                    {language === 'kn' ? 'ಕ್ರ.ಸಂ.' : 'Sl'}
                  </th>
                  <th className="py-3 px-4 w-52 border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                    {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು' : 'Student Name'}
                  </th>
                  <th className="py-3 px-3 w-28 border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                    {language === 'kn' ? 'ಸ್ಯಾಟ್ಸ್ ಸಂ.' : 'SATS No'}
                  </th>

                  {selectedClass <= 8 ? (
                    selectedAssessment === 'SA1' || selectedAssessment === 'SA2' ? (
                      <>
                        <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                          {language === 'kn' ? 'ಲಿಖಿತ (40)' : 'Written (40)'}
                        </th>
                        <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                          {language === 'kn' ? 'ಮೌಖಿಕ (10)' : 'Oral (10)'}
                        </th>
                        <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] text-[#16284F] dark:text-[#2563EB] font-bold">
                          {language === 'kn'
                            ? `ಪರಿವರ್ತಿತ ಎಸ್‌ಎ (${selectedClass <= 5 ? 'ಗರಿಷ್ಠ 20' : 'ಗರಿಷ್ಠ 30'})`
                            : `Converted SA (${selectedClass <= 5 ? 'Max 20' : 'Max 30'})`}
                        </th>
                        <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                          {language === 'kn' ? 'ಗ್ರೇಡ್' : 'Grade'}
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                          {language === 'kn' ? 'ಗೃಹಪಾಠ (10)' : 'Gruha Pata (10)'}
                        </th>
                        <th className="py-3 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                          {language === 'kn' ? 'ಘಟಕ ಪರೀಕ್ಷೆ (10)' : 'Unit Test (10)'}
                        </th>
                        <th className="py-3 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                          {language === 'kn' ? 'ಯೋಜನಾ ಕಾರ್ಯ (10)' : 'Project (10)'}
                        </th>
                        <th className="py-3 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                          {language === 'kn' ? 'ಚಟುವಟಿಕೆ (10)' : 'Activity (10)'}
                        </th>
                        <th className="py-3 px-2 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                          {language === 'kn' ? 'ಭಾಗವಹಿಸುವಿಕೆ (10)' : 'Participation (10)'}
                        </th>
                        <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] font-bold text-[#16284F] dark:text-[#2563EB]">
                          {language === 'kn'
                            ? `ಪರಿವರ್ತಿತ ಎಫ್‌ಎ (${selectedClass <= 5 ? 'ಗರಿಷ್ಠ 15' : 'ಗರಿಷ್ಠ 10'})`
                            : `Converted FA (${selectedClass <= 5 ? 'Max 15' : 'Max 10'})`}
                        </th>
                        <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                          {language === 'kn' ? 'ಗ್ರೇಡ್' : 'Grade'}
                        </th>
                      </>
                    )
                  ) : (
                    // High School SA
                    <>
                      <th className="py-3 px-4 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                        {language === 'kn'
                          ? `ಎಸ್‌ಎ ಅಂಕಗಳು (${selectedSubject.includes('First Language') ? 'ಗರಿಷ್ಠ 100' : 'ಗರಿಷ್ಠ 80'})`
                          : `SA Marks (${selectedSubject.includes('First Language') ? 'Max 100' : 'Max 80'})`}
                      </th>
                      <th className="py-3 px-3 text-center border-r border-[#D8E1EA] dark:border-[#2A3B50]">
                        {language === 'kn' ? 'ಗ್ರೇಡ್' : 'Grade'}
                      </th>
                    </>
                  )}

                  <th className="py-3 px-3 text-center">
                    {language === 'kn' ? 'ಹಾಜರಾತಿ (ದಿನಗಳು)' : 'Attendance (Days)'}
                  </th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeStudents.map((st, idx) => {
                const row = marksGrid[st.id] || {};

                return (
                  <tr
                    key={st.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors focus-within:bg-blue-50/60"
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400 border-r border-slate-100 dark:border-slate-800">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                      {getStudentName(st, language)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-500 border-r border-slate-100 dark:border-slate-800">
                      {st.sats_no}
                    </td>

                    {/* DYNAMIC CELL INPUTS */}
                    {selectedClass <= 8 ? (
                      selectedAssessment === 'SA1' || selectedAssessment === 'SA2' ? (
                        <>
                          <td className="py-2 px-2 text-center border-r border-slate-100 dark:border-slate-800">
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={row.written ?? ''}
                              onChange={(e) => handlePrimarySAChange(st.id, 'written', e.target.value)}
                              className="w-16 text-center py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-center border-r border-slate-100 dark:border-slate-800">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={row.oral ?? ''}
                              onChange={(e) => handlePrimarySAChange(st.id, 'oral', e.target.value)}
                              className="w-16 text-center py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800 font-black text-blue-600 bg-blue-50/30">
                            {row.converted ?? '-'}
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                            <span className="px-2 py-0.5 rounded font-black text-xs bg-slate-100 dark:bg-slate-800">
                              {row.grade || '-'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {['gruha', 'ghataka', 'yojana', 'chatu', 'bhaga'].map((field) => (
                            <td
                              key={field}
                              className="py-2 px-1 text-center border-r border-slate-100 dark:border-slate-800"
                            >
                              <input
                                type="number"
                                min={0}
                                max={10}
                                value={row[field] ?? ''}
                                onChange={(e) => handlePrimaryFAChange(st.id, field, e.target.value)}
                                className="w-12 text-center py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800 font-black text-blue-600 bg-blue-50/30">
                            {row.converted ?? '-'}
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                            <span className="px-2 py-0.5 rounded font-black text-xs bg-slate-100 dark:bg-slate-800">
                              {row.grade || '-'}
                            </span>
                          </td>
                        </>
                      )
                    ) : (
                      // High School 9-10
                      selectedAssessment === 'SA1' || selectedAssessment === 'SA2' ? (
                        <>
                          <td className="py-2 px-4 text-center border-r border-slate-100 dark:border-slate-800">
                            <input
                              type="number"
                              min={0}
                              max={selectedSubject.includes('First Language') ? 100 : 80}
                              value={row.sa_marks ?? ''}
                              onChange={(e) => handleHighSchoolSAChange(st.id, e.target.value)}
                              className="w-24 text-center py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-sm outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                            <span className="px-2.5 py-0.5 rounded font-black text-xs bg-slate-100 dark:bg-slate-800">
                              {row.grade || '-'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Activity 1 Standards */}
                          {Array.from({ length: standardsCountAct1 }).map((_, i) => (
                            <td
                              key={`std1_${i}`}
                              className="py-2 px-1 text-center border-r border-slate-100 dark:border-slate-800"
                            >
                              <input
                                type="number"
                                step="0.5"
                                min={0}
                                max={15 / standardsCountAct1}
                                value={row.act1?.[i] ?? ''}
                                onChange={(e) => handleHighSchoolFAChange(st.id, 'act1', i, e.target.value)}
                                className="w-12 text-center py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none"
                              />
                            </td>
                          ))}
                          {/* Activity 2 Standards */}
                          {Array.from({ length: standardsCountAct2 }).map((_, i) => (
                            <td
                              key={`std2_${i}`}
                              className="py-2 px-1 text-center border-r border-slate-100 dark:border-slate-800"
                            >
                              <input
                                type="number"
                                step="0.5"
                                min={0}
                                max={15 / standardsCountAct2}
                                value={row.act2?.[i] ?? ''}
                                onChange={(e) => handleHighSchoolFAChange(st.id, 'act2', i, e.target.value)}
                                className="w-12 text-center py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-2 text-center border-r border-slate-100 dark:border-slate-800">
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={row.sadhana ?? ''}
                              onChange={(e) => handleHighSchoolTestChange(st.id, e.target.value)}
                              className="w-14 text-center py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none text-[#16284F] dark:text-[#2563EB]"
                            />
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800 font-black text-blue-600 bg-blue-50/30">
                            {row.total_fa ?? '-'}
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                            <span className="px-2 py-0.5 rounded font-black text-xs bg-slate-100 dark:bg-slate-800">
                              {row.grade || '-'}
                            </span>
                          </td>
                        </>
                      )
                    )}

                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={240}
                        value={row.attendance ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setMarksGrid((prev) => ({
                            ...prev,
                            [st.id]: { ...prev[st.id], attendance: val },
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-14 text-center py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}

      {/* CO-CURRICULAR GRADING MODAL (Section 10 Requirements) */}
      {coCurricularModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#16284F] dark:text-[#2563EB]" />
                  Co-Curricular Activities CCE Grading
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Karnataka CCE mandates grading for: Daihika & Arogya, Moulya Shikshana, Kaaryanubhava, and Kala Shikshana.
                </p>
              </div>

              {/* Class & Section Switcher inside Modal */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-xs"
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                </select>

                <button
                  type="button"
                  onClick={() => setCoCurricularModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Fill Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#E3EBF3] dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50]">
              <span className="font-bold text-[#16284F] dark:text-[#2563EB] text-[11px]">
                ⚡ Quick Fill All {(activeStudents.length > 0 ? activeStudents : schoolActiveStudents).length} Students:
              </span>
              <div className="flex items-center gap-1.5">
                {(['A+', 'A', 'B+', 'B'] as GradeValue[]).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleQuickFillCoGrades(grade, activeStudents.length > 0 ? activeStudents : schoolActiveStudents)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-[#D8E1EA] dark:border-slate-700 text-[#16284F] dark:text-[#2563EB] font-bold text-[11px] hover:bg-[#16284F] hover:text-white transition-all cursor-pointer shadow-xs"
                  >
                    All {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Notice if active students in selected class is 0 */}
            {activeStudents.length === 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600" />
                  No students currently enrolled in Class {selectedClass}-{selectedSection}. Click any class below to switch:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {enrolledClasses.map((clsSec) => {
                    const [cls, sec] = clsSec.split('-');
                    return (
                      <button
                        key={clsSec}
                        type="button"
                        onClick={() => {
                          setSelectedClass(Number(cls));
                          setSelectedSection(sec);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 text-[#16284F] font-bold text-[11px] hover:bg-[#16284F] hover:text-white cursor-pointer"
                      >
                        Class {cls}-{sec}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Students List with interactive grading cards */}
            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {(activeStudents.length > 0 ? activeStudents : schoolActiveStudents).map((st) => {
                const g = coGrades[st.id] || { daihika: 'A', moulya: 'A+', kaaryanubhava: 'A', kala: 'A' };
                const gradeOptions: GradeValue[] = ['A+', 'A', 'B+', 'B', 'C'];

                return (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{getStudentName(st, language)}</span>
                        <span className="text-[10px] text-slate-500 ml-2 font-mono">
                          Class {st.class_number}-{st.section} • Adm: {st.admission_no} • SATS: {st.sats_no}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF3FC] text-[#2563EB] dark:bg-slate-800 dark:text-[#2563EB]">
                        CCE Compliant
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px]">
                      {/* Daihika & Arogya */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold mb-1">
                          1. Daihika & Arogya
                        </span>
                        <div className="flex items-center gap-1">
                          {gradeOptions.map((gr) => (
                            <button
                              key={gr}
                              type="button"
                              onClick={() => {
                                setCoGrades((prev) => ({
                                  ...prev,
                                  [st.id]: { ...g, daihika: gr },
                                }));
                                setHasUnsavedChanges(true);
                              }}
                              className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                g.daihika === gr
                                  ? 'bg-[#16284F] text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {gr}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Moulya Shikshana */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold mb-1">
                          2. Moulya Shikshana
                        </span>
                        <div className="flex items-center gap-1">
                          {gradeOptions.map((gr) => (
                            <button
                              key={gr}
                              type="button"
                              onClick={() => {
                                setCoGrades((prev) => ({
                                  ...prev,
                                  [st.id]: { ...g, moulya: gr },
                                }));
                                setHasUnsavedChanges(true);
                              }}
                              className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                g.moulya === gr
                                  ? 'bg-[#3977A8] text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {gr}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Kaaryanubhava */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold mb-1">
                          3. Kaaryanubhava
                        </span>
                        <div className="flex items-center gap-1">
                          {gradeOptions.map((gr) => (
                            <button
                              key={gr}
                              type="button"
                              onClick={() => {
                                setCoGrades((prev) => ({
                                  ...prev,
                                  [st.id]: { ...g, kaaryanubhava: gr },
                                }));
                                setHasUnsavedChanges(true);
                              }}
                              className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                g.kaaryanubhava === gr
                                  ? 'bg-[#16284F] text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {gr}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Kala Shikshana */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold mb-1">
                          4. Kala Shikshana
                        </span>
                        <div className="flex items-center gap-1">
                          {gradeOptions.map((gr) => (
                            <button
                              key={gr}
                              type="button"
                              onClick={() => {
                                setCoGrades((prev) => ({
                                  ...prev,
                                  [st.id]: { ...g, kala: gr },
                                }));
                                setHasUnsavedChanges(true);
                              }}
                              className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                g.kala === gr
                                  ? 'bg-[#3977A8] text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {gr}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[11px]">
                Grades are committed locally to IndexedDB and synced to cloud
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCoCurricularModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCoCurricular(activeStudents.length > 0 ? activeStudents : schoolActiveStudents)}
                  className="px-5 py-2 rounded-xl bg-[#16284F] text-white font-bold hover:bg-[#0F1D3B] transition-colors cursor-pointer shadow-sm"
                >
                  Save Co-Curricular Grades ({(activeStudents.length > 0 ? activeStudents : schoolActiveStudents).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
