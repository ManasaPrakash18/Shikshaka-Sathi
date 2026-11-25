'use client';

import React from 'react';
import Link from 'next/link';
import { FileCheck, ArrowLeft, Shield, AlertCircle, Scale, CheckSquare } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function TermsAndConditionsPage() {
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
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#243449] dark:text-[#F1F5F9]">
              {language === 'kn' ? 'ಸೇವಾ ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು' : 'Terms and Conditions of Use'}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              {language === 'kn'
                ? 'ವಿದ್ಯಾಲಯ ಓಎಸ್ ಸಾಫ್ಟ್‌ವೇರ್ ಬಳಕೆ, ಅಧಿಕೃತ ಶಾಲಾ ದಾಖಲಾತಿ ಮತ್ತು ಮೌಲ್ಯಮಾಪನ ನಿರ್ವಹಣೆಯ ಶಾಸನಬದ್ಧ ನಿಯಮಗಳು'
                : 'Operational governance, document generation guidelines, and compliance rules for Shikshaka Sathi'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 text-sm text-[#243449] dark:text-[#F1F5F9]">
        {/* Section 1 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#16284F] dark:text-[#2563EB] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
            {language === 'kn' ? '1. ಅಧಿಕೃತ ಬಳಕೆ ಮತ್ತು ಶಾಲಾ ಜವಾಬ್ದಾರಿ' : '1. Authorized Educational Use'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            {language === 'kn'
              ? 'ಈ ವೇದಿಕೆಯನ್ನು ಅಧಿಕೃತವಾಗಿ ಅನುಮೋದಿತ ಶಾಲೆಗಳು ಮತ್ತು ನೋಂದಾಯಿತ ಬೋಧಕ ಸಿಬ್ಬಂದಿ ಮಾತ್ರ ಬಳಸತಕ್ಕದ್ದು. ಪ್ರತಿಯೊಬ್ಬ ಬಳಕೆದಾರರು ತಮ್ಮ ಲಾಗಿನ್ ವಿವರಗಳ ಗೌಪ್ಯತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಸ್ವತಃ ಜವಾಬ್ದಾರರಾಗಿರುತ್ತಾರೆ.'
              : 'Access to Shikshaka Sathi is restricted to authorized educational institutions, administrators, and assigned teachers. Users are strictly responsible for maintaining credential secrecy and preventing unauthorized access.'}
          </p>
        </section>

        {/* Section 2 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#16284F] dark:text-[#2563EB] flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
            {language === 'kn' ? '2. ಅಧಿಕೃತ ಪ್ರಮಾಣಪತ್ರಗಳ ವಿತರಣೆ (TC, Study, Marks Card)' : '2. Certificate Issuance & Legal Finality'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            {language === 'kn'
              ? 'ವರ್ಗಾವಣೆ ಪತ್ರ (TC), ವ್ಯಾಸಂಗ ಪ್ರಮಾಣಪತ್ರ ಅಥವಾ ಅಂಕಪಟ್ಟಿಯನ್ನು ಅಂತಿಮಗೊಳಿಸುವ ಮೊದಲು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಪರಿಶೀಲಿಸಬೇಕು. ವರ್ಗಾವಣೆ ಪತ್ರ ನೀಡಿದ ನಂತರ ವಿದ್ಯಾರ್ಥಿಯ ಸ್ಥಿತಿಯನ್ನು "ವರ್ಗಾವಣೆಗೊಂಡವರು" ಎಂದು ದಾಖಲಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಅನಧಿಕೃತವಾಗಿ ಮರುಬದಲಾಯಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.'
              : 'Generated official documents including Transfer Certificates, Study Certificates, and Marks Cards carry institutional standing once sealed and signed. Finalizing a Transfer Certificate marks the student record as permanently transferred.'}
          </p>
        </section>

        {/* Section 3 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#16284F] dark:text-[#2563EB] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
            {language === 'kn' ? '3. ಅಧಿಕೃತ ಸಿಬಿಸಿಇ/ಸಿಸಿಇ ಸೂತ್ರಗಳ ನಿಷ್ಠೆ' : '3. Adherence to Official CCE Grading Formulas'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            {language === 'kn'
              ? 'ಎಲ್ಲಾ ಅಂಕಗಳ ಲೆಕ್ಕಾಚಾರ, ಕಚ್ಚಾ ಅಂಕಗಳಿಂದ ಪರಿವರ್ತಿತ ಅಂಕಗಳ ನಿಷ್ಕರ್ಷೆ ಮತ್ತು ಶ್ರೇಣಿ (ಗ್ರೇಡ್) ನಿಯೋಜನೆಗಳು ಕರ್ನಾಟಕ ಸಾರ್ವಜನಿಕ ಶಿಕ್ಷಣ ಇಲಾಖೆಯ ಅಧಿಕೃತ ಚಾರ್ಟ್ ಮತ್ತು ನಿಯಮಾವಳಿಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನಿರ್ವಹಿಸಲ್ಪಡುತ್ತವೆ.'
              : 'All numerical conversions (e.g. 50 to 15, 50 to 10, 50 to 20, 50 to 30) and grade determinations strictly mirror the statutory rules defined by the Karnataka State Education Department.'}
          </p>
        </section>

        {/* Section 4 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#1A2636] border border-[#D8E1EA] dark:border-[#2A3B50] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#16284F] dark:text-[#2563EB] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#16284F] dark:text-[#2563EB]" />
            {language === 'kn' ? '4. ದತ್ತಾಂಶ ಸಿಂಕ್ ಮತ್ತು ಸತ್ಯಾಸತ್ಯತೆ' : '4. Offline Synchronization Responsibilities'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            {language === 'kn'
              ? 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ನಮೂದಿಸಿದ ಮಾಹಿತಿಯನ್ನು ನಿಯಮಿತವಾಗಿ ಕ್ಲೌಡ್ ಸರ್ವರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡುವುದು ಶಾಲಾ ಆಡಳಿತದ ಜವಾಬ್ದಾರಿಯಾಗಿದೆ. ಬ್ರೌಸರ್ ಕ್ಯಾಶ್ ಅಳಿಸುವುದರಿಂದ ಉಂಟಾಗಬಹುದಾದ ಸ್ಥಳೀಯ ದತ್ತಾಂಶ ನಷ್ಟವನ್ನು ತಪ್ಪಿಸಲು ಸಿಂಕ್ರೊನೈಸೇಶನ್ ಸ್ಥಿತಿಯನ್ನು ನಿರಂತರವಾಗಿ ಪರಿಶೀಲಿಸಬೇಕು.'
              : 'Users must maintain awareness of local storage indicators. Un-synced local records must be synchronized upon establishing reliable internet connectivity to ensure persistent cloud retention.'}
          </p>
        </section>
      </div>
    </div>
  );
}
