'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  UserPlus,
  Users,
  Search,
  CheckCircle,
  Phone,
  Mail,
  KeyRound,
  Copy,
  Clock,
  ShieldCheck,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { User } from '@/lib/types';
import { validatePhone, validateEmail } from '@/lib/utils/validators';
import { getUserName, getSchoolName, toKannadaText } from '@/lib/utils/kannadaNames';

export default function CombinedFacultyPage() {
  const { currentSchool, userRole } = useAuth();
  const { state, addFacultyUser, toggleFacultyStatus } = useAppState();
  const { t, language } = useLanguage();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Access control invite link state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form state for adding faculty (name, role/designation, phone, email)
  const [form, setForm] = useState({
    name: '',
    name_kannada: '',
    phone: '',
    email: '',
    designation: 'Teacher' as 'Teacher' | 'Headmaster' | 'Senior Teacher' | 'Physical Education Teacher' | 'Special Teacher',
  });

  const schoolFaculty = state.users.filter((u) => u.school_id === currentSchool?.id);

  const filteredFaculty = schoolFaculty.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.name_kannada && f.name_kannada.includes(searchQuery)) ||
      f.phone.includes(searchQuery) ||
      (f.email && f.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.designation && f.designation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;

    if (!form.name.trim() || !form.name_kannada.trim() || !form.phone.trim()) {
      alert('Faculty name in English and Kannada and phone number are required.');
      return;
    }

    const phoneVal = validatePhone(form.phone);
    if (!phoneVal.isValid) {
      alert(phoneVal.error || 'Phone number must have exactly 10 digits.');
      return;
    }

    if (form.email.trim()) {
      const emailVal = validateEmail(form.email);
      if (!emailVal.isValid) {
        alert(emailVal.error || 'Please enter a valid official email address.');
        return;
      }
    }

    // Set expiry 7 days from now for new activation token
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const createdUser = await addFacultyUser({
      school_id: currentSchool.id,
      role: form.designation === 'Headmaster' ? 'SCHOOL_ADMIN' : 'FACULTY',
      name: form.name.trim(),
      name_kannada: form.name_kannada.trim(),
      email: form.email.trim() || `${form.name.toLowerCase().replace(/\s+/g, '.')}@school.edu.in`,
      phone: form.phone.trim(),
      designation: form.designation,
      status: 'ACTIVE',
      activation_token: 'act_' + Math.random().toString(36).substring(2, 9),
      token_expiry: expiryDate,
    });

    setAddModalOpen(false);
    setForm({
      name: '',
      name_kannada: '',
      phone: '',
      email: '',
      designation: 'Teacher',
    });

    // Automatically prompt to share personal activation link
    setSelectedUser(createdUser);
    setInviteModalOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    await toggleFacultyStatus(user.id, nextStatus);
  };

  const isTokenValid = (user: User) => {
    if (!user.activation_token) return false;
    if (!user.token_expiry) return true; // if no explicit expiry, treat as valid
    return new Date(user.token_expiry).getTime() > Date.now();
  };

  const generateInvitationLink = (user: User) => {
    setSelectedUser(user);
    setInviteModalOpen(true);
    setCopiedLink(false);
    setCopiedCode(false);
  };

  const activationTokenCode = selectedUser?.activation_token || selectedUser?.id || '';

  const currentInviteUrl = selectedUser
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://vidyalaya-os.internal'}/activate?token=${
        selectedUser.activation_token || 'act_' + selectedUser.id
      }&user=${selectedUser.id}`
    : '';

  const handleCopy = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentInviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleCopyCode = () => {
    if (typeof window !== 'undefined' && navigator.clipboard && activationTokenCode) {
      navigator.clipboard.writeText(activationTokenCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    if (!selectedUser) return;
    const cleanPhone = (selectedUser.phone || '').replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const schName = getSchoolName(currentSchool, language);
    const uName = getUserName(selectedUser, language);
    const msg = language === 'kn'
      ? `ನಮಸ್ಕಾರ ${uName},\n\nನಿಮ್ಮನ್ನು ${schName} ಶಾಲೆಯ ವಿದ್ಯಾಲಯ ಓಎಸ್ (Shikshaka Sathi) ತಂತ್ರಾಂಶದಲ್ಲಿ ಶಿಕ್ಷಕರಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ.\n\nನಿಮ್ಮ ಖಾತೆಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲು ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಲು ಕೆಳಗಿನ ನೇರ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ:\n${currentInviteUrl}\n\nಅಥವಾ /activate ಪುಟದಲ್ಲಿ ಈ ಸಕ್ರಿಯಗೊಳಿಸುವ ಕೋಡ್ ನಮೂದಿಸಿ:\nಕೋಡ್: ${activationTokenCode}`
      : `Namaskara ${selectedUser.name},\n\nYou have been registered on Shikshaka Sathi as ${selectedUser.designation || 'Teacher'} at ${currentSchool?.name || 'our school'}.\n\nTo activate your account and set your password, click your direct link:\n${currentInviteUrl}\n\nOr enter this Activation Code on the /activate page:\nCode: ${activationTokenCode}`;
    
    const url = phoneWithCode 
      ? `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (userRole === 'PLATFORM_ADMIN') {
    return (
      <div className="p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
        <h2 className="text-xl font-bold">Platform Admin View Restricted</h2>
        <p className="mt-2 text-sm">
          Platform administrators only manage school onboarding, registration and institutional access. Faculty records belong to individual schools.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2563EB] dark:text-[#2563EB] font-bold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            {language === 'kn' ? 'ಶಾಲಾ ಬೋಧಕ ಸಿಬ್ಬಂದಿ' : 'Faculty & Staff Administration'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#253747] dark:text-white mt-1">
            {language === 'kn' ? 'ಬೋಧಕ ಸಿಬ್ಬಂದಿ ನಿರ್ವಹಣೆ' : 'Faculty Management'}
          </h1>
          <p className="text-xs sm:text-sm text-[#657587] dark:text-slate-400 mt-0.5">
            {language === 'kn'
              ? `${getSchoolName(currentSchool, language)} ಸಿಬ್ಬಂದಿ ಮಾಹಿತಿ, ಪಾತ್ರಗಳು, ಮತ್ತು ಪ್ರವೇಶ ಸ್ಥಿತಿ`
              : `Directory, roles, contact information, and access credentials for ${getSchoolName(currentSchool, language)}`}
          </p>
        </div>

        {userRole === 'SCHOOL_ADMIN' && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#19483B] text-white font-semibold text-xs shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {language === 'kn' ? 'ಹೊಸ ಸಿಬ್ಬಂದಿ ಸೇರಿಸಿ' : 'Add Faculty Member'}
          </button>
        )}
      </div>

      {/* Unified Faculty Section */}
      <div className="space-y-4">
        {/* Search & Statistics Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-[#DCE5EA] dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 w-full sm:w-80 px-3 py-1.5 rounded-xl bg-[#F4F7F9] dark:bg-slate-800 border border-[#DCE5EA] dark:border-slate-700">
            <Search className="w-4 h-4 text-[#8795A3]" />
            <input
              type="text"
              placeholder={language === 'kn' ? 'ಹೆಸರು, ಫೋನ್ ಅಥವಾ ಇಮೇಲ್ ಮೂಲಕ ಹುಡುಕಿ...' : 'Search by name, phone or email...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs font-semibold outline-none text-[#253747] dark:text-white placeholder:text-[#8795A3]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF3FC] text-[#2563EB] dark:bg-slate-800 dark:text-[#2563EB]">
              {schoolFaculty.filter((f) => f.status === 'ACTIVE').length} {language === 'kn' ? 'ಸಕ್ರಿಯ' : 'Active'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F4F7F9] text-[#657587] dark:bg-slate-800 dark:text-slate-400">
              {schoolFaculty.length} {language === 'kn' ? 'ಒಟ್ಟು ಸಿಬ್ಬಂದಿ' : 'Total Faculty'}
            </span>
          </div>
        </div>

        {/* Clean Modular Faculty Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-[#DCE5EA] dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDF3F5] dark:bg-slate-800/80 text-[#253747] dark:text-slate-300 uppercase font-bold text-[11px] border-b border-[#DCE5EA] dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">{language === 'kn' ? 'ಹೆಸರು' : 'Faculty Name'}</th>
                  <th className="py-3.5 px-4">{language === 'kn' ? 'ಪಾತ್ರ / ಹುದ್ದೆ' : 'Role / Designation'}</th>
                  <th className="py-3.5 px-4">{language === 'kn' ? 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ' : 'Phone Number'}</th>
                  <th className="py-3.5 px-4">{language === 'kn' ? 'ಇಮೇಲ್' : 'Email Address'}</th>
                  <th className="py-3.5 px-4">{language === 'kn' ? 'ಸ್ಥಿತಿ' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{language === 'kn' ? 'ಕ್ರಮಗಳು' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5EA]/60 dark:divide-slate-800">
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#8795A3] font-medium">
                      {language === 'kn' ? 'ಯಾವುದೇ ಬೋಧಕ ಸಿಬ್ಬಂದಿ ಕಂಡುಬಂದಿಲ್ಲ' : 'No faculty members found.'}
                    </td>
                  </tr>
                ) : (
                  filteredFaculty.map((fac) => {
                    const tokenActive = isTokenValid(fac);
                    const isActive = fac.status === 'ACTIVE';

                    return (
                      <tr
                        key={fac.id}
                        className="hover:bg-[#F4F7F9]/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] dark:bg-slate-800 text-[#2563EB] dark:text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0">
                              {fac.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#253747] dark:text-white">
                              {getUserName(fac, language)}
                            </span>
                          </div>
                        </td>

                        {/* Role / Designation */}
                        <td className="py-3.5 px-4 font-semibold text-[#657587] dark:text-slate-300">
                          {language === 'kn' ? toKannadaText(fac.designation || 'Teacher') : (fac.designation || 'Teacher')}
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 font-mono text-[#253747] dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#8795A3]" />
                            <span>{fac.phone}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-[#657587] dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#8795A3]" />
                            <span className="truncate max-w-[200px]">{fac.email}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-[#EBF3FC] text-[#2563EB] dark:bg-slate-800 dark:text-[#2563EB]'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                            }`}
                          >
                            {isActive ? (language === 'kn' ? 'ಸಕ್ರಿಯ' : 'ACTIVE') : (language === 'kn' ? 'ಹಿಂಪಡೆಯಲಾಗಿದೆ' : 'REVOKED')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Activation Link: ONLY show if token is NOT expired */}
                            {tokenActive && (
                              <button
                                onClick={() => generateInvitationLink(fac)}
                                title="Activation Link"
                                className="px-2.5 py-1 rounded-lg bg-[#3979B8]/10 hover:bg-[#3979B8]/20 text-[#3979B8] dark:text-blue-400 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>{language === 'kn' ? 'ಲಿಂಕ್' : 'Activation Link'}</span>
                              </button>
                            )}

                            {/* Revoke / Reactivate Button */}
                            {userRole === 'SCHOOL_ADMIN' && (
                              <button
                                onClick={() => handleToggleStatus(fac)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                                  isActive
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                    : 'bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] dark:text-teal-300'
                                }`}
                              >
                                {isActive
                                  ? (language === 'kn' ? 'ಹಿಂಪಡೆಯಿರಿ' : 'Revoke')
                                  : (language === 'kn' ? 'ಮರುಸಕ್ರಿಯಗೊಳಿಸಿ' : 'Reactivate')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Faculty Modal (Name, Role, Phone, Email only) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#DCE5EA] dark:border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#253747] dark:text-white">
                {language === 'kn' ? 'ಹೊಸ ಬೋಧಕ ಸಿಬ್ಬಂದಿ ಸೇರಿಸಿ' : 'Add New Faculty Member'}
              </h2>
              <p className="text-xs text-[#657587] dark:text-slate-400 mt-0.5">
                {language === 'kn' ? 'ಸಿಬ್ಬಂದಿ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ' : 'Enter faculty contact and institutional details'}
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#253747] dark:text-slate-300">
                  {language === 'kn' ? 'ಪೂರ್ಣ ಹೆಸರು (ಇಂಗ್ಲಿಷ್) *' : 'Full Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smt. Suma R"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#DCE5EA] dark:border-slate-700 bg-[#F4F7F9] dark:bg-slate-800 text-xs font-semibold text-[#253747] dark:text-white focus:outline-[#2563EB]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#253747] dark:text-slate-300">
                  {language === 'kn' ? 'ಪೂರ್ಣ ಹೆಸರು (ಕನ್ನಡ) *' : 'Full Name (Kannada) *'}
                </label>
                <input
                  type="text"
                  required
                  lang="kn"
                  placeholder="ಶಿಕ್ಷಕರ ಪೂರ್ಣ ಹೆಸರು"
                  value={form.name_kannada}
                  onChange={(e) => setForm({ ...form, name_kannada: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#DCE5EA] dark:border-slate-700 bg-[#F4F7F9] dark:bg-slate-800 text-xs font-semibold text-[#253747] dark:text-white focus:outline-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#253747] dark:text-slate-300">
                    {language === 'kn' ? 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit mobile"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#DCE5EA] dark:border-slate-700 bg-[#F4F7F9] dark:bg-slate-800 text-xs font-mono text-[#253747] dark:text-white focus:outline-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#253747] dark:text-slate-300">
                    {language === 'kn' ? 'ಹುದ್ದೆ / ಪಾತ್ರ' : 'Role / Designation'}
                  </label>
                  <select
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value as any })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#DCE5EA] dark:border-slate-700 bg-[#F4F7F9] dark:bg-slate-800 text-xs font-semibold text-[#253747] dark:text-white focus:outline-[#2563EB]"
                  >
                    <option value="Teacher">Teacher (Assistant Teacher)</option>
                    <option value="Headmaster">Headmaster</option>
                    <option value="Senior Teacher">Senior Teacher</option>
                    <option value="Physical Education Teacher">Physical Education Teacher</option>
                    <option value="Special Teacher">Special Teacher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#253747] dark:text-slate-300">
                  {language === 'kn' ? 'ಇಮೇಲ್ ವಿಳಾಸ' : 'Email Address'}
                </label>
                <input
                  type="email"
                  placeholder="faculty@school.edu.in"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#DCE5EA] dark:border-slate-700 bg-[#F4F7F9] dark:bg-slate-800 text-xs font-semibold text-[#253747] dark:text-white focus:outline-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE5EA] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#657587] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#19483B] text-white shadow-sm cursor-pointer"
                >
                  {language === 'kn' ? 'ಉಳಿಸಿ ಮತ್ತು ನೋಂದಾಯಿಸಿ' : 'Save & Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#DCE5EA] dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF3FC] dark:bg-slate-800 flex items-center justify-center text-[#2563EB] dark:text-[#2563EB]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#253747] dark:text-white">
                  {language === 'kn' ? 'ಸಕ್ರಿಯಗೊಳಿಸುವ ಲಿಂಕ್' : 'Faculty Activation Link'}
                </h3>
                <p className="text-xs text-[#657587]">{getUserName(selectedUser, language)}</p>
              </div>
            </div>

            {/* Activation Code Box (Works on any device/network) */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16284F] dark:text-blue-300">
                  {language === 'kn' ? 'ಖಾತೆ ಸಕ್ರಿಯಗೊಳಿಸುವ ಕೋಡ್' : 'Faculty Activation Code'}
                </span>
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-medium">
                  {language === 'kn' ? 'ಯಾವುದೇ ಸಾಧನದಲ್ಲಿ ಬಳಸಿ' : 'Direct manual code'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-900">
                <span className="font-mono text-sm font-bold text-[#16284F] dark:text-[#5B9BD5] select-all">
                  {activationTokenCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 text-[#16284F] dark:text-blue-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                If the teacher is on another phone or personal device where the URL is unreachable, they can simply navigate to <strong>/activate</strong> and enter this code.
              </p>
            </div>

            {/* Direct Activation URL */}
            <div className="p-3 rounded-2xl bg-[#F4F7F9] dark:bg-slate-800/60 border border-[#DCE5EA] dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-[#8795A3]">
                {language === 'kn' ? 'ಸಕ್ರಿಯಗೊಳಿಸುವ URL' : 'One-Time Activation URL'}
              </span>
              <div className="font-mono text-xs text-[#253747] dark:text-slate-300 break-all select-all mt-1">
                {currentInviteUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#E49A45] bg-[#E49A45]/10 p-2.5 rounded-xl border border-[#E49A45]/30">
              <Clock className="w-4 h-4 shrink-0 text-[#E49A45]" />
              <span>
                {language === 'kn'
                  ? 'ಈ ಲಿಂಕ್ 24 ಗಂಟೆಗಳ ನಂತರ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮುಕ್ತಾಯಗೊಳ್ಳುತ್ತದೆ.'
                  : 'This activation link expires 24 hours after generation for security compliance.'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#657587] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-md cursor-pointer transition-all"
                title={`Send link directly to ${selectedUser.phone} via WhatsApp`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {language === 'kn'
                    ? `${selectedUser.phone} ಗೆ ನೇರವಾಗಿ ಕಳುಹಿಸಿ`
                    : `Send directly to ${selectedUser.phone}`}
                </span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#19483B] text-white shadow-sm cursor-pointer transition-colors"
              >
                {copiedLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink
                  ? (language === 'kn' ? 'ನಕಲಿಸಲಾಗಿದೆ!' : 'Copied!')
                  : (language === 'kn' ? 'ಲಿಂಕ್ ನಕಲಿಸಿ' : 'Copy Link')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
