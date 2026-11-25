'use client';

import React, { useState } from 'react';
import {
  School,
  Trophy,
  Users,
  Hammer,
  FileCheck2,
  Image as ImageIcon,
  Plus,
  Calendar,
  Save,
  MapPin,
  Phone,
} from 'lucide-react';
import { ConstructionWork, SchoolAchievement } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getSchoolName, getHMName, getLocationName, getUserName, getSubjectName, toKannadaText } from '@/lib/utils/kannadaNames';

interface BilingualFieldProps {
  label: string;
  english: string;
  kannada: string;
  onEnglishChange: (value: string) => void;
  onKannadaChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
}

function BilingualField({
  label,
  english,
  kannada,
  onEnglishChange,
  onKannadaChange,
  required = false,
  multiline = false,
}: BilingualFieldProps) {
  const fieldClass =
    'w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="font-bold text-slate-700 dark:text-slate-300">
        {label} (English){required ? ' *' : ''}
        {multiline ? (
          <textarea
            rows={2}
            required={required}
            value={english}
            onChange={(event) => onEnglishChange(event.target.value)}
            className={fieldClass}
          />
        ) : (
          <input
            type="text"
            required={required}
            value={english}
            onChange={(event) => onEnglishChange(event.target.value)}
            className={fieldClass}
          />
        )}
      </label>
      <label className="font-bold text-slate-700 dark:text-slate-300">
        {label} (Kannada){required ? ' *' : ''}
        {multiline ? (
          <textarea
            lang="kn"
            rows={2}
            required={required}
            value={kannada}
            onChange={(event) => onKannadaChange(event.target.value)}
            className={fieldClass}
          />
        ) : (
          <input
            type="text"
            lang="kn"
            required={required}
            value={kannada}
            onChange={(event) => onKannadaChange(event.target.value)}
            className={fieldClass}
          />
        )}
      </label>
    </div>
  );
}

