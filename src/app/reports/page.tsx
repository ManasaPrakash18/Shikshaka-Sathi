'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Filter,
  CheckCircle,
  Eye,
  Sparkles,
  School,
  GraduationCap,
  X,
  Award,
  Layers,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { calculateAnnualMarks, getAnnualMaximumMarks, getStandardSubjects, calculateGrade } from '@/lib/cce/calculations';

interface AssessmentRowConfig {
  code: string;
  label: string;
  max: string | number;
}

import { downloadPDFDoc, downloadExcelFile } from '@/lib/pdf/documentGenerator';
import { printConsolidatedReport } from '@/lib/pdf/officialPrintTemplates';
import { getStudentName, getSubjectName, getSchoolName, getLocationName } from '@/lib/utils/kannadaNames';

export default function ConsolidatedReportsPage() {
  const { currentSchool, academicYear, userRole } = useAuth();
  const { state } = useAppState();
  const { t, language } = useLanguage();

  // Mode: Assessment-Wise vs Annual School Consolidated
  const [reportMode, setReportMode] = useState<'ASSESSMENT_WISE' | 'ANNUAL_SCHOOL'>('ASSESSMENT_WISE');

  // Filter selections
  const [selectedClass, setSelectedClass] = useState<number>(10);
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [availableSections, setAvailableSections] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`erp_sections_${currentSchool?.id || 'default'}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return ['A', 'B', 'C'];
  });

  const [todayString, setTodayString] = useState<string>('');
  useEffect(() => {
    setTodayString(new Date().toLocaleDateString());
  }, []);

  const handleAddSection = () => {
    const nextChar = String.fromCharCode(65 + availableSections.length);
    if (!availableSections.includes(nextChar)) {
      const nextSections = [...availableSections, nextChar];
      setAvailableSections(nextSections);
      setSelectedSection(nextChar);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`erp_sections_${currentSchool?.id || 'default'}`, JSON.stringify(nextSections));
      }
    }
  };

  const handleRemoveSection = () => {
    if (availableSections.length <= 1) return;
    const last = availableSections[availableSections.length - 1];
    const nextSections = availableSections.slice(0, -1);
    setAvailableSections(nextSections);
    if (selectedSection === last) setSelectedSection('ALL');
    if (typeof window !== 'undefined') {
      localStorage.setItem(`erp_sections_${currentSchool?.id || 'default'}`, JSON.stringify(nextSections));
    }
  };
  const [selectedAssessment, setSelectedAssessment] = useState<'FA1' | 'FA2' | 'SA1' | 'FA3' | 'FA4' | 'SA2'>('FA1');

  // Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const availableSubjects = getStandardSubjects(selectedClass);

  // Active students in selected class and section
  const activeStudents = state.students.filter(
    (s) =>
      s.school_id === currentSchool?.id &&
      s.academic_year === academicYear &&
      s.class_number === selectedClass &&
      (selectedSection === 'ALL' || s.section === selectedSection) &&
      s.status === 'ACTIVE'
  );

  // Dynamic assessment rows for Annual Register
  const getAssessmentRows = (cls: number): AssessmentRowConfig[] => {
    if (cls <= 5) {
      return [
        { code: 'FA1', label: 'FA1', max: 15 },
        { code: 'FA2', label: 'FA2', max: 15 },
        { code: 'SA1', label: 'SA1', max: 20 },
        { code: 'SEM1', label: language === 'kn' ? 'ಸೆಮಿಸ್ಟರ್ 1 ಒಟ್ಟು' : 'Sem 1 Total', max: 50 },
        { code: 'FA3', label: 'FA3', max: 15 },
        { code: 'FA4', label: 'FA4', max: 15 },
        { code: 'SA2', label: 'SA2', max: 20 },
        { code: 'SEM2', label: language === 'kn' ? 'ಸೆಮಿಸ್ಟರ್ 2 ಒಟ್ಟು' : 'Sem 2 Total', max: 50 },
        { code: 'ANNUAL', label: language === 'kn' ? 'ವಾರ್ಷಿಕ ಮೊತ್ತ' : 'Annual', max: 100 },
      ];
    } else if (cls <= 8) {
      return [
        { code: 'FA1', label: 'FA1', max: 10 },
        { code: 'FA2', label: 'FA2', max: 10 },
        { code: 'SA1', label: 'SA1', max: 30 },
        { code: 'SEM1', label: language === 'kn' ? 'ಸೆಮಿಸ್ಟರ್ 1 ಒಟ್ಟು' : 'Sem 1 Total', max: 50 },
        { code: 'FA3', label: 'FA3', max: 10 },
        { code: 'FA4', label: 'FA4', max: 10 },
        { code: 'SA2', label: 'SA2', max: 30 },
        { code: 'SEM2', label: language === 'kn' ? 'ಸೆಮಿಸ್ಟರ್ 2 ಒಟ್ಟು' : 'Sem 2 Total', max: 50 },
        { code: 'ANNUAL', label: language === 'kn' ? 'ವಾರ್ಷಿಕ ಮೊತ್ತ' : 'Annual', max: 100 },
      ];
    } else {
      // High School 9-10
      return [
        { code: 'FA1', label: 'FA1', max: 50 },
        { code: 'FA2', label: 'FA2', max: 50 },
        { code: 'SA1', label: 'SA1', max: '80 / 100' },
        { code: 'FA3', label: 'FA3', max: 50 },
        { code: 'FA4', label: 'FA4', max: 50 },
        { code: 'SA2', label: 'SA2', max: '80 / 100' },
        { code: 'ANNUAL', label: language === 'kn' ? 'ವಾರ್ಷಿಕ ಮೊತ್ತ' : 'Annual', max: '125 / 100' },
      ];
    }
  };

  const assessmentRows = getAssessmentRows(selectedClass);

  // Helper to extract assessment mark & grade for student and subject
  const getStudentMarkForAssessment = (studentId: string, subjectName: string, rowCode: string) => {
    if (rowCode === 'SEM1') {
      const fa1 = state.assessments.find(
        (a) => a.student_id === studentId && a.subject_name === subjectName && a.assessment_type === 'FA1'
      );
      const fa2 = state.assessments.find(
        (a) => a.student_id === studentId && a.subject_name === subjectName && a.assessment_type === 'FA2'
      );
      const sa1 = state.assessments.find(
        (a) => a.student_id === studentId && a.subject_name === subjectName && a.assessment_type === 'SA1'
      );
      if (fa1 && fa2 && sa1) {
        const sum = (Number(fa1.total_marks) || 0) + (Number(fa2.total_marks) || 0) + (Number(sa1.total_marks) || 0);
        return { marks: sum.toFixed(1), grade: calculateGrade(sum, 50) };
      }
      return { marks: '-', grade: '-' };
    }

    if (rowCode === 'SEM2') {
      const fa3 = state.assessments.find(
        (a) => a.student_id === studentId && a.subject_name === subjectName && a.assessment_type === 'FA3'
      );
      const fa4 = state.assessments.find(
        (a) => a.student_id === studentId && a.subject_name === subjectName && a.assessment_type === 'FA4'
      );
      const sa2 = state.assessments.find(
        (a) => a.student_id === studentId && a.subject_name === subjectName && a.assessment_type === 'SA2'
      );
      if (fa3 && fa4 && sa2) {
        const sum = (Number(fa3.total_marks) || 0) + (Number(fa4.total_marks) || 0) + (Number(sa2.total_marks) || 0);
        return { marks: sum.toFixed(1), grade: calculateGrade(sum, 50) };
      }
      return { marks: '-', grade: '-' };
    }

    if (rowCode === 'ANNUAL') {
      const getMarks = (assessmentType: string) =>
        state.assessments.find(
          (a) =>
            a.school_id === currentSchool?.id &&
            a.academic_year === academicYear &&
            a.student_id === studentId &&
            a.subject_name === subjectName &&
            a.assessment_type === assessmentType
        )?.total_marks ?? null;
      const annualMarks = calculateAnnualMarks(selectedClass, subjectName, {
        fa1: getMarks('FA1'),
        fa2: getMarks('FA2'),
        sa1: getMarks('SA1'),
        fa3: getMarks('FA3'),
        fa4: getMarks('FA4'),
        sa2: getMarks('SA2'),
      });
      return annualMarks === null
        ? { marks: '-', grade: '-' }
        : {
            marks: annualMarks.toFixed(1),
            grade: calculateGrade(annualMarks, getAnnualMaximumMarks(selectedClass, subjectName), selectedClass),
          };
    }

    // Direct assessment lookup (FA1, FA2, SA1, FA3, FA4, SA2)
    const rec = state.assessments.find(
      (a) =>
        a.school_id === currentSchool?.id &&
        a.academic_year === academicYear &&
        a.student_id === studentId &&
        a.subject_name === subjectName &&
        a.assessment_type === rowCode
    );

    return rec ? { marks: rec.total_marks, grade: rec.grade } : { marks: '-', grade: '-' };
  };

  // Helper to compute Assessment-Wise Student Totals
  const getAssessmentStudentSummary = (studentId: string, assessmentType: string) => {
    let totalObtained = 0;
    let subjectsEvaluated = 0;

    availableSubjects.forEach((sub) => {
      const rec = state.assessments.find(
        (a) =>
          a.school_id === currentSchool?.id &&
          a.academic_year === academicYear &&
          a.student_id === studentId &&
          a.subject_name === sub &&
          a.assessment_type === assessmentType
      );
      if (rec && typeof rec.total_marks === 'number') {
        totalObtained += rec.total_marks;
        subjectsEvaluated++;
      }
    });

    const maxPerSubj =
      selectedClass <= 5
        ? assessmentType.startsWith('FA') ? 15 : 20
        : selectedClass <= 8
        ? assessmentType.startsWith('FA') ? 10 : 30
        : assessmentType.startsWith('FA') ? 50 : 100;

    const maxTotal = availableSubjects.length * maxPerSubj;
    const percentage = maxTotal > 0 ? (totalObtained / maxTotal) * 100 : 0;
    const overallGrade = calculateGrade(percentage, 100);

    return {
      totalObtained,
      maxTotal,
      percentage: percentage.toFixed(1),
      overallGrade,
      subjectsEvaluated,
      status: percentage >= 35 ? 'PASS / QUALIFIED' : 'NEEDS SUPPORT',
    };
  };

  // EXCEL EXPORT (Assessment-Wise or Annual)
  const handleExportExcel = () => {
    const excelRows: any[] = [];

    if (reportMode === 'ASSESSMENT_WISE') {
      activeStudents.forEach((st, idx) => {
        const summary = getAssessmentStudentSummary(st.id, selectedAssessment);
        const rowObj: any = {
          'Sl No': idx + 1,
          'Student Name': getStudentName(st, language),
          'SATS No': st.sats_no,
          'Admission No': st.admission_no,
          'Class & Sec': `Class ${st.class_number}-${st.section}`,
          Assessment: selectedAssessment,
        };

        availableSubjects.forEach((sub) => {
          const m = getStudentMarkForAssessment(st.id, sub, selectedAssessment);
          rowObj[`${sub} (Marks)`] = m.marks;
          rowObj[`${sub} (Grade)`] = m.grade;
        });

        rowObj['Total Marks'] = summary.totalObtained;
        rowObj['Percentage (%)'] = summary.percentage;
        rowObj['Grade'] = summary.overallGrade;
        rowObj['Status'] = summary.status;

        excelRows.push(rowObj);
      });

      const ws = XLSX.utils.json_to_sheet(excelRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${selectedAssessment}_Consolidated`);
      downloadExcelFile(
        wb,
        `${currentSchool?.name?.replace(/\s+/g, '_')}_Class${selectedClass}_${selectedAssessment}_Consolidated_${academicYear}.xlsx`
      );
    } else {
      activeStudents.forEach((st, idx) => {
        const co = state.coCurricular.find(
          (c) => c.school_id === currentSchool?.id && c.academic_year === academicYear && c.student_id === st.id
        );

        assessmentRows.forEach((ar, aIdx) => {
          const rowObj: any = {
            'Sl No': aIdx === 0 ? idx + 1 : '',
            'Student Name': aIdx === 0 ? getStudentName(st, language) : '',
            'SATS No': aIdx === 0 ? st.sats_no || '—' : '',
            'Admission No': aIdx === 0 ? st.admission_no : '',
            Assessment: ar.label,
            'Max Marks': ar.max,
          };

          availableSubjects.forEach((sub) => {
            const m = getStudentMarkForAssessment(st.id, sub, ar.code);
            rowObj[`${sub} (Marks)`] = m.marks;
            rowObj[`${sub} (Grade)`] = m.grade;
          });

          rowObj['Co-Curricular: Daihika'] = aIdx === 0 ? co?.daihika_arogya || '-' : '';
          rowObj['Co-Curricular: Moulya'] = aIdx === 0 ? co?.moulya || '-' : '';
          rowObj['Co-Curricular: Kaaryanubhava'] = aIdx === 0 ? co?.kaaryanubhava || '-' : '';
          rowObj['Co-Curricular: Kala'] = aIdx === 0 ? co?.kala || '-' : '';

          excelRows.push(rowObj);
        });
      });

      const ws = XLSX.utils.json_to_sheet(excelRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Annual_Consolidated');
      downloadExcelFile(
        wb,
        `${currentSchool?.name?.replace(/\s+/g, '_')}_Class${selectedClass}_Annual_Consolidated_${academicYear}.xlsx`
      );
    }
  };

  // Print Official Consolidated Report (18 Students/Page A4 Landscape with Karnataka CCE Formatting)
  const handlePrintOfficialConsolidatedReport = () => {
    if (!currentSchool) return;
    printConsolidatedReport(
      currentSchool,
      selectedClass,
      selectedSection,
      selectedAssessment,
      academicYear,
      activeStudents,
      availableSubjects,
      (stId: string) => {
        const sum = getAssessmentStudentSummary(stId, selectedAssessment);
        const subjectMarks: Record<string, { marks: number; grade: string }> = {};
        availableSubjects.forEach((sub) => {
          const rec = state.assessments.find(
            (a) =>
              a.school_id === currentSchool.id &&
              a.academic_year === academicYear &&
              a.student_id === stId &&
              a.subject_name === sub &&
              a.assessment_type === selectedAssessment
          );
          if (rec && typeof rec.total_marks === 'number') {
            subjectMarks[sub] = { marks: rec.total_marks, grade: rec.grade };
          }
        });

        return {
          subjectMarks,
          totalMarks: sum.totalObtained,
          maxPossibleMarks: sum.maxTotal,
          percentage: Number(sum.percentage),
          overallGrade: sum.overallGrade,
          result: sum.status,
        };
      },
      language as 'kn' | 'en'
    );
  };

  // PDF EXPORT
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Formal Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(currentSchool?.name?.toUpperCase() || 'INSTITUTION NAME', pageWidth / 2, 12, {
      align: 'center',
    });
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `UDISE: ${currentSchool?.udise} | Taluk: ${currentSchool?.taluk} | District: ${currentSchool?.district}`,
      pageWidth / 2,
      17,
      { align: 'center' }
    );
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    const titleText =
      reportMode === 'ASSESSMENT_WISE'
        ? `CONSOLIDATED REPORT FOR ASSESSMENT: ${selectedAssessment} (CLASS ${selectedClass}-${selectedSection}) - ${academicYear}`
        : `ANNUAL CONSOLIDATED ASSESSMENT REGISTER: CLASS ${selectedClass}-${selectedSection} - ${academicYear}`;

    doc.text(titleText, pageWidth / 2, 23, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Enrolled: ${activeStudents.length} Students`, 10, 27);

    if (reportMode === 'ASSESSMENT_WISE') {
      const pdfBody: any[] = [];
      activeStudents.forEach((st, idx) => {
        const sum = getAssessmentStudentSummary(st.id, selectedAssessment);
        const row: any[] = [idx + 1, `${st.name}${st.sats_no ? `\nSATS: ${st.sats_no}` : ''}`];

        availableSubjects.forEach((sub) => {
          const m = getStudentMarkForAssessment(st.id, sub, selectedAssessment);
          row.push(m.marks);
          row.push(m.grade);
        });

        row.push(sum.totalObtained);
        row.push(`${sum.percentage}%`);
        row.push(sum.overallGrade);

        pdfBody.push(row);
      });

      const headRow1: any[] = [
        { content: 'Sl', rowSpan: 2 },
        { content: 'Student Information', rowSpan: 2 },
      ];
      availableSubjects.forEach((sub) => {
        headRow1.push({ content: sub.split(' ')[0], colSpan: 2 });
      });
      headRow1.push({ content: 'Total', rowSpan: 2 }, { content: '%', rowSpan: 2 }, { content: 'Grd', rowSpan: 2 });

      const headRow2: any[] = [];
      availableSubjects.forEach(() => {
        headRow2.push('Mks', 'Grd');
      });

      autoTable(doc, {
        startY: 29,
        margin: { left: 8, right: 8 },
        head: [headRow1, headRow2],
        body: pdfBody,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
        headStyles: { fillColor: [36, 92, 75], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 40, halign: 'left', fontStyle: 'bold' } },
      });

      downloadPDFDoc(
        doc,
        `Assessment_${selectedAssessment}_Class${selectedClass}_Consolidated_${academicYear}.pdf`
      );
    } else {
      const pdfBody: any[] = [];
      activeStudents.forEach((st, sIdx) => {
        const co = state.coCurricular.find(
          (c) => c.school_id === currentSchool?.id && c.academic_year === academicYear && c.student_id === st.id
        );

        assessmentRows.forEach((ar, aIdx) => {
          const row: any[] = [];
          row.push(aIdx === 0 ? sIdx + 1 : '');
          row.push(aIdx === 0 ? `${st.name}${st.sats_no ? `\nSATS: ${st.sats_no}` : ''}` : '');
          row.push(ar.label);
          row.push(String(ar.max));

          availableSubjects.forEach((sub) => {
            const m = getStudentMarkForAssessment(st.id, sub, ar.code);
            row.push(m.marks);
            row.push(m.grade);
          });

          row.push(aIdx === 0 ? co?.daihika_arogya || '-' : '');
          row.push(aIdx === 0 ? co?.moulya || '-' : '');
          row.push(aIdx === 0 ? co?.kaaryanubhava || '-' : '');
          row.push(aIdx === 0 ? co?.kala || '-' : '');

          pdfBody.push(row);
        });
      });

      const headRow1: any[] = [
        { content: 'Sl', rowSpan: 2 },
        { content: 'Student Information', rowSpan: 2 },
        { content: 'Assessments', rowSpan: 2 },
        { content: 'Max', rowSpan: 2 },
      ];

      availableSubjects.forEach((sub) => {
        headRow1.push({ content: sub.split(' ')[0], colSpan: 2 });
      });

      headRow1.push({ content: 'Co-Curricular', colSpan: 4 });

      const headRow2: any[] = [];
      availableSubjects.forEach(() => {
        headRow2.push('Mks', 'Grd');
      });
      headRow2.push('Daihika', 'Moulya', 'Kaarya', 'Kala');

      autoTable(doc, {
        startY: 29,
        margin: { left: 8, right: 8 },
        head: [headRow1, headRow2],
        body: pdfBody,
        theme: 'grid',
        styles: { fontSize: 6.5, cellPadding: 1.2, halign: 'center', valign: 'middle' },
        headStyles: { fillColor: [36, 92, 75], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 32, halign: 'left', fontStyle: 'bold' } },
      });

      downloadPDFDoc(
        doc,
        `Annual_Consolidated_${currentSchool?.name?.replace(/\s+/g, '_')}_Class${selectedClass}_${academicYear}.pdf`
      );
    }
  };

  if (userRole === 'PLATFORM_ADMIN') {
    return (
      <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 space-y-3">
        <h2 className="text-xl font-black">Platform Admin View Restricted</h2>
        <p className="text-xs sm:text-sm">
          Platform administrators oversee school tenancy and credential approvals. Consolidated evaluation registers belong to individual schools.
        </p>
        <Link
          href="/platform-admin"
          className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          Go to School Access Management
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#16284F] dark:text-[#2563EB] font-bold text-xs uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            {language === 'kn' ? 'ಅಧಿಕೃತ ಕರ್ನಾಟಕ ಕ್ರೋಢೀಕೃತ ಮೌಲ್ಯಮಾಪನ ರಿಜಿಸ್ಟರ್‌ಗಳು' : 'Official Karnataka Consolidated Evaluation Registers'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#243449] dark:text-[#F1F5F9] mt-1">
            {t.reports.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            {language === 'kn'
              ? `${getSchoolName(currentSchool, language)} ಗಾಗಿ ಮೌಲ್ಯಮಾಪನವಾರು ಮತ್ತು ವಾರ್ಷಿಕ ಕ್ರೋಢೀಕೃತ ದಾಖಲೆಗಳು`
              : `Assessment-wise and full academic year consolidated registers with verified exports for ${getSchoolName(currentSchool, language)}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] hover:bg-[#D8E1EA] text-[#16284F] dark:text-[#2563EB] font-semibold text-xs shadow-sm cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#3977A8] dark:text-[#4B8DC2]" />
            {t.reports.printPreview}
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8E1EA] dark:border-[#2A3B50] bg-white dark:bg-[#1A2636] hover:bg-[#F3F6F9] dark:hover:bg-[#1E2B3C] text-[#243449] dark:text-[#F1F5F9] font-semibold text-xs shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#2563EB]" />
            {t.reports.exportExcel}
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {t.reports.exportPdf}
          </button>

          <button
            onClick={handlePrintOfficialConsolidatedReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            title={language === 'kn' ? 'ಅಧಿಕೃತ ಕ್ರೂಡೀಕೃತ ವರದಿ ಮುದ್ರಿಸಿ (18 ವಿದ್ಯಾರ್ಥಿಗಳು/ಪುಟ A4 ಲ್ಯಾಂಡ್‌ಸ್ಕೇಪ್)' : 'Print Official Consolidated Report (A4 Landscape)'}
          >
            <Printer className="w-4 h-4" />
            {language === 'kn' ? 'ವರದಿ ಮುದ್ರಿಸಿ' : 'Print Report (A4)'}
          </button>
        </div>
      </div>

      {/* TWO DISTINCT REPORT MODES SEGMENTED TABS */}
      <div className="flex w-full flex-col items-stretch gap-2 rounded-2xl border border-[#D8E1EA] bg-[#EAF0F6] p-1.5 dark:border-[#2A3B50] dark:bg-[#1E2B3C] xl:w-fit xl:flex-row xl:items-center xl:gap-3">
        <button
          onClick={() => setReportMode('ASSESSMENT_WISE')}
          className={`flex w-full min-w-0 items-center gap-2 rounded-xl px-4 py-2 text-left text-xs font-bold transition-all cursor-pointer xl:w-auto ${
            reportMode === 'ASSESSMENT_WISE'
              ? 'bg-[#16284F] text-white shadow-sm'
              : 'text-[#243449] dark:text-slate-300 hover:text-[#16284F]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="min-w-0 whitespace-normal">1. Assessment-Wise Consolidated Report (ಪ್ರತಿ ಮೌಲ್ಯಮಾಪನವಾರು)</span>
        </button>

        <button
          onClick={() => setReportMode('ANNUAL_SCHOOL')}
          className={`flex w-full min-w-0 items-center gap-2 rounded-xl px-4 py-2 text-left text-xs font-bold transition-all cursor-pointer xl:w-auto ${
            reportMode === 'ANNUAL_SCHOOL'
              ? 'bg-[#16284F] text-white shadow-sm'
              : 'text-[#243449] dark:text-slate-300 hover:text-[#16284F]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="min-w-0 whitespace-normal">2. School Annual Consolidated Register (ವಾರ್ಷಿಕ ಕ್ರೋಢೀಕೃತ ರಿಜಿಸ್ಟರ್)</span>
        </button>
      </div>

      {/* Filter Selection Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm flex flex-wrap items-center gap-4 text-xs">
        {/* Assessment Selector (when in Assessment-Wise mode) */}
        {reportMode === 'ASSESSMENT_WISE' && (
          <div className="flex w-full min-w-0 max-w-full flex-wrap items-center gap-2 sm:w-auto">
            <span className="font-bold text-[#64748B] dark:text-[#94A3B8]">
              {language === 'kn' ? 'ಮೌಲ್ಯಮಾಪನ:' : 'Assessment:'}
            </span>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value as any)}
              className="min-w-0 max-w-full rounded-xl border border-[#3977A8] bg-[#F3F6F9] px-3 py-1.5 pr-4 font-black text-[#16284F] dark:border-[#4B8DC2] dark:bg-[#1E2B3C] dark:text-[#2563EB] cursor-pointer"
            >
              <option value="FA1">FA1 — Formative Assessment 1</option>
              <option value="FA2">FA2 — Formative Assessment 2</option>
              <option value="SA1">SA1 — Summative Assessment 1 / Midterm</option>
              <option value="FA3">FA3 — Formative Assessment 3</option>
              <option value="FA4">FA4 — Formative Assessment 4</option>
              <option value="SA2">SA2 — Summative Assessment 2 / Annual</option>
            </select>
          </div>
        )}

        <div className="flex w-full min-w-0 max-w-full flex-wrap items-center gap-2 sm:w-auto">
          <span className="font-bold text-[#64748B] dark:text-[#94A3B8]">
            {language === 'kn' ? 'ತರಗತಿ:' : 'Class:'}
          </span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(Number(e.target.value))}
            className="min-w-0 max-w-full rounded-xl border border-[#D8E1EA] bg-[#F3F6F9] px-3 py-1.5 pr-4 font-bold text-[#243449] dark:border-[#2A3B50] dark:bg-[#1E2B3C] dark:text-[#F1F5F9] cursor-pointer"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => (
              <option key={c} value={c}>
                {language === 'kn'
                  ? `ತರಗತಿ ${c} (${c <= 5 ? 'ಪ್ರಾಥಮಿಕ' : c <= 8 ? 'ಹಿರಿಯ ಪ್ರಾಥಮಿಕ' : 'ಪ್ರೌಢಶಾಲೆ'})`
                  : `Class ${c} (${c <= 5 ? 'Primary' : c <= 8 ? 'Middle' : 'High School'})`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-full min-w-0 max-w-full flex-wrap items-center gap-2 sm:w-auto">
          <span className="font-bold text-[#64748B] dark:text-[#94A3B8]">
            {language === 'kn' ? 'ವಿಭಾಗ:' : 'Section:'}
          </span>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="min-w-0 max-w-full rounded-xl border border-[#D8E1EA] bg-[#F3F6F9] px-3 py-1.5 pr-4 font-bold text-[#243449] dark:border-[#2A3B50] dark:bg-[#1E2B3C] dark:text-[#F1F5F9] cursor-pointer"
          >
            <option value="ALL">{language === 'kn' ? 'ಎಲ್ಲಾ ವಿಭಾಗಗಳು (All Sections)' : 'All Sections'}</option>
            {availableSections.map((sec) => (
              <option key={sec} value={sec}>
                {language === 'kn' ? `ವಿಭಾಗ ${sec}` : `Section ${sec}`}
              </option>
            ))}
          </select>

          {userRole === 'SCHOOL_ADMIN' && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleAddSection}
                title={language === 'kn' ? 'ಹೊಸ ವಿಭಾಗ ಸೇರಿಸಿ (ಉದಾಹರಣೆಗೆ ವಿಭಾಗ D)' : 'Add a new section (e.g. Section D)'}
                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-xs"
              >
                {language === 'kn' ? '+ ವಿಭಾಗ ಸೇರಿಸಿ' : '+ Add'}
              </button>
              {availableSections.length > 1 && (
                <button
                  onClick={handleRemoveSection}
                  title={language === 'kn' ? 'ಕೊನೆಯ ವಿಭಾಗವನ್ನು ತೆಗೆದುಹಾಕಿ' : 'Remove last section'}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-500 cursor-pointer shadow-xs"
                >
                  {language === 'kn' ? '- ತೆಗೆದುಹಾಕಿ' : '- Remove'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto text-[#64748B] dark:text-[#94A3B8] font-semibold">
          {language === 'kn' ? 'ದಾಖಲಾತಿ:' : 'Enrolled:'}{' '}
          <strong className="text-[#3977A8] dark:text-[#4B8DC2]">
            {activeStudents.length} {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಗಳು' : 'Students'}
          </strong>{' '}
          | {language === 'kn' ? 'ಶೈಕ್ಷಣಿಕ ವರ್ಷ:' : 'Academic Year:'}{' '}
          <strong className="text-[#243449] dark:text-[#F1F5F9]">{academicYear}</strong>
        </div>
      </div>

      {/* REPORT VIEW 1: ASSESSMENT-WISE CONSOLIDATED REPORT */}
      {reportMode === 'ASSESSMENT_WISE' && (
        <div className="rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-[#D8E1EA] dark:border-[#2A3B50] bg-[#F3F6F9] dark:bg-[#1E2B3C] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#16284F] text-white font-bold text-xs">
                  {selectedAssessment}
                </span>
                <h2 className="text-sm font-bold text-[#243449] dark:text-[#F1F5F9] uppercase tracking-wider">
                  {language === 'kn'
                    ? `${selectedAssessment} ಕ್ರೋಢೀಕೃತ ಮೌಲ್ಯಮಾಪನ ವರದಿ — ತರಗತಿ ${selectedClass}-${selectedSection}`
                    : `${selectedAssessment} Consolidated Assessment Report — Class ${selectedClass}-${selectedSection}`}
                </h2>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                {language === 'kn'
                  ? `ಎಲ್ಲಾ ${availableSubjects.length} ವಿಷಯಗಳ ಅಂಕಗಳು, ಒಟ್ಟು ಮೊತ್ತ, ಶೇಕಡಾವಾರು ಮತ್ತು ಶ್ರೇಣಿಗಳು`
                  : `Comprehensive scores across all ${availableSubjects.length} subjects with total converted marks, percentage, and grade`}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E3EBF3] text-[#16284F] dark:bg-[#202F42] dark:text-[#2563EB]">
              {availableSubjects.length} Subjects Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#EDF2F7] dark:bg-[#1E2B3C] text-[#243449] dark:text-[#F1F5F9] font-bold uppercase text-[10px]">
                <tr>
                  <th rowSpan={2} className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50] w-10">
                    {language === 'kn' ? 'ಕ್ರ.ಸಂ.' : 'Sl'}
                  </th>
                  <th rowSpan={2} className="py-3 px-4 border border-[#D8E1EA] dark:border-[#2A3B50] w-52">
                    {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು / SATS' : 'Student Name & SATS'}
                  </th>
                  {availableSubjects.map((sub) => (
                    <th
                      key={sub}
                      colSpan={2}
                      className="py-2 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50]"
                    >
                      {sub}
                    </th>
                  ))}
                  <th rowSpan={2} className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] text-[#16284F] dark:text-[#2563EB]">
                    {language === 'kn' ? 'ಒಟ್ಟು ಅಂಕಗಳು' : 'Total Marks'}
                  </th>
                  <th rowSpan={2} className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50]">
                    %
                  </th>
                  <th rowSpan={2} className="py-3 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50]">
                    Grade
                  </th>
                  <th rowSpan={2} className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50]">
                    Status
                  </th>
                </tr>
                <tr>
                  {availableSubjects.map((sub) => (
                    <React.Fragment key={`${sub}-sub`}>
                      <th className="py-1 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] text-[9px] text-[#64748B]">
                        Mks
                      </th>
                      <th className="py-1 px-1 text-center border border-[#D8E1EA] dark:border-[#2A3B50] text-[9px] text-[#64748B]">
                        Grd
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E1EA] dark:divide-[#2A3B50] text-[#243449] dark:text-[#F1F5F9]">
                {activeStudents.length === 0 ? (
                  <tr>
                    <td colSpan={availableSubjects.length * 2 + 6} className="py-12 text-center text-slate-400">
                      No active students found in Class {selectedClass}-{selectedSection}.
                    </td>
                  </tr>
                ) : (
                  activeStudents.map((st, idx) => {
                    const summary = getAssessmentStudentSummary(st.id, selectedAssessment);
                    return (
                      <tr key={st.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E2B3C]/50 transition-colors">
                        <td className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 border border-[#D8E1EA] dark:border-[#2A3B50]">
                          <div className="font-bold text-[#243449] dark:text-[#F1F5F9]">{getStudentName(st, language)}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            SATS: {st.sats_no} • Adm: {st.admission_no}
                          </div>
                        </td>
                        {availableSubjects.map((sub) => {
                          const m = getStudentMarkForAssessment(st.id, sub, selectedAssessment);
                          return (
                            <React.Fragment key={sub}>
                              <td className="py-3 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold">
                                {m.marks}
                              </td>
                              <td className="py-3 px-1 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-[11px] text-[#3977A8]">
                                {m.grade}
                              </td>
                            </React.Fragment>
                          );
                        })}
                        <td className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-mono font-bold text-[#16284F] dark:text-[#2563EB] bg-[#EBF3FC]/40 dark:bg-slate-800/40">
                          {summary.totalObtained}
                        </td>
                        <td className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-mono font-bold">
                          {summary.percentage}%
                        </td>
                        <td className="py-3 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-black text-[#16284F] dark:text-[#2563EB]">
                          {summary.overallGrade}
                        </td>
                        <td className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50]">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              Number(summary.percentage) >= 35
                                ? 'bg-[#EBF3FC] text-[#16284F] dark:bg-slate-800 dark:text-[#2563EB]'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                            }`}
                          >
                            {Number(summary.percentage) >= 35 ? 'PASS' : 'REMEDIAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT VIEW 2: SCHOOL ANNUAL CONSOLIDATED REGISTER */}
      {reportMode === 'ANNUAL_SCHOOL' && (
        <div className="rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-[#D8E1EA] dark:border-[#2A3B50] bg-[#F3F6F9] dark:bg-[#1E2B3C] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#243449] dark:text-[#F1F5F9] uppercase tracking-wider">
                {language === 'kn'
                  ? `ಶಾಲಾ ವಾರ್ಷಿಕ ಕ್ರೋಢೀಕೃತ ರಿಜಿಸ್ಟರ್ (ತರಗತಿ ${selectedClass}-${selectedSection})`
                  : `School Annual Consolidated Register (Class ${selectedClass}-${selectedSection})`}
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                {language === 'kn'
                  ? 'ಸಂಪೂರ್ಣ ಶೈಕ್ಷಣಿಕ ವರ್ಷದ ಮೌಲ್ಯಮಾಪನ ಸರಣಿ (FA1-FA4, SA1-SA2, ವಾರ್ಷಿಕ ಮೊತ್ತ) + ಪಠ್ಯೇತರ ಮೌಲ್ಯಮಾಪನ'
                  : 'Full academic year assessment series (FA1-FA4, SA1-SA2, Annual Total) + Co-Curricular CCE Evaluation'}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E3EBF3] text-[#16284F] dark:bg-[#202F42] dark:text-[#2563EB]">
              {availableSubjects.length} Curricular Subjects Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#EDF2F7] dark:bg-[#1E2B3C] text-[#243449] dark:text-[#F1F5F9] font-bold uppercase text-[10px]">
                <tr>
                  <th rowSpan={2} className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50] w-10">
                    {language === 'kn' ? 'ಕ್ರ.ಸಂ.' : 'Sl'}
                  </th>
                  <th rowSpan={2} className="py-3 px-4 border border-[#D8E1EA] dark:border-[#2A3B50] w-48">
                    {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ವಿವರ' : 'Student Information'}
                  </th>
                  <th rowSpan={2} className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50] w-28">
                    {language === 'kn' ? 'ಮೌಲ್ಯಮಾಪನ' : 'Assessment'}
                  </th>
                  <th rowSpan={2} className="py-3 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] w-14">
                    {language === 'kn' ? 'ಗರಿಷ್ಠ' : 'Max'}
                  </th>
                  {availableSubjects.map((sub) => (
                    <th
                      key={sub}
                      colSpan={2}
                      className="py-2.5 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-[#16284F] dark:text-[#2563EB] bg-[#E3EBF3] dark:bg-[#202F42]"
                    >
                      {sub}
                    </th>
                  ))}
                  <th
                    colSpan={4}
                    className="py-2.5 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-[#3977A8] dark:text-[#4B8DC2] bg-[#EAF0F6] dark:bg-[#1E2B3C]"
                  >
                    {language === 'kn' ? 'ಪಠ್ಯೇತರ ಮೌಲ್ಯಮಾಪನ' : 'Co-Curricular CCE'}
                  </th>
                </tr>
                <tr>
                  {availableSubjects.map((sub) => (
                    <React.Fragment key={`${sub}-sub`}>
                      <th className="py-1 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] text-[9px] text-[#64748B]">
                        Mks
                      </th>
                      <th className="py-1 px-1 text-center border border-[#D8E1EA] dark:border-[#2A3B50] text-[9px] text-[#64748B]">
                        Grd
                      </th>
                    </React.Fragment>
                  ))}
                  <th className="py-1 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] text-[9px]">Daihika</th>
                  <th className="py-1 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] text-[9px]">Moulya</th>
                  <th className="py-1 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] text-[9px]">Kaarya</th>
                  <th className="py-1 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] text-[9px]">Kala</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E1EA] dark:divide-[#2A3B50] text-[#243449] dark:text-[#F1F5F9]">
                {activeStudents.map((st, idx) => {
                  const co = state.coCurricular.find(
                    (c) => c.school_id === currentSchool?.id && c.academic_year === academicYear && c.student_id === st.id
                  );

                  return (
                    <React.Fragment key={st.id}>
                      {assessmentRows.map((ar, rIdx) => {
                        const isAnnual = ar.code === 'ANNUAL';
                        const isSem = ar.code === 'SEM1' || ar.code === 'SEM2';

                        return (
                          <tr
                            key={`${st.id}-${ar.code}`}
                            className={`transition-colors ${
                              isAnnual
                                ? 'bg-[#EBF3FC]/30 dark:bg-slate-800/60 font-bold'
                                : isSem
                                ? 'bg-[#F4F7F9] dark:bg-[#1E2B3C]/50 font-semibold'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                            }`}
                          >
                            {rIdx === 0 && (
                              <td
                                rowSpan={assessmentRows.length}
                                className="py-3 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-slate-400 align-top"
                              >
                                {idx + 1}
                              </td>
                            )}

                            {rIdx === 0 && (
                              <td
                                rowSpan={assessmentRows.length}
                                className="py-3 px-4 border border-[#D8E1EA] dark:border-[#2A3B50] font-bold align-top bg-white dark:bg-[#1A2636]"
                              >
                                <div className="text-[#243449] dark:text-[#F1F5F9] font-bold">{getStudentName(st, language)}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  SATS: {st.sats_no}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Adm: {st.admission_no}
                                </div>
                              </td>
                            )}

                            <td className="py-2 px-3 text-center border border-[#D8E1EA] dark:border-[#2A3B50]">
                              {ar.label}
                            </td>
                            <td className="py-2 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[11px] text-slate-500">
                              {ar.max}
                            </td>

                            {availableSubjects.map((sub) => {
                              const m = getStudentMarkForAssessment(st.id, sub, ar.code);
                              return (
                                <React.Fragment key={sub}>
                                  <td className="py-2 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold">
                                    {m.marks}
                                  </td>
                                  <td className="py-2 px-1 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-[10px] text-[#3977A8]">
                                    {m.grade}
                                  </td>
                                </React.Fragment>
                              );
                            })}

                            {rIdx === 0 && (
                              <>
                                <td rowSpan={assessmentRows.length} className="py-3 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-[#16284F] dark:text-[#2563EB] bg-[#EBF3FC]/20 dark:bg-slate-800/30 align-middle">
                                  {co?.daihika_arogya || '-'}
                                </td>
                                <td rowSpan={assessmentRows.length} className="py-3 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-[#16284F] dark:text-[#2563EB] bg-[#EBF3FC]/20 dark:bg-slate-800/30 align-middle">
                                  {co?.moulya || '-'}
                                </td>
                                <td rowSpan={assessmentRows.length} className="py-3 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-[#16284F] dark:text-[#2563EB] bg-[#EBF3FC]/20 dark:bg-slate-800/30 align-middle">
                                  {co?.kaaryanubhava || '-'}
                                </td>
                                <td rowSpan={assessmentRows.length} className="py-3 px-2 text-center border border-[#D8E1EA] dark:border-[#2A3B50] font-bold text-[#16284F] dark:text-[#2563EB] bg-[#EBF3FC]/20 dark:bg-slate-800/30 align-middle">
                                  {co?.kala || '-'}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL */}
      {previewModalOpen && currentSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#0F1D3B] bg-[#16284F] text-white">
              <div>
                <h3 className="text-base font-bold">
                  {reportMode === 'ASSESSMENT_WISE'
                    ? `Assessment Report Preview: ${selectedAssessment} (Class ${selectedClass}-${selectedSection})`
                    : `Annual School Consolidated Register Preview (Class ${selectedClass}-${selectedSection})`}
                </h3>
                <p className="text-xs text-white/80">{currentSchool.name} • {academicYear}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintOfficialConsolidatedReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 rounded-xl text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950">
              <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-300 print-page text-xs">
                <div className="text-center border-b pb-3 mb-4">
                  <h1 className="text-xl font-bold uppercase">{getSchoolName(currentSchool, language)}</h1>
                  <p className="text-slate-600 text-xs">
                    {getLocationName(currentSchool.taluk, language, currentSchool.taluk_kannada)}, {getLocationName(currentSchool.district, language, currentSchool.district_kannada)} | UDISE: {currentSchool.udise}
                  </p>
                  <div className="font-bold text-slate-800 mt-1 uppercase">
                    {reportMode === 'ASSESSMENT_WISE'
                      ? `${selectedAssessment} Consolidated Evaluation Register — Class ${selectedClass}-${selectedSection} (${academicYear})`
                      : `Annual Master Evaluation Register — Class ${selectedClass}-${selectedSection} (${academicYear})`}
                  </div>
                </div>

                <div className="text-slate-600 text-xs mb-3 flex justify-between font-mono">
                  <span>Enrolled: {activeStudents.length} Students</span>
                  <span>Date: {todayString || '—'}</span>
                </div>

                <div className="overflow-x-auto my-4">
                  {reportMode === 'ASSESSMENT_WISE' ? (
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold border border-slate-300">
                          <th className="p-2 text-center border border-slate-300 w-8">#</th>
                          <th className="p-2 border border-slate-300 w-48">Student Name & SATS</th>
                          {availableSubjects.map((sub) => (
                            <th key={sub} className="p-2 text-center border border-slate-300">
                              {sub.split(' ')[0]}
                            </th>
                          ))}
                          <th className="p-2 text-center border border-slate-300 font-bold bg-slate-200">Total</th>
                          <th className="p-2 text-center border border-slate-300">%</th>
                          <th className="p-2 text-center border border-slate-300">Grade</th>
                          <th className="p-2 text-center border border-slate-300">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeStudents.map((st, idx) => {
                          const summary = getAssessmentStudentSummary(st.id, selectedAssessment);
                          return (
                            <tr key={st.id} className="border border-slate-200 hover:bg-slate-50">
                              <td className="p-2 text-center border border-slate-200 font-mono">{idx + 1}</td>
                              <td className="p-2 border border-slate-200 font-semibold">
                                <div>{getStudentName(st, language)}</div>
                                <div className="text-[9px] text-slate-500 font-mono">SATS: {st.sats_no}</div>
                              </td>
                              {availableSubjects.map((sub) => {
                                const m = getStudentMarkForAssessment(st.id, sub, selectedAssessment);
                                return (
                                  <td key={sub} className="p-2 text-center border border-slate-200 font-bold">
                                    {m.marks}
                                  </td>
                                );
                              })}
                              <td className="p-2 text-center border border-slate-200 font-bold font-mono bg-slate-50">
                                {summary.totalObtained}
                              </td>
                              <td className="p-2 text-center border border-slate-200 font-mono">
                                {summary.percentage}%
                              </td>
                              <td className="p-2 text-center border border-slate-200 font-bold text-blue-700">
                                {summary.overallGrade}
                              </td>
                              <td className="p-2 text-center border border-slate-200 font-semibold">
                                <span className={Number(summary.percentage) >= 35 ? 'text-blue-700 font-bold' : 'text-rose-600'}>
                                  {Number(summary.percentage) >= 35 ? 'PASSED' : 'NEEDS REMEDIAL'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold">
                          <th rowSpan={2} className="p-2 text-center border border-slate-300">#</th>
                          <th rowSpan={2} className="p-2 border border-slate-300">Student Name & SATS</th>
                          <th rowSpan={2} className="p-2 text-center border border-slate-300">Assessment</th>
                          <th rowSpan={2} className="p-2 text-center border border-slate-300">Max</th>
                          {availableSubjects.map((sub) => (
                            <th key={sub} colSpan={2} className="p-2 text-center border border-slate-300">
                              {sub.split(' ')[0]}
                            </th>
                          ))}
                          <th colSpan={4} className="p-2 text-center border border-slate-300">Co-Curricular</th>
                        </tr>
                        <tr className="bg-slate-100 text-slate-800 font-bold">
                          {availableSubjects.map((sub) => (
                            <React.Fragment key={`${sub}-preview`}>
                              <th className="p-1 text-center border border-slate-300">Mks</th>
                              <th className="p-1 text-center border border-slate-300">Grd</th>
                            </React.Fragment>
                          ))}
                          <th className="p-1 text-center border border-slate-300">Daihika</th>
                          <th className="p-1 text-center border border-slate-300">Moulya</th>
                          <th className="p-1 text-center border border-slate-300">Kaarya</th>
                          <th className="p-1 text-center border border-slate-300">Kala</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeStudents.map((st, idx) => {
                          const co = state.coCurricular.find(
                            (record) =>
                              record.school_id === currentSchool.id &&
                              record.academic_year === academicYear &&
                              record.student_id === st.id
                          );
                          return assessmentRows.map((assessment, rowIndex) => (
                            <tr key={`${st.id}-${assessment.code}`} className={assessment.code === 'ANNUAL' ? 'bg-slate-100 font-bold' : ''}>
                              {rowIndex === 0 && (
                                <>
                                  <td rowSpan={assessmentRows.length} className="p-2 text-center border border-slate-300">{idx + 1}</td>
                                  <td rowSpan={assessmentRows.length} className="p-2 border border-slate-300 font-semibold">
                                    <div>{getStudentName(st, language)}</div>
                                    <div className="text-[9px] text-slate-500 font-mono">SATS: {st.sats_no}</div>
                                  </td>
                                </>
                              )}
                              <td className="p-2 text-center border border-slate-300">{assessment.label}</td>
                              <td className="p-2 text-center border border-slate-300">{assessment.max}</td>
                              {availableSubjects.map((sub) => {
                                const mark = getStudentMarkForAssessment(st.id, sub, assessment.code);
                                return (
                                  <React.Fragment key={sub}>
                                    <td className="p-2 text-center border border-slate-300">{mark.marks}</td>
                                    <td className="p-2 text-center border border-slate-300">{mark.grade}</td>
                                  </React.Fragment>
                                );
                              })}
                              {rowIndex === 0 && (
                                <>
                                  <td rowSpan={assessmentRows.length} className="p-2 text-center border border-slate-300">{co?.daihika_arogya || '-'}</td>
                                  <td rowSpan={assessmentRows.length} className="p-2 text-center border border-slate-300">{co?.moulya || '-'}</td>
                                  <td rowSpan={assessmentRows.length} className="p-2 text-center border border-slate-300">{co?.kaaryanubhava || '-'}</td>
                                  <td rowSpan={assessmentRows.length} className="p-2 text-center border border-slate-300">{co?.kala || '-'}</td>
                                </>
                              )}
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Official Signatures Block (A4 Formatted, Clean 2-Column without Seal Box) */}
                <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 items-end text-center text-xs">
                  <div>
                    <div className="border-b border-slate-700 w-40 mx-auto mb-1.5" />
                    <span className="font-bold text-slate-900 text-xs">Class Teacher</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-700 w-40 mx-auto mb-1.5" />
                    <span className="font-bold text-slate-900 text-xs">Headmaster Signature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
