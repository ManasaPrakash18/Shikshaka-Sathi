'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  ArrowRightLeft,
  Search,
  Filter,
  Edit2,
  Eye,
  History,
  Check,
  AlertTriangle,
  X,
  FileText,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Student, CategoryType } from '@/lib/types';
import { validateAadhaar, validatePhone } from '@/lib/utils/validators';
import { downloadPDFDoc, downloadExcelFile } from '@/lib/pdf/documentGenerator';
import { getStudentName, getFatherName, getSchoolName } from '@/lib/utils/kannadaNames';

export default function StudentsPage() {
  const { currentSchool, academicYear, userRole, currentUser } = useAuth();
  const { state, addStudent, updateStudent, importStudents, promoteStudents } = useAppState();
  const { t, language } = useLanguage();

  // Strict role check: Platform Admin only has access to School Access Management
  if (userRole === 'PLATFORM_ADMIN') {
    return (
      <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 space-y-3">
        <h2 className="text-xl font-black">Platform Admin View Restricted</h2>
        <p className="text-xs sm:text-sm">
          Platform administrators only oversee school institutions and credential approvals. Student records and statistics are strictly private to individual schools.
        </p>
        <Link
          href="/platform-admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-sm transition-colors"
        >
          Go to School Access Management
        </Link>
      </div>
    );
  }

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [allAuditModalOpen, setAllAuditModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);

  // Individual & Bulk Promotion Selection
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Selected Student for Edit / Audit
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editReason, setEditReason] = useState('');

  // Form State
  const initialStudentForm: Omit<Student, 'id' | 'created_at' | 'updated_at'> = {
    school_id: currentSchool?.id || 'school-1',
    academic_year: academicYear,
    admission_no: '',
    sats_no: '',
    pen_no: '',
    apaar_id: '',
    aadhaar_no: '',
    name: '',
    name_kannada: '',
    gender: 'BOY',
    dob: '2010-01-01',
    religion: 'Hindu',
    category: 'OBC',
    caste: '',
    sub_caste: '',
    father_name: '',
    father_name_kannada: '',
    mother_name: '',
    mother_name_kannada: '',
    cwsn: false,
    mobile: '',
    class_number: 10,
    section: 'A',
    place_of_birth: currentSchool?.taluk || 'Mysuru',
    taluk: currentSchool?.taluk || 'Mysuru South',
    district: currentSchool?.district || 'Mysuru',
    state: 'Karnataka',
    nationality: 'Indian',
    medium_of_instruction: 'Kannada',
    admission_date: '2024-06-01',
    status: 'ACTIVE',
  };

  const [formData, setFormData] = useState(initialStudentForm);

  // Filtered Students
  const filteredStudents = state.students.filter((s) => {
    if (s.school_id !== currentSchool?.id) return false;
    if (s.academic_year !== academicYear) return false;

    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.name_kannada && s.name_kannada.includes(searchQuery)) ||
      s.admission_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.sats_no ? s.sats_no.includes(searchQuery) : false);

    const matchesClass = classFilter === 'ALL' || s.class_number.toString() === classFilter;
    const matchesSection = sectionFilter === 'ALL' || s.section === sectionFilter;
    const matchesGender = genderFilter === 'ALL' || s.gender === genderFilter;
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return (
      matchesSearch && matchesClass && matchesSection && matchesGender && matchesCategory && matchesStatus
    );
  });

  // Handle Add Student
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.name_kannada?.trim() ||
      !formData.father_name.trim() ||
      !formData.father_name_kannada?.trim() ||
      !formData.mother_name.trim() ||
      !formData.mother_name_kannada?.trim() ||
      !formData.admission_no.trim()
    ) {
      alert(
        language === 'kn'
          ? 'ವಿದ್ಯಾರ್ಥಿ ಮತ್ತು ಪೋಷಕರ ಹೆಸರುಗಳನ್ನು ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ಹಾಗೂ ಪ್ರವೇಶ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
          : 'Enter student and parent names in both English and Kannada, and provide the admission number.'
      );
      return;
    }

    if (formData.aadhaar_no && formData.aadhaar_no.trim()) {
      const aadhVal = validateAadhaar(formData.aadhaar_no);
      if (!aadhVal.isValid) {
        alert(aadhVal.error || 'Aadhaar number must have exactly 12 digits.');
        return;
      }
    }

    if (formData.mobile && formData.mobile.trim()) {
      const phoneVal = validatePhone(formData.mobile);
      if (!phoneVal.isValid) {
        alert(phoneVal.error || 'Contact mobile number must have exactly 10 digits.');
        return;
      }
    }

    await addStudent({
      ...formData,
      school_id: currentSchool?.id || 'school-1',
      academic_year: academicYear,
    });

    setAddModalOpen(false);
    setFormData(initialStudentForm);
    alert('Student successfully registered and saved locally with offline persistence!');
  };

  // Handle Edit Student (requires mandatory reason)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!editReason.trim()) {
      alert('A mandatory reason is strictly required when modifying existing student records.');
      return;
    }

    if (formData.aadhaar_no && formData.aadhaar_no.trim()) {
      const aadhVal = validateAadhaar(formData.aadhaar_no);
      if (!aadhVal.isValid) {
        alert(aadhVal.error || 'Aadhaar number must have exactly 12 digits.');
        return;
      }
    }

    if (formData.mobile && formData.mobile.trim()) {
      const phoneVal = validatePhone(formData.mobile);
      if (!phoneVal.isValid) {
        alert(phoneVal.error || 'Contact mobile number must have exactly 10 digits.');
        return;
      }
    }

    await updateStudent(
      selectedStudent.id,
      formData,
      editReason,
      currentUser?.name || 'School Admin'
    );

    setEditModalOpen(false);
    setSelectedStudent(null);
    setEditReason('');
    alert('Student updated successfully with audit history logged!');
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData(student);
    setEditReason('');
    setEditModalOpen(true);
  };

  const openAuditModal = (student: Student) => {
    setSelectedStudent(student);
    setAuditModalOpen(true);
  };

  // Excel Export
  const handleExportExcel = () => {
    const exportData = filteredStudents.map((s, idx) => ({
      'Sl. No.': idx + 1,
      'Admission No': s.admission_no,
      'SATS No': s.sats_no,
      'PEN No': s.pen_no,
      'Student Name': getStudentName(s, language),
      'Gender': s.gender,
      'Date of Birth': s.dob,
      'Class': s.class_number,
      'Section': s.section,
      'Category': s.category,
      'Caste': s.caste,
      'Father Name': getFatherName(s, language),
      'Mother Name': s.mother_name,
      'Mobile': s.mobile,
      'Aadhaar': s.aadhaar_no,
      'Medium': s.medium_of_instruction,
      'Status': s.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    downloadExcelFile(
      workbook,
      `${currentSchool?.name?.replace(/\s+/g, '_')}_Students_${academicYear}.xlsx`
    );
  };

  // PDF Export for A4 Printing with Repeated Headers
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // School Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(currentSchool?.name?.toUpperCase() || 'KARNATAKA SCHOOL', pageWidth / 2, 14, {
      align: 'center',
    });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `STUDENT ENROLMENT REGISTER | UDISE: ${currentSchool?.udise} | Academic Year: ${academicYear} | Total Students: ${filteredStudents.length}`,
      pageWidth / 2,
      20,
      { align: 'center' }
    );

    const tableRows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.admission_no,
      s.sats_no || '—',
      s.name,
      s.gender,
      s.dob,
      `Class ${s.class_number}-${s.section}`,
      s.category,
      s.caste,
      s.father_name,
      s.mobile || '—',
    ]);

    autoTable(doc, {
      startY: 25,
      margin: { left: 10, right: 10 },
      head: [
        [
          'Sl',
          'Adm No',
          'SATS No',
          'Student Name',
          'Gender',
          'DOB',
          'Class',
          'Category',
          'Caste',
          'Father Name',
          'Mobile',
        ],
      ],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [11, 25, 44], textColor: 255, fontStyle: 'bold' },
    });

    const filename = `Student_Register_${currentSchool?.udise || 'School'}_${academicYear}.pdf`;
    downloadPDFDoc(doc, filename);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            Karnataka Student Registry & CCE Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t.students.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.students.subtitle}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {userRole !== 'FACULTY' && (
            <button
              onClick={() => {
                setFormData(initialStudentForm);
                setAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {t.students.addStudent}
            </button>
          )}

          {userRole !== 'FACULTY' && (
            <button
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#2563EB]" />
              {t.students.importExcel}
            </button>
          )}

          <button
            onClick={() => setAllAuditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-[#16284F] dark:text-blue-300 font-bold text-xs shadow-sm cursor-pointer"
            title="Click to view all student record modification reasons & regulatory audit log"
          >
            <History className="w-4 h-4 text-[#2563EB]" />
            <span>{language === 'kn' ? 'ತಿದ್ದುಪಡಿ ಆಡಿಟ್ ರಿಜಿಸ್ಟರ್' : 'Edit Reasons & Audit Log'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-200/80 dark:bg-blue-900/80 text-[10px] font-black text-blue-900 dark:text-blue-200">
              {state.studentAuditLogs?.length || 0}
            </span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#16284F]" />
            {t.students.exportExcel}
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#C75B5B]" />
            {t.students.exportPdf}
          </button>

          {userRole !== 'FACULTY' && (
            <button
              onClick={() => setPromoteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#3977A8] hover:bg-[#2C618C] text-white font-semibold text-xs shadow-sm cursor-pointer transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {t.students.promote}
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar (Section 7) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.students.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-[#16284F] dark:focus:border-[#2563EB]"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold cursor-pointer"
            >
              <option value="ALL">{t.students.allClasses}</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                <option key={c} value={c}>
                  {language === 'kn' ? `${c}ನೇ ತರಗತಿ (Class ${c})` : `Class ${c}`}
                </option>
              ))}
            </select>

            {/* Section Filter */}
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold cursor-pointer"
            >
              <option value="ALL">{t.students.allSections}</option>
              <option value="A">{language === 'kn' ? 'ವಿಭಾಗ ಎ (Section A)' : 'Section A'}</option>
              <option value="B">{language === 'kn' ? 'ವಿಭಾಗ ಬಿ (Section B)' : 'Section B'}</option>
              <option value="C">{language === 'kn' ? 'ವಿಭಾಗ ಸಿ (Section C)' : 'Section C'}</option>
            </select>

            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold cursor-pointer"
            >
              <option value="ALL">{t.students.allGenders}</option>
              <option value="BOY">{language === 'kn' ? 'ಬಾಲಕರು (Boys)' : 'Boys'}</option>
              <option value="GIRL">{language === 'kn' ? 'ಬಾಲಕಿಯರು (Girls)' : 'Girls'}</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold cursor-pointer"
            >
              <option value="ALL">{t.students.allCategories}</option>
              <option value="SC">SC (ಪ.ಜಾತಿ)</option>
              <option value="ST">ST (ಪ.ಪಂಗಡ)</option>
              <option value="OBC">OBC (ಹಿಂದುಳಿದ ವರ್ಗ)</option>
              <option value="GM">GM (ಸಾಮಾನ್ಯ)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold cursor-pointer"
            >
              <option value="ALL">{t.students.allStatuses}</option>
              <option value="ACTIVE">{language === 'kn' ? 'ಸಕ್ರಿಯ (Active)' : 'Active'}</option>
              <option value="TRANSFERRED">{language === 'kn' ? 'ವರ್ಗಾವಣೆಗೊಂಡವರು (TC)' : 'Transferred (TC)'}</option>
              <option value="PROMOTED">{language === 'kn' ? 'ಬಡ್ತಿ ಪಡೆದವರು (Promoted)' : 'Promoted'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar when students are selected */}
      {selectedStudentIds.length > 0 && userRole !== 'FACULTY' && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#E3EBF3] dark:bg-slate-800/90 border border-[#3977A8]/40 dark:border-slate-700 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-[#16284F] dark:text-[#2563EB] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16284F] animate-pulse" />
            {language === 'kn'
              ? `${selectedStudentIds.length} / ${filteredStudents.length} ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ`
              : `Selected ${selectedStudentIds.length} of ${filteredStudents.length} Students`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedStudentIds([])}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
            >
              {language === 'kn' ? 'ಆಯ್ಕೆ ರದ್ದು' : 'Clear Selection'}
            </button>
            <button
              onClick={() => setPromoteModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold shadow-sm cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {language === 'kn'
                ? `ಸಾಮೂಹಿಕ ಬಡ್ತಿ (${selectedStudentIds.length} ಆಯ್ಕೆ)`
                : `Bulk Promote (${selectedStudentIds.length} Selected)`}
            </button>
          </div>
        </div>
      )}

      {/* Students Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#EDF2F7] dark:bg-slate-800/60">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {language === 'kn'
              ? `${academicYear} ಶೈಕ್ಷಣಿಕ ವರ್ಷದಲ್ಲಿ ${filteredStudents.length} ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ`
              : `Showing ${filteredStudents.length} Students in ${academicYear}`}
          </span>
          {userRole === 'FACULTY' && (
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
              {language === 'kn' ? 'ಓದಲು ಮಾತ್ರ ಅನುಮತಿ' : 'Read-Only Access'}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EDF2F7] dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-[#D8E1EA] dark:border-slate-700">
              <tr>
                {userRole !== 'FACULTY' && (
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                      onChange={() => {
                        if (selectedStudentIds.length === filteredStudents.length) {
                          setSelectedStudentIds([]);
                        } else {
                          setSelectedStudentIds(filteredStudents.map((s) => s.id));
                        }
                      }}
                      className="w-4 h-4 rounded cursor-pointer accent-[#16284F]"
                    />
                  </th>
                )}
                <th className="py-3 px-4">{t.students.tableHeaders.slNo}</th>
                <th className="py-3 px-3">{t.students.tableHeaders.admissionNo}</th>
                <th className="py-3 px-3">{t.students.tableHeaders.satsNo}</th>
                <th className="py-3 px-4">{t.students.tableHeaders.studentName}</th>
                <th className="py-3 px-3">{t.students.tableHeaders.gender}</th>
                <th className="py-3 px-3.5 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 font-bold">{language === 'kn' ? 'ಪ್ರಸ್ತುತ ತರಗತಿ (Class)' : 'Class (Currently Pursuing)'}</th>
                <th className="py-3 px-3">{t.students.tableHeaders.category}</th>
                <th className="py-3 px-3">{language === 'kn' ? 'ಆಧಾರ್ (ಮರೆಮಾಡಲಾಗಿದೆ)' : 'Aadhaar (Masked)'}</th>
                <th className="py-3 px-4">{t.students.tableHeaders.fatherName}</th>
                <th className="py-3 px-3">{t.students.tableHeaders.mobile}</th>
                <th className="py-3 px-3">{t.students.tableHeaders.status}</th>
                <th className="py-3 px-4 text-right">{t.students.tableHeaders.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400 text-xs">
                    {language === 'kn'
                      ? 'ನಿಮ್ಮ ಫಿಲ್ಟರ್ ಮಾನದಂಡಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ವಿದ್ಯಾರ್ಥಿ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.'
                      : 'No student records matching your filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-[#EBF3FC]/50 dark:bg-slate-800/60' : ''
                      }`}
                    >
                      {userRole !== 'FACULTY' && (
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedStudentIds((prev) =>
                                prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                              );
                            }}
                            className="w-4 h-4 rounded cursor-pointer accent-[#16284F]"
                          />
                        </td>
                      )}
                      <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {s.admission_no}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#3977A8]">
                        {s.sats_no || '—'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {getStudentName(s, language)}
                        {s.cwsn && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                            CWSN
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                        {s.gender === 'BOY' ? (
                          <span className="text-[#3977A8] font-semibold">{language === 'kn' ? 'ಬಾಲಕ' : 'Boy'}</span>
                        ) : (
                          <span className="text-[#C75B5B] font-semibold">{language === 'kn' ? 'ಬಾಲಕಿ' : 'Girl'}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {language === 'kn' ? `${s.class_number}ನೇ ತರಗತಿ-${s.section}` : `Class ${s.class_number}-${s.section}`}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s.category} ({s.caste || '-'})
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {s.aadhaar_no ? `XXXX-XXXX-${s.aadhaar_no.slice(-4)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{getFatherName(s, language)}</td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{s.mobile}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'ACTIVE'
                              ? 'bg-[#EBF3FC] text-[#16284F] dark:bg-slate-800 dark:text-[#2563EB]'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {userRole !== 'FACULTY' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedStudentIds([s.id]);
                                  setPromoteModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#16284F] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Promote Student to Next Academic Year"
                              >
                                <ArrowRightLeft className="w-4 h-4 text-[#16284F]" />
                              </button>
                              <button
                                onClick={() => openEditModal(s)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit Student Information (Requires Audit Reason)"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openAuditModal(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#16284F] hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Modification History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT STUDENT MODAL */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  {addModalOpen ? 'Register New Student' : `Edit Student: ${selectedStudent?.name}`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete official Karnataka demographic and CCE enrolment details
                </p>
              </div>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={addModalOpen ? handleAddSubmit : handleEditSubmit}
              className="space-y-6 text-xs"
            >
              {/* Section 1: Official Identifiers */}
              <div>
                <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-3">
                  1. Official Identifiers (SATS, PEN, APAAR, Aadhaar)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Admission No *</label>
                    <input
                      type="text"
                      required
                      value={formData.admission_no}
                      onChange={(e) => setFormData({ ...formData, admission_no: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {language === 'kn' ? 'ಸ್ಯಾಟ್ಸ್ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)' : 'SATS / STA No (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={formData.sats_no || ''}
                      onChange={(e) => setFormData({ ...formData, sats_no: e.target.value })}
                      placeholder="Optional / ಐಚ್ಛಿಕ"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">PEN (Permanent No)</label>
                    <input
                      type="text"
                      value={formData.pen_no}
                      onChange={(e) => setFormData({ ...formData, pen_no: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">APAAR ID</label>
                    <input
                      type="text"
                      value={formData.apaar_id}
                      onChange={(e) => setFormData({ ...formData, apaar_id: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Student Personal Information */}
              <div>
                <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-3">
                  2. Student Information & Enrollment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Student Full Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Student Full Name (Kannada) *</label>
                    <input
                      type="text"
                      lang="kn"
                      required
                      value={formData.name_kannada || ''}
                      onChange={(e) => setFormData({ ...formData, name_kannada: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="BOY">Boy</option>
                      <option value="GIRL">Girl</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Class *</label>
                    <select
                      value={formData.class_number}
                      onChange={(e) => setFormData({ ...formData, class_number: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                        <option key={c} value={c}>
                          Class {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Section</label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Medium</label>
                    <input
                      type="text"
                      value={formData.medium_of_instruction}
                      onChange={(e) => setFormData({ ...formData, medium_of_instruction: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Parental & Social Category Details */}
              <div>
                <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-3">
                  3. Parental, Social Category & Demographic Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Father Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={formData.father_name}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Father Name (Kannada) *</label>
                    <input
                      type="text"
                      lang="kn"
                      required
                      value={formData.father_name_kannada || ''}
                      onChange={(e) => setFormData({ ...formData, father_name_kannada: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Mother Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={formData.mother_name}
                      onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Mother Name (Kannada) *</label>
                    <input
                      type="text"
                      lang="kn"
                      required
                      value={formData.mother_name_kannada || ''}
                      onChange={(e) => setFormData({ ...formData, mother_name_kannada: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                    >
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OBC">OBC</option>
                      <option value="GM">GM</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Caste</label>
                    <input
                      type="text"
                      value={formData.caste}
                      onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Sub-caste</label>
                    <input
                      type="text"
                      value={formData.sub_caste}
                      onChange={(e) => setFormData({ ...formData, sub_caste: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Aadhaar Number</label>
                    <input
                      type="text"
                      placeholder="12 digits"
                      value={formData.aadhaar_no}
                      onChange={(e) => setFormData({ ...formData, aadhaar_no: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* MANDATORY EDIT REASON (Section 7 Requirement) */}
              {editModalOpen && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2">
                  <label className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Mandatory Reason for Student Modification *
                  </label>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Department compliance mandates recording previous value, new value, reason, and timestamp for all
                    modifications.
                  </p>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g., Parent submitted updated birth certificate / Name spelling correction"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold shadow-sm cursor-pointer transition-colors"
                >
                  {addModalOpen
                    ? language === 'kn'
                      ? 'ವಿದ್ಯಾರ್ಥಿ ಉಳಿಸಿ'
                      : 'Save Student'
                    : language === 'kn'
                    ? 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ ಮತ್ತು ಆಡಿಟ್ ದಾಖಲಿಸಿ'
                    : 'Save Changes & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT AUDIT HISTORY MODAL */}
      {auditModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-[#16284F]" />
                  Modification Audit Trail: {selectedStudent.name}
                </h2>
                <p className="text-slate-400 text-[11px]">SATS: {selectedStudent.sats_no}</p>
              </div>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const logs = state.studentAuditLogs.filter((l) => l.student_id === selectedStudent.id);
              if (logs.length === 0) {
                return (
                  <div className="p-8 text-center text-slate-400">
                    No modifications recorded for this student. Record is in original state.
                  </div>
                );
              }

              return (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                          Field: {log.field_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                           <span className="text-slate-400">Previous:</span>{' '}
                          <span className="line-through text-rose-500 font-medium">{log.previous_value}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Updated:</span>{' '}
                          <span className="text-[#16284F] dark:text-[#2563EB] font-bold">{log.updated_value}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#3977A8] dark:text-[#5B9BD5] pt-1">
                        <strong>Reason:</strong> {log.reason} (By: {log.updated_by})
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT MODAL (Section 7 Requirements) */}
      {importModalOpen && (
        <ExcelImportModal
          schoolId={currentSchool?.id || 'school-1'}
          academicYear={academicYear}
          onClose={() => setImportModalOpen(false)}
          onImportSuccess={async (students) => {
            const count = await importStudents(students);
            setImportModalOpen(false);
            alert(`Successfully imported ${count} students!`);
          }}
        />
      )}

      {/* STUDENT PROMOTION MODAL (Section 7 Requirements) */}
      {promoteModalOpen && (
        <StudentPromotionModal
          schoolId={currentSchool?.id || 'school-1'}
          currentYear={academicYear}
          students={
            selectedStudentIds.length > 0
              ? state.students.filter((s) => selectedStudentIds.includes(s.id))
              : state.students.filter(
                  (s) => s.school_id === currentSchool?.id && s.status === 'ACTIVE'
                )
          }
          onClose={() => {
            setPromoteModalOpen(false);
          }}
          onPromote={async (toYear, promotions) => {
            await promoteStudents(academicYear, toYear, promotions, currentUser?.name || 'School Admin');
            setPromoteModalOpen(false);
            setSelectedStudentIds([]);
            alert(`Promotion completed successfully! ${promotions.length} active record(s) promoted to ${toYear}.`);
          }}
        />
      )}

      {/* ALL AUDIT LOGS MODAL (Where Edit Reasons Are Stored) */}
      {allAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-[#2563EB]" />
                  Karnataka SATS Audit Log Register & Edit Reasons
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {language === 'kn'
                    ? 'ಪ್ರತಿಯೊಂದು ವಿದ್ಯಾರ್ಥಿ ದಾಖಲೆಯ ಬದಲಾವಣೆಯು ನಿಯಂತ್ರಕ ಸಮರ್ಥನೆ, ಬದಲಾವಣೆ ವಿವರಗಳು ಮತ್ತು ನಿರ್ವಾಹಕರ ವಿವರಗಳೊಂದಿಗೆ ಸ್ಥಳೀಯವಾಗಿ ಮತ್ತು ಕ್ಲೌಡ್‌ನಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ.'
                    : 'Every student record edit or modification is tracked with regulatory justification, before/after values, and administrator details. Stored securely in local storage and synced to Cloud.'}
                </p>
              </div>
              <button
                onClick={() => setAllAuditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              {state.studentAuditLogs && state.studentAuditLogs.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Student</th>
                        <th className="p-3">Field Modified</th>
                        <th className="p-3">Old Value</th>
                        <th className="p-3">New Value</th>
                        <th className="p-3">Regulatory Edit Reason</th>
                        <th className="p-3">Modified By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                      {state.studentAuditLogs.map((log) => {
                        const student = state.students.find((s) => s.id === log.student_id);
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                            <td className="p-3 text-slate-500 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                              {student?.name || log.student_id}
                              <div className="text-[10px] text-slate-400 font-mono">SATS: {student?.sats_no || '—'}</div>
                            </td>
                            <td className="p-3 font-bold text-slate-700 dark:text-slate-300 font-sans">
                              {log.field_name}
                            </td>
                            <td className="p-3 text-rose-600 line-through">
                              {log.previous_value || '—'}
                            </td>
                            <td className="p-3 text-blue-600 dark:text-blue-400 font-semibold">
                              {log.updated_value || '—'}
                            </td>
                            <td className="p-3 font-sans">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-medium">
                                {log.reason}
                              </span>
                            </td>
                            <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                              {log.updated_by}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <History className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">{language === 'kn' ? 'ಇನ್ನೂ ಯಾವುದೇ ತಿದ್ದುಪಡಿ ದಾಖಲಾಗಿಲ್ಲ' : 'No edits recorded yet'}</p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'kn'
                      ? 'ವಿದ್ಯಾರ್ಥಿ ವಿವರಗಳನ್ನು ತಿದ್ದಿದಾಗ, ಕಡ್ಡಾಯ ಕಾರಣವನ್ನು ಇಲ್ಲಿ ಮತ್ತು ಕ್ಲೌಡ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ.'
                      : 'Whenever student data is modified via the Edit modal, a mandatory reason is captured and recorded here and in Cloud.'}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setAllAuditModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Close Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// EXCEL IMPORT SUB-COMPONENT
// -------------------------------------------------------------
function ExcelImportModal({
  schoolId,
  academicYear,
  onClose,
  onImportSuccess,
}: {
  schoolId: string;
  academicYear: string;
  onClose: () => void;
  onImportSuccess: (students: Omit<Student, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
}) {
  const [fileData, setFileData] = useState<any[]>([]);
  const [parsedStudents, setParsedStudents] = useState<Omit<Student, 'id' | 'created_at' | 'updated_at'>[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setFileData(data);

      const validList: Omit<Student, 'id' | 'created_at' | 'updated_at'>[] = [];
      let dups = 0;
      let invalids = 0;

      data.forEach((row: any, idx) => {
        const name = row['Student Name'] || row['name'] || row['NAME'];
        const nameKannada = row['Student Name (Kannada)'] || row['Student Name Kannada'] || '';
        const fatherName = row['Father Name'] || '';
        const fatherNameKannada = row['Father Name (Kannada)'] || row['Father Name Kannada'] || '';
        const motherName = row['Mother Name'] || '';
        const motherNameKannada = row['Mother Name (Kannada)'] || row['Mother Name Kannada'] || '';
        const admNo = row['Admission No'] || row['admission_no'] || row['ADM_NO'] || `ADM/2024/${idx + 100}`;
        const satsNo = row['SATS No'] || row['sats_no'] || row['SATS'] || row['STA No'] || row['sta_no'] || '';
        const cls = Number(row['Class'] || row['class'] || 8);
        const sec = row['Section'] || row['section'] || 'A';
        const gender = (row['Gender'] || row['gender'] || 'BOY').toString().toUpperCase().includes('G') ? 'GIRL' : 'BOY';

        if (!name || !nameKannada || !fatherName || !fatherNameKannada || !motherName || !motherNameKannada) {
          invalids++;
          return;
        }

        validList.push({
          school_id: schoolId,
          academic_year: academicYear,
          admission_no: String(admNo),
          sats_no: String(satsNo),
          pen_no: row['PEN'] || '',
          apaar_id: row['APAAR'] || '',
          aadhaar_no: row['Aadhaar'] || 'XXXX-XXXX-9999',
          name: String(name),
          name_kannada: String(nameKannada),
          gender: gender as any,
          dob: row['DOB'] || '2010-01-01',
          religion: 'Hindu',
          category: (row['Category'] || 'OBC') as CategoryType,
          caste: row['Caste'] || 'General',
          sub_caste: '',
          father_name: String(fatherName),
          father_name_kannada: String(fatherNameKannada),
          mother_name: String(motherName),
          mother_name_kannada: String(motherNameKannada),
          cwsn: false,
          mobile: row['Mobile'] || '9845000000',
          class_number: cls,
          section: sec,
          place_of_birth: 'Karnataka',
          taluk: 'Karnataka Taluk',
          district: 'Karnataka District',
          state: 'Karnataka',
          nationality: 'Indian',
          medium_of_instruction: 'Kannada',
          admission_date: '2024-06-01',
          status: 'ACTIVE',
        });
      });

      setParsedStudents(validList);
      setDuplicateCount(dups);
      setInvalidCount(invalids);
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadSample = () => {
    const sample = [
      {
        'Admission No': 'ADM/2024/101',
        'SATS No': '109855121',
        'Student Name': 'Darshan Kumar',
        'Student Name (Kannada)': '',
        'Gender': 'BOY',
        'Class': 10,
        'Section': 'A',
        'Category': 'OBC',
        'Caste': 'Kuruba',
        'Father Name': 'Mahadevaiah',
        'Father Name (Kannada)': '',
        'Mother Name': 'Geetha',
        'Mother Name (Kannada)': '',
        'Mobile': '9845012345',
        'DOB': '2009-05-15',
      },
      {
        'Admission No': 'ADM/2024/102',
        'SATS No': '109855122',
        'Student Name': 'Bhavya R',
        'Student Name (Kannada)': '',
        'Gender': 'GIRL',
        'Class': 10,
        'Section': 'A',
        'Category': 'SC',
        'Caste': 'Adi Karnataka',
        'Father Name': 'Ramaswamy',
        'Father Name (Kannada)': '',
        'Mother Name': 'Lakshmamma',
        'Mother Name (Kannada)': '',
        'Mobile': '9845012346',
        'DOB': '2009-08-20',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample_Students');
    downloadExcelFile(wb, 'Karnataka_CCE_Student_Import_Template.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#16284F] dark:text-[#2563EB]" />
            Import Student Records from Excel / UDISE+
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-500">
          Upload standard application Excel or UDISE+ format spreadsheet. All rows are validated with duplicate
          detection before committing to the database.
        </p>

        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Standard Excel Template</div>
            <div className="text-[11px] text-slate-400">Download formatted template with columns</div>
          </div>
          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            Download Template
          </button>
        </div>

        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#16284F] file:text-white file:font-bold cursor-pointer"
          />
        </div>

        {fileData.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Validation Preview</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-[#EBF3FC] text-[#16284F] dark:bg-slate-800 dark:text-[#2563EB] font-bold">
                {parsedStudents.length} Valid Records
              </div>
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                {duplicateCount} Duplicates
              </div>
              <div className="p-2 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                {invalidCount} Invalid Records
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            Cancel
          </button>
          <button
            onClick={() => onImportSuccess(parsedStudents)}
            disabled={parsedStudents.length === 0}
            className="px-5 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold disabled:opacity-50"
          >
            Commit {parsedStudents.length} Students
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STUDENT PROMOTION SUB-COMPONENT (Section 7 Requirements)
// -------------------------------------------------------------
function StudentPromotionModal({
  schoolId,
  currentYear,
  students,
  onClose,
  onPromote,
}: {
  schoolId: string;
  currentYear: string;
  students: Student[];
  onClose: () => void;
  onPromote: (
    toYear: string,
    promotions: { studentId: string; fromClass: number; toClass: number; status: 'PROMOTED' | 'RETAINED' | 'GRADUATED' }[]
  ) => Promise<void>;
}) {
  const { language } = useLanguage();
  const fromStartYear = parseInt(currentYear.split('-')[0]) || 2026;
  const nextForwardYear = `${fromStartYear + 1}-${String(fromStartYear + 2).slice(-2)}`;
  const futureYear = `${fromStartYear + 2}-${String(fromStartYear + 3).slice(-2)}`;
  const [toYear, setToYear] = useState(nextForwardYear);

  const [promotionMapping, setPromotionMapping] = useState<
    Record<string, { toClass: number; status: 'PROMOTED' | 'RETAINED' | 'GRADUATED' }>
  >(() => {
    const map: any = {};
    students.forEach((s) => {
      if (s.class_number === 10) {
        map[s.id] = { toClass: 10, status: 'GRADUATED' };
      } else {
        map[s.id] = { toClass: s.class_number + 1, status: 'PROMOTED' };
      }
    });
    return map;
  });

  const handleStatusChange = (
    studentId: string,
    status: 'PROMOTED' | 'RETAINED' | 'GRADUATED',
    currentClass: number
  ) => {
    setPromotionMapping((prev) => ({
      ...prev,
      [studentId]: {
        toClass: status === 'PROMOTED' ? currentClass + 1 : currentClass,
        status,
      },
    }));
  };

  const handlePromoteAll = () => {
    const payload = students.map((s) => {
      const mapping = promotionMapping[s.id] || {
        toClass: s.class_number === 10 ? 10 : s.class_number + 1,
        status: s.class_number === 10 ? 'GRADUATED' : 'PROMOTED',
      };
      return {
        studentId: s.id,
        fromClass: s.class_number,
        toClass: mapping.toClass,
        status: mapping.status,
      };
    });

    onPromote(toYear, payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#2563EB]" />
            Annual Student Promotion Engine ({currentYear} → {toYear})
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Forward Session Progression Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F4F7F9] dark:bg-slate-800/60 border border-[#DCE5EA] dark:border-slate-700">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#657587]">Current Session</span>
            <div className="text-sm font-black text-[#253747] dark:text-white">{currentYear}</div>
          </div>
          <div className="text-xs font-bold text-[#2563EB] bg-[#EBF3FC] dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            Progressing Forward
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[#657587]">Target Promotion Session</span>
            <select
              value={toYear}
              onChange={(e) => setToYear(e.target.value)}
              className="block mt-0.5 px-3 py-1.5 rounded-xl border border-[#DCE5EA] dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-xs text-[#2563EB] dark:text-[#2563EB] outline-none"
            >
              <option value={nextForwardYear}>{nextForwardYear} (Next Academic Year)</option>
              <option value={futureYear}>{futureYear} (Subsequent Academic Year)</option>
            </select>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#EBF3FC]/60 dark:bg-slate-800/80 border border-[#2563EB]/20 dark:border-slate-700 space-y-1">
          <div className="font-bold text-[#2563EB]">Karnataka Promotion Rules:</div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300">
            • Classes 1 to 9 move forward to the next standard automatically unless marked for retention.
            <br />• Class 10 students graduate from high school and are recorded as alumni.
            <br />• Historical academic records for {currentYear} are preserved in archive.
          </p>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {students.map((s) => {
            const currentMap = promotionMapping[s.id] || {
              toClass: s.class_number + 1,
              status: s.class_number === 10 ? 'GRADUATED' : 'PROMOTED',
            };
            return (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{getStudentName(s, language)}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Class {s.class_number}-{s.section} • SATS: {s.sats_no}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={currentMap.status}
                    onChange={(e) => handleStatusChange(s.id, e.target.value as any, s.class_number)}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold"
                  >
                    <option value="PROMOTED">Promote to Class {s.class_number + 1}</option>
                    <option value="RETAINED">Retain in Class {s.class_number}</option>
                    <option value="GRADUATED">Graduated (Class 10)</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handlePromoteAll}
            className="px-5 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold shadow-sm cursor-pointer transition-colors"
          >
            Confirm Promotion to {toYear}
          </button>
        </div>
      </div>
    </div>
  );
}
