'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/lib/context/AuthContext';
import { AppStateProvider } from '@/lib/context/AppStateContext';
import { LanguageProvider } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Clock, ShieldAlert, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import LoginPortal from '@/components/auth/LoginPortal';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

function InnerShell({ children }: { children: React.ReactNode }) {
  const { currentUser, currentSchool, switchRole, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) caches.delete(name);
        });
      }
    }
  }, []);

  const isPublicRoute =
    pathname?.startsWith('/activate') ||
    pathname === '/terms' ||
    pathname === '/privacy';

  if (mounted && !currentUser) {
    if (isPublicRoute) {
      return <>{children}</>;
    }
    return <LoginPortal />;
  }

  // Revoked School & Faculty Guard: If school access is revoked, immediately block faculty and school admin
  if (mounted && currentUser && currentUser.role !== 'PLATFORM_ADMIN' && (currentSchool?.status === 'REVOKED' || currentUser.status === 'REVOKED')) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] dark:bg-[#0B131E] flex flex-col items-center justify-center p-4 sm:p-6 text-[#243449] dark:text-[#F1F5F9] font-sans">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-rose-300 dark:border-rose-900/80 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-rose-600 to-red-600 px-6 py-6 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight">School Access Revoked</h1>
            <p className="text-xs text-rose-100 mt-1 font-medium">
              Karnataka School Education Department — CCE Shikshaka Sathi Portal
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2.5 text-xs">
              <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                {currentSchool?.name || 'Institution Access Suspended'}
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Access for this institution and all associated faculty accounts has been revoked or expired by the Platform Administrator.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => logout()}
                className="py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unapproved School Guard View: If logged into a school awaiting Master Admin approval
  if (mounted && currentUser && currentUser.role !== 'PLATFORM_ADMIN' && currentSchool?.status === 'PENDING_APPROVAL') {
    return (
      <div className="min-h-screen bg-[#F4F7FA] dark:bg-[#0B131E] flex flex-col items-center justify-center p-4 sm:p-6 text-[#243449] dark:text-[#F1F5F9] font-sans">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-300 dark:border-amber-800/80 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-6 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Clock className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-xl font-black tracking-tight">Institution Registration Pending Approval</h1>
            <p className="text-xs text-amber-100 mt-1 font-medium">
              Karnataka School Education Department — CCE Shikshaka Sathi Portal
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {currentSchool.name}
                  </div>
                  {currentSchool.name_kannada && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {currentSchool.name_kannada}
                    </div>
                  )}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 uppercase tracking-wider shrink-0">
                  Pending Approval
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-slate-600 dark:text-slate-400">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">UDISE:</span>{' '}
                  <span className="font-mono font-bold text-[#16284F] dark:text-[#5B9BD5]">{currentSchool.udise}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Taluk / District:</span>{' '}
                  {currentSchool.taluk}, {currentSchool.district}
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Head Master:</span>{' '}
                  {currentSchool.hm_name} ({currentSchool.hm_phone})
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Academic Year:</span>{' '}
                  {currentSchool.current_academic_year}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Your application and school data have been submitted successfully to the state registry.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Access to Marks Entry, Transfer Certificates, and Student Records will be enabled immediately upon Master Admin approval.</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => switchRole('PLATFORM_ADMIN')}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                Switch to Platform Admin to Approve
              </button>
              <button
                onClick={() => logout()}
                className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF0F6] dark:bg-[#111A24] text-[#243449] dark:text-[#F1F5F9] flex flex-col font-sans transition-colors">
      <AppSidebar isOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        <footer className="py-4 px-6 border-t border-[#D8E1EA] dark:border-[#2A3B50] bg-white/40 dark:bg-[#16212E]/40 text-center text-xs text-[#8492A6] no-print">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="font-semibold text-[#64748B] dark:text-[#94A3B8]">© 2026-27 Shikshaka Sathi</span>
            <span>•</span>
            <a href="/privacy" className="hover:text-[#3977A8] dark:hover:text-[#4B8DC2] transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-[#3977A8] dark:hover:text-[#4B8DC2] transition-colors">
              Terms and Conditions
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppStateProvider>
          <InnerShell>{children}</InnerShell>
        </AppStateProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
