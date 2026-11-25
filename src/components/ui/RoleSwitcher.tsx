'use client';

import React, { useState } from 'react';
import { UserCheck, Shield, GraduationCap, ChevronDown, Check, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { UserRole } from '@/lib/types';

export default function RoleSwitcher() {
  const router = useRouter();
  const { currentUser, currentSchool, switchRole } = useAuth();
  const { language } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const rolesConfig = [
    {
      id: 'platform-admin',
      role: 'PLATFORM_ADMIN' as UserRole,
      title: language === 'kn' ? 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಆಡಳಿತಾಧಿಕಾರಿ' : 'Platform Admin',
      subtitle: language === 'kn' ? 'ರಾಜ್ಯಾದ್ಯಂತ ಶಾಲಾ ಅನುಮೋದನೆಗಳು ಮತ್ತು ನೋಂದಣಿ' : 'Statewide School Approvals & Registry',
      icon: <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      color: 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40',
      schoolId: undefined,
      userId: 'user-platform-admin',
    },
    {
      id: 'hm-ranebennur',
      role: 'SCHOOL_ADMIN' as UserRole,
      title: language === 'kn' ? 'ಡೆಮೊ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು' : 'Demo Headmaster',
      subtitle: language === 'kn' ? 'ಶಾಲಾ ಆಡಳಿತ | ಸರ್ಕಾರಿ ಶಾಲೆ, ರಾಣೆಬೆನ್ನೂರು' : 'School Admin | Government School, Ranebennur',
      icon: <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      color: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40',
      schoolId: 'school-demo-ranebennur',
      userId: 'user-demo-hm-ranebennur',
    },
    {
      id: 'faculty-ranebennur',
      role: 'FACULTY' as UserRole,
      title: language === 'kn' ? 'ಡೆಮೊ ಶಿಕ್ಷಕರು ೦೧' : 'Demo Teacher 01',
      subtitle: language === 'kn' ? 'ಬೋಧಕ ವರ್ಗ | ಸರ್ಕಾರಿ ಶಾಲೆ, ರಾಣೆಬೆನ್ನೂರು' : 'Faculty | Government School, Ranebennur',
      icon: <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      color: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40',
      schoolId: 'school-demo-ranebennur',
      userId: 'user-demo-faculty-01',
    },

  ];

  const handleSelect = (item: (typeof rolesConfig)[0]) => {
    switchRole(item.role, item.schoolId, item.userId);
    setDropdownOpen(false);
    if (item.role === 'PLATFORM_ADMIN') {
      router.replace('/platform-admin');
    } else {
      router.replace('/dashboard');
    }
  };

  const currentRoleLabel =
    currentUser?.role === 'PLATFORM_ADMIN'
      ? (language === 'kn' ? 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಆಡಳಿತಾಧಿಕಾರಿ' : 'Platform Admin')
      : currentUser?.role === 'SCHOOL_ADMIN'
      ? (language === 'kn' ? `ಶಾಲಾ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು (${currentUser.name_kannada || currentUser.name})` : `School Admin (${currentUser.name})`)
      : (language === 'kn' ? `ಶಿಕ್ಷಕರು (${currentUser?.name_kannada || currentUser?.name})` : `Faculty (${currentUser?.name})`);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label={currentRoleLabel}
        aria-expanded={dropdownOpen}
        className="flex max-w-[220px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:pl-3.5 sm:pr-4"
      >
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {language === 'kn' ? 'ಪಾತ್ರ:' : 'Role:'}
        </span>
        <span className="hidden truncate font-bold sm:inline">{currentRoleLabel}</span>
        <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'kn' ? 'ಪರೀಕ್ಷಾ ಲಾಗಿನ್ ಆಯ್ಕೆಮಾಡಿ' : 'Switch Testing Persona'}
            </div>
            <div className="p-1 space-y-1">
              {rolesConfig.map((item) => {
                const isSelected = currentUser?.id === item.userId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">{item.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
