'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, Database, Server } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#3977A8] dark:text-[#4B8DC2] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'kn' ? 'ನಿಯಂತ್ರಣ ಕೊಠಡಿಗೆ ಹಿಂತಿರುಗಿ' : 'Back to Dashboard'}
        </Link>
        <span className="text-xs text-[#8492A6]">
          {language === 'kn' ? 'ಕೊನೆಯ ನವೀಕರಣ: ನವೆಂಬರ್ 2026' : 'Last Updated: November 2026'}
        </span>
      </div>

      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16284F] flex items-center justify-center text-white">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#243449] dark:text-[#F1F5F9]">
              {language === 'kn' ? 'ಗೌಪ್ಯತಾ ನೀತಿ' : 'Data Privacy Policy'}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              {language === 'kn'
                ? 'ವಿದ್ಯಾಲಯ ಓಎಸ್ ಶಾಲಾ ಶಿಕ್ಷಣ ವೇದಿಕೆಯಲ್ಲಿ ವಿದ್ಯಾರ್ಥಿ ಹಾಗೂ ಶಿಕ್ಷಕರ ದತ್ತಾಂಶ ಸಂರಕ್ಷಣೆಯ ನಿಯಮಾವಳಿಗಳು'
                : 'Student record governance and school institutional data privacy protocol'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 text-sm text-[#243449] dark:text-[#F1F5F9]">
        {/* Section 1 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#16284F] dark:text-[#2563EB] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
            {language === 'kn' ? '1. ಸಂಗ್ರಹಿಸಲಾಗುವ ದತ್ತಾಂಶದ ವ್ಯಾಪ್ತಿ' : '1. Scope of Collected Academic Data'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            {language === 'kn'
              ? 'ವಿದ್ಯಾಲಯ ಓಎಸ್ ತಂತ್ರಾಂಶವು ಶಾಲಾ ಆಡಳಿತ ಮತ್ತು ನಿರಂತರ ಮೌಲ್ಯಮಾಪನ (CCE) ನಿರ್ವಹಣೆಗೆ ಅವಶ್ಯವಿರುವ ವಿದ್ಯಾರ್ಥಿ ಶೈಕ್ಷಣಿಕ ದಾಖಲೆಗಳನ್ನು ಮಾತ್ರ ಸಂಗ್ರಹಿಸುತ್ತದೆ. ಇದರಲ್ಲಿ SATS ಸಂಖ್ಯೆ, PEN, APAAR ಐಡಿ, ಹಾಜರಾತಿ, ಅಂಕಗಳು ಮತ್ತು ಪೋಷಕರ ಮೂಲ ಸಂಪರ್ಕ ಮಾಹಿತಿ ಒಳಗೊಂಡಿರುತ್ತದೆ.'
              : 'Shikshaka Sathi collects strictly academic and operational records essential for continuous assessment and school administration. This includes official identifiers (SATS, PEN, APAAR), assessment scores, attendance figures, and guardian contact details.'}
          </p>
        </section>

        {/* Section 2 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#16284F] dark:text-[#2563EB] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
            {language === 'kn' ? '2. ಸ್ಥಳೀಯ ಮತ್ತು ಕ್ಲೌಡ್ ದತ್ತಾಂಶ ಸಂಗ್ರಹಣೆ' : '2. Storage Architecture & Local Caching'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            {language === 'kn'
              ? 'ಗ್ರಾಮೀಣ ಮತ್ತು ಸೀಮಿತ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿರುವ ಶಾಲೆಗಳಲ್ಲಿ ಶಿಕ್ಷಕರ ಕಾರ್ಯ ಸುಲಭವಾಗಿಸಲು, ದತ್ತಾಂಶವನ್ನು ಮೊದಲು ಬ್ರೌಸರ್‌ನ ಸುರಕ್ಷಿತ ಸ್ಥಳೀಯ ಶೇಖರಣೆಯಲ್ಲಿ (IndexedDB/LocalDB) ಇರಿಸಲಾಗುತ್ತದೆ. ಇಂಟರ್ನೆಟ್ ಲಭ್ಯವಾದಾಗ ಮಾತ್ರ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾದ ಕ್ಲೌಡ್ ಸರ್ವರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತದೆ.'
              : 'To enable uninterrupted offline operations across schools, marks and records are cached securely in local browser storage. When internet access is active, records are synchronized via authenticated, encrypted transport to the secure Cloud database.'}
          </p>
        </section>

        {/* Section 3 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#16284F] dark:text-[#2563EB] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
            {language === 'kn' ? '3. ಪಾತ್ರಾಧಾರಿತ ಪ್ರವೇಶ ನಿಯಂತ್ರಣ (RBAC)' : '3. Role-Based Access Control'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            {language === 'kn'
              ? 'ಪ್ರತಿಯೊಂದು ಶಾಲೆಯ ದತ್ತಾಂಶವು ಇತರ ಶಾಲೆಗಳಿಂದ ಸಂಪೂರ್ಣ ಪ್ರತ್ಯೇಕವಾಗಿರುತ್ತದೆ (Multi-tenant Isolation). ಶಿಕ್ಷಕರು ತಮಗೆ ನಿಯೋಜಿಸಲಾದ ತರಗತಿಗಳ ಅಂಕಗಳನ್ನು ಮಾತ್ರ ದಾಖಲಿಸಬಹುದು. ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು ಶಾಲೆಯ ಒಟ್ಟಾರೆ ದಾಖಲೆಗಳನ್ನು ನಿರ್ವಹಿಸುತ್ತಾರೆ. ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಅಡ್ಮಿನ್ ಶಾಲಾ ಅನುಮೋದನೆಗಳಿಗಷ್ಟೇ ಸೀಮಿತರಾಗಿರುತ್ತಾರೆ.'
              : 'School records are strictly multi-tenant isolated. Faculty can only view and update marks for assigned classes. Headmasters oversee their respective institutional records. Platform administrators oversee credentials and school tenancy without viewing private student metrics.'}
          </p>
        </section>

        {/* Section 4 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#16284F] dark:text-[#2563EB] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
            {language === 'kn' ? '4. ತಿದ್ದುಪಡಿ ಮತ್ತು ಆಡಿಟ್ ಇತಿಹಾಸ' : '4. Audit Logs and Modification Traceability'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            {language === 'kn'
              ? 'ವಿದ್ಯಾರ್ಥಿ ವಿವರ ಅಥವಾ ಅಂಕಗಳಲ್ಲಿ ಯಾವುದೇ ಬದಲಾವಣೆ ಮಾಡಿದರೂ, ಅದನ್ನು ಯಾರು ಬದಲಾಯಿಸಿದರು ಮತ್ತು ಕಾರಣವೇನು ಎಂಬ ವಿವರವನ್ನು ದಿನಾಂಕ-ಸಮಯದೊಂದಿಗೆ ಆಡಿಟ್ ಲಾಗ್‌ನಲ್ಲಿ ಶಾಶ್ವತವಾಗಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ.'
              : 'Every modification made to student demographic information or finalized assessment marks requires an explicit justification and is logged permanently with user credentials and ISO timestamps in the institutional audit trail.'}
          </p>
        </section>
      </div>
    </div>
  );
}
