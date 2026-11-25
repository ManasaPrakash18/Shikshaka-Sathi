'use client';

import React, { useState } from 'react';
import {
  UserX,
  Search,
  FileText,
  History,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Lock,
  Calendar,
  Edit,
  Clock,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { FormerStudent } from '@/lib/types';
import { printBilingualConfirmationCertificate } from '@/lib/pdf/officialPrintTemplates';
import { Student } from '@/lib/types';
import { Printer } from 'lucide-react';
import { toKannadaText } from '@/lib/utils/kannadaNames';

export default function FormerStudentsPage() {
  const { currentSchool, academicYear, userRole, currentUser } = useAuth();
  const { state, updateFormerStudent } = useAppState();
  const { language } = useLanguage();

  // Strict role check: Platform Admin only has access to School Access Management
  if (userRole === 'PLATFORM_ADMIN') {
    return (
      <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 space-y-3">
        <h2 className="text-xl font-black">Platform Admin View Restricted</h2>
        <p className="text-xs sm:text-sm">
          Platform administrators only oversee school institutions and credential approvals. Historical student transfer records belong to individual schools.
        </p>
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormer, setSelectedFormer] = useState<FormerStudent | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrintFormerCertificate = (fs: FormerStudent) => {
    if (!currentSchool) return;
    const existing = state.students.find((s) => s.id === fs.student_id);
    const mockStudent: Student = existing || {
      id: fs.student_id || fs.id,
      school_id: fs.school_id,
      academic_year: fs.academic_year,
      admission_no: fs.original_admission_no,
      sats_no: fs.original_admission_no,
      pen_no: '',
      apaar_id: '',
      aadhaar_no: '',
      name: fs.student_name,
      name_kannada: fs.student_name_kannada,
      gender: 'BOY',
      dob: '2010-06-01',
      religion: 'Hindu',
      category: 'OBC',
      caste: 'General',
      father_name: 'Father',
      mother_name: 'Mother',
      cwsn: false,
      mobile: '',
      class_number: fs.class_at_transfer,
      section: 'A',
      place_of_birth: currentSchool.taluk,
      taluk: currentSchool.taluk,
      district: currentSchool.district,
      state: 'Karnataka',
      nationality: 'Indian',
      medium_of_instruction: 'Kannada',
      admission_date: fs.transfer_date,
      status: 'TRANSFERRED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    printBilingualConfirmationCertificate(
      mockStudent,
      currentSchool,
      fs.transfer_date || new Date().toISOString().split('T')[0],
      currentSchool.taluk,
      fs.tc_no || `TC/${fs.academic_year}/${fs.original_admission_no}`
    );
  };

  const [editForm, setEditForm] = useState({
    student_name: '',
    original_admission_no: '',
    tc_no: '',
    class_at_transfer: 10,
    transfer_date: '',
    academic_year: '2026-27',
    reason: '',
    editReason: '',
  });

  const formerStudents = state.formerStudents.filter((f) => f.school_id === currentSchool?.id);

  const filtered = formerStudents.filter(
    (f) =>
      f.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tc_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.original_admission_no.includes(searchQuery)
  );

  const openEditModal = (fs: FormerStudent) => {
    setSelectedFormer(fs);
    setEditForm({
      student_name: fs.student_name || '',
      original_admission_no: fs.original_admission_no || '',
      tc_no: fs.tc_no || '',
      class_at_transfer: fs.class_at_transfer || 10,
      transfer_date: fs.transfer_date || '',
      academic_year: fs.academic_year || '2026-27',
      reason: fs.reason || '',
      editReason: '',
    });
    setEditModalOpen(true);
  };

  const openHistoryModal = (fs: FormerStudent) => {
    setSelectedFormer(fs);
    setHistoryModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormer) return;

    if (!editForm.editReason.trim()) {
      alert('Mandatory Edit Reason is required for audit compliance.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateFormerStudent(
        selectedFormer.id,
        {
          student_name: editForm.student_name.trim(),
          original_admission_no: editForm.original_admission_no.trim(),
          tc_no: editForm.tc_no.trim(),
          class_at_transfer: Number(editForm.class_at_transfer),
          transfer_date: editForm.transfer_date,
          academic_year: editForm.academic_year,
          reason: editForm.reason.trim(),
        },
        editForm.editReason.trim(),
        currentUser?.name || 'School Admin'
      );

      setEditModalOpen(false);
      alert('Former student record updated and modification reason logged in audit register!');
    } catch (err: any) {
      alert(`Error updating record: ${err?.message || 'Update failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find audit logs matching former student
  const studentLogs = selectedFormer
    ? state.studentAuditLogs.filter(
        (log) =>
          log.student_id === selectedFormer.student_id ||
          log.student_id === selectedFormer.id ||
          log.field_name.startsWith('former_student_')
      )
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
            <UserX className="w-4 h-4" />
            {language === 'kn' ? 'ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರ ದಾಖಲೆಗಳ ಕೋಶ' : 'Transfer Certificate Archives'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {language === 'kn' ? 'ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಗಳ ದಾಖಲಾತಿ (ಟಿಸಿ ನೀಡಲಾದವರು)' : 'Former Students Database (TC Issued)'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'kn'
              ? 'ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರ (ಟಿಸಿ) ಪಡೆದ ವಿದ್ಯಾರ್ಥಿಗಳ ಸಂಗ್ರಹಿತ ದಾಖಲೆಗಳು. ಪ್ರತಿಯೊಂದು ತಿದ್ದುಪಡಿಯು ಕಡ್ಡಾಯ ಆಡಳಿತಾತ್ಮಕ ಕಾರಣದೊಂದಿಗೆ ಕರ್ನಾಟಕ SATS ಆಡಿಟ್ ರಿಜಿಸ್ಟರ್‌ನಲ್ಲಿ ಶಾಶ್ವತವಾಗಿ ದಾಖಲಾಗುತ್ತದೆ.'
              : 'Archived records for students who have received Transfer Certificates. Every modification requires an official administrative reason and is permanently recorded in the Karnataka SATS Audit Register.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            {language === 'kn' ? 'ಆಡಿಟ್ ಸಂರಕ್ಷಿತ' : 'Audit Protected'}
          </span>
        </div>
      </div>

      {/* Search Bar & Summary */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'kn'
                ? 'ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು, ಟಿಸಿ ಸಂಖ್ಯೆ, SATS ಮೂಲಕ ಹುಡುಕಿ...'
                : 'Search former student by name, TC number, SATS...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          {language === 'kn' ? 'ಒಟ್ಟು ದಾಖಲಾದವರು: ' : 'Total Archived: '}
          <strong className="text-slate-800 dark:text-slate-200">{formerStudents.length}</strong>{' '}
          {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಗಳು' : 'Students'}
        </div>
      </div>

      {/* Former Students Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">{language === 'kn' ? 'ಕ್ರ.ಸಂ.' : 'Sl'}</th>
                <th className="py-3 px-4">{language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು ಮತ್ತು SATS' : 'Student Name & SATS'}</th>
                <th className="py-3 px-3">{language === 'kn' ? 'ಟಿಸಿ ಸಂಖ್ಯೆ' : 'TC Number'}</th>
                <th className="py-3 px-3">{language === 'kn' ? 'ವರ್ಗಾವಣೆ ತರಗತಿ' : 'Class at Transfer'}</th>
                <th className="py-3 px-3">{language === 'kn' ? 'ವರ್ಗಾವಣೆ ದಿನಾಂಕ' : 'Date of Transfer'}</th>
                <th className="py-3 px-4">{language === 'kn' ? 'ವರ್ಗಾವಣೆ ಕಾರಣ' : 'Transfer Reason'}</th>
                <th className="py-3 px-3 text-center">{language === 'kn' ? 'ಆಡಿಟ್ ಸ್ಥಿತಿ' : 'Audit Status'}</th>
                <th className="py-3 px-4 text-right">{language === 'kn' ? 'ಕ್ರಮಗಳು' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    {language === 'kn'
                      ? 'ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.'
                      : 'No former student records found matching your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((fs, idx) => {
                  const historyCount = fs.correction_history?.length || 0;
                  const localizedName = language === 'kn' ? fs.student_name_kannada || fs.student_name : fs.student_name;
                  const localizedReason = language === 'kn' ? fs.reason_kannada || fs.reason : fs.reason;

                  return (
                    <tr key={fs.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400 text-center">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{localizedName}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">
                          {language === 'kn' ? 'SATS / ದಾಖಲಾತಿ:' : 'SATS / Adm:'} {fs.original_admission_no}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#3977A8] dark:text-[#5B9BD5]">
                        {fs.tc_no}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                        {language === 'kn' ? `${fs.class_at_transfer}ನೇ ತರಗತಿ` : `Class ${fs.class_at_transfer}`}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{fs.transfer_date}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={localizedReason}>
                        {localizedReason}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => openHistoryModal(fs)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                        >
                          {historyCount} {language === 'kn' ? 'ದಾಖಲಾದ ತಿದ್ದುಪಡಿಗಳು' : 'Logged Edits'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openHistoryModal(fs)}
                            title={language === 'kn' ? 'SATS ಆಡಿಟ್ ಇತಿಹಾಸ ವೀಕ್ಷಿಸಿ' : 'View SATS Audit Log History'}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handlePrintFormerCertificate(fs)}
                            title={language === 'kn' ? 'ದ್ವಿಭಾಷಾ ದೃಢೀಕರಣ ಪ್ರಮಾಣಪತ್ರ ಮುದ್ರಿಸಿ (A4 Single Page)' : 'Print Bilingual Confirmation Certificate'}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            {language === 'kn' ? 'ದೃಢೀಕರಣ ಪತ್ರ' : 'Certificate'}
                          </button>
                          <button
                            onClick={() => openEditModal(fs)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            {language === 'kn' ? 'ವಿವರ ತಿದ್ದುಪಡಿ' : 'Edit Details'}
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

      {/* EDIT FORMER STUDENT MODAL (WITH MANDATORY AUDIT REASON) */}
      {editModalOpen && selectedFormer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                {language === 'kn' ? 'ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಯ ದಾಖಲೆ ತಿದ್ದುಪಡಿ' : 'Edit Former Student Record'}
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
              <span className="font-semibold">{language === 'kn' ? 'ತಿದ್ದುಪಡಿ ಮಾಡಲಾಗುತ್ತಿದೆ:' : 'Editing:'}</span>{' '}
              <strong className="text-slate-900 dark:text-white">
                {language === 'kn' ? selectedFormer.student_name_kannada || selectedFormer.student_name : selectedFormer.student_name}
              </strong> • TC: {selectedFormer.tc_no}
              <div className="text-[11px] mt-0.5 text-blue-700 dark:text-blue-300">
                {language === 'kn'
                  ? 'ಇಲ್ಲಿ ಮಾಡುವ ಯಾವುದೇ ಬದಲಾವಣೆಯನ್ನು ಕಡ್ಡಾಯ ಕಾರಣದೊಂದಿಗೆ ಅಧಿಕೃತ SATS ಆಡಿಟ್ ರಿಜಿಸ್ಟರ್‌ನಲ್ಲಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ.'
                  : 'Any change made here will be recorded in the official SATS Audit Register along with your mandatory edit reason.'}
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು *' : 'Student Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.student_name}
                    onChange={(e) => setEditForm({ ...editForm, student_name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'kn' ? 'SATS / ದಾಖಲಾತಿ ಸಂಖ್ಯೆ *' : 'SATS / Admission No. *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.original_admission_no}
                    onChange={(e) => setEditForm({ ...editForm, original_admission_no: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'kn' ? 'ಟಿಸಿ ಸಂಖ್ಯೆ *' : 'TC Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.tc_no}
                    onChange={(e) => setEditForm({ ...editForm, tc_no: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'kn' ? 'ವರ್ಗಾವಣೆ ತರಗತಿ *' : 'Class at Transfer *'}
                  </label>
                  <select
                    value={editForm.class_at_transfer}
                    onChange={(e) => setEditForm({ ...editForm, class_at_transfer: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
                      <option key={cls} value={cls}>
                        {language === 'kn' ? `${cls}ನೇ ತರಗತಿ` : `Class ${cls}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'kn' ? 'ವರ್ಗಾವಣೆ ದಿನಾಂಕ *' : 'Transfer Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.transfer_date}
                    onChange={(e) => setEditForm({ ...editForm, transfer_date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'kn' ? 'ಶೈಕ್ಷಣಿಕ ವರ್ಷ *' : 'Academic Year *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.academic_year}
                    onChange={(e) => setEditForm({ ...editForm, academic_year: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'kn' ? 'ವರ್ಗಾವಣೆ ಕಾರಣ' : 'Transfer Reason'}
                </label>
                <input
                  type="text"
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  placeholder={
                    language === 'kn'
                      ? 'ಉದಾ: 10ನೇ ತರಗತಿ ಪೂರ್ಣಗೊಳಿಸಲಾಗಿದೆ / ಪೋಷಕರ ವರ್ಗಾವಣೆ / ಉನ್ನತ ವ್ಯಾಸಂಗ'
                      : 'e.g. Completed Class 10 / Parent transfer / Higher education'
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1.5">
                <label className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  {language === 'kn' ? 'ಕಡ್ಡಾಯ ಆಡಳಿತಾತ್ಮಕ ತಿದ್ದುಪಡಿ ಕಾರಣ *' : 'Mandatory Administrative Edit Reason *'}
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={
                    language === 'kn'
                      ? 'ಈ ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಯ ದಾಖಲೆ ತಿದ್ದುಪಡಿಗೆ ಸೂಕ್ತ ಆಡಳಿತಾತ್ಮಕ ಕಾರಣವನ್ನು ನಮೂದಿಸಿ (ಉದಾ: ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಆದೇಶದಂತೆ ಕಾಗುಣಿತ ತಿದ್ದುಪಡಿ)...'
                      : 'Enter detailed administrative reason for updating this former student record (e.g. Spelling correction as per court order / TC number rectification by Headmaster)...'
                  }
                  value={editForm.editReason}
                  onChange={(e) => setEditForm({ ...editForm, editReason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {language === 'kn' ? 'ರದ್ದುಗೊಳಿಸಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting
                    ? (language === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving...')
                    : (language === 'kn' ? 'ಉಳಿಸಿ ಮತ್ತು ಆಡಿಟ್‌ಗೆ ದಾಖಲಿಸಿ' : 'Save & Log to Audit Register')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SATS AUDIT TRAIL / CORRECTION HISTORY MODAL */}
      {historyModalOpen && selectedFormer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                {language === 'kn'
                  ? `ಆಡಿಟ್ ವಿವರ ಮತ್ತು ತಿದ್ದುಪಡಿ ಇತಿಹಾಸ: ${selectedFormer.student_name_kannada || selectedFormer.student_name}`
                  : `Audit Trail & Edit History: ${selectedFormer.student_name}`}
              </h2>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              {(!selectedFormer.correction_history || selectedFormer.correction_history.length === 0) &&
              studentLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  {language === 'kn'
                    ? 'ಈ ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಗೆ ಯಾವುದೇ ತಿದ್ದುಪಡಿ ವಿವರ ಅಥವಾ ಆಡಿಟ್ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ.'
                    : 'No edit reasons or audit logs recorded for this former student yet.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* History from correction_history */}
                  {selectedFormer.correction_history?.map((ch, idx) => (
                    <div
                      key={`ch-${idx}`}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                          {language === 'kn' ? 'ಕ್ಷೇತ್ರ: ' : 'Field: '}{ch.field}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {new Date(ch.approved_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">
                            {language === 'kn' ? 'ಹಿಂದಿನ ಮೌಲ್ಯ' : 'Previous'}
                          </span>
                          <span className="font-mono bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded">
                            {ch.old_value || (language === 'kn' ? 'ಯಾವುದೂ ಇಲ್ಲ' : 'None')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">
                            {language === 'kn' ? 'ಹೊಸ ಮೌಲ್ಯ' : 'New Value'}
                          </span>
                          <span className="font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                            {ch.new_value}
                          </span>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-slate-200">{language === 'kn' ? 'ಕಾರಣ: ' : 'Reason: '}</strong>{' '}
                        {language === 'kn' ? toKannadaText(ch.reason) : ch.reason}
                        <span className="text-slate-400 ml-2">({language === 'kn' ? toKannadaText(ch.approver) : ch.approver})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
              >
                {language === 'kn' ? 'ಆಡಿಟ್ ಇತಿಹಾಸ ಮುಚ್ಚಿ' : 'Close Audit Trail'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