export default function AboutSchoolPage() {
  const { currentSchool, academicYear, userRole, updateSchoolDetails } = useAuth();
  const { state, addAchievement, addConstructionWork, addSDMCMeeting, addGalleryItem } = useAppState();
  const { t, language } = useLanguage();

  const defaultEnglishDesc = 'Government High School dedicated to providing holistic education, fostering academic excellence and nurturing extracurricular talents under the guidelines of Karnataka School Education Department.';
  const defaultKannadaDesc = 'ಕರ್ನಾಟಕ ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆಯ ಮಾರ್ಗಸೂಚಿಗಳ ಅನ್ವಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಗುಣಮಟ್ಟದ ಶಿಕ್ಷಣ, ಸರ್ವತೋಮುಖ ಕಲಿಕೆ, ನೈತಿಕ ಮೌಲ್ಯಗಳು ಹಾಗೂ ಪಠ್ಯೇತರ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ಪ್ರೋತ್ಸಾಹ ನೀಡಲು ಬದ್ಧವಾಗಿರುವ ಶ್ರೇಷ್ಠ ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ.';
  const legacyDescriptionKannada =
    (currentSchool as (typeof currentSchool & { description_kn?: string }) | null)?.description_kn || '';

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACHIEVEMENTS' | 'FACULTY' | 'WORKS' | 'SDMC' | 'GALLERY'>('OVERVIEW');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descTextEn, setDescTextEn] = useState(currentSchool?.description || '');
  const [descTextKn, setDescTextKn] = useState(currentSchool?.description_kannada || legacyDescriptionKannada);

  // Modals
  const [achieveModalOpen, setAchieveModalOpen] = useState(false);
  const [achieveForm, setAchieveForm] = useState({
    title: '',
    title_kannada: '',
    category: 'Sports' as SchoolAchievement['category'],
    student_name: '',
    student_name_kannada: '',
    class_number: 10,
    description: '',
    description_kannada: '',
    date: '2026-10-15',
    academic_year: academicYear,
  });

  const [workModalOpen, setWorkModalOpen] = useState(false);
  const [workForm, setWorkForm] = useState({
    title: '',
    title_kannada: '',
    description: '',
    description_kannada: '',
    date: '2026-10-15',
    estimated_cost: 250000,
    completion_status: 'IN_PROGRESS' as ConstructionWork['completion_status'],
    academic_year: academicYear,
  });

  const [sdmcModalOpen, setSdmcModalOpen] = useState(false);
  const [sdmcForm, setSdmcForm] = useState({
    title: '',
    title_kannada: '',
    date: '2026-10-15',
    agenda: '',
    agenda_kannada: '',
    summary: '',
    summary_kannada: '',
    decisions_taken: '',
    decisions_taken_kannada: '',
    academic_year: academicYear,
  });

  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    title_kannada: '',
    description: '',
    description_kannada: '',
    date: '2026-10-15',
    photoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    academic_year: academicYear,
  });

  // Faculty table for current school
  const workingFaculty = state.users.filter((u) => u.school_id === currentSchool?.id);

  // Group and sort items by academic year from latest to oldest
  const groupAndSortByYear = <T extends { academic_year?: string; date?: string; school_id?: string }>(items: T[]) => {
    const schoolItems = items.filter((i) => i.school_id === currentSchool?.id);
    const groups: Record<string, T[]> = {};

    schoolItems.forEach((item) => {
      const yr = item.academic_year || academicYear;
      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(item);
    });

    // Sort items inside each year newest to oldest by date
    Object.keys(groups).forEach((yr) => {
      groups[yr].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    });

    // Sort years descending (latest to oldest, e.g., '2026-27' before '2025-26' before '2024-25')
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((year) => ({
        year,
        items: groups[year],
      }));
  };

  const groupedAchievements = groupAndSortByYear(state.achievements);
  const totalAchievements = state.achievements.filter((a) => a.school_id === currentSchool?.id).length;

  const groupedWorks = groupAndSortByYear(state.constructionWorks);
  const totalWorks = state.constructionWorks.filter((w) => w.school_id === currentSchool?.id).length;

  const groupedSDMC = groupAndSortByYear(state.sdmcMeetings);
  const totalSDMC = state.sdmcMeetings.filter((m) => m.school_id === currentSchool?.id).length;

  const groupedGallery = groupAndSortByYear(state.gallery);
  const totalGallery = state.gallery.filter((g) => g.school_id === currentSchool?.id).length;
  const localizedText = (english?: string, kannada?: string) =>
    language === 'kn' ? kannada || english || '' : english || '';
  const hasIncompleteLanguagePair = (english: string, kannada: string) =>
    Boolean(english.trim()) !== Boolean(kannada.trim());

  const handleSaveDescription = async () => {
    const finalEn = descTextEn.trim();
    const finalKn = descTextKn.trim();
    if (!finalEn || !finalKn) {
      alert('Enter the school description in both English and Kannada.');
      return;
    }

    await updateSchoolDetails({
      description: finalEn,
      description_kannada: finalKn,
    });

    setIsEditingDesc(false);
    alert(language === 'kn' ? 'ಶಾಲೆಯ ವಿವರಣೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!' : 'School description updated successfully in both languages!');
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    if (hasIncompleteLanguagePair(achieveForm.description, achieveForm.description_kannada)) {
      alert('Enter the achievement description in both languages, or leave both blank.');
      return;
    }
    await addAchievement({
      school_id: currentSchool.id,
      title: achieveForm.title,
      title_kannada: achieveForm.title_kannada,
      category: achieveForm.category,
      student_name: achieveForm.student_name,
      student_name_kannada: achieveForm.student_name_kannada,
      class_number: achieveForm.class_number,
      description: achieveForm.description,
      description_kannada: achieveForm.description_kannada,
      date: achieveForm.date,
      academic_year: achieveForm.academic_year || academicYear,
    });
    setAchieveModalOpen(false);
    setAchieveForm({
      title: '',
      title_kannada: '',
      category: 'Sports',
      student_name: '',
      student_name_kannada: '',
      class_number: 10,
      description: '',
      description_kannada: '',
      date: '2026-10-15',
      academic_year: academicYear,
    });
  };

  const handleCreateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    if (hasIncompleteLanguagePair(workForm.description, workForm.description_kannada)) {
      alert('Enter the work description in both languages, or leave both blank.');
      return;
    }
    await addConstructionWork({
      school_id: currentSchool.id,
      title: workForm.title,
      title_kannada: workForm.title_kannada,
      description: workForm.description,
      description_kannada: workForm.description_kannada,
      date: workForm.date,
      estimated_cost: workForm.estimated_cost,
      completion_status: workForm.completion_status,
      academic_year: workForm.academic_year || academicYear,
    });
    setWorkModalOpen(false);
    setWorkForm({
      title: '',
      title_kannada: '',
      description: '',
      description_kannada: '',
      date: '2026-10-15',
      estimated_cost: 250000,
      completion_status: 'IN_PROGRESS',
      academic_year: academicYear,
    });
  };

  const handleCreateSDMC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    if (
      hasIncompleteLanguagePair(sdmcForm.summary, sdmcForm.summary_kannada) ||
      hasIncompleteLanguagePair(sdmcForm.decisions_taken, sdmcForm.decisions_taken_kannada)
    ) {
      alert('Enter meeting summaries and decisions in both languages, or leave both blank.');
      return;
    }
    await addSDMCMeeting({
      school_id: currentSchool.id,
      title: sdmcForm.title,
      title_kannada: sdmcForm.title_kannada,
      date: sdmcForm.date,
      agenda: sdmcForm.agenda,
      agenda_kannada: sdmcForm.agenda_kannada,
      summary: sdmcForm.summary,
      summary_kannada: sdmcForm.summary_kannada,
      decisions_taken: sdmcForm.decisions_taken,
      decisions_taken_kannada: sdmcForm.decisions_taken_kannada,
      academic_year: sdmcForm.academic_year || academicYear,
    });
    setSdmcModalOpen(false);
    setSdmcForm({
      title: '',
      title_kannada: '',
      date: '2026-10-15',
      agenda: '',
      agenda_kannada: '',
      summary: '',
      summary_kannada: '',
      decisions_taken: '',
      decisions_taken_kannada: '',
      academic_year: academicYear,
    });
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    if (hasIncompleteLanguagePair(galleryForm.description, galleryForm.description_kannada)) {
      alert('Enter the gallery description in both languages, or leave both blank.');
      return;
    }
    await addGalleryItem({
      school_id: currentSchool.id,
      title: galleryForm.title,
      title_kannada: galleryForm.title_kannada,
      description: galleryForm.description,
      description_kannada: galleryForm.description_kannada,
      date: galleryForm.date,
      photos: [galleryForm.photoUrl],
      academic_year: galleryForm.academic_year || academicYear,
    });
    setGalleryModalOpen(false);
    setGalleryForm({
      title: '',
      title_kannada: '',
      description: '',
      description_kannada: '',
      date: '2026-10-15',
      photoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      academic_year: academicYear,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with School Identity */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1A2636] text-[#243449] dark:text-[#F1F5F9] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-md bg-[#EBF3FC] dark:bg-[#1E2B3C] text-[#2563EB] dark:text-[#3B82F6] text-xs font-semibold border border-blue-200 dark:border-blue-800">
              {language === 'kn' ? 'ಶಾಲಾ ಸಂಸ್ಥೆ ವಿವರ ಮತ್ತು ದಾಖಲೆಗಳು' : 'Institution Profile & Records'}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#16284F] dark:text-[#F1F5F9] tracking-tight">
              {getSchoolName(currentSchool, language)}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                {getLocationName(currentSchool?.taluk, language, currentSchool?.taluk_kannada)}, {getLocationName(currentSchool?.district, language, currentSchool?.district_kannada)}, {language === 'kn' ? 'ಕರ್ನಾಟಕ' : 'Karnataka'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                {language === 'kn' ? 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು' : 'HM'}: {getHMName(currentSchool, language)} ({currentSchool?.hm_phone})
              </span>
            </div>
          </div>

          <div className="px-5 py-3 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] self-start md:self-auto text-right">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              {t.dashboard.udise}
            </span>
            <div className="text-xl font-mono font-bold text-[#16284F] dark:text-[#F1F5F9]">{currentSchool?.udise}</div>
            <span className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6]">
              {language === 'kn' ? 'ಶೈಕ್ಷಣಿಕ ವರ್ಷ:' : 'Academic Year:'} {academicYear}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#D8E1EA] dark:border-[#2A3B50] pb-2">
        {[
          { id: 'OVERVIEW', label: language === 'kn' ? 'ಶಾಲಾ ವಿವರ' : 'School Profile', icon: School },
          { id: 'ACHIEVEMENTS', label: language === 'kn' ? `ಸಾಧನೆಗಳು (${totalAchievements})` : `Achievements (${totalAchievements})`, icon: Trophy },
          { id: 'FACULTY', label: language === 'kn' ? `ಬೋಧಕ ಸಿಬ್ಬಂದಿ (${workingFaculty.length})` : `Working Faculty (${workingFaculty.length})`, icon: Users },
          { id: 'WORKS', label: language === 'kn' ? `ಅಭಿವೃದ್ಧಿ ಕಾಮಗಾರಿಗಳು (${totalWorks})` : `Construction Works (${totalWorks})`, icon: Hammer },
          { id: 'SDMC', label: language === 'kn' ? `ಎಸ್‌ಡಿಎಂಸಿ ಸಭೆಗಳು (${totalSDMC})` : `SDMC Meetings (${totalSDMC})`, icon: FileCheck2 },
          { id: 'GALLERY', label: language === 'kn' ? `ಶಾಲಾ ಗ್ಯಾಲರಿ (${totalGallery})` : `School Gallery (${totalGallery})`, icon: ImageIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isSel
                  ? 'bg-[#16284F] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1A2636] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F3F6F9] dark:hover:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & EDITABLE BILINGUAL DESCRIPTION */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <School className="w-4 h-4 text-[#2563EB]" />
                {language === 'kn' ? 'ಶಾಲಾ ಹಿನ್ನೆಲೆ ಮತ್ತು ಆಡಳಿತ ವಿವರಣೆ' : 'Institutional Background & Governance'}
              </h2>
              {userRole !== 'FACULTY' && !isEditingDesc && (
                <button
                  onClick={() => {
                    setDescTextEn(currentSchool?.description || '');
                    setDescTextKn(currentSchool?.description_kannada || legacyDescriptionKannada);
                    setIsEditingDesc(true);
                  }}
                  className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  {language === 'kn' ? 'ವಿವರಣೆ ತಿದ್ದುಪಡಿ' : 'Edit Description'}
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <div className="space-y-3">
                <BilingualField
                  label="School description"
                  english={descTextEn}
                  kannada={descTextKn}
                  required
                  multiline
                  onEnglishChange={setDescTextEn}
                  onKannadaChange={setDescTextKn}
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingDesc(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSaveDescription}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#16284F] text-white hover:bg-[#0F1D3B] shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {language === 'kn' ? 'ವಿವರಣೆ ಉಳಿಸಿ' : 'Save Description'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {language === 'kn'
                  ? descTextKn || currentSchool?.description_kannada || legacyDescriptionKannada || defaultKannadaDesc
                  : descTextEn || currentSchool?.description || defaultEnglishDesc}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 font-semibold">{language === 'kn' ? 'ಶಾಲೆಯ ಹೆಸರು:' : 'School Name:'}</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{getSchoolName(currentSchool, language)}</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">{language === 'kn' ? 'ಯುಡೈಸ್ ಕೋಡ್:' : 'UDISE Number:'}</span>
                <div className="font-bold font-mono text-[#2563EB] mt-0.5">
                  {currentSchool?.udise}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">{language === 'kn' ? 'ಪ್ರಸ್ತುತ ಶೈಕ್ಷಣಿಕ ವರ್ಷ:' : 'Current Academic Year:'}</span>
                <div className="font-bold text-[#2563EB] dark:text-blue-400 mt-0.5">{academicYear}</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">{language === 'kn' ? 'ಪ್ರವೇಶ ಸ್ಥಿತಿ:' : 'Access Status:'}</span>
                <div className="font-bold text-[#2563EB] dark:text-[#3B82F6] mt-0.5">
                  {currentSchool?.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT ACHIEVEMENTS */}
      {activeTab === 'ACHIEVEMENTS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {language === 'kn'
                ? 'ಕ್ರೀಡೆ, ಪ್ರತಿಭಾ ಕಾರಂಜಿ, ಇನ್‌ಸ್ಪೈರ್ ಅವಾರ್ಡ್ಸ್ ಮತ್ತು ಪರೀಕ್ಷಾ ಸಾಧನೆಗಳ ಶೈಕ್ಷಣಿಕ ವರ್ಷವಾರು ವಿವರ.'
                : 'Student awards in Sports, Pratibha Karanji, INSPIRE Awards, and Competitive Exams separated by academic year.'}
            </p>
            {userRole !== 'FACULTY' && (
              <button
                onClick={() => setAchieveModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {language === 'kn' ? 'ಸಾಧನೆ ಸೇರಿಸಿ' : 'Add Achievement'}
              </button>
            )}
          </div>

          {groupedAchievements.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              {language === 'kn' ? 'ಯಾವುದೇ ಸಾಧನೆಗಳು ದಾಖಲಾಗಿಲ್ಲ.' : 'No achievements recorded yet.'}
            </div>
          ) : (
            groupedAchievements.map(({ year, items }, idx) => (
              <div key={year} className="space-y-4">
                {/* Academic Year Header */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    {language === 'kn' ? `ಶೈಕ್ಷಣಿಕ ವರ್ಷ ${year}` : `Academic Year ${year}`}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({items.length} {language === 'kn' ? 'ಸಾಧನೆಗಳು' : items.length === 1 ? 'Achievement' : 'Achievements'})
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:border-slate-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {language === 'kn' ? toKannadaText(item.category) : item.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {localizedText(item.title, item.title_kannada)}
                        </h3>
                        <div className="text-xs text-[#2563EB] dark:text-blue-400 font-semibold mt-1">
                          {localizedText(item.student_name, item.student_name_kannada)}{' '}
                          ({language === 'kn' ? `${item.class_number}ನೇ ತರಗತಿ` : `Class ${item.class_number}`})
                        </div>
                        {(item.description || item.description_kannada) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            {localizedText(item.description, item.description_kannada)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section Divider after every academic year completes */}
                {idx < groupedAchievements.length - 1 && (
                  <div className="pt-6 pb-2">
                    <hr className="border-t-2 border-dashed border-slate-200 dark:border-slate-800" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: FACULTY INFORMATION */}
      {activeTab === 'FACULTY' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'kn' ? 'ಪ್ರಸ್ತುತ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ಬೋಧಕ ಸಿಬ್ಬಂದಿ' : 'Currently Working Faculty'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'kn'
                ? 'ಹುದ್ದೆ, ನಿಯೋಜಿತ ತರಗತಿಗಳು ಮತ್ತು ವಿಷಯವಾರು ಶಿಕ್ಷಕರ ಪಟ್ಟಿ'
                : 'Faculty list with assigned designations, classes, and subjects'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">{language === 'kn' ? 'ಕ್ರ.ಸಂ.' : 'Sl. No.'}</th>
                  <th className="py-3 px-4">{language === 'kn' ? 'ಶಿಕ್ಷಕರ ಹೆಸರು' : 'Faculty Name'}</th>
                  <th className="py-3 px-4">{language === 'kn' ? 'ಹುದ್ದೆ' : 'Designation'}</th>
                  <th className="py-3 px-4">{language === 'kn' ? 'ನಿಯೋಜಿತ ತರಗತಿ' : 'Assigned Class'}</th>
                  <th className="py-3 px-4">{language === 'kn' ? 'ಬೋಧನಾ ವಿಷಯ' : 'Assigned Subject'}</th>
                  <th className="py-3 px-4 text-center">{language === 'kn' ? 'ಸ್ಥಿತಿ' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {workingFaculty.map((fac, idx) => {
                  const assignment = state.facultyAssignments.find((a) => a.faculty_id === fac.id);
                  return (
                    <tr key={fac.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{getUserName(fac, language)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                        {language === 'kn' ? toKannadaText(fac.designation || fac.role) : (fac.designation || fac.role)}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#2563EB] dark:text-blue-400">
                        {assignment
                          ? (language === 'kn'
                              ? `ತರಗತಿ ${assignment.class_number} - ${assignment.section} ವಿಭಾಗ`
                              : `Class ${assignment.class_number} - Sec ${assignment.section}`)
                          : (language === 'kn' ? 'ಸಾಮಾನ್ಯ / ಎಲ್ಲಾ' : 'General / All')}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {assignment?.subject_name ? getSubjectName(assignment.subject_name, language) : (language === 'kn' ? 'ಎಲ್ಲಾ ವಿಷಯಗಳು' : 'All Subjects (Primary)')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3FC] text-[#2563EB] dark:bg-slate-800 dark:text-blue-400">
                          {fac.status === 'ACTIVE' ? (language === 'kn' ? 'ಸಕ್ರಿಯ' : 'ACTIVE') : fac.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONSTRUCTION WORKS (Grouped by Academic Year, Latest to Oldest) */}
      {activeTab === 'WORKS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Academic-year construction, smart lab upgrades, and civil improvements displayed latest to oldest.
            </p>
            {userRole !== 'FACULTY' && (
              <button
                onClick={() => setWorkModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Construction Work
              </button>
            )}
          </div>

          {groupedWorks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No construction works recorded yet.
            </div>
          ) : (
            groupedWorks.map(({ year, items }, idx) => (
              <div key={year} className="space-y-4">
                {/* Academic Year Header */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    Academic Year {year}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({items.length} {items.length === 1 ? 'Work Project' : 'Work Projects'})
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:border-slate-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {items.map((work) => {
                    const statusPill =
                      work.completion_status === 'COMPLETED'
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200 dark:bg-slate-800 dark:text-blue-300'
                        : work.completion_status === 'IN_PROGRESS'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
                    return (
                      <div
                        key={work.id}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusPill}`}>
                            {work.completion_status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{work.date}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {localizedText(work.title, work.title_kannada)}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {localizedText(work.description, work.description_kannada)}
                        </p>
                        {work.estimated_cost && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span>Est. Cost:</span>
                            <span className="font-mono text-[#2563EB] dark:text-blue-400 font-bold">
                              ₹{work.estimated_cost.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Section Divider after every academic year completes */}
                {idx < groupedWorks.length - 1 && (
                  <div className="pt-6 pb-2">
                    <hr className="border-t-2 border-dashed border-slate-200 dark:border-slate-800" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: SDMC MEETINGS (Grouped by Academic Year, Latest to Oldest) */}
      {activeTab === 'SDMC' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              School Development and Monitoring Committee (SDMC) proceedings displayed academic year separated.
            </p>
            {userRole !== 'FACULTY' && (
              <button
                onClick={() => setSdmcModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add SDMC Meeting
              </button>
            )}
          </div>

          {groupedSDMC.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No SDMC meetings recorded yet.
            </div>
          ) : (
            groupedSDMC.map(({ year, items }, idx) => (
              <div key={year} className="space-y-4">
                {/* Academic Year Header */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    Academic Year {year}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({items.length} {items.length === 1 ? 'Meeting' : 'Meetings'})
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:border-slate-800" />
                </div>

                <div className="space-y-3">
                  {items.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {localizedText(meeting.title, meeting.title_kannada)}
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">{meeting.date}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Agenda</span>
                          <p className="mt-1 text-slate-700 dark:text-slate-300">
                            {localizedText(meeting.agenda, meeting.agenda_kannada)}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Discussion Summary</span>
                          <p className="mt-1 text-slate-700 dark:text-slate-300">
                            {localizedText(meeting.summary, meeting.summary_kannada)}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-200 dark:border-slate-700">
                          <span className="font-bold text-[#2563EB] dark:text-blue-400 uppercase text-[10px]">Decisions Taken</span>
                          <p className="mt-1 text-slate-800 dark:text-slate-200">
                            {localizedText(meeting.decisions_taken, meeting.decisions_taken_kannada)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section Divider after every academic year completes */}
                {idx < groupedSDMC.length - 1 && (
                  <div className="pt-6 pb-2">
                    <hr className="border-t-2 border-dashed border-slate-200 dark:border-slate-800" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: SCHOOL GALLERY (Grouped by Academic Year, Latest to Oldest) */}
      {activeTab === 'GALLERY' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Visual event archives and student activities separated by academic year.</p>
            {userRole !== 'FACULTY' && (
              <button
                onClick={() => setGalleryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Gallery Item
              </button>
            )}
          </div>

          {groupedGallery.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No gallery items recorded yet.
            </div>
          ) : (
            groupedGallery.map(({ year, items }, idx) => (
              <div key={year} className="space-y-4">
                {/* Academic Year Header */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    Academic Year {year}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({items.length} {items.length === 1 ? 'Photo Archive' : 'Photo Archives'})
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:border-slate-800" />
                </div>

                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="break-inside-avoid rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                    >
                      {item.photos?.[0] && (
                        <div className="relative overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800">
                          <img
                            src={item.photos[0]}
                            alt={localizedText(item.title, item.title_kannada)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{item.date}</span>
                          <span className="font-semibold text-[#2563EB] dark:text-blue-400">{year}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {localizedText(item.title, item.title_kannada)}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {localizedText(item.description, item.description_kannada)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section Divider after every academic year completes */}
                {idx < groupedGallery.length - 1 && (
                  <div className="pt-6 pb-2">
                    <hr className="border-t-2 border-dashed border-slate-200 dark:border-slate-800" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ADD ACHIEVEMENT MODAL */}
      {achieveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Student Achievement</h2>
            <form onSubmit={handleCreateAchievement} className="space-y-3">
              <BilingualField
                label="Award / Event Title"
                english={achieveForm.title}
                kannada={achieveForm.title_kannada}
                required
                onEnglishChange={(value) => setAchieveForm({ ...achieveForm, title: value })}
                onKannadaChange={(value) => setAchieveForm({ ...achieveForm, title_kannada: value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={achieveForm.category}
                    onChange={(e) =>
                      setAchieveForm({ ...achieveForm, category: e.target.value as SchoolAchievement['category'] })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="Sports">Sports</option>
                    <option value="Pratibha Karanji">Pratibha Karanji</option>
                    <option value="INSPIRE Awards">INSPIRE Awards</option>
                    <option value="Competitive Examinations">Competitive Exams</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Class</label>
                  <select
                    value={achieveForm.class_number}
                    onChange={(e) => setAchieveForm({ ...achieveForm, class_number: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <BilingualField
                label="Student Name(s)"
                english={achieveForm.student_name}
                kannada={achieveForm.student_name_kannada}
                required
                onEnglishChange={(value) => setAchieveForm({ ...achieveForm, student_name: value })}
                onKannadaChange={(value) => setAchieveForm({ ...achieveForm, student_name_kannada: value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Date *</label>
                  <input
                    type="date"
                    required
                    value={achieveForm.date}
                    onChange={(e) => setAchieveForm({ ...achieveForm, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Academic Year</label>
                  <select
                    value={achieveForm.academic_year}
                    onChange={(e) => setAchieveForm({ ...achieveForm, academic_year: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                  >
                    <option value="2026-27">2026-27</option>
                    <option value="2025-26">2025-26</option>
                    <option value="2024-25">2024-25</option>
                  </select>
                </div>
              </div>
              <BilingualField
                label="Description"
                english={achieveForm.description}
                kannada={achieveForm.description_kannada}
                multiline
                onEnglishChange={(value) => setAchieveForm({ ...achieveForm, description: value })}
                onKannadaChange={(value) => setAchieveForm({ ...achieveForm, description_kannada: value })}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAchieveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CONSTRUCTION WORK MODAL */}
      {workModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Construction Work</h2>
            <form onSubmit={handleCreateWork} className="space-y-3">
              <BilingualField
                label="Work Title"
                english={workForm.title}
                kannada={workForm.title_kannada}
                required
                onEnglishChange={(value) => setWorkForm({ ...workForm, title: value })}
                onKannadaChange={(value) => setWorkForm({ ...workForm, title_kannada: value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={workForm.estimated_cost}
                    onChange={(e) => setWorkForm({ ...workForm, estimated_cost: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={workForm.completion_status}
                    onChange={(e) =>
                      setWorkForm({
                        ...workForm,
                        completion_status: e.target.value as ConstructionWork['completion_status'],
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Date *</label>
                  <input
                    type="date"
                    required
                    value={workForm.date}
                    onChange={(e) => setWorkForm({ ...workForm, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Academic Year</label>
                  <select
                    value={workForm.academic_year}
                    onChange={(e) => setWorkForm({ ...workForm, academic_year: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                  >
                    <option value="2026-27">2026-27</option>
                    <option value="2025-26">2025-26</option>
                    <option value="2024-25">2024-25</option>
                  </select>
                </div>
              </div>
              <BilingualField
                label="Description"
                english={workForm.description}
                kannada={workForm.description_kannada}
                multiline
                onEnglishChange={(value) => setWorkForm({ ...workForm, description: value })}
                onKannadaChange={(value) => setWorkForm({ ...workForm, description_kannada: value })}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWorkModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold"
                >
                  Save Work Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SDMC MEETING MODAL */}
      {sdmcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Record SDMC Meeting</h2>
            <form onSubmit={handleCreateSDMC} className="space-y-3">
              <BilingualField
                label="Meeting Title"
                english={sdmcForm.title}
                kannada={sdmcForm.title_kannada}
                required
                onEnglishChange={(value) => setSdmcForm({ ...sdmcForm, title: value })}
                onKannadaChange={(value) => setSdmcForm({ ...sdmcForm, title_kannada: value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Date *</label>
                  <input
                    type="date"
                    required
                    value={sdmcForm.date}
                    onChange={(e) => setSdmcForm({ ...sdmcForm, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Academic Year</label>
                  <select
                    value={sdmcForm.academic_year}
                    onChange={(e) => setSdmcForm({ ...sdmcForm, academic_year: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                  >
                    <option value="2026-27">2026-27</option>
                    <option value="2025-26">2025-26</option>
                    <option value="2024-25">2024-25</option>
                  </select>
                </div>
              </div>
              <BilingualField
                label="Agenda"
                english={sdmcForm.agenda}
                kannada={sdmcForm.agenda_kannada}
                required
                onEnglishChange={(value) => setSdmcForm({ ...sdmcForm, agenda: value })}
                onKannadaChange={(value) => setSdmcForm({ ...sdmcForm, agenda_kannada: value })}
              />
              <BilingualField
                label="Meeting Summary"
                english={sdmcForm.summary}
                kannada={sdmcForm.summary_kannada}
                multiline
                onEnglishChange={(value) => setSdmcForm({ ...sdmcForm, summary: value })}
                onKannadaChange={(value) => setSdmcForm({ ...sdmcForm, summary_kannada: value })}
              />
              <BilingualField
                label="Decisions Taken"
                english={sdmcForm.decisions_taken}
                kannada={sdmcForm.decisions_taken_kannada}
                multiline
                onEnglishChange={(value) => setSdmcForm({ ...sdmcForm, decisions_taken: value })}
                onKannadaChange={(value) => setSdmcForm({ ...sdmcForm, decisions_taken_kannada: value })}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSdmcModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold"
                >
                  Save SDMC Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD GALLERY MODAL */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Photo to Gallery</h2>
            <form onSubmit={handleCreateGallery} className="space-y-3">
              <BilingualField
                label="Event Title"
                english={galleryForm.title}
                kannada={galleryForm.title_kannada}
                required
                onEnglishChange={(value) => setGalleryForm({ ...galleryForm, title: value })}
                onKannadaChange={(value) => setGalleryForm({ ...galleryForm, title_kannada: value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Date *</label>
                  <input
                    type="date"
                    required
                    value={galleryForm.date}
                    onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Academic Year</label>
                  <select
                    value={galleryForm.academic_year}
                    onChange={(e) => setGalleryForm({ ...galleryForm, academic_year: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                  >
                    <option value="2026-27">2026-27</option>
                    <option value="2025-26">2025-26</option>
                    <option value="2024-25">2024-25</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Photograph URL *</label>
                <input
                  type="url"
                  required
                  value={galleryForm.photoUrl}
                  onChange={(e) => setGalleryForm({ ...galleryForm, photoUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono text-[11px]"
                />
              </div>
              <BilingualField
                label="Description"
                english={galleryForm.description}
                kannada={galleryForm.description_kannada}
                multiline
                onEnglishChange={(value) => setGalleryForm({ ...galleryForm, description: value })}
                onKannadaChange={(value) => setGalleryForm({ ...galleryForm, description_kannada: value })}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
