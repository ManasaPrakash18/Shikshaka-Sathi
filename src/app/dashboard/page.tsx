'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  GraduationCap,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  UserPlus,
  ArrowRight,
  TrendingUp,
  School,
  Phone,
  Building,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getSchoolName, getHMName, getLocationName } from '@/lib/utils/kannadaNames';
import PlatformAdminPage from '../platform-admin/page';

export default function DashboardPage() {
  const { currentSchool, academicYear, userRole } = useAuth();
  const { state } = useAppState();
  const { t, language } = useLanguage();

  // Strict role check: Platform Admin only has access to School Access Management
  if (userRole === 'PLATFORM_ADMIN') {
    return <PlatformAdminPage />;
  }

  // Filter students by current school, academic year, and ACTIVE status
  const activeStudents = state.students.filter(
    (s) =>
      s.school_id === currentSchool?.id &&
      s.academic_year === academicYear &&
      s.status === 'ACTIVE'
  );

  const totalStudents = activeStudents.length;
  const totalBoys = activeStudents.filter((s) => s.gender === 'BOY').length;
  const totalGirls = activeStudents.filter((s) => s.gender === 'GIRL').length;

  // Classes range: 1 to 10
  const classesList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Table 1: Class-wise Student Statistics
  const classStats = classesList.map((cls) => {
    const classStudents = activeStudents.filter((s) => s.class_number === cls);
    const boys = classStudents.filter((s) => s.gender === 'BOY').length;
    const girls = classStudents.filter((s) => s.gender === 'GIRL').length;
    return {
      classNumber: cls,
      boys,
      girls,
      total: boys + girls,
    };
  });

  // Table 2: Class-wise Category Statistics
  const categoryStats = classesList.map((cls) => {
    const classStudents = activeStudents.filter((s) => s.class_number === cls);
    const sc = classStudents.filter((s) => s.category === 'SC').length;
    const st = classStudents.filter((s) => s.category === 'ST').length;
    const obc = classStudents.filter((s) => s.category === 'OBC').length;
    const gm = classStudents.filter((s) => s.category === 'GM').length;
    return {
      classNumber: cls,
      sc,
      st,
      obc,
      gm,
      total: sc + st + obc + gm,
    };
  });

  const totalSC = categoryStats.reduce((acc, c) => acc + c.sc, 0);
  const totalST = categoryStats.reduce((acc, c) => acc + c.st, 0);
  const totalOBC = categoryStats.reduce((acc, c) => acc + c.obc, 0);
  const totalGM = categoryStats.reduce((acc, c) => acc + c.gm, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP INSTITUTIONAL BANNER: Forest Teal × Academic Blue design system */}
      <div className="rounded-2xl bg-white dark:bg-[#1A2636] text-[#243449] dark:text-[#F1F5F9] p-6 sm:p-8 border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EBF3FC] dark:bg-[#202F42] text-[#2563EB] dark:text-[#2563EB] text-xs font-semibold border border-[#DCE5EA] dark:border-[#2A3B50]">
              <Building className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#2563EB]" />
              <span>
                {language === 'kn'
                  ? 'ಶಾಲಾ ಆಡಳಿತ ಮತ್ತು ಮೌಲ್ಯಮಾಪನ ವ್ಯವಸ್ಥೆ'
                  : 'School Administration & CCE ERP'}
              </span>
            </div>

            {/* Prominent School Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#243449] dark:text-[#F1F5F9] leading-tight">
              {getSchoolName(currentSchool, language)}
            </h1>

            {/* Creative Metadata Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50]">
                <GraduationCap className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
                <span className="font-semibold text-[#243449] dark:text-[#F1F5F9]">{t.dashboard.headmaster}:</span>
                <span>{getHMName(currentSchool, language)}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50]">
                <Phone className="w-4 h-4 text-[#3977A8] dark:text-[#4B8DC2]" />
                <span className="font-semibold text-[#243449] dark:text-[#F1F5F9]">{t.dashboard.phone}:</span>
                <span className="font-mono">{currentSchool?.hm_phone || '9845123456'}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50]">
                <School className="w-4 h-4 text-[#2563EB]" />
                <span>
                  {getLocationName(currentSchool?.taluk, language, currentSchool?.taluk_kannada)}, {getLocationName(currentSchool?.district, language, currentSchool?.district_kannada)}
                </span>
              </div>
            </div>
          </div>

          {/* Prominent UDISE & Academic Year */}
          <div className="flex flex-col sm:items-end gap-1.5 bg-[#EAF0F6] dark:bg-[#1E2B3C] p-4 rounded-xl border border-[#D8E1EA] dark:border-[#2A3B50] self-start md:self-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              {t.dashboard.udise}
            </span>
            <div className="text-2xl font-mono font-bold text-[#243449] dark:text-[#F1F5F9]">
              {currentSchool?.udise || '29260100102'}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#16284F] text-white text-xs font-semibold">
              <span>{language === 'kn' ? 'ಶೈಕ್ಷಣಿಕ ವರ್ಷ:' : 'Academic Year:'}</span>
              <span>{academicYear}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATISTIC CARDS: Total Students, Total Boys, Total Girls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Students */}
        <div className="rounded-xl bg-white dark:bg-[#1A2636] p-5 border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              {t.dashboard.totalStudents}
            </span>
            <div className="p-2 rounded-lg bg-[#E3EBF3] dark:bg-[#202F42] text-[#16284F] dark:text-[#2563EB]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#243449] dark:text-[#F1F5F9]">
              {totalStudents}
            </span>
            <span className="text-xs font-semibold text-[#2563EB] flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {academicYear}
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-[#EAF0F6] dark:bg-[#1E2B3C] overflow-hidden flex">
            <div
              className="bg-[#3977A8] h-full"
              style={{ width: `${totalStudents > 0 ? (totalBoys / totalStudents) * 100 : 50}%` }}
              title={`Boys: ${totalBoys}`}
            />
            <div
              className="bg-[#2563EB] h-full"
              style={{ width: `${totalStudents > 0 ? (totalGirls / totalStudents) * 100 : 50}%` }}
              title={`Girls: ${totalGirls}`}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            <span>{language === 'kn' ? 'ಬಾಲಕರು:' : 'Boys:'} {totalBoys}</span>
            <span>{language === 'kn' ? 'ಬಾಲಕಿಯರು:' : 'Girls:'} {totalGirls}</span>
          </div>
        </div>

        {/* Total Boys */}
        <div className="rounded-xl bg-white dark:bg-[#1A2636] p-5 border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              {t.dashboard.totalBoys}
            </span>
            <div className="p-2 rounded-lg bg-[#EAF0F6] dark:bg-[#1E2B3C] text-[#3977A8] dark:text-[#4B8DC2]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#243449] dark:text-[#F1F5F9]">
              {totalBoys}
            </span>
            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              ({totalStudents > 0 ? Math.round((totalBoys / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
            {language === 'kn' ? 'ತರಗತಿ 1 ರಿಂದ 10 ರವರೆಗೆ ದಾಖಲಾದ ಬಾಲಕರು' : 'Enrolled boys across Classes 1 to 10'}
          </p>
        </div>

        {/* Total Girls */}
        <div className="rounded-xl bg-white dark:bg-[#1A2636] p-5 border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              {t.dashboard.totalGirls}
            </span>
            <div className="p-2 rounded-lg bg-[#E3EBF3] dark:bg-[#202F42] text-[#2563EB]">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#243449] dark:text-[#F1F5F9]">
              {totalGirls}
            </span>
            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              ({totalStudents > 0 ? Math.round((totalGirls / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
            {language === 'kn' ? 'ತರಗತಿ 1 ರಿಂದ 10 ರವರೆಗೆ ದಾಖಲಾದ ಬಾಲಕಿಯರು' : 'Enrolled girls across Classes 1 to 10'}
          </p>
        </div>
      </div>

      {/* 3. QUICK ACTIONS: Solid Clean Cards (No gradients) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/marks"
          className="p-4 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white shadow-sm transition-colors flex flex-col justify-between"
        >
          <ClipboardList className="w-5 h-5 text-white/80 mb-3" />
          <div>
            <div className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
              {language === 'kn' ? 'ಸಿಸಿಇ ಮಾಡ್ಯೂಲ್' : 'CCE Module'}
            </div>
            <div className="text-sm font-bold mt-0.5">{t.dashboard.enterMarks}</div>
          </div>
        </Link>

        {userRole !== 'FACULTY' ? (
          <Link
            href="/students"
            className="p-4 rounded-xl bg-[#3977A8] hover:bg-[#2F648E] text-white shadow-sm transition-colors flex flex-col justify-between"
          >
            <UserPlus className="w-5 h-5 text-blue-200 mb-3" />
            <div>
              <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider">
                {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಮಾಹಿತಿ' : 'Student Registry'}
              </div>
              <div className="text-sm font-bold mt-0.5">{t.dashboard.addStudent}</div>
            </div>
          </Link>
        ) : (
          <Link
            href="/students"
            className="p-4 rounded-xl bg-[#3977A8] hover:bg-[#2F648E] text-white shadow-sm transition-colors flex flex-col justify-between"
          >
            <Users className="w-5 h-5 text-blue-200 mb-3" />
            <div>
              <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider">
                {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಮಾಹಿತಿ' : 'Student Registry'}
              </div>
              <div className="text-sm font-bold mt-0.5">
                {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಗಳ ವಿವರ' : 'View Students'}
              </div>
            </div>
          </Link>
        )}

        <Link
          href="/reports"
          className="p-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm transition-colors flex flex-col justify-between"
        >
          <FileSpreadsheet className="w-5 h-5 text-white/80 mb-3" />
          <div>
            <div className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
              {language === 'kn' ? 'ವರದಿಗಳು' : 'Reports'}
            </div>
            <div className="text-sm font-bold mt-0.5">{t.dashboard.viewReports}</div>
          </div>
        </Link>

        <Link
          href="/records"
          className="p-4 rounded-xl bg-[#E28A45] hover:bg-[#CF7835] text-white shadow-sm transition-colors flex flex-col justify-between"
        >
          <FileText className="w-5 h-5 text-amber-100 mb-3" />
          <div>
            <div className="text-[11px] font-semibold text-amber-100 uppercase tracking-wider">
              {language === 'kn' ? 'ದಾಖಲೆಗಳು' : 'Certificates'}
            </div>
            <div className="text-sm font-bold mt-0.5">{t.dashboard.issueTc}</div>
          </div>
        </Link>
      </div>

      {/* 4. STATISTICS TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Class-wise Student Statistics */}
        <div className="rounded-xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#D8E1EA] dark:border-[#2A3B50] flex items-center justify-between bg-[#F3F6F9] dark:bg-[#1E2B3C]">
            <div>
              <h2 className="text-sm font-bold text-[#243449] dark:text-[#F1F5F9] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
                {t.dashboard.classWiseStats}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                {language === 'kn'
                  ? 'ತರಗತಿ 1 ರಿಂದ 10 ರವರೆಗಿನ ದಾಖಲಾತಿ ವಿವರ'
                  : 'Classes 1 through 10 enrolment breakdown'}
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#E3EBF3] text-[#16284F] dark:bg-[#202F42] dark:text-[#2563EB] text-xs font-semibold">
              {totalStudents} {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಗಳು' : 'Students'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDF2F7] dark:bg-[#1E2B3C] text-[#243449] dark:text-[#F1F5F9] uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">{t.dashboard.class}</th>
                  <th className="py-2.5 px-4 text-center">{t.dashboard.boys}</th>
                  <th className="py-2.5 px-4 text-center">{t.dashboard.girls}</th>
                  <th className="py-2.5 px-4 text-right">{t.dashboard.total}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E1EA] dark:divide-[#2A3B50]">
                {classStats.map((row) => (
                  <tr
                    key={row.classNumber}
                    className="hover:bg-[#EAF0F6]/50 dark:hover:bg-[#1E2B3C]/50 transition-colors"
                  >
                    <td className="py-2 px-4 font-semibold text-[#243449] dark:text-[#F1F5F9]">
                      {language === 'kn' ? `ತರಗತಿ ${row.classNumber}` : `Class ${row.classNumber}`}
                    </td>
                    <td className="py-2 px-4 text-center text-[#3977A8] dark:text-[#4B8DC2] font-medium">
                      {row.boys}
                    </td>
                    <td className="py-2 px-4 text-center text-[#2563EB] font-medium">
                      {row.girls}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-[#243449] dark:text-[#F1F5F9]">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#EDF2F7] dark:bg-[#1E2B3C] font-bold text-[#243449] dark:text-[#F1F5F9] border-t border-[#D8E1EA] dark:border-[#2A3B50]">
                <tr>
                  <td className="py-2.5 px-4">{t.dashboard.total}</td>
                  <td className="py-2.5 px-4 text-center text-[#3977A8] dark:text-[#4B8DC2]">{totalBoys}</td>
                  <td className="py-2.5 px-4 text-center text-[#2563EB]">{totalGirls}</td>
                  <td className="py-2.5 px-4 text-right">{totalStudents}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Table 2: Class-wise Category Statistics */}
        <div className="rounded-xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#D8E1EA] dark:border-[#2A3B50] flex items-center justify-between bg-[#F3F6F9] dark:bg-[#1E2B3C]">
            <div>
              <h2 className="text-sm font-bold text-[#243449] dark:text-[#F1F5F9] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#3977A8] dark:text-[#4B8DC2]" />
                {t.dashboard.categoryStats}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                {language === 'kn'
                  ? 'ಸಾಮಾಜಿಕ ವರ್ಗವಾರು ವಿವರ: SC, ST, OBC, GM'
                  : 'Social category representation: SC, ST, OBC, GM'}
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#E3EBF3] text-[#3977A8] dark:bg-[#202F42] dark:text-[#4B8DC2] text-xs font-semibold">
              4 {language === 'kn' ? 'ವರ್ಗಗಳು' : 'Categories'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDF2F7] dark:bg-[#1E2B3C] text-[#243449] dark:text-[#F1F5F9] uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">{t.dashboard.class}</th>
                  <th className="py-2.5 px-3 text-center">{t.dashboard.sc}</th>
                  <th className="py-2.5 px-3 text-center">{t.dashboard.st}</th>
                  <th className="py-2.5 px-3 text-center">{t.dashboard.obc}</th>
                  <th className="py-2.5 px-3 text-center">{t.dashboard.gm}</th>
                  <th className="py-2.5 px-4 text-right">{t.dashboard.total}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E1EA] dark:divide-[#2A3B50]">
                {categoryStats.map((row) => (
                  <tr
                    key={row.classNumber}
                    className="hover:bg-[#EAF0F6]/50 dark:hover:bg-[#1E2B3C]/50 transition-colors"
                  >
                    <td className="py-2 px-4 font-semibold text-[#243449] dark:text-[#F1F5F9]">
                      {language === 'kn' ? `ತರಗತಿ ${row.classNumber}` : `Class ${row.classNumber}`}
                    </td>
                    <td className="py-2 px-3 text-center font-medium text-[#243449] dark:text-[#F1F5F9]">
                      {row.sc}
                    </td>
                    <td className="py-2 px-3 text-center font-medium text-[#243449] dark:text-[#F1F5F9]">
                      {row.st}
                    </td>
                    <td className="py-2 px-3 text-center font-medium text-[#243449] dark:text-[#F1F5F9]">
                      {row.obc}
                    </td>
                    <td className="py-2 px-3 text-center font-medium text-[#243449] dark:text-[#F1F5F9]">
                      {row.gm}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-[#243449] dark:text-[#F1F5F9]">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#EDF2F7] dark:bg-[#1E2B3C] font-bold text-[#243449] dark:text-[#F1F5F9] border-t border-[#D8E1EA] dark:border-[#2A3B50]">
                <tr>
                  <td className="py-2.5 px-4">{t.dashboard.total}</td>
                  <td className="py-2.5 px-3 text-center">{totalSC}</td>
                  <td className="py-2.5 px-3 text-center">{totalST}</td>
                  <td className="py-2.5 px-3 text-center">{totalOBC}</td>
                  <td className="py-2.5 px-3 text-center">{totalGM}</td>
                  <td className="py-2.5 px-4 text-right">{totalStudents}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
