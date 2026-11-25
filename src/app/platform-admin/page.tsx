'use client';

import React, { useState } from 'react';
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  ShieldCheck,
  Search,
  Filter,
  Check,
  RotateCcw,
  Calendar,
  Phone,
  GraduationCap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppState, calculateAcademicYearExpiry } from '@/lib/context/AppStateContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { School, SchoolStatus } from '@/lib/types';
import { validatePhone } from '@/lib/utils/validators';
import { getHMName, getLocationName, getSchoolName } from '@/lib/utils/kannadaNames';

export default function PlatformAdminPage() {
  const router = useRouter();
  const { state, registerSchool, approveSchool, revokeSchoolAccess, reactivateSchoolAccess } = useAppState();
  const { academicYear, userRole, switchRole } = useAuth();
  const { t, language } = useLanguage();

  React.useEffect(() => {
    if (userRole && userRole !== 'PLATFORM_ADMIN') {
      router.replace('/dashboard');
    }
  }, [userRole, router]);

  if (userRole !== 'PLATFORM_ADMIN') {
    return (
      <div className="p-8 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 space-y-3">
        <h2 className="text-xl font-black">Redirecting to Dashboard...</h2>
        <p className="text-xs sm:text-sm">
          Platform Administration is strictly restricted to Directorate Platform Administrators. Redirecting you to your school dashboard.
        </p>
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REVOKED'>('ALL');

  // Modals
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    name_kannada: '',
    udise: '',
    hm_name: '',
    hm_name_kannada: '',
    hm_phone: '',
    taluk: 'Mysuru South',
    taluk_kannada: 'ಮೈಸೂರು ದಕ್ಷಿಣ',
    district: 'Mysuru',
    district_kannada: 'ಮೈಸೂರು',
    description: '',
    description_kannada: '',
  });

  const totalRegistered = state.schools.length;
  const activeSchools = state.schools.filter((s) => s.status === 'ACTIVE').length;
  const revokedSchools = state.schools.filter((s) => s.status === 'REVOKED').length;
  const pendingSchools = state.schools.filter((s) => s.status === 'PENDING_APPROVAL').length;

  // Filter helper guaranteeing search across English & Kannada names, UDISE, phone, taluk, district
  const matchesSearch = (s: School) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.name_kannada && s.name_kannada.toLowerCase().includes(q)) ||
      s.udise.includes(q) ||
      s.hm_name.toLowerCase().includes(q) ||
      s.hm_phone.includes(q) ||
      s.district.toLowerCase().includes(q) ||
      s.taluk.toLowerCase().includes(q)
    );
  };

  // Strictly segregated, mutually exclusive collections so schools NEVER collide
  const allSchoolsList = state.schools.filter(matchesSearch);
  const pendingSchoolsList = state.schools.filter((s) => s.status === 'PENDING_APPROVAL' && matchesSearch(s));
  const activeSchoolsList = state.schools.filter((s) => s.status === 'ACTIVE' && matchesSearch(s));
  const revokedSchoolsList = state.schools.filter((s) => s.status === 'REVOKED' && matchesSearch(s));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.name_kannada.trim() ||
      !formData.udise.trim() ||
      !formData.hm_name.trim() ||
      !formData.hm_name_kannada.trim() ||
      !formData.hm_phone.trim() ||
      !formData.district.trim() ||
      !formData.district_kannada.trim()
    ) {
      alert('Enter school and headmaster names and district in both English and Kannada, and fill in all required fields.');
      return;
    }
    if (Boolean(formData.description.trim()) !== Boolean(formData.description_kannada.trim())) {
      alert('Enter the school description in both English and Kannada, or leave both blank.');
      return;
    }

    const phoneVal = validatePhone(formData.hm_phone);
    if (!phoneVal.isValid) {
      alert(phoneVal.error || 'Headmaster phone number must have exactly 10 digits.');
      return;
    }

    await registerSchool({
      udise: formData.udise.trim(),
      name: formData.name.trim(),
      name_kannada: formData.name_kannada.trim(),
      hm_name: formData.hm_name.trim(),
      hm_name_kannada: formData.hm_name_kannada.trim(),
      hm_phone: formData.hm_phone.trim(),
      taluk: formData.taluk.trim(),
      taluk_kannada: formData.taluk_kannada.trim(),
      district: formData.district.trim(),
      district_kannada: formData.district_kannada.trim(),
      state: 'Karnataka',
      description: formData.description.trim(),
      description_kannada: formData.description_kannada.trim(),
      status: 'PENDING_APPROVAL',
      current_academic_year: academicYear,
      registration_date: new Date().toISOString().split('T')[0],
      expiry_date: calculateAcademicYearExpiry(academicYear),
    });

    setRegisterModalOpen(false);
    setFormData({
      name: '',
      name_kannada: '',
      udise: '',
      hm_name: '',
      hm_name_kannada: '',
      hm_phone: '',
      taluk: 'Mysuru South',
      taluk_kannada: 'ಮೈಸೂರು ದಕ್ಷಿಣ',
      district: 'Mysuru',
      district_kannada: 'ಮೈಸೂರು',
      description: '',
      description_kannada: '',
    });
    alert('School successfully registered with PENDING APPROVAL status!');
  };

  const handleApprove = async (schoolId: string) => {
    await approveSchool(schoolId, 'Platform Admin (H Prakash)');
    alert('School access APPROVED! School Admin can now log in.');
  };

  const handleRevokeConfirm = async () => {
    if (!selectedSchool) return;
    const finalReason = revokeReason.trim() || 'Payment cycle ended';
    await revokeSchoolAccess(selectedSchool.id, finalReason, 'Platform Admin');
    setRevokeModalOpen(false);
    setRevokeReason('');
    setSelectedSchool(null);
  };

  const handleReactivateConfirm = async () => {
    if (!selectedSchool) return;
    await reactivateSchoolAccess(selectedSchool.id, 'Platform Admin');
    setReactivateModalOpen(false);
    setSelectedSchool(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#16284F] dark:text-[#2563EB] font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Karnataka State Department Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t.platformAdmin.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.platformAdmin.subtitle}</p>
        </div>

        <button
          onClick={() => setRegisterModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t.platformAdmin.registerSchool}
        </button>
      </div>

      {/* Prominent Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <div 
          onClick={() => setActiveTab('ALL')}
          className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            activeTab === 'ALL'
              ? 'ring-2 ring-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.platformAdmin.totalRegistered}
            </span>
            <div className="p-2.5 rounded-xl bg-[#E3EBF3] dark:bg-slate-800 text-[#16284F] dark:text-[#2563EB]">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalRegistered}
          </div>
          <p className="mt-1 text-xs text-slate-500">Total registered institutions</p>
        </div>

        {/* Pending Approval Card */}
        <div 
          onClick={() => setActiveTab('PENDING')}
          className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            activeTab === 'PENDING'
              ? 'ring-2 ring-amber-500 bg-amber-50/80 dark:bg-amber-950/40 border-amber-400'
              : pendingSchools > 0 
                ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 hover:border-amber-500' 
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              Pending Approvals
            </span>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {pendingSchools}
            </span>
            {pendingSchools > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Click to view pending requests</p>
        </div>

        {/* Active Schools Card */}
        <div 
          onClick={() => setActiveTab('ACTIVE')}
          className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            activeTab === 'ACTIVE'
              ? 'ring-2 ring-[#16284F] bg-[#EBF3FC]/80 dark:bg-slate-800 border-[#16284F]'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-[#16284F]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.platformAdmin.activeSchools}
            </span>
            <div className="p-2.5 rounded-xl bg-[#EBF3FC]/60 dark:bg-slate-800 text-[#16284F] dark:text-[#2563EB]">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#16284F] dark:text-[#2563EB]">
            {activeSchools}
          </div>
          <p className="mt-1 text-xs text-slate-500">Approved active institutions</p>
        </div>

        {/* Revoked Schools Card */}
        <div 
          onClick={() => setActiveTab('REVOKED')}
          className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            activeTab === 'REVOKED'
              ? 'ring-2 ring-rose-500 bg-rose-50/80 dark:bg-rose-950/40 border-rose-400'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.platformAdmin.revokedSchools}
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {revokedSchools}
          </div>
          <p className="mt-1 text-xs text-slate-500">Access suspended or expired</p>
        </div>
      </div>

      {/* DISTINCT SECTION TABS & SEARCH (Strict Separation) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            All Registered Schools
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'ALL' ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200'
            }`}>
              {totalRegistered}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending Requests
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
            }`}>
              {pendingSchools}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-[#16284F] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approved Schools
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'ACTIVE' ? 'bg-[#0F1D3B] text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}>
              {activeSchools}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('REVOKED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'REVOKED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Revoked Schools
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'REVOKED' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
            }`}>
              {revokedSchools}
            </span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search school name, UDISE, HM phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-[#16284F] shadow-sm"
          />
        </div>
      </div>

            {/* SECTION 0: ALL REGISTERED SCHOOLS (Visible when activeTab === 'ALL') */}
      {activeTab === 'ALL' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-sm overflow-hidden animate-in fade-in">
          <div className="bg-gradient-to-r from-indigo-50/80 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 px-6 py-4 border-b border-indigo-200 dark:border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  All Registered Schools & Current Status
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Complete statewide roster displaying approval, active, and revoked states across Karnataka.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200">
              {allSchoolsList.length} Schools Total
            </span>
          </div>

          {allSchoolsList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Schools Found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">{t.platformAdmin.schoolName}</th>
                    <th className="py-3 px-3">{t.platformAdmin.udise}</th>
                    <th className="py-3 px-4">{t.platformAdmin.hmName}</th>
                    <th className="py-3 px-3">{t.platformAdmin.hmPhone}</th>
                    <th className="py-3 px-3">{t.platformAdmin.academicYear}</th>
                    <th className="py-3 px-3">Access Expiry</th>
                    <th className="py-3 px-3">Current Status</th>
                    <th className="py-3 px-4 text-right">{t.platformAdmin.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {allSchoolsList.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                        {getSchoolName(sch, language)}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {getLocationName(sch.taluk, language, sch.taluk_kannada)}, {getLocationName(sch.district, language, sch.district_kannada)}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-[#16284F] dark:text-[#5B9BD5]">
                        {sch.udise}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {getHMName(sch, language)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {sch.hm_phone}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {sch.current_academic_year}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {sch.expiry_date || '2027-04-30'}
                      </td>
                      <td className="py-3.5 px-3">
                        {sch.status === 'ACTIVE' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-300">
                            APPROVED / ACTIVE
                          </span>
                        )}
                        {sch.status === 'PENDING_APPROVAL' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-300">
                            PENDING APPROVAL
                          </span>
                        )}
                        {sch.status === 'REVOKED' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-300">
                            REVOKED / EXPIRED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sch.status === 'PENDING_APPROVAL' && (
                            <button
                              onClick={() => handleApprove(sch.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer shadow-sm transition-colors"
                              title="Approve this school"
                            >
                              Approve
                            </button>
                          )}
                          {sch.status === 'ACTIVE' && (
                            <button
                              onClick={() => {
                                setSelectedSchool(sch);
                                setRevokeModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-[11px] cursor-pointer transition-colors"
                              title="Revoke School Access"
                            >
                              Revoke
                            </button>
                          )}
                          {sch.status === 'REVOKED' && (
                            <button
                              onClick={() => {
                                setSelectedSchool(sch);
                                setReactivateModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold text-[11px] cursor-pointer transition-colors"
                              title="Reactivate School Access"
                            >
                              Reactivate
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedSchool(sch);
                              setViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

{/* SECTION 1: PENDING SCHOOL REQUESTS (Only visible when activeTab === 'PENDING') */}
      {activeTab === 'PENDING' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-800/80 shadow-md overflow-hidden animate-in fade-in">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 px-6 py-4 border-b border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Pending School Requests (Requires Approval)
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Institutions awaiting verification. Approving activates access through April 30 of the academic year.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
              {pendingSchoolsList.length} Requests
            </span>
          </div>

          {pendingSchoolsList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Pending Requests</p>
              <p className="text-xs text-slate-400 mt-1">All registered schools have been reviewed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/80 dark:bg-slate-800 text-amber-900 dark:text-amber-200 uppercase tracking-wider font-bold text-[10px] border-b border-amber-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">School Name & Location</th>
                    <th className="py-3 px-3">UDISE Code</th>
                    <th className="py-3 px-4">Head Master</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Registration Date</th>
                    <th className="py-3 px-3">Academic Year</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 dark:divide-slate-800">
                  {pendingSchoolsList.map((sch) => (
                    <tr key={sch.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {getSchoolName(sch, language)}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {getLocationName(sch.taluk, language, sch.taluk_kannada)}, {getLocationName(sch.district, language, sch.district_kannada)}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-[#16284F] dark:text-[#5B9BD5]">
                        {sch.udise}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {getHMName(sch, language)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {sch.hm_phone}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{sch.registration_date}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {sch.current_academic_year}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(sch.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
                            title="Approve and activate this school"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve School
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSchool(sch);
                              setViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: APPROVED & ACTIVE SCHOOLS (Only visible when activeTab === 'ACTIVE') */}
      {activeTab === 'ACTIVE' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in">
          <div className="bg-[#EDF2F7] dark:bg-slate-800/80 px-6 py-4 border-b border-[#D8E1EA] dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#16284F] text-white shadow-sm">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Approved & Active Schools
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Institutions with active portal access. Access auto-revokes on the 30th of April ending the academic cycle.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF3FC] text-[#16284F] dark:bg-slate-700 dark:text-[#5B9BD5]">
              {activeSchoolsList.length} Active Schools
            </span>
          </div>

          {activeSchoolsList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Active Schools Found</p>
              <p className="text-xs text-slate-400 mt-1">Check the Pending Requests tab to approve new schools.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">{t.platformAdmin.schoolName}</th>
                    <th className="py-3 px-3">{t.platformAdmin.udise}</th>
                    <th className="py-3 px-4">{t.platformAdmin.hmName}</th>
                    <th className="py-3 px-3">{t.platformAdmin.hmPhone}</th>
                    <th className="py-3 px-3">{t.platformAdmin.academicYear}</th>
                    <th className="py-3 px-3">Access Expiry Date</th>
                    <th className="py-3 px-3">{t.platformAdmin.status}</th>
                    <th className="py-3 px-4 text-right">{t.platformAdmin.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeSchoolsList.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                        {getSchoolName(sch, language)}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {getLocationName(sch.taluk, language, sch.taluk_kannada)}, {getLocationName(sch.district, language, sch.district_kannada)}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-[#3977A8] dark:text-[#5B9BD5]">
                        {sch.udise}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {getHMName(sch, language)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {sch.hm_phone}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {sch.current_academic_year}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                        {sch.expiry_date || '2027-04-30'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-[#EBF3FC] text-[#16284F] dark:bg-slate-800 dark:text-[#2563EB] border-[#16284F]/30">
                          ACTIVE
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedSchool(sch);
                              setRevokeModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-[11px] cursor-pointer transition-colors"
                            title="Revoke School Access"
                          >
                            Revoke
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSchool(sch);
                              setViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: REVOKED SCHOOLS (Only visible when activeTab === 'REVOKED') */}
      {activeTab === 'REVOKED' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-sm overflow-hidden animate-in fade-in">
          <div className="bg-rose-50/60 dark:bg-rose-950/40 px-6 py-4 border-b border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-sm">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Revoked & Inactive Schools
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Institutions whose access was revoked or expired. The Master Admin can reactivate access at any time.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
              {revokedSchoolsList.length} Revoked Schools
            </span>
          </div>

          {revokedSchoolsList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              <Check className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Revoked Schools</p>
              <p className="text-xs text-slate-400 mt-1">All registered institutions have active or pending status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50/40 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-rose-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">{t.platformAdmin.schoolName}</th>
                    <th className="py-3 px-3">{t.platformAdmin.udise}</th>
                    <th className="py-3 px-4">{t.platformAdmin.hmName}</th>
                    <th className="py-3 px-3">{t.platformAdmin.hmPhone}</th>
                    <th className="py-3 px-3">{t.platformAdmin.academicYear}</th>
                    <th className="py-3 px-3">Expired On</th>
                    <th className="py-3 px-3">{t.platformAdmin.status}</th>
                    <th className="py-3 px-4 text-right">{t.platformAdmin.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {revokedSchoolsList.map((sch) => (
                    <tr key={sch.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                        {getSchoolName(sch, language)}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {getLocationName(sch.taluk, language, sch.taluk_kannada)}, {getLocationName(sch.district, language, sch.district_kannada)}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-500">
                        {sch.udise}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {getHMName(sch, language)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {sch.hm_phone}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {sch.current_academic_year}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs text-rose-600 dark:text-rose-400">
                        {sch.expiry_date || '2027-04-30'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300">
                          REVOKED
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedSchool(sch);
                              setReactivateModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer transition-colors shadow-sm"
                            title="Reactivate School Access"
                          >
                            Reactivate
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSchool(sch);
                              setViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
{/* REGISTER SCHOOL MODAL (Section 3.A) */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#16284F]" />
              {t.platformAdmin.registerSchool}
            </h2>
            <p className="text-xs text-slate-500">
              New schools are registered with <strong>PENDING APPROVAL</strong> status until verified by Platform Admin.
            </p>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">School Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Government High School"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">School Name (Kannada) *</label>
                  <input
                    type="text"
                    required
                    lang="kn"
                    placeholder="ಶಾಲೆಯ ಪೂರ್ಣ ಹೆಸರು"
                    value={formData.name_kannada}
                    onChange={(e) => setFormData({ ...formData, name_kannada: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">UDISE Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="11 digits (e.g. 29210204509)"
                    value={formData.udise}
                    onChange={(e) => setFormData({ ...formData, udise: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">District (English) *</label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">District (Kannada) *</label>
                    <input
                      type="text"
                      required
                      lang="kn"
                      value={formData.district_kannada}
                      onChange={(e) => setFormData({ ...formData, district_kannada: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Headmaster Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Headmaster full name"
                    value={formData.hm_name}
                    onChange={(e) => setFormData({ ...formData, hm_name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Headmaster Name (Kannada) *</label>
                  <input
                    type="text"
                    required
                    lang="kn"
                    placeholder="ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಪೂರ್ಣ ಹೆಸರು"
                    value={formData.hm_name_kannada}
                    onChange={(e) => setFormData({ ...formData, hm_name_kannada: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Headmaster Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10 digits mobile"
                  value={formData.hm_phone}
                  onChange={(e) => setFormData({ ...formData, hm_phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">School Description (English)</label>
                  <textarea
                    rows={2}
                    placeholder="School history and facilities..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">School Description (Kannada)</label>
                  <textarea
                    lang="kn"
                    rows={2}
                    placeholder="ಶಾಲೆಯ ಇತಿಹಾಸ ಮತ್ತು ಸೌಲಭ್ಯಗಳು..."
                    value={formData.description_kannada}
                    onChange={(e) => setFormData({ ...formData, description_kannada: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Register School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVOKE CONFIRMATION DIALOG (Section 3.A) */}
      {revokeModalOpen && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.platformAdmin.revokeConfirmTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500">School access is revoked based on subscription and payment cycles. No formal reason is required.</p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">{getSchoolName(selectedSchool, language)}</div>
              <div className="text-slate-500 font-mono">UDISE: {selectedSchool.udise}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Billing / Cycle Note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Defaults to: Payment cycle ended"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                {t.platformAdmin.cancel}
              </button>
              <button
                onClick={handleRevokeConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REACTIVATE CONFIRMATION DIALOG (Section 3.A) */}
      {reactivateModalOpen && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#16284F] dark:text-[#2563EB]">
              <RotateCcw className="w-6 h-6" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.platformAdmin.reactivateConfirmTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500">{t.platformAdmin.reactivateConfirmDesc}</p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">{getSchoolName(selectedSchool, language)}</div>
              <div className="text-slate-500 font-mono">UDISE: {selectedSchool.udise}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReactivateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                {t.platformAdmin.cancel}
              </button>
              <button
                onClick={handleReactivateConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#16284F] hover:bg-[#0F1D3B] text-white shadow-md shadow-[#16284F]/20"
              >
                Confirm Reactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SCHOOL DETAILS MODAL */}
      {viewModalOpen && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{getSchoolName(selectedSchool, language)}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E3EBF3] text-[#16284F] dark:bg-slate-800 dark:text-[#2563EB]">
                {selectedSchool.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <strong>UDISE:</strong> <span className="font-mono">{selectedSchool.udise}</span>
              </div>
              <div>
                <strong>Headmaster:</strong> {getHMName(selectedSchool, language)} ({selectedSchool.hm_phone})
              </div>
              <div>
                <strong>Location:</strong> {selectedSchool.taluk}, {selectedSchool.district},{' '}
                {selectedSchool.state}
              </div>
              <div>
                <strong>Academic Year:</strong> {selectedSchool.current_academic_year}
              </div>
              <div>
                <strong>Registration Date:</strong> {selectedSchool.registration_date}
              </div>
              <div>
                <strong>Description:</strong> {selectedSchool.description}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
