'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building,
  School,
  Calendar,
  Users,
  GraduationCap,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Settings,
  UserX,
  LogOut,
  ChevronRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getUserName, toKannadaText } from '@/lib/utils/kannadaNames';

export default function AppSidebar({
  isOpen,
  onCloseMobile,
}: {
  isOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const { userRole, currentUser, logout } = useAuth();
  const { t, language } = useLanguage();

  const getPrimaryNavItems = () => {
    if (userRole === 'PLATFORM_ADMIN') {
      return [
        { label: language === 'kn' ? 'ಶಾಲಾ ಪ್ರವೇಶ ನಿರ್ವಹಣೆ' : 'School Access Management', href: '/platform-admin', icon: Building },
      ];
    }

    if (userRole === 'SCHOOL_ADMIN') {
      return [
        { label: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
        { label: t.nav.aboutSchool, href: '/about-school', icon: School },
        { label: t.nav.academicCalendar, href: '/calendar', icon: Calendar },
        { label: t.nav.students, href: '/students', icon: Users },
        { label: t.nav.marksEntry, href: '/marks', icon: ClipboardList },
        { label: t.nav.consolidatedReports, href: '/reports', icon: FileSpreadsheet },
        { label: t.nav.records, href: '/records', icon: FileText },
        { label: t.nav.formerStudents, href: '/former-students', icon: UserX },
        { label: language === 'kn' ? 'ಶಿಕ್ಷಕರು ಮತ್ತು ಪ್ರವೇಶ' : 'Faculty & Access', href: '/faculty', icon: GraduationCap },
      ];
    }

    // Faculty
    return [
      { label: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
      { label: t.nav.aboutSchool, href: '/about-school', icon: School },
      { label: t.nav.academicCalendar, href: '/calendar', icon: Calendar },
      { label: t.nav.students, href: '/students', icon: Users },
      { label: t.nav.marksEntry, href: '/marks', icon: ClipboardList },
      { label: t.nav.consolidatedReports, href: '/reports', icon: FileSpreadsheet },
      { label: t.nav.records, href: '/records', icon: FileText },
    ];
  };

  const primaryItems = getPrimaryNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Academic Navy Sidebar Container (#16284F) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#16284F] text-white flex flex-col border-r border-[#0F1D3B] shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand Identity */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-[#0F1D3B] bg-[#0F1D3B]">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#16284F] font-black shadow-sm">
            <BookOpen className="w-5 h-5 text-[#16284F]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h1 className="text-base font-bold tracking-tight text-white truncate">
              Shikshaka Sathi
            </h1>
            <p className="text-[11px] text-blue-100/80 font-medium truncate">
              {language === 'kn' ? 'ಶಾಲಾ ನಿರ್ವಹಣಾ ತಂತ್ರಾಂಶ' : 'School Management System'}
            </p>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-blue-200/60">
            {language === 'kn' ? 'ಮುಖ್ಯ ಮೆನು' : 'Academic Workspace'}
          </div>

          {primaryItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && item.href !== '/platform-admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors group relative ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                    : 'text-blue-100/85 hover:text-white hover:bg-[#1E3261]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-white' : 'text-blue-200/80 group-hover:text-white'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/90" />}
              </Link>
            );
          })}

          {/* Secondary Divider & Settings (Only for School Admin, strictly hidden for Platform Admin) */}
          {userRole === 'SCHOOL_ADMIN' && (
            <div className="pt-4 mt-4 border-t border-[#0F1D3B]">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-blue-200/60">
                {language === 'kn' ? 'ವ್ಯವಸ್ಥೆ' : 'System'}
              </div>
              <Link
                href="/settings"
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors group relative ${
                  pathname === '/settings'
                    ? 'bg-[#2563EB] text-white font-semibold'
                    : 'text-blue-100/85 hover:text-white hover:bg-[#1E3261]'
                }`}
              >
                <Settings className="w-4 h-4 text-blue-200/80 group-hover:text-white" />
                <span className="flex-1 truncate">{t.nav.settings}</span>
                {pathname === '/settings' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>
            </div>
          )}
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-[#0F1D3B] bg-[#0F1D3B]">
          <div className="p-2.5 rounded-xl bg-[#142345] border border-[#1E3A6E] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">
                {getUserName(currentUser, language)}
              </div>
              <div className="text-[10px] text-blue-200/70 truncate capitalize font-medium">
                {userRole === 'PLATFORM_ADMIN'
                  ? (language === 'kn' ? 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ನಿರ್ವಾಹಕರು' : 'Platform Admin')
                  : (language === 'kn' ? toKannadaText(currentUser?.designation || userRole) : (currentUser?.designation || userRole.replace('_', ' ').toLowerCase()))}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-blue-200/70 hover:text-white hover:bg-[#2563EB] transition-colors cursor-pointer"
              title={t.nav.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
