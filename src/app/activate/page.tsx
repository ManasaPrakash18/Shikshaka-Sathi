'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  School,
  UserCheck,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { erpLocalDB } from '@/lib/db/indexedDB';
import { User, School as SchoolType } from '@/lib/types';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/db/supabaseClient';
import { validatePassword } from '@/lib/utils/validators';

function TeacherActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUpWithSupabase, loginWithSupabase, switchRole } = useAuth();

  const tokenParam = searchParams.get('token') || '';
  const userIdParam = searchParams.get('user') || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchingManual, setSearchingManual] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [teacher, setTeacher] = useState<User | null>(null);
  const [school, setSchool] = useState<SchoolType | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);

  // Helper to lookup user by code, email, id, or phone
  const lookupFaculty = async (query: string) => {
    const clean = query.trim();
    if (!clean) {
      setErrorMsg('Please enter your activation code or registered faculty email.');
      return;
    }

    setSearchingManual(true);
    setErrorMsg('');

    try {
      const state = await erpLocalDB.loadState();
      let targetUser = state.users.find(
        (u) =>
          (u.activation_token && u.activation_token.toLowerCase() === clean.toLowerCase()) ||
          (u.email && u.email.toLowerCase() === clean.toLowerCase()) ||
          u.id === clean ||
          u.phone === clean
      );

      // Cloud lookup fallback
      if (!targetUser && isSupabaseConfigured()) {
        const client = getSupabaseClient();
        const { data } = await client
          .from('users')
          .select('*')
          .or(`activation_token.eq.${clean},email.ilike.${clean},id.eq.${clean},phone.eq.${clean}`)
          .limit(1)
          .maybeSingle();
        if (data) {
          targetUser = data as User;
        }
      }

      if (!targetUser) {
        setIsTokenInvalid(true);
        setErrorMsg('No faculty record found matching this code or email. Please verify with your Headmaster.');
        setSearchingManual(false);
        return;
      }

      // Check token expiry if set
      if (targetUser.token_expiry) {
        const expiryTime = new Date(targetUser.token_expiry).getTime();
        if (Date.now() > expiryTime) {
          setIsTokenInvalid(true);
          setErrorMsg('This activation link has expired. Please request a new activation code from your Headmaster.');
          setSearchingManual(false);
          return;
        }
      }

      setTeacher(targetUser);

      // Find school info
      const targetSchool = state.schools.find((s) => s.id === targetUser?.school_id);
      if (targetSchool) {
        setSchool(targetSchool);
      }

      setIsTokenInvalid(false);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(`Lookup failed: ${err?.message || 'Please retry'}`);
    } finally {
      setSearchingManual(false);
      setLoading(false);
    }
  };

  // Validate activation link from URL parameters
  useEffect(() => {
    async function loadTeacherData() {
      if (!tokenParam && !userIdParam) {
        setIsTokenInvalid(true);
        setErrorMsg('');
        setLoading(false);
        return;
      }

      try {
        const state = await erpLocalDB.loadState();
        let targetUser = state.users.find(
          (u) =>
            (userIdParam && u.id === userIdParam) ||
            (tokenParam && u.activation_token === tokenParam)
        );

        // Fallback: check Supabase Cloud directly if not found locally
        if (!targetUser && isSupabaseConfigured()) {
          const client = getSupabaseClient();
          const { data } = await client
            .from('users')
            .select('*')
            .or(`id.eq.${userIdParam || 'none'},activation_token.eq.${tokenParam || 'none'}`)
            .limit(1)
            .maybeSingle();
          if (data) {
            targetUser = data as User;
          }
        }

        if (!targetUser) {
          setIsTokenInvalid(true);
          setErrorMsg('No faculty record found matching this link. You can enter your activation code below.');
          setLoading(false);
          return;
        }

        // Check token expiry if set
        if (targetUser.token_expiry) {
          const expiryTime = new Date(targetUser.token_expiry).getTime();
          if (Date.now() > expiryTime) {
            setIsTokenInvalid(true);
            setErrorMsg('This activation link has expired. Please request a new activation link or code from your Headmaster.');
            setLoading(false);
            return;
          }
        }

        setTeacher(targetUser);

        // Find school info
        const targetSchool = state.schools.find((s) => s.id === targetUser?.school_id);
        if (targetSchool) {
          setSchool(targetSchool);
        }

        setLoading(false);
      } catch (err: any) {
        setIsTokenInvalid(true);
        setErrorMsg(`Error loading invitation details: ${err?.message || 'Please retry'}`);
        setLoading(false);
      }
    }

    loadTeacherData();
  }, [tokenParam, userIdParam]);

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!teacher) return;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrorMsg(passwordValidation.error || 'Password does not meet security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const email = teacher.email || `${teacher.name.toLowerCase().replace(/\s+/g, '.')}@ghs.gov.in`;

      let authConnected = false;
      const res = await signUpWithSupabase(email, password, {
        name: teacher.name,
        role: teacher.role || 'FACULTY',
        school_id: teacher.school_id,
        phone: teacher.phone,
        designation: teacher.designation || 'Teacher',
      });

      if (res.success) {
        authConnected = true;
      } else {
        // Try sign-in in case user already existed in Supabase Auth
        const loginRes = await loginWithSupabase(email, password);
        if (loginRes.success) {
          authConnected = true;
        }
      }

      // 2. Mark activation token as consumed in local state
      const state = await erpLocalDB.loadState();
      const userIndex = state.users.findIndex((u) => u.id === teacher.id);
      if (userIndex !== -1) {
        state.users[userIndex] = {
          ...state.users[userIndex],
          status: 'ACTIVE',
          activation_token: undefined,
          token_expiry: undefined,
          updated_at: new Date().toISOString(),
        };
        await erpLocalDB.persistState(state);
      }

      // 3. Also update Supabase public.users table directly
      if (isSupabaseConfigured()) {
        try {
          const client = getSupabaseClient();
          await client.from('users').upsert({
            id: teacher.id,
            school_id: teacher.school_id || null,
            role: teacher.role || 'FACULTY',
            name: teacher.name,
            phone: teacher.phone,
            email: email,
            designation: teacher.designation || 'Teacher',
            status: 'ACTIVE',
            updated_at: new Date().toISOString(),
          });
        } catch {}
      }

      // 4. Log the teacher in immediately
      switchRole('FACULTY', teacher.school_id, teacher.id);

      setSuccessMsg('Account successfully activated! Logging in to your CCE dashboard...');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 700);
    } catch (err: any) {
      setErrorMsg(`Activation failed: ${err?.message || 'Please try again'}`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#EAF0F6] dark:bg-[#111A24]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#16284F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Validating teacher activation link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#EAF0F6] dark:bg-[#111A24] text-[#243449] dark:text-[#F1F5F9]">
      <div className="w-full max-w-lg bg-white dark:bg-[#1A2636] rounded-3xl shadow-2xl border border-[#D8E1EA] dark:border-[#2A3B50] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#16284F] text-white flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              Government of Karnataka • CCE ERP
            </div>
            <h1 className="text-lg sm:text-xl font-black">Teacher Account Activation</h1>
            <p className="text-xs text-white/80">
              Set your personal password to access CCE marks & evaluations
            </p>
          </div>
        </div>

        {/* Invalid Token or Manual Code Entry View */}
        {isTokenInvalid || !teacher ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-[#16284F] dark:text-[#2563EB]">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-[#243449] dark:text-[#F1F5F9]">
                Activate Teacher Account
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                Enter the Activation Code or registered department email provided by your Headmaster to set up your password.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                lookupFaculty(manualCode);
              }}
              className="space-y-4"
            >
              <div>
                <label className="font-bold text-xs text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Activation Code or Department Email
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. act_7k9x2m or faculty@school.edu.in"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-xs text-[#243449] dark:text-[#F1F5F9] outline-none focus:border-[#16284F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={searchingManual}
                className="w-full py-3 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {searchingManual ? (
                  <span>Locating Faculty Profile...</span>
                ) : (
                  <>
                    <span>Verify Code & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-[#D8E1EA] dark:border-[#2A3B50] text-center">
              <button
                type="button"
                onClick={() => router.replace('/login')}
                className="text-xs font-semibold text-[#3977A8] dark:text-[#4B8DC2] hover:underline cursor-pointer"
              >
                Return to Sign In Portal
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleActivateSubmit} className="p-6 sm:p-8 space-y-5 text-xs">
            {/* Teacher & School Summary Card */}
            <div className="p-4 rounded-2xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#16284F] dark:text-[#2563EB]">
                <UserCheck className="w-4 h-4" />
                <span>Verified Faculty Profile</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block">Faculty Name:</span>
                  <strong className="text-sm font-bold text-[#243449] dark:text-[#F1F5F9]">
                    {teacher?.name}
                  </strong>
                </div>
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block">Designation:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {teacher?.designation || 'Teacher'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[#64748B] dark:text-[#94A3B8] block">Assigned Institution:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {school?.name || teacher?.school_id}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[#64748B] dark:text-[#94A3B8] block">Department Email:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {teacher?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Set Password Fields */}
            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                Create Your Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[#243449] dark:text-[#F1F5F9] outline-none focus:border-[#16284F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[#243449] dark:text-[#F1F5F9] outline-none focus:border-[#16284F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <span>Setting password & activating...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Set Password & Activate Portal Access</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function TeacherActivationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#EAF0F6]">
          <div className="text-xs text-slate-600">Loading activation portal...</div>
        </div>
      }
    >
      <TeacherActivationContent />
    </Suspense>
  );
}
