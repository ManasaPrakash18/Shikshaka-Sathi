'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  FileText,
  Printer,
  Download,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  BookOpen,
  Eye,
  Send,
  ShieldCheck,
  Check,
  X,
  Building,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  generateTransferCertificatePDF,
  generateStudyCertificatePDF,
  generateMarksCardPDF,
  downloadElementAsPDF,
  toSafePdfText,
} from '@/lib/pdf/documentGenerator';
import {
  getStudentName,
  getFatherName,
  getMotherName,
  getSchoolName,
  getHMName,
  getSubjectName,
  getLocationName,
} from '@/lib/utils/kannadaNames';
import { calculateAnnualMarks, calculateGrade, getAnnualMaximumMarks, getStandardSubjects } from '@/lib/cce/calculations';
import { Student, TransferCertificate } from '@/lib/types';
import {
  printOfficialTransferCertificate,
  printBilingualConfirmationCertificate,
  printOfficialProgressCard,
  getOfficialTransferCertificateHTML,
  getOfficialBilingualCertificateHTML,
  getOfficialProgressCardHTML,
} from '@/lib/pdf/officialPrintTemplates';
import { getDobInWords } from '@/lib/utils/dobWords';

export default function RecordsPage() {
  const { currentSchool, academicYear, userRole } = useAuth();
  const { state, finalizeTransferCertificate, issueStudyCertificate } = useAppState();
  const { t, language, pdfLanguage } = useLanguage();

  // Strict role check: Platform Admin only has access to School Access Management
  if (userRole === 'PLATFORM_ADMIN') {
    return (
      <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 space-y-3">
        <h2 className="text-xl font-black">Platform Admin View Restricted</h2>
        <p className="text-xs sm:text-sm">
          Platform administrators oversee statewide school onboarding and credential approvals. Certificate issuance belongs to individual school institutions.
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'TC' | 'STUDY' | 'MARKS_CARD'>('TC');

  // Selected Student
  const activeStudents = state.students.filter(
    (s) => s.school_id === currentSchool?.id && s.academic_year === academicYear && s.status === 'ACTIVE'
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(activeStudents[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-select student once loaded
  useEffect(() => {
    if (!selectedStudentId && activeStudents.length > 0) {
      setSelectedStudentId(activeStudents[0].id);
    }
  }, [activeStudents, selectedStudentId]);

  const filteredStudents = activeStudents.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.sats_no && s.sats_no.toLowerCase().includes(q)) ||
      s.admission_no.toLowerCase().includes(q) ||
      (s.pen_no && s.pen_no.toLowerCase().includes(q)) ||
      `class ${s.class_number}`.toLowerCase().includes(q)
    );
  });

  const student = state.students.find((s) => s.id === selectedStudentId) || filteredStudents[0] || activeStudents[0];

  // Toggle states requested by user
  const [isPromoted, setIsPromoted] = useState<boolean>(true);
  const [isFeesPaid, setIsFeesPaid] = useState<boolean>(true);

  // TC Form Overrides
  const [tcData, setTcData] = useState({
    tc_no: `TC/2026-27/104`,
    sanchita_dakhale_no: 'SD-1048',
    fee_discount: 'Government Fee Concession',
    scholarship: 'Karnataka Vidyasiri Scholarship',
    medical_test_info: 'Normal / Fit',
    last_attendance_date: '2027-03-31',
    tc_application_date: '2026-10-15',
    tc_issue_date: '2026-10-15',
    total_working_days: 220,
    days_attended: 208,
    behaviour: 'Good & Satisfactory',
  });

  // Study Certificate Overrides — language kept in sync with docLanguage
  const [studyData, setStudyData] = useState({
    certificate_no: `SC/2026-27/104`,
    status_type: 'Currently Studying' as 'Currently Studying' | 'Passed Out',
    issue_date: '2026-10-15',
    place_of_issue: currentSchool?.taluk || 'Mysuru South',
    language: (pdfLanguage === 'KN' || language === 'kn' ? 'KN' : 'EN') as 'EN' | 'KN',
  });

  // Document language preference: automatically defaults to PDF Output Language from settings or interface language
  const [docLanguage, setDocLanguageState] = useState<'KN' | 'EN'>(() =>
    pdfLanguage === 'KN' || language === 'kn' ? 'KN' : 'EN'
  );
  const [previewDocLang, setPreviewDocLang] = useState<'KN' | 'EN'>(() =>
    pdfLanguage === 'KN' || language === 'kn' ? 'KN' : 'EN'
  );

  // Helper to change document language and keep studyData.language in sync
  const setDocLanguage = (lang: 'KN' | 'EN') => {
    setDocLanguageState(lang);
    setPreviewDocLang(lang);
    setStudyData((prev) => ({ ...prev, language: lang }));
  };

  // Synchronize document language whenever PDF settings or interface language changes
  useEffect(() => {
    const isKn = pdfLanguage === 'KN' || language === 'kn';
    setDocLanguageState(isKn ? 'KN' : 'EN');
    setPreviewDocLang(isKn ? 'KN' : 'EN');
    setStudyData((prev) => ({ ...prev, language: isKn ? 'KN' : 'EN' }));
  }, [pdfLanguage, language]);

  // Modal States
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'TC' | 'STUDY' | 'MARKS_CARD'>('TC');
  const [showTransferConfirmModal, setShowTransferConfirmModal] = useState(false);
  const [transferredNotice, setTransferredNotice] = useState<{ name: string; tcNo: string } | null>(null);

  // Helper to compile TC object from current student & form data
  const buildTCObject = (): TransferCertificate | null => {
    if (!student || !currentSchool) return null;
    const promotedText = isPromoted
      ? 'Yes, Qualified for Promotion to Next Standard'
      : 'No, Not Promoted (Retained in Standard)';

    const feesPaidText = isFeesPaid
      ? 'Yes, All School Dues & Fees Fully Cleared'
      : 'No, Fees Dues Pending';

    return {
      id: `tc_${student.id}`,
      tc_no: tcData.tc_no,
      school_id: currentSchool.id,
      student_id: student.id,
      academic_year: academicYear,
      sanchita_dakhale_no: tcData.sanchita_dakhale_no,
      student_name: student.name,
      place_of_birth: student.place_of_birth || currentSchool.taluk,
      taluk: student.taluk || currentSchool.taluk,
      district: student.district || currentSchool.district,
      state: student.state || 'Karnataka',
      gender: student.gender,
      nationality: student.nationality || 'Indian',
      religion: student.religion || 'Hindu',
      caste: student.caste || 'General',
      sub_caste: student.sub_caste || '',
      category: student.category,
      father_name: student.father_name,
      mother_name: student.mother_name,
      whether_promoted: promotedText,
      dob: student.dob,
      class_studying: student.class_number,
      medium_of_teaching: student.medium_of_instruction || 'Kannada',
      date_of_admission: student.admission_date || '2021-06-10',
      whether_fees_paid: feesPaidText,
      fee_discount: tcData.fee_discount,
      scholarship: tcData.scholarship,
      medical_test_info: tcData.medical_test_info,
      last_attendance_date: tcData.last_attendance_date,
      tc_application_date: tcData.tc_application_date,
      tc_issue_date: tcData.tc_issue_date,
      total_working_days: tcData.total_working_days,
      days_attended: tcData.days_attended,
      behaviour: tcData.behaviour,
      sats_no: student.sats_no,
      pen_no: student.pen_no || '',
      apaar_id: student.apaar_id || '',
      aadhaar_no: student.aadhaar_no || '',
      status: 'FINALIZED',
      created_at: student.created_at || '2026-06-01T00:00:00.000Z',
      updated_at: student.updated_at || '2026-06-01T00:00:00.000Z',
    };
  };

  // Print Official 28-field Karnataka TC with Emblem & QR Code (githubversion format)
  const handlePrintOfficialTC = () => {
    if (!student || !currentSchool) return;
    const tc = buildTCObject();
    if (tc) {
      printOfficialTransferCertificate(
        tc,
        student,
        currentSchool,
        (previewDocLang || docLanguage).toLowerCase() as 'kn' | 'en'
      );
    }
  };

  // Print Official Bilingual Confirmation Certificate (Single A4 Page with dual QR Codes)
  const handlePrintOfficialStudy = () => {
    if (!student || !currentSchool) return;
    printBilingualConfirmationCertificate(
      student,
      currentSchool,
      studyData.issue_date,
      studyData.place_of_issue,
      studyData.certificate_no
    );
  };

  // Print Official Progress Card (Karnataka CCE A4 Single Page)
  const handlePrintOfficialMarksCard = () => {
    if (!student || !currentSchool) return;
    const assessments = state.assessments.filter(
      (a) =>
        a.school_id === currentSchool.id &&
        a.academic_year === academicYear &&
        a.student_id === student.id
    );
    const coCurricular = state.coCurricular.find(
      (c) =>
        c.school_id === currentSchool.id &&
        c.academic_year === academicYear &&
        c.student_id === student.id
    );
    printOfficialProgressCard(
      student,
      currentSchool,
      assessments,
      coCurricular,
      (previewDocLang || docLanguage).toLowerCase() as 'kn' | 'en'
    );
  };

  // Universal Official Document Print Trigger
  const handlePrintDocument = () => {
    if (previewType === 'TC') handlePrintOfficialTC();
    else if (previewType === 'STUDY') handlePrintOfficialStudy();
    else handlePrintOfficialMarksCard();
  };

  // Immediate Download of TC PDF (Handles both Kannada & English)
  const handleDownloadTCPDF = async () => {
    const isKn = docLanguage === 'KN';
    const sheetEl = document.getElementById('official-document-printable-sheet') || document.getElementById('hidden-kannada-document-sheet');
    if (isKn && sheetEl) {
      const cleanName = `TC_${tcData.tc_no.replace(/[^a-zA-Z0-9]/g, '_')}_${toSafePdfText(student?.name, 'Student').replace(/[\s/]/g, '_')}.pdf`;
      const success = await downloadElementAsPDF(sheetEl, cleanName);
      if (success) return;
    }
    const tc = buildTCObject();
    if (tc && currentSchool) {
      generateTransferCertificatePDF(tc, currentSchool);
    }
  };

  // Formal Transfer Action (Triggered via clear in-app confirmation modal)
  const handleExecuteTransfer = async () => {
    if (!student || !currentSchool) return;

    const promotedText = isPromoted
      ? 'Yes, Qualified for Promotion to Next Standard'
      : 'No, Not Promoted (Retained in Standard)';

    const feesPaidText = isFeesPaid
      ? 'Yes, All School Dues & Fees Fully Cleared'
      : 'No, Fees Dues Pending';

    const tc = await finalizeTransferCertificate({
      tc_no: tcData.tc_no,
      school_id: currentSchool.id,
      student_id: student.id,
      academic_year: academicYear,
      sanchita_dakhale_no: tcData.sanchita_dakhale_no,
      student_name: student.name,
      place_of_birth: student.place_of_birth || currentSchool.taluk,
      taluk: student.taluk || currentSchool.taluk,
      district: student.district || currentSchool.district,
      state: student.state || 'Karnataka',
      gender: student.gender,
      nationality: student.nationality || 'Indian',
      religion: student.religion || 'Hindu',
      caste: student.caste || 'General',
      sub_caste: student.sub_caste || '',
      category: student.category,
      father_name: student.father_name,
      mother_name: student.mother_name,
      whether_promoted: promotedText,
      dob: student.dob,
      class_studying: student.class_number,
      medium_of_teaching: student.medium_of_instruction || 'Kannada',
      date_of_admission: student.admission_date || '2021-06-10',
      whether_fees_paid: feesPaidText,
      fee_discount: tcData.fee_discount,
      scholarship: tcData.scholarship,
      medical_test_info: tcData.medical_test_info,
      last_attendance_date: tcData.last_attendance_date,
      tc_application_date: tcData.tc_application_date,
      tc_issue_date: tcData.tc_issue_date,
      total_working_days: tcData.total_working_days,
      days_attended: tcData.days_attended,
      behaviour: tcData.behaviour,
      sats_no: student.sats_no,
      pen_no: student.pen_no || '',
      apaar_id: student.apaar_id || '',
      aadhaar_no: student.aadhaar_no || '',
      status: 'FINALIZED',
    });

    const isKn = docLanguage === 'KN';
    const sheetEl = document.getElementById('official-document-printable-sheet') || document.getElementById('hidden-kannada-document-sheet');
    if (isKn && sheetEl) {
      const cleanName = `TC_${tcData.tc_no.replace(/[^a-zA-Z0-9]/g, '_')}_${toSafePdfText(student.name, 'Student').replace(/[\s/]/g, '_')}.pdf`;
      const success = await downloadElementAsPDF(sheetEl, cleanName);
      if (!success && currentSchool) {
        generateTransferCertificatePDF(tc, currentSchool);
      }
    } else {
      generateTransferCertificatePDF(tc, currentSchool);
    }
    setShowTransferConfirmModal(false);
    setTransferredNotice({ name: student.name, tcNo: tcData.tc_no });

    const remaining = activeStudents.filter((s) => s.id !== student.id);
    if (remaining.length > 0) {
      setSelectedStudentId(remaining[0].id);
    }
  };

  // Handle Study Certificate Generate
  const handleGenerateStudyCert = async () => {
    if (!student || !currentSchool) return;

    let finalCertNo = studyData.certificate_no.trim();
    if (!finalCertNo || state.studyCertificates.some((c) => c.certificate_no === finalCertNo)) {
      finalCertNo = `SC/${academicYear}/${Date.now().toString().slice(-4)}`;
    }

    const isKn = docLanguage === 'KN';
    const sheetEl = document.getElementById('official-document-printable-sheet') || document.getElementById('hidden-kannada-document-sheet');
    if (isKn && sheetEl) {
      const cleanName = `Vyasanga_Pramana_Patra_${toSafePdfText(student.name, 'Student').replace(/[\s/]/g, '_')}.pdf`;
      const success = await downloadElementAsPDF(sheetEl, cleanName);
      if (success) {
        await issueStudyCertificate({
          certificate_no: finalCertNo,
          school_id: currentSchool.id,
          student_id: student.id,
          student_name: student.name,
          father_name: student.father_name,
          place: student.place_of_birth || currentSchool.taluk,
          taluk: student.taluk || currentSchool.taluk,
          district: student.district || currentSchool.district,
          status_type: studyData.status_type,
          dob: student.dob,
          place_of_birth: student.place_of_birth || currentSchool.taluk,
          caste: student.caste || 'General',
          admission_no: student.admission_no,
          sats_no: student.sats_no,
          pen_no: student.pen_no || '',
          class_studying: student.class_number,
          academic_year: academicYear,
          issue_date: studyData.issue_date,
          place_of_issue: studyData.place_of_issue,
          language: studyData.language,
        });
        return;
      }
    }

    const cert = await issueStudyCertificate({
      certificate_no: finalCertNo,
      school_id: currentSchool.id,
      student_id: student.id,
      student_name: student.name,
      father_name: student.father_name,
      place: student.place_of_birth || currentSchool.taluk,
      taluk: student.taluk || currentSchool.taluk,
      district: student.district || currentSchool.district,
      status_type: studyData.status_type,
      dob: student.dob,
      place_of_birth: student.place_of_birth || currentSchool.taluk,
      caste: student.caste || 'General',
      admission_no: student.admission_no,
      sats_no: student.sats_no,
      pen_no: student.pen_no || '',
      class_studying: student.class_number,
      academic_year: academicYear,
      issue_date: studyData.issue_date,
      place_of_issue: studyData.place_of_issue,
      language: studyData.language,
    });

    generateStudyCertificatePDF(cert, currentSchool);
  };

  // Handle Marks Card PDF Generate
  const handleGenerateMarksCard = async () => {
    if (!student || !currentSchool) return;

    const isKn = docLanguage === 'KN';
    const sheetEl = document.getElementById('official-document-printable-sheet') || document.getElementById('hidden-kannada-document-sheet');
    if (isKn && sheetEl) {
      const cleanName = `MarksCard_${toSafePdfText(student.name, 'Student').replace(/[\s/]/g, '_')}_Class${student.class_number}.pdf`;
      const success = await downloadElementAsPDF(sheetEl, cleanName);
      if (success) return;
    }

    const subjects = getStandardSubjects(student.class_number);
    const assessments = state.assessments.filter(
      (a) =>
        a.school_id === currentSchool.id &&
        a.academic_year === academicYear &&
        a.student_id === student.id
    );
    const coCurricular = state.coCurricular.find(
      (c) =>
        c.school_id === currentSchool.id &&
        c.academic_year === academicYear &&
        c.student_id === student.id
    );

    generateMarksCardPDF(student, currentSchool, assessments, coCurricular, subjects);
  };

  // Open Preview Modal
  const openPreview = (type: 'TC' | 'STUDY' | 'MARKS_CARD') => {
    setPreviewType(type);
    setPreviewDocLang(docLanguage);
    setPreviewModalOpen(true);
  };

  // Reusable official certificate renderer (Used for both live preview and high-DPI Kannada PDF downloads)
  // Reusable official certificate renderer using the EXACT templates from githubversion.html
  const renderCertificateSheet = (
    type: 'TC' | 'STUDY' | 'MARKS_CARD',
    docLang: 'KN' | 'EN',
    containerId?: string
  ) => {
    if (!student || !currentSchool) return null;
    const lang = docLang.toLowerCase() as 'kn' | 'en';

    let htmlContent = '';
    if (type === 'TC') {
      const tc = buildTCObject();
      if (tc) {
        htmlContent = getOfficialTransferCertificateHTML(tc, student, currentSchool, lang, false);
      }
    } else if (type === 'STUDY') {
      htmlContent = getOfficialBilingualCertificateHTML(
        student,
        currentSchool,
        studyData.issue_date,
        studyData.place_of_issue,
        studyData.certificate_no,
        false
      );
    } else {
      const assessments = state.assessments.filter(
        (a) =>
          a.school_id === currentSchool.id &&
          a.academic_year === academicYear &&
          a.student_id === student.id
      );
      const coCurricular = state.coCurricular.find(
        (c) =>
          c.school_id === currentSchool.id &&
          c.academic_year === academicYear &&
          c.student_id === student.id
      );
      htmlContent = getOfficialProgressCardHTML(
        student,
        currentSchool,
        assessments,
        coCurricular,
        lang,
        false
      );
    }

    return (
      <div
        id={containerId}
        className="w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-xl border border-slate-300 relative print-page p-2 sm:p-4 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#16284F] dark:text-[#2563EB] font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            {language === 'kn' ? 'ಅಧಿಕೃತ ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ದಾಖಲೆಗಳ ಮಾಡ್ಯೂಲ್' : 'Official Certificates & Records Module'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243449] dark:text-[#F1F5F9] mt-1">
            {t.records.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">{t.records.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D8E1EA] pb-2 dark:border-[#2A3B50]">
        <button
          onClick={() => setActiveTab('TC')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'TC'
              ? 'bg-[#16284F] text-white shadow-sm'
              : 'bg-white dark:bg-[#1A2636] text-[#243449] dark:text-slate-300 hover:bg-[#F3F6F9] dark:hover:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50]'
          }`}
        >
          <FileText className="w-4 h-4" />
          {t.records.tabTc}
        </button>

        <button
          onClick={() => setActiveTab('STUDY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'STUDY'
              ? 'bg-[#16284F] text-white shadow-sm'
              : 'bg-white dark:bg-[#1A2636] text-[#243449] dark:text-slate-300 hover:bg-[#F3F6F9] dark:hover:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          {t.records.tabStudyCert}
        </button>

        <button
          onClick={() => setActiveTab('MARKS_CARD')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'MARKS_CARD'
              ? 'bg-[#16284F] text-white shadow-sm'
              : 'bg-white dark:bg-[#1A2636] text-[#243449] dark:text-slate-300 hover:bg-[#F3F6F9] dark:hover:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          {t.records.tabMarksCard}
        </button>
      </div>

      {/* Student Search & Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು, SATS, ದಾಖಲಾತಿ ಸಂಖ್ಯೆ ಮೂಲಕ ಹುಡುಕಿ...' : 'Search student by Name, SATS, Admission No, Class...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <label className="font-bold text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">{language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ:' : 'Student:'}</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full min-w-0 rounded-xl border border-[#D8E1EA] bg-[#F3F6F9] px-3 py-2 font-bold text-[#243449] dark:border-[#2A3B50] dark:bg-[#1E2B3C] dark:text-[#F1F5F9] cursor-pointer sm:max-w-xs"
            >
              {filteredStudents.length === 0 ? (
                <option value="">{language === 'kn' ? 'ಯಾವುದೇ ವಿದ್ಯಾರ್ಥಿ ಕಂಡುಬಂದಿಲ್ಲ' : 'No matching students'}</option>
              ) : (
                filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {getStudentName(s, language)} ({language === 'kn' ? `ತರಗತಿ ${s.class_number}-${s.section}` : `Class ${s.class_number}-${s.section}`} | SATS: {s.sats_no})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {student && (
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            <span>
              {language === 'kn' ? 'ದಾಖಲಾತಿ ಸಂಖ್ಯೆ:' : 'Adm No:'} <strong className="text-[#243449] dark:text-[#F1F5F9]">{student.admission_no}</strong>
            </span>
            <span>
              {language === 'kn' ? 'ವರ್ಗ:' : 'Category:'} <strong className="text-[#243449] dark:text-[#F1F5F9]">{student.category}</strong>
            </span>
            <span>
              {language === 'kn' ? 'ತಂದೆಯ ಹೆಸರು:' : 'Father:'} <strong className="text-[#243449] dark:text-[#F1F5F9]">{getFatherName(student, language)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* 1. TRANSFER CERTIFICATE (TC) VIEW & FORM */}
      {activeTab === 'TC' && student && (
        <div className="rounded-3xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E1EA] dark:border-[#2A3B50] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3977A8] dark:text-[#4B8DC2]">
                {language === 'kn' ? 'ಅಧಿಕೃತ ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆಯ ನಮೂನೆ' : 'Official Department Format (Formats.pdf Page 1)'}
              </span>
              <h2 className="text-lg font-bold text-[#243449] dark:text-[#F1F5F9] mt-0.5">
                {language === 'kn' ? 'ವರ್ಗಾವಣೆ ಪತ್ರ (TC) ವಿತರಣೆ' : 'Transfer Certificate (TC) Issuance'}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Document Language Switcher */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setDocLanguage('EN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    docLanguage === 'EN'
                      ? 'bg-white dark:bg-slate-700 text-[#16284F] dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setDocLanguage('KN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    docLanguage === 'KN'
                      ? 'bg-white dark:bg-slate-700 text-[#16284F] dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
              </div>

              <button
                onClick={() => openPreview('TC')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] hover:bg-[#D8E1EA] text-[#16284F] dark:text-[#2563EB] font-bold text-xs shadow-sm cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                {language === 'kn' ? 'ನೇರ ಪೂರ್ವವೀಕ್ಷಣೆ' : 'Live Preview TC'}
              </button>
              <button
                onClick={handleDownloadTCPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                title={language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಸ್ಥಿತಿಯನ್ನು ಬದಲಾಯಿಸದೆ ತಕ್ಷಣ ಟಿಸಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' : 'Download official TC PDF immediately without changing student status'}
              >
                <Download className="w-4 h-4" />
                {language === 'kn' ? 'ಟಿಸಿ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್' : 'Download TC PDF'}
              </button>
              <button
                onClick={handlePrintOfficialTC}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                title={language === 'kn' ? 'ಅಧಿಕೃತ 28 ಅಂಶಗಳ ಕರ್ನಾಟಕ ಟಿಸಿ ಮುದ್ರಿಸಿ (ರಾಜ್ಯ ಲಾಂಛನ & QR ಕೋಡ್)' : 'Print Official 28-field Karnataka TC (State Emblem & QR)'}
              >
                <Printer className="w-4 h-4" />
                {language === 'kn' ? 'ಅಧಿಕೃತ ಟಿಸಿ ಮುದ್ರಿಸಿ' : 'Print Official TC'}
              </button>
              <button
                onClick={() => setShowTransferConfirmModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-sm cursor-pointer"
                title={language === 'kn' ? 'ಶಾಶ್ವತವಾಗಿ ವರ್ಗಾವಣೆ ಮಾಡಿ ಮತ್ತು ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಗಳ ಪಟ್ಟಿಗೆ ಸೇರಿಸಿ' : 'Permanently transfer student and issue final TC'}
              >
                <FileText className="w-4 h-4" />
                {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ವರ್ಗಾವಣೆ ಮಾಡಿ ಟಿಸಿ ನೀಡಿ' : 'Finalize & Issue TC (Transfer)'}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>{language === 'kn' ? 'ಸೂಚನೆ:' : 'Note:'}</strong> {t.records.warningTcFinalize} {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ರಿಜಿಸ್ಟರ್‌ನಿಂದ ಭರ್ತಿ ಮಾಡಲಾಗಿದೆ. ಅಂತಿಮಗೊಳಿಸುವ ಮೊದಲು ಅಗತ್ಯ ಬದಲಾವಣೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.' : 'All student identity fields are prepopulated from the registry. You can adjust the certificate-specific parameters below before finalizing.'}
            </span>
          </div>

          {/* Form Fields including Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ವರ್ಗಾವಣೆ ಪತ್ರ ಸಂಖ್ಯೆ *' : 'TC Number *'}</label>
              <input
                type="text"
                value={tcData.tc_no}
                onChange={(e) => setTcData({ ...tcData, tc_no: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono font-bold text-[#243449] dark:text-[#F1F5F9]"
              />
            </div>
            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ಸಂಚಿತ ದಾಖಲೆ ಸಂಖ್ಯೆ' : 'Sanchita Dakhale Sankhye'}</label>
              <input
                type="text"
                value={tcData.sanchita_dakhale_no}
                onChange={(e) => setTcData({ ...tcData, sanchita_dakhale_no: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[#243449] dark:text-[#F1F5F9]"
              />
            </div>

            {/* TOGGLE 1: Whether Promoted */}
            <div className="p-3.5 rounded-2xl bg-[#EAF0F6] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ಮುಂದಿನ ತರಗತಿಗೆ ತೇರ್ಗಡೆಯಾಗಿದ್ದಾರೆಯೇ?:' : 'Whether Promoted:'}</span>
                <button
                  type="button"
                  onClick={() => setIsPromoted(!isPromoted)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    isPromoted ? 'bg-[#16284F]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle Whether Promoted"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isPromoted ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="mt-2 text-[11px] font-semibold flex items-center gap-1.5">
                {isPromoted ? (
                  <span className="text-[#16284F] dark:text-[#2563EB] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {language === 'kn' ? 'ಹೌದು (ಮುಂದಿನ ತರಗತಿಗೆ ತೇರ್ಗಡೆಯಾಗಿದ್ದಾರೆ)' : 'YES (Promoted to next standard)'}
                  </span>
                ) : (
                  <span className="text-[#C75B5B] flex items-center gap-1">
                    <X className="w-3.5 h-3.5" />
                    {language === 'kn' ? 'ಇಲ್ಲ (ತೇರ್ಗಡೆಯಾಗಿಲ್ಲ)' : 'NO (Retained / Not Promoted)'}
                  </span>
                )}
              </div>
            </div>

            {/* TOGGLE 2: Whether Fees Paid */}
            <div className="p-3.5 rounded-2xl bg-[#EAF0F6] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ಶಾಲಾ ಶುಲ್ಕ ಪಾವತಿಸಲಾಗಿದೆಯೇ?:' : 'Whether Fees Paid:'}</span>
                <button
                  type="button"
                  onClick={() => setIsFeesPaid(!isFeesPaid)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    isFeesPaid ? 'bg-[#16284F]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle Whether Fees Paid"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isFeesPaid ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="mt-2 text-[11px] font-semibold flex items-center gap-1.5">
                {isFeesPaid ? (
                  <span className="text-[#16284F] dark:text-[#2563EB] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {language === 'kn' ? 'ಹೌದು (ಎಲ್ಲಾ ಬಾಕಿ ಪಾವತಿಸಲಾಗಿದೆ)' : 'YES (All dues cleared)'}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {language === 'kn' ? 'ಇಲ್ಲ (ಶುಲ್ಕ ಬಾಕಿ ಇದೆ)' : 'NO (Fees Pending)'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿವೇತನದ ವಿವರ' : 'Scholarship Details'}</label>
              <input
                type="text"
                value={tcData.scholarship}
                onChange={(e) => setTcData({ ...tcData, scholarship: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] text-[#243449] dark:text-[#F1F5F9]"
              />
            </div>
            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ಸಾಮಾನ್ಯ ನಡತೆ ಮತ್ತು ಶೀಲ' : 'General Conduct / Behaviour'}</label>
              <input
                type="text"
                value={tcData.behaviour}
                onChange={(e) => setTcData({ ...tcData, behaviour: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] text-[#243449] dark:text-[#F1F5F9]"
              />
            </div>

            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ಒಟ್ಟು ಕೆಲಸದ ದಿನಗಳು' : 'Total Working Days'}</label>
              <input
                type="number"
                value={tcData.total_working_days}
                onChange={(e) => setTcData({ ...tcData, total_working_days: Number(e.target.value) })}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[#243449] dark:text-[#F1F5F9]"
              />
            </div>
            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ಹಾಜರಾದ ದಿನಗಳು' : 'Days Attended'}</label>
              <input
                type="number"
                value={tcData.days_attended}
                onChange={(e) => setTcData({ ...tcData, days_attended: Number(e.target.value) })}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[#243449] dark:text-[#F1F5F9]"
              />
            </div>
            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ಟಿಸಿ ನೀಡಿದ ದಿನಾಂಕ' : 'Date of TC Issue'}</label>
              <input
                type="date"
                value={tcData.tc_issue_date}
                onChange={(e) => setTcData({ ...tcData, tc_issue_date: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[#243449] dark:text-[#F1F5F9]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDY CERTIFICATE VIEW & FORM */}
      {activeTab === 'STUDY' && student && (
        <div className="rounded-3xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E1EA] dark:border-[#2A3B50] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3977A8] dark:text-[#4B8DC2]">
                {language === 'kn' ? 'ಅಧಿಕೃತ ಇಲಾಖಾ ವ್ಯಾಸಂಗ ಪ್ರಮಾಣಪತ್ರ ನಮೂನೆ' : 'Official Department Bonafide Study Certificate'}
              </span>
              <h2 className="text-lg font-bold text-[#243449] dark:text-[#F1F5F9] mt-0.5">
                {language === 'kn' ? 'ವ್ಯಾಸಂಗ ಪ್ರಮಾಣಪತ್ರ (Study Certificate)' : 'Study Certificate / ವ್ಯಾಸಂಗ ಪ್ರಮಾಣಪತ್ರ'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Document Language Switcher */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setDocLanguage('EN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    docLanguage === 'EN'
                      ? 'bg-white dark:bg-slate-700 text-[#16284F] dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setDocLanguage('KN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    docLanguage === 'KN'
                      ? 'bg-white dark:bg-slate-700 text-[#16284F] dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
              </div>

              <button
                onClick={() => openPreview('STUDY')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] hover:bg-[#D8E1EA] text-[#16284F] dark:text-[#2563EB] font-bold text-xs shadow-sm cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                {language === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರ ಪೂರ್ವವೀಕ್ಷಣೆ' : 'Live Preview Study Cert'}
              </button>
              <button
                onClick={handleGenerateStudyCert}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {language === 'kn' ? 'ವ್ಯಾಸಂಗ ಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' : 'Generate & Download Study Cert'}
              </button>
              <button
                onClick={handlePrintOfficialStudy}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                title={language === 'kn' ? 'ದ್ವಿಭಾಷಾ ದೃಢೀಕರಣ ಪತ್ರ ಮುದ್ರಿಸಿ (ಕನ್ನಡ + ಇಂಗ್ಲಿಷ್ ಒಂದೇ A4 ಪುಟದಲ್ಲಿ QR ಕೋಡ್ ಸಹಿತ)' : 'Print Bilingual Confirmation Certificate (A4 Single Page with QR)'}
              >
                <Printer className="w-4 h-4" />
                {language === 'kn' ? 'ದ್ವಿಭಾಷಾ ಪ್ರಮಾಣಪತ್ರ ಮುದ್ರಿಸಿ' : 'Print Bilingual Cert (A4)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರ ಸಂಖ್ಯೆ' : 'Certificate Number'}</label>
              <input
                type="text"
                value={studyData.certificate_no}
                onChange={(e) => setStudyData({ ...studyData, certificate_no: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono font-bold text-[#243449] dark:text-[#F1F5F9]"
              />
            </div>
            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಸ್ಥಿತಿ' : 'Student Status'}</label>
              <select
                value={studyData.status_type}
                onChange={(e) => setStudyData({ ...studyData, status_type: e.target.value as any })}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9]"
              >
                <option value="Currently Studying">{language === 'kn' ? 'ಹಾಲಿ ಓದುತ್ತಿದ್ದಾರೆ (Currently Studying)' : 'Currently Studying (ಹಾಲಿ ಓದುತ್ತಿದ್ದಾರೆ)'}</option>
                <option value="Passed Out">{language === 'kn' ? 'ತೇರ್ಗಡೆ ಹೊಂದಿದ್ದಾರೆ (Passed Out)' : 'Passed Out / Completed'}</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">{language === 'kn' ? 'ನೀಡಿದ ದಿನಾಂಕ' : 'Date of Issue'}</label>
              <input
                type="date"
                value={studyData.issue_date}
                onChange={(e) => setStudyData({ ...studyData, issue_date: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[#243449] dark:text-[#F1F5F9]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. MARKS CARD VIEW */}
      {activeTab === 'MARKS_CARD' && student && (
        <div className="rounded-3xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E1EA] dark:border-[#2A3B50] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3977A8] dark:text-[#4B8DC2]">
                {language === 'kn' ? 'ಕರ್ನಾಟಕ ಸಿಸಿಇ ರಾಜ್ಯ ಮಂಡಳಿ ಅಂಕಪಟ್ಟಿ' : 'Karnataka CCE State Board Marks Card'}
              </span>
              <h2 className="text-lg font-bold text-[#243449] dark:text-[#F1F5F9] mt-0.5">
                {language === 'kn' ? `ಅಧಿಕೃತ ಅಂಕಪಟ್ಟಿ — ತರಗತಿ ${student.class_number} (${academicYear})` : `Official Marks Card — Class ${student.class_number} (${academicYear})`}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Document Language Switcher */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setDocLanguage('EN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    docLanguage === 'EN'
                      ? 'bg-white dark:bg-slate-700 text-[#16284F] dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setDocLanguage('KN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    docLanguage === 'KN'
                      ? 'bg-white dark:bg-slate-700 text-[#16284F] dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
              </div>

              <button
                onClick={() => openPreview('MARKS_CARD')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D8E1EA] dark:border-[#2A3B50] bg-[#E3EBF3] dark:bg-[#202F42] hover:bg-[#D8E1EA] text-[#16284F] dark:text-[#2563EB] font-bold text-xs shadow-sm cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                {language === 'kn' ? 'ಅಂಕಪಟ್ಟಿ ಪೂರ್ವವೀಕ್ಷಣೆ' : 'Live Preview Marks Card'}
              </button>
              <button
                onClick={handleGenerateMarksCard}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {language === 'kn' ? 'ಅಂಕಪಟ್ಟಿ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್' : 'Download Marks Card PDF'}
              </button>
              <button
                onClick={handlePrintOfficialMarksCard}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                title={language === 'kn' ? 'ಅಧಿಕೃತ ಸಿಸಿಇ ಪ್ರಗತಿ ಪತ್ರ ಮುದ್ರಿಸಿ (A4 portrait format)' : 'Print Official CCE Marks Card (A4 format)'}
              >
                <Printer className="w-4 h-4" />
                {language === 'kn' ? 'ಅಧಿಕೃತ ಅಂಕಪಟ್ಟಿ ಮುದ್ರಿಸಿ' : 'Print Official Marks Card'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[#243449] dark:text-[#F1F5F9]">{getStudentName(student, language)}</span>
              <span className="text-slate-500 ml-2">{language === 'kn' ? `ತರಗತಿ ${student.class_number}-${student.section} • SATS: ${student.sats_no}` : `Class ${student.class_number}-${student.section} • SATS: ${student.sats_no}`}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#EBF3FC] text-[#16284F] dark:bg-slate-800 dark:text-[#2563EB] font-bold">
              {language === 'kn' ? 'ಮುದ್ರಣ ಮತ್ತು ಪಿಡಿಎಫ್‌ಗೆ ಸಿದ್ಧವಾಗಿದೆ' : 'Ready for Print & PDF'}
            </span>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewModalOpen && student && currentSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#0F1D3B] bg-[#16284F] text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold">
                    {language === 'kn'
                      ? `ಅಧಿಕೃತ ದಾಖಲೆಯ ಪೂರ್ವವೀಕ್ಷಣೆ — ${previewType === 'TC' ? 'ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರ' : previewType === 'STUDY' ? 'ವ್ಯಾಸಂಗ ಪ್ರಮಾಣಪತ್ರ' : 'ಸಿಸಿಇ ಅಂಕಪಟ್ಟಿ'}`
                      : `Official Document Preview — ${previewType === 'TC' ? 'Transfer Certificate' : previewType === 'STUDY' ? 'Bonafide Study Certificate' : 'CCE Marks Card'}`}
                  </h2>
                  <p className="text-[11px] text-white/80">
                    {getStudentName(student, language)} ({language === 'kn' ? `ತರಗತಿ ${student.class_number}-${student.section} | SATS: ${student.sats_no}` : `Class ${student.class_number}-${student.section} | SATS: ${student.sats_no}`})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Modal Document Language Switcher */}
                <div className="flex items-center p-0.5 bg-white/10 rounded-xl border border-white/20 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDocLang('EN')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      previewDocLang === 'EN'
                        ? 'bg-white text-[#16284F] shadow-sm'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDocLang('KN')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      previewDocLang === 'KN'
                        ? 'bg-white text-[#16284F] shadow-sm'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    ಕನ್ನಡ
                  </button>
                </div>

                <button
                  onClick={handlePrintDocument}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
                  title={language === 'kn' ? 'ದಾಖಲೆ ಮುದ್ರಿಸಿ' : 'Print Document'}
                >
                  <Printer className="w-3.5 h-3.5" />
                  {language === 'kn' ? 'ಮುದ್ರಿಸಿ' : 'Print'}
                </button>
                <button
                  onClick={() => {
                    setDocLanguage(previewDocLang);
                    if (previewType === 'TC') handleDownloadTCPDF();
                    else if (previewType === 'STUDY') handleGenerateStudyCert();
                    else handleGenerateMarksCard();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#16284F] hover:bg-[#EBF3FC] text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  {language === 'kn' ? 'ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Sheet Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
              {renderCertificateSheet(
                previewType,
                previewDocLang,
                'official-document-printable-sheet'
              )}
            </div>
          </div>
        </div>
      )}

      {/* In-App Transfer Certificate Confirmation Modal (Replaces disappearing browser prompt) */}
      {showTransferConfirmModal && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1A2636] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-2xl flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ವರ್ಗಾವಣೆ ಖಚಿತಪಡಿಸಿ (ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರ)' : 'Confirm Student Transfer (TC Issuance)'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {language === 'kn'
                    ? `ನೀವು ${getStudentName(student, language)} ಅವರಿಗೆ ಅಧಿಕೃತ ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರ ನೀಡಿ ವರ್ಗಾವಣೆಗೊಳಿಸುತ್ತಿದ್ದೀರಿ. ವಿದ್ಯಾರ್ಥಿಯ ಸ್ಥಿತಿ 'ವರ್ಗಾವಣೆಗೊಂಡವರು (TRANSFERRED)' ಎಂದು ಬದಲಾಗುತ್ತದೆ ಮತ್ತು ದಾಖಲೆಯನ್ನು ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಗಳ ವಿಭಾಗಕ್ಕೆ ಸರಿಸಲಾಗುತ್ತದೆ.`
                    : `You are about to finalize and issue an official Transfer Certificate for ${getStudentName(student, language)}. The student status will be updated to 'TRANSFERRED' and permanently archived in Former Students.`}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{language === 'kn' ? 'ಟಿಸಿ ಸಂಖ್ಯೆ:' : 'TC Number:'}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{tcData.tc_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಹೆಸರು:' : 'Student Name:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{getStudentName(student, language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{language === 'kn' ? 'ಸ್ಯಾಟ್ಸ್ ಸಂಖ್ಯೆ:' : 'SATS ID:'}</span>
                <span className="font-mono text-slate-800 dark:text-slate-100">{student.sats_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{language === 'kn' ? 'ತರಗತಿ & ವಿಭಾಗ:' : 'Class & Section:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{student.class_number}th Standard ({student.section})</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowTransferConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
              <button
                onClick={handleExecuteTransfer}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                {language === 'kn' ? 'ಖಚಿತಪಡಿಸಿ & ಟಿಸಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' : 'Confirm Transfer & Download TC'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Banner after Transfer */}
      {transferredNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-4 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold">
                {language === 'kn' ? 'ವರ್ಗಾವಣೆ ಪತ್ರ ಯಶಸ್ವಿಯಾಗಿ ಅಂತಿಮಗೊಂಡಿದೆ!' : 'Transfer Certificate Issued Successfully!'}
              </span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                {transferredNotice.name} ({transferredNotice.tcNo}) {language === 'kn' ? 'ಅವರನ್ನು ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಗಳ ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ ಮತ್ತು ಅಧಿಕೃತ ಟಿಸಿ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ.' : 'has been moved to Former Students and the official verified TC PDF has been downloaded.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/former-students"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
            >
              {language === 'kn' ? 'ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿ ದಾಖಲೆಗಳು →' : 'View Former Students →'}
            </Link>
            <button
              onClick={() => setTransferredNotice(null)}
              className="p-1 rounded-lg hover:bg-emerald-200/50 text-emerald-800 dark:text-emerald-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden Document Sheet for direct PDF download rendering */}
      <div
        id="offscreen-printable-container"
        style={{
          position: 'fixed',
          top: '0px',
          left: '-9999px',
          width: '794px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        {student && currentSchool && renderCertificateSheet(
          activeTab,
          docLanguage,
          'hidden-kannada-document-sheet'
        )}
      </div>
    </div>
  );
}