'use client';

import React, { useState, useRef } from 'react';
import {
  Settings,
  Building,
  Globe,
  Moon,
  Sun,
  Download,
  Upload,
  Save,
  CheckCircle,
  Database,
  FileText,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function SettingsPage() {
  const { currentSchool, academicYear, setAcademicYear, updateSchoolDetails, userRole } = useAuth();
  const { state, downloadBackupJSON, restoreBackupJSON } = useAppState();
  const { language, setLanguage, pdfLanguage, setPdfLanguage, t } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: currentSchool?.name || '',
    name_kannada: currentSchool?.name_kannada || '',
    taluk: currentSchool?.taluk || '',
    taluk_kannada: currentSchool?.taluk_kannada || '',
    district: currentSchool?.district || '',
    district_kannada: currentSchool?.district_kannada || '',
    udise: currentSchool?.udise || '',
    hm_phone: currentSchool?.hm_phone || '',
    hm_name: currentSchool?.hm_name || '',
    hm_name_kannada: currentSchool?.hm_name_kannada || '',
  });

  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  const [workingDaysDraft, setWorkingDaysDraft] = useState<{
    schoolId: string;
    academicYear: string;
    value: string;
  } | null>(null);
  const workingDaysValue =
    workingDaysDraft && workingDaysDraft.schoolId === currentSchool?.id && workingDaysDraft.academicYear === academicYear
      ? workingDaysDraft.value
      : currentSchool?.working_days_by_year?.[academicYear]?.toString() ?? '';

  const handleSaveWorkingDays = async () => {
    if (!currentSchool) return;
    const value = Number(workingDaysValue);
    if (!workingDaysValue.trim() || !Number.isInteger(value) || value < 1 || value > 366) {
      alert(language === 'kn'
        ? 'ಶೈಕ್ಷಣಿಕ ವರ್ಷಕ್ಕೆ 1 ರಿಂದ 366ರೊಳಗಿನ ಶಾಲಾ ಕಾರ್ಯದಿನಗಳ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
        : 'Enter a whole number of school working days from 1 to 366 for this academic year.');
      return;
    }

    await updateSchoolDetails({
      working_days_by_year: {
        ...currentSchool.working_days_by_year,
        [academicYear]: value,
      },
    });
    setWorkingDaysDraft(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'FACULTY') {
      alert(language === 'kn' ? 'ಬೋಧಕ ಸಿಬ್ಬಂದಿಗೆ ಶಾಲಾ ಸೆಟ್ಟಿಂಗ್ಸ್ ಬದಲಾಯಿಸಲು ಪ್ರವೇಶವಿಲ್ಲ.' : 'Faculty accounts have read-only access to school administrative settings.');
      return;
    }
    if (
      !form.name.trim() ||
      !form.name_kannada.trim() ||
      !form.taluk.trim() ||
      !form.taluk_kannada.trim() ||
      !form.district.trim() ||
      !form.district_kannada.trim() ||
      !form.hm_name.trim() ||
      !form.hm_name_kannada.trim()
    ) {
      alert('Enter school, location, and headmaster names in both English and Kannada.');
      return;
    }

    await updateSchoolDetails({
      name: form.name.trim(),
      name_kannada: form.name_kannada.trim(),
      taluk: form.taluk.trim(),
      taluk_kannada: form.taluk_kannada.trim(),
      district: form.district.trim(),
      district_kannada: form.district_kannada.trim(),
      udise: form.udise,
      hm_phone: form.hm_phone,
      hm_name: form.hm_name.trim(),
      hm_name_kannada: form.hm_name_kannada.trim(),
    });

    alert(language === 'kn' ? 'ಶಾಲಾ ಮಾಹಿತಿ ಮತ್ತು ಸಂರಚನೆ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಣಗೊಂಡಿದೆ!' : 'School information and settings successfully updated!');
  };

  const toggleDarkMode = (enableDark: boolean) => {
    setIsDark(enableDark);
    if (enableDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = await restoreBackupJSON(content);
        if (ok) {
          alert(language === 'kn' ? 'ಬ್ಯಾಕಪ್ ಯಶಸ್ವಿಯಾಗಿ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ!' : 'Backup restored successfully into IndexedDB!');
        } else {
          alert(language === 'kn' ? 'ಬ್ಯಾಕಪ್ ಮರುಸ್ಥಾಪನೆ ವಿಫಲವಾಗಿದೆ: ಅಮಾನ್ಯ ಫೈಲ್.' : 'Failed to restore backup: Invalid file.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          {language === 'kn' ? 'ವ್ಯವಸ್ಥೆಯ ಸಂರಚನೆ ಮತ್ತು ಪ್ರಾಶಸ್ತ್ಯಗಳು' : 'System Configuration & Preferences'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          {language === 'kn' ? 'ಸೆಟ್ಟಿಂಗ್ಸ್ ಮತ್ತು ಕಾನ್ಫಿಗರೇಶನ್' : t.nav.settings}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'kn'
            ? 'ಶಾಲೆಯ ವಿವರಗಳು, ದ್ವಿಭಾಷಾ ಮಾಹಿತಿ (ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡ), ಡಾರ್ಕ್ ಮೋಡ್ ಮತ್ತು ಆಫ್‌ಲೈನ್ ಬ್ಯಾಕಪ್ ನಿರ್ವಹಿಸಿ'
            : 'Configure school identity, bilingual localization, UI appearance, and disaster recovery backups'}
        </p>
      </div>

      {/* School Information */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            {language === 'kn' ? 'ಶಾಲಾ ಗುರುತು ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಸಂರಚನೆ' : 'School Identity & Academic Configuration'}
          </h2>
          {userRole === 'FACULTY' && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
              {language === 'kn' ? 'ಬೋಧಕರಿಗೆ ಓದಲು ಮಾತ್ರ' : 'Read-Only for Faculty'}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'ಶಾಲೆಯ ಹೆಸರು (English)' : 'School Name (English)'}
              </label>
              <input
                type="text"
                disabled={userRole === 'FACULTY'}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'ಶಾಲೆಯ ಹೆಸರು (ಕನ್ನಡ)' : 'School Name (Kannada)'}
              </label>
              <input
                type="text"
                disabled={userRole === 'FACULTY'}
                value={form.name_kannada}
                onChange={(e) => setForm({ ...form, name_kannada: e.target.value })}
                placeholder="ಉದಾ: ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ವಿದ್ಯಾರಣ್ಯಪುರಂ"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'UDISE ಸಂಖ್ಯೆ' : 'UDISE Number'}
              </label>
              <input
                type="text"
                disabled={userRole === 'FACULTY'}
                value={form.udise}
                onChange={(e) => setForm({ ...form, udise: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'ಪ್ರಸ್ತುತ ಶೈಕ್ಷಣಿಕ ವರ್ಷ' : 'Current Academic Year'}
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none"
              >
                <option value="2026-27">{language === 'kn' ? '2026-27 (ಪ್ರಸ್ತುತ ವರ್ಷ)' : '2026-27 (Current Session)'}</option>
                <option value="2025-26">{language === 'kn' ? '2025-26 (ಹಿಂದಿನ ವರ್ಷ)' : '2025-26 (Previous Session)'}</option>
                <option value="2027-28">{language === 'kn' ? '2027-28 (ಮುಂದಿನ ವರ್ಷ)' : '2027-28 (Upcoming Session)'}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'ತಾಲೂಕು (English)' : 'Taluk (English)'}
              </label>
              <input
                type="text"
                disabled={userRole === 'FACULTY'}
                value={form.taluk}
                onChange={(e) => setForm({ ...form, taluk: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'ತಾಲೂಕು (ಕನ್ನಡ)' : 'Taluk (Kannada)'}
              </label>
              <input
                type="text"
                disabled={userRole === 'FACULTY'}
                value={form.taluk_kannada}
                onChange={(e) => setForm({ ...form, taluk_kannada: e.target.value })}
                placeholder="ಉದಾ: ಮೈಸೂರು ದಕ್ಷಿಣ"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'ಜಿಲ್ಲೆ (English)' : 'District (English)'}
              </label>
              <input
                type="text"
                disabled={userRole === 'FACULTY'}
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'ಜಿಲ್ಲೆ (ಕನ್ನಡ)' : 'District (Kannada)'}
              </label>
              <input
                type="text"
                disabled={userRole === 'FACULTY'}
                value={form.district_kannada}
                onChange={(e) => setForm({ ...form, district_kannada: e.target.value })}
                placeholder="ಉದಾ: ಮೈಸೂರು"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಹೆಸರು (English)' : 'Headmaster Name (English)'}
              </label>
              <input
                type="text"
                disabled={userRole === 'FACULTY'}
                value={form.hm_name}
                onChange={(e) => setForm({ ...form, hm_name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಹೆಸರು (ಕನ್ನಡ)' : 'Headmaster Name (Kannada)'}
              </label>
              <input
                type="text"
                disabled={userRole === 'FACULTY'}
                value={form.hm_name_kannada}
                onChange={(e) => setForm({ ...form, hm_name_kannada: e.target.value })}
                placeholder="ಉದಾ: ರಮೇಶ್ ಗೌಡ"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn' ? 'ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Registered Mobile Number'}
              </label>
              <input
                type="tel"
                disabled={userRole === 'FACULTY'}
                value={form.hm_phone}
                onChange={(e) => setForm({ ...form, hm_phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {userRole !== 'FACULTY' && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
              >
                <Save className="w-4 h-4" />
                {language === 'kn' ? 'ಶಾಲಾ ವಿವರಗಳನ್ನು ಉಳಿಸಿ' : 'Save School Details'}
              </button>
            </div>
          )}
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div>
            <label htmlFor="school-working-days" className="font-bold text-slate-700 dark:text-slate-300 text-xs">
              {language === 'kn' ? `ಶೈಕ್ಷಣಿಕ ವರ್ಷ ${academicYear}ರಲ್ಲಿ ಶಾಲೆ ನಡೆದ ದಿನಗಳು` : `School Working Days (${academicYear})`}
            </label>
            <p className="mt-1 text-[11px] text-slate-500">
              {language === 'kn'
                ? 'ಈ ಶೈಕ್ಷಣಿಕ ವರ್ಷದಲ್ಲಿ ತರಗತಿಗಳು ನಡೆದ ಒಟ್ಟು ದಿನಗಳನ್ನು ನಮೂದಿಸಿ.'
                : 'Enter the total number of days classes were held in this academic year.'}
            </p>
            <input
              id="school-working-days"
              type="number"
              min={1}
              max={366}
              step={1}
              disabled={userRole === 'FACULTY'}
              value={workingDaysValue}
              onChange={(event) => setWorkingDaysDraft({
                schoolId: currentSchool?.id || '',
                academicYear,
                value: event.target.value,
              })}
              className="mt-2 w-full sm:max-w-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none disabled:opacity-60"
            />
          </div>
          {userRole !== 'FACULTY' && (
            <button
              type="button"
              onClick={handleSaveWorkingDays}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 text-xs"
            >
              <Save className="w-4 h-4" />
              {language === 'kn' ? 'ಕಾರ್ಯದಿನಗಳನ್ನು ಉಳಿಸಿ' : 'Save Working Days'}
            </button>
          )}
        </div>
      </div>

      {/* Appearance & Language Settings */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Globe className="w-4 h-4 text-[#16284F]" />
          {language === 'kn' ? 'ವಿನ್ಯಾಸ ಮತ್ತು ಕನ್ನಡ ಸ್ಥಳೀಕರಣ' : 'Appearance & Kannada Localization'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Interface Language */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              {language === 'kn' ? 'ವೇದಿಕೆಯ ಭಾಷೆ' : 'Interface Language'}
            </span>
            <p className="text-[11px] text-slate-400">
              {language === 'kn' ? 'ಮೆನುಗಳು, ಬಟನ್‌ಗಳು, ಕೋಷ್ಟಕಗಳು ಮತ್ತು ಫಾರ್ಮ್‌ಗಳನ್ನು ಬದಲಾಯಿಸುತ್ತದೆ' : 'Translates navigation, buttons, tables, forms, and alerts'}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#16284F] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('kn')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  language === 'kn'
                    ? 'bg-[#16284F] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>

          {/* Theme Mode */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              {language === 'kn' ? 'ಡಿಸ್ಪ್ಲೇ ವಿನ್ಯಾಸ' : 'Visual Appearance'}
            </span>
            <p className="text-[11px] text-slate-400">
              {language === 'kn' ? 'ಸ್ಪಷ್ಟ ಕಾಂಟ್ರಾಸ್ಟ್ ಡಾರ್ಕ್ ಮೋಡ್ ಅಥವಾ ಲೈಟ್ ಮೋಡ್' : 'High-contrast dark mode or clean editorial light mode'}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => toggleDarkMode(false)}
                className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                  !isDark
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                {language === 'kn' ? 'ಲೈಟ್' : 'Light'}
              </button>
              <button
                onClick={() => toggleDarkMode(true)}
                className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                  isDark
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                {language === 'kn' ? 'ಡಾರ್ಕ್' : 'Dark'}
              </button>
            </div>
          </div>

          {/* PDF Language */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              {language === 'kn' ? 'ಪಿಡಿಎಫ್ ದಾಖಲೆಗಳ ಭಾಷೆ' : 'PDF Output Language'}
            </span>
            <p className="text-[11px] text-slate-400">
              {language === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ಅಂಕಪಟ್ಟಿಗಳಿಗೆ ಪಿಡಿಎಫ್ ಭಾಷೆ' : 'Independent PDF language for certificates and marks cards'}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setPdfLanguage('EN')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-colors ${
                  pdfLanguage === 'EN'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setPdfLanguage('KN')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-colors ${
                  pdfLanguage === 'KN'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backup, Disaster Recovery & Local Data */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Database className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
          {language === 'kn' ? 'ಆಫ್‌ಲೈನ್ ಶೇಖರಣೆ ಮತ್ತು ಡೇಟಾ ಸುರಕ್ಷತೆ' : 'Offline-First Storage & Data Safety'}
        </h2>

        <p className="text-xs text-slate-500">
          {language === 'kn'
            ? 'ಶಾಲಾ ದತ್ತಾಂಶವು IndexedDB ಮೂಲಕ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ವ್ಯವಸ್ಥೆಯ ಬದಲಾವಣೆ ಅಥವಾ ಸುರಕ್ಷತೆಗಾಗಿ ಪೂರ್ಣ JSON ಬ್ಯಾಕಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಿ ಅಥವಾ ಮರುಸ್ಥಾಪಿಸಿ.'
            : 'The school database operates offline-first with IndexedDB. In case of system migration or hardware change, export full JSON backup or restore past checkpoints.'}
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={downloadBackupJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            {language === 'kn' ? 'ಪೂರ್ಣ JSON ಬ್ಯಾಕಪ್ ಡೌನ್‌ಲೋಡ್' : 'Download Complete JSON Backup'}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
            {language === 'kn' ? 'ಡೇಟಾಬೇಸ್ ಬ್ಯಾಕಪ್ ಮರುಸ್ಥಾಪಿಸಿ' : 'Restore Database Backup'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleRestoreFile}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
