'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  GraduationCap,
  UserCheck,
  Lock,
  Mail,
  School,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Phone,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { UserRole } from '@/lib/types';
import { erpLocalDB } from '@/lib/db/indexedDB';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/db/supabaseClient';
import { validatePassword, validatePhone, validateEmail } from '@/lib/utils/validators';

export default function LoginPortal() {
  const router = useRouter();
  const { switchRole, loginWithSupabase, signUpWithSupabase, resetPassword } = useAuth();
  const { language } = useLanguage();

  // Active tab: SIGN_IN | REGISTER | PERSONAS | FORGOT_PASSWORD
  const [activeTab, setActiveTab] = useState<'SIGN_IN' | 'REGISTER' | 'FORGOT_PASSWORD'>('SIGN_IN');

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up state (Only for School Admin / HM onboarding)
  const [signUpName, setSignUpName] = useState('');
  const [signUpNameKannada, setSignUpNameKannada] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpSchoolName, setSignUpSchoolName] = useState('');
  const [signUpSchoolNameKannada, setSignUpSchoolNameKannada] = useState('');
  const [signUpSchoolDescription, setSignUpSchoolDescription] = useState('');
  const [signUpSchoolDescriptionKannada, setSignUpSchoolDescriptionKannada] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpDesignation, setSignUpDesignation] = useState('Headmaster / Principal');
  const [signUpDesignationKannada, setSignUpDesignationKannada] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');

  // Status & feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signInEmail || !signInPassword) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    const res = await loginWithSupabase(signInEmail, signInPassword);
    setLoading(false);

    if (res.success) {
      const state = await erpLocalDB.loadState();
      const user = state.users.find(
        (u) => u.email && u.email.toLowerCase() === signInEmail.trim().toLowerCase()
      );
      if (user?.role === 'PLATFORM_ADMIN') {
        router.replace('/platform-admin');
      } else {
        router.replace('/dashboard');
      }
    } else {
      let msg = res.error || 'Invalid credentials or user does not exist.';
      if (msg.toLowerCase().includes('email not confirmed')) {
        msg =
          'Email not confirmed. Please check your confirmation email or ask an administrator to confirm your access.';
      }
      setErrorMsg(msg);
    }
  };

  // Sign Up Handler (Restricted strictly to School Admin / HM)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (
      !signUpName.trim() ||
      !signUpNameKannada.trim() ||
      !signUpSchoolName.trim() ||
      !signUpSchoolNameKannada.trim() ||
      !signUpDesignationKannada.trim() ||
      !signUpEmail.trim() ||
      !signUpPassword
    ) {
      setErrorMsg('Please enter the headmaster and school names in both English and Kannada, along with email and password.');
      return;
    }

    const emailValidation = validateEmail(signUpEmail);
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.error || 'Please enter a valid official email address.');
      return;
    }

    const phoneValidation = validatePhone(signUpPhone);
    if (!phoneValidation.isValid) {
      setErrorMsg(phoneValidation.error || 'Phone number must have exactly 10 digits.');
      return;
    }

    if (!signUpSchoolName.trim()) {
      setErrorMsg('Please enter your Assigned Institution / School name.');
      return;
    }
    if (Boolean(signUpSchoolDescription.trim()) !== Boolean(signUpSchoolDescriptionKannada.trim())) {
      setErrorMsg('Enter the school description in both English and Kannada, or leave both blank.');
      return;
    }

    const passwordValidation = validatePassword(signUpPassword);
    if (!passwordValidation.isValid) {
      setErrorMsg(passwordValidation.error || 'Password does not meet security requirements.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    // Always create new school record with PENDING_APPROVAL status
    const state = await erpLocalDB.loadState();
    const newSchoolId = `sch_${Date.now()}`;
    const newSchool = {
      id: newSchoolId,
      udise: `29${Math.floor(100000000 + Math.random() * 900000000)}`,
      name: signUpSchoolName.trim(),
      name_kannada: signUpSchoolNameKannada.trim(),
      hm_name: signUpName.trim(),
      hm_name_kannada: signUpNameKannada.trim(),
      hm_phone: signUpPhone.trim() || '9845000000',
      email: signUpEmail.trim(),
      taluk: 'Karnataka',
      district: 'Karnataka',
      state: 'Karnataka',
      description: signUpSchoolDescription.trim(),
      description_kannada: signUpSchoolDescriptionKannada.trim(),
      status: 'PENDING_APPROVAL' as const,
      current_academic_year: '2026-27',
      registration_date: new Date().toISOString().split('T')[0],
      expiry_date: '2027-05-31',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.schools.push(newSchool);
    await erpLocalDB.persistState(state);
    const schoolId = newSchoolId;

    // Also persist to Supabase schools table if online
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        await client.from('schools').upsert(newSchool);
      } catch {}
    }

    const res = await signUpWithSupabase(signUpEmail, signUpPassword, {
      name: signUpName.trim(),
      name_kannada: signUpNameKannada.trim(),
      role: 'SCHOOL_ADMIN',
      school_id: schoolId,
      phone: signUpPhone.trim() || '9845000000',
      designation: signUpDesignation.trim() || 'Headmaster',
      designation_kannada: signUpDesignationKannada.trim(),
      isPendingSchool: true,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg(
        'School registration submitted successfully! Your application is now PENDING review and approval by the Platform Admin. Once approved, you can sign in with your credentials.'
      );
      setActiveTab('SIGN_IN');
      setSignInEmail(signUpEmail);
    } else {
      setErrorMsg(res.error || 'Failed to submit school registration.');
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetEmail) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(resetEmail);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(
        'Password reset link dispatched! Please check your email inbox to choose a new password.'
      );
    } else {
      setErrorMsg(res.error || 'Unable to send password reset email.');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#EAF0F6] dark:bg-[#111A24] text-[#243449] dark:text-[#F1F5F9]">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1A2636] rounded-3xl shadow-2xl border border-[#D8E1EA] dark:border-[#2A3B50] overflow-hidden transition-all">
        {/* Top Header */}
        <div className="p-6 sm:p-8 bg-[#16284F] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Government of Karnataka • CCE ERP
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Shikshaka Sathi Authentication</h1>
              <p className="text-xs text-white/80">
                Role-Based Access Control & School Management Platform
              </p>
            </div>
          </div>

          {/* Navigation Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto bg-black/25 p-1.5 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('SIGN_IN');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'SIGN_IN'
                  ? 'bg-white text-[#16284F] font-bold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('REGISTER');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'REGISTER'
                  ? 'bg-white text-[#16284F] font-bold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              Register School
            </button>

          </div>
        </div>

        {/* Global Feedback Banner */}
        {errorMsg && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-start gap-3 text-xs leading-relaxed">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {activeTab === 'SIGN_IN' && (
          <div className="p-6 sm:p-8 max-w-md mx-auto space-y-5 text-xs">
            <div className="text-center mb-4">
              <h2 className="text-base font-bold text-[#243449] dark:text-[#F1F5F9]">
                Sign In to Shikshaka Sathi
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                Enter your department email and password
              </p>
            </div>

            {/* Note for Teachers */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
              <GraduationCap className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5" />
              <div>
                <strong>Are you a Teaching Faculty?</strong>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-0.5">
                  Teachers receive a personal activation link from their Headmaster to set their password. Once activated, enter your credentials below to log in.
                </p>
                <a
                  href="/activate"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline mt-1.5 cursor-pointer"
                >
                  Have an activation code? Activate Teacher Account →
                </a>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none focus:border-[#16284F]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#243449] dark:text-[#F1F5F9]">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('FORGOT_PASSWORD');
                      setResetEmail(signInEmail);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] text-[#3977A8] dark:text-[#4B8DC2] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[#243449] dark:text-[#F1F5F9] outline-none focus:border-[#16284F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-3 border-t border-[#D8E1EA] dark:border-[#2A3B50] space-y-1">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Headmaster onboarding a new school? </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('REGISTER');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[#3977A8] dark:text-[#4B8DC2] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                Register School <UserPlus className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER SCHOOL ADMIN (TEACHERS CANNOT SELF-REGISTER) */}
        {activeTab === 'REGISTER' && (
          <form onSubmit={handleSignUp} className="p-6 sm:p-8 space-y-5 text-xs">
            <div className="text-center max-w-lg mx-auto mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold text-[11px] mb-2">
                <School className="w-3.5 h-3.5" />
                Register School & Headmaster Access
              </div>
              <h2 className="text-base font-bold text-[#243449] dark:text-[#F1F5F9]">
                Register School & Headmaster Access
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                New school registrations require Karnataka Platform Admin review and approval. Teachers are onboarded directly by their Headmaster after approval.
              </p>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Headmaster Full Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Headmaster Full Name (Kannada) *
                </label>
                <input
                  type="text"
                  required
                  lang="kn"
                  value={signUpNameKannada}
                  onChange={(e) => setSignUpNameKannada(e.target.value)}
                  placeholder="ಹೆಸರು"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Official Email Address (School or Headmaster)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                  />
                </div>
              </div>

              {/* Assigned Institution / School */}
              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Assigned Institution / School (English) *
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={signUpSchoolName}
                    onChange={(e) => setSignUpSchoolName(e.target.value)}
                    placeholder="School name"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Assigned Institution / School (Kannada) *
                </label>
                <input
                  type="text"
                  required
                  lang="kn"
                  value={signUpSchoolNameKannada}
                  onChange={(e) => setSignUpSchoolNameKannada(e.target.value)}
                  placeholder="ಶಾಲೆಯ ಹೆಸರು"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  School Description (English)
                </label>
                <textarea
                  rows={2}
                  value={signUpSchoolDescription}
                  onChange={(e) => setSignUpSchoolDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  School Description (Kannada)
                </label>
                <textarea
                  lang="kn"
                  rows={2}
                  value={signUpSchoolDescriptionKannada}
                  onChange={(e) => setSignUpSchoolDescriptionKannada(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Designation (English)
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={signUpDesignation}
                    onChange={(e) => setSignUpDesignation(e.target.value)}
                    placeholder="Designation"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Designation (Kannada) *
                </label>
                <input
                  type="text"
                  required
                  lang="kn"
                  value={signUpDesignationKannada}
                  onChange={(e) => setSignUpDesignationKannada(e.target.value)}
                  placeholder="ಹುದ್ದೆ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Contact Phone Number (School or Headmaster)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                  Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[#243449] dark:text-[#F1F5F9] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-mono text-[#243449] dark:text-[#F1F5F9] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Registering School & HM Access...</span>
                ) : (
                  <>
                    <School className="w-4 h-4" />
                    <span>Register School & HM Access</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2 text-[#64748B] dark:text-[#94A3B8]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('SIGN_IN');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[#3977A8] dark:text-[#4B8DC2] font-bold hover:underline cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: FORGOT PASSWORD */}
        {activeTab === 'FORGOT_PASSWORD' && (
          <form onSubmit={handleForgotPassword} className="p-6 sm:p-8 max-w-md mx-auto space-y-4 text-xs">
            <div className="text-center mb-6">
              <h2 className="text-base font-bold text-[#243449] dark:text-[#F1F5F9]">
                Reset Password
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                Enter your registered email to receive a password reset link
              </p>
            </div>

            <div>
              <label className="font-bold text-[#243449] dark:text-[#F1F5F9] block mb-1">
                Your Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F3F6F9] dark:bg-[#1E2B3C] border border-[#D8E1EA] dark:border-[#2A3B50] font-semibold text-[#243449] dark:text-[#F1F5F9] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 mt-3"
            >
              {loading ? 'Sending Reset Email...' : 'Send Password Reset Link'}
            </button>

            <div className="text-center pt-3 border-t border-[#D8E1EA] dark:border-[#2A3B50]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('SIGN_IN');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[#3977A8] dark:text-[#4B8DC2] font-bold hover:underline cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 sm:px-8 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-[#D8E1EA] dark:border-[#2A3B50] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cloud Database: Connected & Operational</span>
          </div>
          <div>Offline-First Architecture: Local operations sync securely when online</div>
        </div>
      </div>
    </div>
  );
}
