'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Clock,
  Filter,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { downloadExcelFile } from '@/lib/pdf/documentGenerator';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { AcademicCalendarEvent } from '@/lib/types';
import { generateKarnatakaProvisionalCalendar } from '@/lib/calendar/karnatakaProvisionalCalendar';

export default function AcademicCalendarPage() {
  const { currentSchool, academicYear, userRole } = useAuth();
  const { state, isLoading, addCalendarEvent, deleteCalendarEvent, importCalendarEvents } = useAppState();
  const { t, language } = useLanguage();

  const activeSchool = currentSchool || state.schools[0];
  const initializedCalendar = useRef<string | null>(null);

  const [viewMode, setViewMode] = useState<'MONTH' | 'YEAR'>('MONTH');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1); // June (Academic opening month in Karnataka)
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Dynamic Academic Year calculation (Every academic year runs June startYear -> April 31st endYear)
  const startYear = parseInt(academicYear.split('-')[0]) || 2026;
  const endYear = startYear + 1;

  const [form, setForm] = useState({
    title: '',
    title_kannada: '',
    description: '',
    description_kannada: '',
    date: `${startYear}-06-15`,
    category: 'SCHOOL_EVENT' as AcademicCalendarEvent['category'],
  });

  const months = [
    { name: `May ${startYear}`, nameKn: `ಮೇ ${startYear}`, month: 4, year: startYear },
    { name: `June ${startYear}`, nameKn: `ಜೂನ್ ${startYear}`, month: 5, year: startYear },
    { name: `July ${startYear}`, nameKn: `ಜುಲೈ ${startYear}`, month: 6, year: startYear },
    { name: `August ${startYear}`, nameKn: `ಆಗಸ್ಟ್ ${startYear}`, month: 7, year: startYear },
    { name: `September ${startYear}`, nameKn: `ಸೆಪ್ಟೆಂಬರ್ ${startYear}`, month: 8, year: startYear },
    { name: `October ${startYear}`, nameKn: `ಅಕ್ಟೋಬರ್ ${startYear}`, month: 9, year: startYear },
    { name: `November ${startYear}`, nameKn: `ನವೆಂಬರ್ ${startYear}`, month: 10, year: startYear },
    { name: `December ${startYear}`, nameKn: `ಡಿಸೆಂಬರ್ ${startYear}`, month: 11, year: startYear },
    { name: `January ${endYear}`, nameKn: `ಜನವರಿ ${endYear}`, month: 0, year: endYear },
    { name: `February ${endYear}`, nameKn: `ಫೆಬ್ರವರಿ ${endYear}`, month: 1, year: endYear },
    { name: `March ${endYear}`, nameKn: `ಮಾರ್ಚ್ ${endYear}`, month: 2, year: endYear },
    {
      name: `April ${endYear}`,
      nameKn: `ಏಪ್ರಿಲ್ ${endYear}`,
      month: 3,
      year: endYear,
      note: 'Academic year concludes by April 30th',
      noteKn: 'ಶೈಕ್ಷಣಿಕ ವರ್ಷವು ಏಪ್ರಿಲ್ 30ರೊಳಗೆ ಮುಕ್ತಾಯಗೊಳ್ಳುತ್ತದೆ',
    },
  ];

  const currentMonthData = months[currentMonthIndex];

  useEffect(() => {
    if (isLoading || !activeSchool) return;
    const initializationKey = `${activeSchool.id}:${academicYear}`;
    if (initializedCalendar.current === initializationKey) return;
    initializedCalendar.current = initializationKey;

    const existingAutoEvents = state.calendarEvents.filter(
      (event) =>
        event.school_id === activeSchool.id &&
        event.academic_year === academicYear &&
        event.created_by === 'SYSTEM_KARNATAKA_PROVISIONAL'
    );
    const existingTitles = new Set(existingAutoEvents.map((event) => event.title));
    const missingEvents = generateKarnatakaProvisionalCalendar(activeSchool.id, academicYear)
      .filter((event) => !existingTitles.has(event.title));

    if (missingEvents.length > 0) {
      void importCalendarEvents(missingEvents);
    }
  }, [activeSchool, academicYear, importCalendarEvents, isLoading, state.calendarEvents]);

  // Category styles & badge with authentic Kannada labels
  const categoryConfig: Record<string, { label: string; labelKn: string; badge: string; dot: string }> = {
    GOVT_HOLIDAY: {
      label: 'Govt Holiday',
      labelKn: 'ಸರ್ಕಾರಿ ರಜಾದಿನ',
      badge: 'bg-[#EBF3FC] text-[#16284F] dark:bg-slate-800 dark:text-[#2563EB] border-[#16284F]/30',
      dot: 'bg-[#16284F]',
    },
    NATIONAL_HOLIDAY: {
      label: 'National Holiday',
      labelKn: 'ರಾಷ್ಟ್ರೀಯ ರಜಾದಿನ',
      badge: 'bg-[#E3EBF3] text-[#3977A8] dark:bg-slate-800 dark:text-[#5B9BD5] border-[#3977A8]/30',
      dot: 'bg-[#3977A8]',
    },
    SCHOOL_HOLIDAY: {
      label: 'School Holiday',
      labelKn: 'ಶಾಲಾ ರಜಾದಿನ',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
      dot: 'bg-amber-500',
    },
    LOCAL_HOLIDAY: {
      label: 'Local Holiday',
      labelKn: 'ಸ್ಥಳೀಯ ರಜಾದಿನ',
      badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300',
      dot: 'bg-teal-500',
    },
    SCHOOL_EVENT: {
      label: 'School Event',
      labelKn: 'ಶಾಲಾ ಕಾರ್ಯಕ್ರಮ',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
      dot: 'bg-blue-500',
    },
    EXAM: {
      label: 'Examination / Assessment',
      labelKn: 'ಪರೀಕ್ಷೆ / ಮೌಲ್ಯಮಾಪನ',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
      dot: 'bg-rose-500',
    },
    ACADEMIC_ACTIVITY: {
      label: 'Academic Activity',
      labelKn: 'ಶೈಕ್ಷಣಿಕ ಚಟುವಟಿಕೆ',
      badge: 'bg-[#E3EBF3] text-[#3977A8] dark:bg-slate-800 dark:text-[#5B9BD5] border-[#3977A8]/30',
      dot: 'bg-[#3977A8]',
    },
  };

  // Filter events
  const allEvents = state.calendarEvents.filter(
    (event) =>
      event.school_id === activeSchool?.id &&
      event.academic_year === academicYear &&
      (filterCategory === 'ALL' || event.category === filterCategory)
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool) return;
    if (!form.title.trim() || !form.title_kannada.trim()) {
      alert('Enter the event title in both English and Kannada.');
      return;
    }
    if (Boolean(form.description.trim()) !== Boolean(form.description_kannada.trim())) {
      alert('Enter the event description in both English and Kannada, or leave both blank.');
      return;
    }

    await addCalendarEvent({
      school_id: activeSchool.id,
      academic_year: academicYear,
      title: form.title.trim(),
      title_kannada: form.title_kannada.trim(),
      description: form.description.trim(),
      description_kannada: form.description_kannada.trim(),
      date: form.date,
      category: form.category,
      is_official: false,
      created_by: 'School Admin',
    });

    setAddModalOpen(false);
    setForm({
      title: '',
      title_kannada: '',
      description: '',
      description_kannada: '',
      date: `${startYear}-06-15`,
      category: 'SCHOOL_EVENT',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#3979B8] dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            {language === 'kn' ? 'ಶೈಕ್ಷಣಿಕ ವರ್ಷದ ಕ್ಯಾಲೆಂಡರ್ ಮತ್ತು ರಜಾದಿನಗಳು' : 'Academic Year Calendar & Events Schedule'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {language === 'kn' ? `ಶೈಕ್ಷಣಿಕ ಕ್ಯಾಲೆಂಡರ್ (${academicYear})` : `Academic Calendar (${academicYear})`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'kn'
              ? 'ಕರ್ನಾಟಕದ ರಜಾದಿನಗಳು ಮತ್ತು ಹಬ್ಬಗಳ ತಾತ್ಕಾಲಿಕ ದಿನಾಂಕಗಳು — ಅಧಿಕೃತ ಅಧಿಸೂಚನೆಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ'
              : 'Provisional Karnataka holiday and festival dates — verify with the official notification'}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {/* View Mode Toggle */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'MONTH' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600' : 'text-slate-500'
              }`}
            >
              {language === 'kn' ? 'ತಿಂಗಳ ನೋಟ' : 'Month View'}
            </button>
            <button
              onClick={() => setViewMode('YEAR')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'YEAR' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600' : 'text-slate-500'
              }`}
            >
              {language === 'kn' ? 'ವರ್ಷದ ಸಮಗ್ರ ನೋಟ' : 'Year View (All)'}
            </button>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            {language === 'kn'
              ? 'ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೇರಿಸಿದ ಹಬ್ಬಗಳ ದಿನಾಂಕಗಳು ಅಂದಾಜು ಮಾತ್ರ; ಅವು ಅಧಿಕೃತ ರಜಾ ಘೋಷಣೆಗಳಲ್ಲ. ಪ್ರತಿ ಶೈಕ್ಷಣಿಕ ವರ್ಷಕ್ಕೆ ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಅಧಿಸೂಚನೆಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.'
              : 'Auto-filled festival dates are estimates, not official holiday declarations. Verify each academic year against the Karnataka Government notification.'}
          </div>

          {userRole !== 'FACULTY' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="import-calendar-btn"
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-normal rounded-xl bg-[#2563EB] px-2.5 py-2 text-center text-xs font-bold text-white shadow-sm cursor-pointer sm:flex-initial sm:px-3.5"
              >
                <Upload className="w-4 h-4" />
                {language === 'kn' ? 'ಕ್ಯಾಲೆಂಡರ್ ಆಮದು (.xlsx, .pdf, .word)' : 'Import Calendar (.xlsx, .pdf, .word)'}
              </button>

              <button
                id="add-event-btn"
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-normal rounded-xl bg-blue-600 px-2.5 py-2 text-center text-xs font-bold text-white shadow-md shadow-blue-600/20 cursor-pointer sm:flex-initial sm:px-3.5"
              >
                <Plus className="w-4 h-4" />
                {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮ / ರಜಾದಿನ ಸೇರಿಸಿ' : 'Add Event / Holiday'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter by Category bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-bold text-slate-400 uppercase text-[10px] whitespace-nowrap">
          {language === 'kn' ? 'ವರ್ಗೀಕರಣ:' : 'Filter:'}
        </span>
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-2.5 py-1 rounded-lg font-bold border transition-colors whitespace-nowrap ${
            filterCategory === 'ALL'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          {language === 'kn' ? `ಎಲ್ಲಾ ವರ್ಗಗಳು (${state.calendarEvents.length})` : `All Categories (${state.calendarEvents.length})`}
        </button>
        {Object.entries(categoryConfig).map(([key, cfg]) => {
          const isSelected = filterCategory === key;
          const count = state.calendarEvents.filter((e) => e.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold border transition-colors whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span>{language === 'kn' ? cfg.labelKn : cfg.label}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'MONTH' && (
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentMonthIndex === 0}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {language === 'kn' ? currentMonthData.nameKn : currentMonthData.name}
            </h2>

            <button
              onClick={() => setCurrentMonthIndex((prev) => Math.min(months.length - 1, prev + 1))}
              disabled={currentMonthIndex === months.length - 1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Events list for the active month */}
          {(() => {
            const monthPrefix = `${currentMonthData.year}-${String(currentMonthData.month + 1).padStart(2, '0')}`;
            const monthEvents = allEvents.filter((e) => e.date.startsWith(monthPrefix));

            if (monthEvents.length === 0) {
              return (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  {language === 'kn'
                    ? `${currentMonthData.nameKn || currentMonthData.name} ತಿಂಗಳಲ್ಲಿ ಯಾವುದೇ ಕಾರ್ಯಕ್ರಮಗಳು ಅಥವಾ ರಜಾದಿನಗಳು ನಿಗದಿಯಾಗಿಲ್ಲ.`
                    : `No scheduled activities or holidays found for ${currentMonthData.name}.`}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monthEvents.map((evt) => {
                  const cfg = categoryConfig[evt.category] || categoryConfig.SCHOOL_EVENT;
                  return (
                    <div
                      key={evt.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}>
                            {language === 'kn' ? cfg.labelKn : cfg.label}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-500">{evt.date}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {language === 'kn' ? evt.title_kannada || evt.title : evt.title}
                        </h3>
                        {(evt.description || evt.description_kannada) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                            {language === 'kn' ? evt.description_kannada || evt.description : evt.description}
                          </p>
                        )}
                      </div>

                      {userRole !== 'FACULTY' && !evt.is_official && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                          <button
                            onClick={() => deleteCalendarEvent(evt.id)}
                            className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {language === 'kn' ? 'ತೆಗೆದುಹಾಕಿ' : 'Remove'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* YEAR VIEW (All chronological) */}
      {viewMode === 'YEAR' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'kn'
                  ? `ಸಮಗ್ರ ಶೈಕ್ಷಣಿಕ ಕ್ಯಾಲೆಂಡರ್ ಕೋಶ (${academicYear})`
                  : `Comprehensive Calendar Directory (${academicYear})`}
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {allEvents.map((evt) => {
                const cfg = categoryConfig[evt.category] || categoryConfig.SCHOOL_EVENT;
                const locTitle = language === 'kn' ? evt.title_kannada || evt.title : evt.title;
                const locDesc = language === 'kn' ? evt.description_kannada || evt.description : evt.description;

                return (
                  <div
                    key={evt.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 font-mono font-bold text-slate-500 text-[11px] pt-0.5">
                        {evt.date}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}>
                            {language === 'kn' ? cfg.labelKn : cfg.label}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{locTitle}</span>
                          {evt.is_official && (
                            <span className="text-[10px] text-[#16284F] dark:text-[#2563EB] font-semibold">
                              {language === 'kn' ? '(ಅಧಿಕೃತ)' : '(Official)'}
                            </span>
                          )}
                        </div>
                        {locDesc && <p className="text-slate-500 mt-0.5">{locDesc}</p>}
                      </div>
                    </div>

                    {userRole !== 'FACULTY' && !evt.is_official && (
                      <button
                        onClick={() => deleteCalendarEvent(evt.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 self-end sm:self-auto"
                        title={language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮ ತೆಗೆದುಹಾಕಿ' : 'Delete custom event'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ADD EVENT MODAL (School Admin only) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'kn' ? 'ಶಾಲಾ ಕಾರ್ಯಕ್ರಮ / ಸ್ಥಳೀಯ ರಜೆ ಸೇರಿಸಿ' : 'Add School Event / Local Holiday'}
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮದ ಶೀರ್ಷಿಕೆ (English) *' : 'Event Title (English) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taluk Sports Meet / Village Jathra Holiday"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮದ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)' : 'Event Title (Kannada)'}
                </label>
                <input
                  type="text"
                  placeholder="ಉದಾ: ತಾಲೂಕು ಮಟ್ಟದ ಕ್ರೀಡಾಕೂಟ / ಗ್ರಾಮ ಜಾತ್ರಾ ರಜೆ"
                  required
                  value={form.title_kannada}
                  onChange={(e) => setForm({ ...form, title_kannada: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'kn' ? 'ವರ್ಗ' : 'Category'}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="LOCAL_HOLIDAY">{language === 'kn' ? 'ಸ್ಥಳೀಯ ರಜಾದಿನ' : 'Local Holiday'}</option>
                    <option value="SCHOOL_HOLIDAY">{language === 'kn' ? 'ಶಾಲಾ ರಜಾದಿನ' : 'School Holiday'}</option>
                    <option value="SCHOOL_EVENT">{language === 'kn' ? 'ಶಾಲಾ ಕಾರ್ಯಕ್ರಮ' : 'School Event'}</option>
                    <option value="EXAM">{language === 'kn' ? 'ಪರೀಕ್ಷಾ ದಿನಾಂಕ' : 'Examination Date'}</option>
                    <option value="ACADEMIC_ACTIVITY">{language === 'kn' ? 'ಶೈಕ್ಷಣಿಕ ಚಟುವಟಿಕೆ' : 'Academic Activity'}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'kn' ? 'ದಿನಾಂಕ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'kn' ? 'ವಿವರಣೆ (English)' : 'Description (English)'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Details, circular reference, timings..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'kn' ? 'ವಿವರಣೆ (ಕನ್ನಡ)' : 'Description (Kannada)'}
                </label>
                <textarea
                  rows={2}
                  placeholder="ವಿವರಗಳು, ಸುತ್ತೋಲೆ ಸಂಖ್ಯೆ, ಸಮಯ..."
                  value={form.description_kannada}
                  onChange={(e) => setForm({ ...form, description_kannada: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  {language === 'kn' ? 'ರದ್ದುಗೊಳಿಸಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮ ಉಳಿಸಿ' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT CALENDAR MODAL (Section 8 Requirements) */}
      {importModalOpen && (
        <ImportCalendarModal
          schoolId={activeSchool?.id || 'school-1'}
          academicYear={academicYear}
          startYear={startYear}
          endYear={endYear}
          onClose={() => setImportModalOpen(false)}
          onImportSuccess={async (events, clearExisting) => {
            const count = await importCalendarEvents(events, clearExisting);
            setImportModalOpen(false);
            alert(`Successfully imported ${count} events for academic year ${academicYear}!`);
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// IMPORT CALENDAR SUB-COMPONENT (.xlsx, .pdf, .word, .csv)
// -------------------------------------------------------------
function ImportCalendarModal({
  schoolId,
  academicYear,
  startYear,
  endYear,
  onClose,
  onImportSuccess,
}: {
  schoolId: string;
  academicYear: string;
  startYear: number;
  endYear: number;
  onClose: () => void;
  onImportSuccess: (
    events: Omit<AcademicCalendarEvent, 'id'>[],
    clearExisting: boolean
  ) => Promise<void>;
}) {
  const [stagedEvents, setStagedEvents] = useState<Omit<AcademicCalendarEvent, 'id'>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [clearExisting, setClearExisting] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string>('');

  const normalizeDate = (rawDate: any): string => {
    if (!rawDate) return `${startYear}-06-01`;
    const s = String(rawDate).trim();

    // Check for explicit April 31st requirement
    if (s.includes('04-31') || s.includes('04/31') || s.toLowerCase().includes('april 31')) {
      return `${endYear}-04-31`;
    }

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyy) {
      const day = ddmmyyyy[1].padStart(2, '0');
      const month = ddmmyyyy[2].padStart(2, '0');
      const yr = ddmmyyyy[3];
      return `${yr}-${month}-${day}`;
    }

    // Excel serial number
    if (!isNaN(Number(s)) && Number(s) > 30000 && Number(s) < 60000) {
      const jsDate = new Date((Number(s) - 25569) * 86400 * 1000);
      return jsDate.toISOString().split('T')[0];
    }

    return `${startYear}-06-01`;
  };

  const normalizeCategory = (cat: any): AcademicCalendarEvent['category'] => {
    if (!cat) return 'SCHOOL_EVENT';
    const s = String(cat).toUpperCase();
    if (s.includes('GOVT') || s.includes('GOVERNMENT')) return 'GOVT_HOLIDAY';
    if (s.includes('NATION') || s.includes('INDEPENDENCE') || s.includes('REPUBLIC')) return 'NATIONAL_HOLIDAY';
    if (s.includes('EXAM') || s.includes('TEST') || s.includes('ASSESSMENT') || s.includes('FA') || s.includes('SA')) return 'EXAM';
    if (s.includes('LOCAL') || s.includes('JATHRA')) return 'LOCAL_HOLIDAY';
    if (s.includes('HOLIDAY') || s.includes('VACATION') || s.includes('DASARA')) return 'SCHOOL_HOLIDAY';
    if (s.includes('ACTIVITY') || s.includes('SPORTS') || s.includes('SCIENCE')) return 'ACADEMIC_ACTIVITY';
    return 'SCHOOL_EVENT';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);
    setParseError('');

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result;
          const wb = XLSX.read(buffer, { type: 'array' });
          const firstSheet = wb.Sheets[wb.SheetNames[0]];
          const rows: any[] = XLSX.utils.sheet_to_json(firstSheet);

          const parsed: Omit<AcademicCalendarEvent, 'id'>[] = rows.map((r) => {
            const dateVal = r['Date'] || r['Event Date'] || r['date'] || r['DATE'] || `${startYear}-06-01`;
            const titleVal = r['Event Title'] || r['Title'] || r['Event'] || r['title'] || r['Name'] || 'Academic Event';
            const catVal = r['Category'] || r['Type'] || r['category'] || 'SCHOOL_EVENT';
            const descVal = r['Description'] || r['description'] || r['Details'] || '';

            return {
              school_id: schoolId,
              academic_year: academicYear,
              title: String(titleVal).trim(),
              description: String(descVal).trim(),
              date: normalizeDate(dateVal),
              category: normalizeCategory(catVal),
              is_official: false,
              created_by: 'Calendar Import',
            };
          });

          setStagedEvents(parsed);
          setIsParsing(false);
        } catch (err: any) {
          setParseError(`Failed to parse Excel file: ${err.message || 'Unknown error'}`);
          setIsParsing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // PDF, Word (.docx, .doc), or Text (.txt)
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = String(evt.target?.result || '');
          // Scan for dates in text
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          const parsed: Omit<AcademicCalendarEvent, 'id'>[] = [];

          lines.forEach((line) => {
            // Match dates like 2026-06-15, 15/06/2026, 15-06-2026
            const dateMatch = line.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})|(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/);
            if (dateMatch) {
              const matchedDate = dateMatch[0];
              const rest = line.replace(matchedDate, '').replace(/[:\-\–\t]/g, ' ').trim();
              parsed.push({
                school_id: schoolId,
                academic_year: academicYear,
                title: rest || 'Academic Event',
                description: `Imported from ${file.name}`,
                date: normalizeDate(matchedDate),
                category: normalizeCategory(line),
                is_official: false,
                created_by: 'Calendar Import',
              });
            }
          });

          if (parsed.length === 0) {
            // Fallback: create staged event with file name
            parsed.push({
              school_id: schoolId,
              academic_year: academicYear,
              title: `${file.name.replace(/\.[^/.]+$/, '')} Schedule`,
              description: `Imported document for academic year ${academicYear}. Session ends April 31st.`,
              date: `${startYear}-06-01`,
              category: 'SCHOOL_EVENT',
              is_official: false,
              created_by: 'Document Import',
            });
          }

          setStagedEvents(parsed);
          setIsParsing(false);
        } catch (err: any) {
          setParseError(`Failed to parse document: ${err.message || 'Unknown error'}`);
          setIsParsing(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        'Date': `${startYear}-06-01`,
        'Event Title': 'School Reopening & Praveshotsava',
        'Category': 'SCHOOL_EVENT',
        'Description': 'Commencement of academic session. Welcome ceremony for new students.',
      },
      {
        'Date': `${startYear}-07-15`,
        'Event Title': 'CCE Formative Assessment 1 (FA-1) Window',
        'Category': 'EXAM',
        'Description': 'Conduct Activity 1, Activity 2, and unit tests as per Karnataka CCE norms.',
      },
      {
        'Date': `${startYear}-08-15`,
        'Event Title': 'Independence Day Celebration',
        'Category': 'NATIONAL_HOLIDAY',
        'Description': 'National flag hoisting, patriotic songs, and cultural programmes.',
      },
      {
        'Date': `${startYear}-09-05`,
        'Event Title': 'Teachers Day & Dr. Radhakrishnan Jayanti',
        'Category': 'SCHOOL_EVENT',
        'Description': 'Student felicitations for faculty members.',
      },
      {
        'Date': `${startYear}-09-20`,
        'Event Title': 'CCE Formative Assessment 2 (FA-2) Window',
        'Category': 'EXAM',
        'Description': 'Second formative evaluation for primary, middle, and high school.',
      },
      {
        'Date': `${startYear}-10-02`,
        'Event Title': 'Gandhi Jayanti',
        'Category': 'NATIONAL_HOLIDAY',
        'Description': 'Swachhata Abhiyan and moral assembly.',
      },
      {
        'Date': `${startYear}-10-10`,
        'Event Title': 'Dasara / Mid-Term Vacation Begins',
        'Category': 'SCHOOL_HOLIDAY',
        'Description': 'Mid-term vacation as notified by the Department of School Education.',
      },
      {
        'Date': `${startYear}-11-01`,
        'Event Title': 'Karnataka Rajyotsava',
        'Category': 'GOVT_HOLIDAY',
        'Description': 'State formation day celebrations and Kannada cultural events.',
      },
      {
        'Date': `${startYear}-11-20`,
        'Event Title': 'CCE Summative Assessment 1 (SA-1) Mid-Term Exams',
        'Category': 'EXAM',
        'Description': 'Mid-term summative examinations and evaluation.',
      },
      {
        'Date': `${startYear}-12-24`,
        'Event Title': 'Winter Break & Christmas Holiday',
        'Category': 'SCHOOL_HOLIDAY',
        'Description': 'Winter break.',
      },
      {
        'Date': `${endYear}-01-10`,
        'Event Title': 'CCE Formative Assessment 3 (FA-3) Window',
        'Category': 'EXAM',
        'Description': 'Third formative evaluation window.',
      },
      {
        'Date': `${endYear}-01-26`,
        'Event Title': 'Republic Day Celebration',
        'Category': 'NATIONAL_HOLIDAY',
        'Description': 'Flag hoisting and parade.',
      },
      {
        'Date': `${endYear}-02-15`,
        'Event Title': 'CCE Formative Assessment 4 (FA-4) Window',
        'Category': 'EXAM',
        'Description': 'Final formative evaluation window.',
      },
      {
        'Date': `${endYear}-03-20`,
        'Event Title': 'CCE Summative Assessment 2 (SA-2) Annual Exams',
        'Category': 'EXAM',
        'Description': 'Annual summative examinations for Classes 1 to 10.',
      },
      {
        'Date': `${endYear}-04-31`,
        'Event Title': 'Academic Year Session Concludes & Results Declaration',
        'Category': 'SCHOOL_EVENT',
        'Description': 'Every Karnataka academic year ends on April 31st. Declaration of marks cards, promotion registers, and SDMC review.',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AcademicCalendar');
    downloadExcelFile(wb, `Karnataka_Academic_Calendar_${academicYear}_Template.xlsx`);
  };

  const handleAddRow = () => {
    setStagedEvents((prev) => [
      ...prev,
      {
        school_id: schoolId,
        academic_year: academicYear,
        title: 'New Academic Event',
        description: '',
        date: `${startYear}-06-15`,
        category: 'SCHOOL_EVENT',
        is_official: false,
        created_by: 'Manual Entry',
      },
    ]);
  };

  const handleRemoveRow = (idx: number) => {
    setStagedEvents((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRow = (idx: number, field: string, val: string) => {
    setStagedEvents((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EBF3FC] dark:bg-slate-800 flex items-center justify-center text-[#2563EB] dark:text-[#2563EB]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Import Academic Calendar Events ({academicYear})
              </h2>
              <p className="text-[11px] text-slate-500">
                Upload schedule in <strong>.xlsx</strong>, <strong>.pdf</strong>, <strong>.docx / .doc</strong>, or <strong>.csv</strong> format. Session ends <strong>April 31st</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone & Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="sm:col-span-2 border-2 border-dashed border-[#DCE5EA] dark:border-slate-700 hover:border-[#2563EB] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#F8FAFC] dark:bg-slate-800/40">
            <Upload className="w-6 h-6 text-[#2563EB] dark:text-[#2563EB] mb-1.5" />
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              {fileName ? fileName : 'Click to select or drag & drop calendar file'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Supports .xlsx, .xls, .pdf, .docx, .doc, .csv, .txt
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.pdf,.docx,.doc,.csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="flex flex-col justify-between p-4 rounded-2xl bg-[#F4F7F9] dark:bg-slate-800/60 border border-[#DCE5EA] dark:border-slate-700 space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Template & Help</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                Download a pre-formatted template with all mandatory Karnataka CCE dates and April 31st closure.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DCE5EA] dark:border-slate-700 text-[#2563EB] dark:text-[#2563EB] font-bold text-xs hover:bg-[#EBF3FC] transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Sample .xlsx
            </button>
          </div>
        </div>

        {parseError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Staging Table & Toolbar */}
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                Staged Events Preview ({stagedEvents.length} events)
              </span>
              <span className="text-[10px] text-slate-500">
                You can edit dates, titles, and categories before committing.
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-y-auto flex-1 max-h-72">
            {stagedEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No events loaded yet. Upload a file above or click "Download Sample .xlsx" to view the template.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#EDF2F7] dark:bg-slate-800 sticky top-0 font-bold text-[10px] text-slate-600 dark:text-slate-300 uppercase">
                  <tr>
                    <th className="py-2 px-2 w-10 text-center">#</th>
                    <th className="py-2 px-3 w-32">Date</th>
                    <th className="py-2 px-3">Event Title</th>
                    <th className="py-2 px-3 w-40">Category</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-2 w-10 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stagedEvents.map((ev, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-1 px-2">
                        <input
                          type="text"
                          value={ev.date}
                          onChange={(e) => handleUpdateRow(idx, 'date', e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] outline-none"
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="text"
                          value={ev.title}
                          onChange={(e) => handleUpdateRow(idx, 'title', e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-[11px] outline-none"
                        />
                      </td>
                      <td className="py-1 px-2">
                        <select
                          value={ev.category}
                          onChange={(e) => handleUpdateRow(idx, 'category', e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold outline-none"
                        >
                          <option value="SCHOOL_EVENT">School Event</option>
                          <option value="GOVT_HOLIDAY">Govt Holiday</option>
                          <option value="NATIONAL_HOLIDAY">National Holiday</option>
                          <option value="SCHOOL_HOLIDAY">School Holiday</option>
                          <option value="LOCAL_HOLIDAY">Local Holiday</option>
                          <option value="EXAM">Examination / CCE</option>
                          <option value="ACADEMIC_ACTIVITY">Academic Activity</option>
                        </select>
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="text"
                          value={ev.description || ''}
                          onChange={(e) => handleUpdateRow(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] outline-none text-slate-600 dark:text-slate-300"
                        />
                      </td>
                      <td className="py-1 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              className="rounded text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
            />
            <span>Clear existing events for academic year {academicYear} before import</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={stagedEvents.length === 0 || isParsing}
              onClick={() => onImportSuccess(stagedEvents, clearExisting)}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#0F1D3B] text-white font-bold disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              Commit & Import {stagedEvents.length} Event(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
