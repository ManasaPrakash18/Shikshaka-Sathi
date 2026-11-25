'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Globe,
  Calendar,
  Building2,
  ChevronDown,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getSchoolName, getLocationName } from '@/lib/utils/kannadaNames';
import SyncStatusBadge from '../ui/SyncStatusBadge';
// RoleSwitcher removed in production
import { Shield, UserCheck } from 'lucide-react';

export default function AppHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { currentSchool, academicYear, setAcademicYear, switchSchool, userRole, currentUser } = useAuth();
  const { state } = useAppState();
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF]/95 dark:bg-[#16212E]/95 backdrop-blur-md border-b border-[#D8E1EA] dark:border-[#2A3B50] transition-colors">
      <div className="h-full min-w-0 px-4 flex items-center justify-between gap-2">
        {/* Left: Mobile hamburger & School Brand */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#243449] dark:hover:text-white hover:bg-[#EAF0F6] dark:hover:bg-[#1E2B3C] transition-colors cursor-pointer"
            title={language === 'kn' ? 'ಮೆನು ತೆರೆಯಿರಿ' : 'Toggle Menu'}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* School Selector (for School Admin / Faculty) or Statewide Header (for Platform Admin) */}
          {userRole === 'PLATFORM_ADMIN' ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#16284F] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                KA
              </div>
              <div>
                <div className="text-xs font-bold text-[#243449] dark:text-[#F1F5F9] leading-tight">
                  {language === 'kn' ? 'ರಾಜ್ಯ ಮಟ್ಟದ ಆಡಳಿತ ಕನ್ಸೋಲ್' : 'Statewide Platform Administration'}
                </div>
                <div className="text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-semibold">
                  {language === 'kn' ? 'ಶಾಲಾ ನೋಂದಣಿ ಮತ್ತು ಪ್ರವೇಶ ನಿಯಂತ್ರಣ' : 'School Registry & Access Console'}
                </div>
              </div>
            </div>
          ) : (
            /* Institutional School Identity Card (Non-switchable on actual platform) */
            <div className="flex items-center gap-2.5 px-1 py-1 text-left">
            <div className="w-8 h-8 rounded-lg bg-[#16284F] flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-[#243449] dark:text-[#F1F5F9] truncate max-w-[140px] md:max-w-[230px]">
                {getSchoolName(currentSchool, language)}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                <span className="font-mono font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                  UDISE: {currentSchool?.udise}
                </span>
                <span>•</span>
                <span className="truncate max-w-[90px]">
                  {getLocationName(currentSchool?.taluk, language, currentSchool?.taluk_kannada)}
                </span>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Academic Year Selector with clean padding */}
          {userRole !== 'PLATFORM_ADMIN' && (
            <div className="hidden xl:flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-lg bg-[#EAF0F6] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] text-xs text-[#243449] dark:text-[#F1F5F9]">
              <Calendar className="w-3.5 h-3.5 text-[#3977A8] dark:text-[#4B8DC2] shrink-0" />
              <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                {language === 'kn' ? 'ವರ್ಷ:' : 'Year:'}
              </span>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="bg-transparent font-bold text-xs outline-none cursor-pointer pr-1"
              >
                <option value="2026-27">
                  2026-27 ({language === 'kn' ? 'ಪ್ರಸ್ತುತ' : 'Current'})
                </option>
                <option value="2025-26">2025-26</option>
                <option value="2024-25">
                  2024-25 ({language === 'kn' ? 'ಹಳೆಯ ದಾಖಲೆ' : 'Archived'})
                </option>
              </select>
            </div>
          )}

          {/* Bilingual Language Selector */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8E1EA] dark:border-[#2A3B50] hover:bg-[#EAF0F6] dark:hover:bg-[#1E2B3C] text-xs font-semibold text-[#243449] dark:text-[#F1F5F9] transition-colors shadow-sm cursor-pointer"
            title="Toggle English / ಕನ್ನಡ"
          >
            <Globe className="w-3.5 h-3.5 text-[#3977A8]" />
            <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:bg-[#EAF0F6] dark:hover:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] transition-colors cursor-pointer"
            title={isDark ? (language === 'kn' ? 'ಲೈಟ್ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ' : 'Switch to Light Mode') : (language === 'kn' ? 'ಡಾರ್ಕ್ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ' : 'Switch to Dark Mode')}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#D6B85C]" /> : <Moon className="w-4 h-4 text-[#243449]" />}
          </button>

          {/* Offline Sync Status Badge */}
          <SyncStatusBadge />

          {/* Static Current Role Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1E2B3C] border border-slate-200 dark:border-[#2A3B50] select-none">
            {userRole === 'PLATFORM_ADMIN' ? (
              <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            ) : userRole === 'SCHOOL_ADMIN' ? (
              <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">
                {language === 'kn' ? 'ಖಾತೆ ಪಾತ್ರ' : 'Role'}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {userRole === 'PLATFORM_ADMIN'
                  ? (language === 'kn' ? 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ನಿರ್ವಾಹಕರು' : 'Platform Admin')
                  : userRole === 'SCHOOL_ADMIN'
                  ? (language === 'kn' ? 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು' : 'School Admin (HM)')
                  : (language === 'kn' ? 'ಶಿಕ್ಷಕರು' : 'Faculty / Teacher')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
