/**
 * Official Karnataka State CCE Certificates & Reports Print Engine
 * Directly implements the authentic layout, styling, and QR verification
 * from the official Teacher-Friendly CCE Karnataka system (githubversion.html).
 */

import { Student, School, TransferCertificate, AssessmentRecord, CoCurricularGradeRecord } from '../types';
import { getDobInWords } from '../utils/dobWords';
import { getStudentName, getFatherName, getMotherName, getSchoolName, getLocationName } from '../utils/kannadaNames';
import { getStandardSubjects, calculateAnnualMarks, calculateGrade, getAnnualMaximumMarks } from '../cce/calculations';

export const KARNATAKA_EMBLEM = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Seal_of_Karnataka.svg/330px-Seal_of_Karnataka.svg.png';

export function esc(s: any): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] || c));
}

export function openPrintWindow(title: string, htmlContent: string) {
  const w = window.open('', '_blank');
  if (!w) {
    alert('Please allow pop-ups in your browser to preview and print official documents.');
    return;
  }
  w.document.open();
  w.document.write(htmlContent);
  w.document.close();
}

/**
 * 1. OFFICIAL 28-FIELD TRANSFER CERTIFICATE (TC) HTML GENERATOR
 * Exact layout, classes, styles, emblem and QR code from githubversion.html (v95/v289/v292)
 */
export function getOfficialTransferCertificateHTML(
  tc: TransferCertificate,
  student: Student,
  school: School,
  lang: 'kn' | 'en' = 'kn',
  forDirectPrint = false
): string {
  const isKn = lang === 'kn';
  const title = isKn ? 'ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರ' : 'TRANSFER CERTIFICATE';
  const certTitle = isKn ? 'ಪ್ರಮಾಣ ಪತ್ರ' : 'CERTIFICATE';
  const certText = isKn
    ? 'ಈ ಮೇಲ್ಕಂಡ ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರದಲ್ಲಿ ನಮೂದಿಸಿರುವ ಎಲ್ಲಾ ವಿವರಗಳು ಶಾಲೆಯ ದಾಖಲಾತಿ ವಹಿಯಲ್ಲಿರುವ ಅಂಶಗಳಿಗೆ ಅನುಗುಣವಾಗಿದ್ದು ಸರಿಯಾಗಿವೆ ಎಂದು ದೃಢೀಕರಿಸಲಾಗಿದೆ.'
    : 'This is to certify that the particulars entered in this Transfer Certificate agree with the school records and are correct.';

  const dobWord = getDobInWords(student.dob, lang);

  // Compact payload for QR Code
  const qrPayload = JSON.stringify({
    title: isKn ? 'ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರ' : 'TRANSFER CERTIFICATE',
    tcNo: tc.tc_no,
    school: getSchoolName(school, lang),
    udise: school.udise,
    student: getStudentName(student, lang),
    father: getFatherName(student, lang),
    dob: student.dob,
    dobWords: dobWord,
    admNo: student.admission_no,
    sats: student.sats_no || '',
    pen: student.pen_no || '',
    class: `${student.class_number} (${student.section})`,
    promoted: tc.whether_promoted,
    issueDate: tc.tc_issue_date,
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=190x190&ecc=M&data=${encodeURIComponent(qrPayload)}`;

  const field = (label: string, val: string | number | undefined | null) =>
    `<div class="fld"><span class="lbl">${esc(label)}</span><span class="ans">${val ? esc(val) : '&nbsp;'}</span></div>`;

  const row = (a: string, b: string) => `<div class="orow"><div class="ocell">${a}</div><div class="ocell">${b}</div></div>`;
  const full = (a: string) => `<div class="orow one"><div class="ocell">${a}</div></div>`;

  let rows = '';
  rows += full(field(isKn ? '1. ಶಾಲೆಯ ಹೆಸರು :' : '1. Name of School :', getSchoolName(school, lang)));
  rows += row(field(isKn ? '2. ಪ್ರವೇಶ ಸಂಖ್ಯೆ :' : '2. Admission No. :', student.admission_no), field(isKn ? '3. ಸಂಚಿತ ದಾಖಲಾತಿ ಸಂಖ್ಯೆ :' : '3. Cumulative Record No. :', tc.sanchita_dakhale_no || '-'));
  rows += full(field(isKn ? '4. ವಿದ್ಯಾರ್ಥಿಯ ಪೂರ್ಣ ಹೆಸರು :' : '4. Name of Pupil in Full :', getStudentName(student, lang)));
  rows += row(field(isKn ? '5. ಹುಟ್ಟಿದ ಸ್ಥಳ :' : '5. Place of Birth :', getLocationName(student.place_of_birth, lang, student.place_of_birth_kannada)), field(isKn ? '6. ತಾಲೂಕು :' : '6. Taluk :', getLocationName(student.taluk || school.taluk, lang, student.taluk_kannada || school.taluk_kannada)));
  rows += row(field(isKn ? '7. ಜಿಲ್ಲೆ :' : '7. District :', getLocationName(student.district || school.district, lang, student.district_kannada || school.district_kannada)), field(isKn ? '8. ರಾಜ್ಯ :' : '8. State :', student.state || 'Karnataka'));
  rows += row(field(isKn ? '9. ಲಿಂಗ :' : '9. Sex :', isKn ? (student.gender === 'BOY' ? 'ಬಾಲಕ' : 'ಬಾಲಕಿ') : student.gender), field(isKn ? '10. ರಾಷ್ಟ್ರೀಯತೆ :' : '10. Nationality :', student.nationality || 'Indian'));
  rows += row(field(isKn ? '11. ಧರ್ಮ :' : '11. Religion :', student.religion || 'Hindu'), field(isKn ? '12. ಜಾತಿ :' : '12. Caste :', getLocationName(student.caste, lang, student.caste_kannada) || 'General'));
  rows += row(field(isKn ? '13. ಉಪಜಾತಿ :' : '13. Sub Caste :', student.sub_caste || '-'), field(isKn ? '14. ವರ್ಗ :' : '14. Category :', student.category));
  rows += row(field(isKn ? '15. ತಂದೆಯ ಹೆಸರು :' : '15. Father Name :', getFatherName(student, lang)), field(isKn ? 'ತಾಯಿಯ ಹೆಸರು :' : 'Mother Name :', getMotherName(student, lang)));
  rows += row(field(isKn ? '16. ಪರಿಶಿಷ್ಟ ಜಾತಿ / ಪಂಗಡಕ್ಕೆ ಸೇರಿದವರೇ? :' : '16. Belongs to SC/ST? :', student.category === 'SC' || student.category === 'ST' ? (isKn ? 'ಹೌದು' : 'Yes') : (isKn ? 'ಇಲ್ಲ' : 'No')), field(isKn ? '17. ಮುಂದಿನ ತರಗತಿಗೆ ಅರ್ಹರಾಗಿರುವರೇ? :' : '17. Qualified for Promotion? :', tc.whether_promoted));
  rows += full(field(isKn ? '18. ಜನ್ಮ ದಿನಾಂಕ (ಅಂಕಿಗಳಲ್ಲಿ) :' : '18. Date of Birth (Figures) :', student.dob) + `<div class="dobword"><b>${isKn ? 'ಜನ್ಮ ದಿನಾಂಕ (ಅಕ್ಷರಗಳಲ್ಲಿ) : ' : 'Date of Birth (Words) : '}</b>${esc(dobWord)}</div>`);
  rows += row(field(isKn ? '19. ಶಾಲೆ ಬಿಟ್ಟಾಗ ಓದುತ್ತಿದ್ದ ತರಗತಿ :' : '19. Standard Leaving :', isKn ? `${student.class_number} ನೇ ತರಗತಿ` : `Class ${student.class_number}`), field(isKn ? '20. ಬೋಧನಾ ಮಾಧ್ಯಮ :' : '20. Medium :', student.medium_of_instruction || 'Kannada'));
  rows += row(field(isKn ? '21. ದಾಖಲಾದ ದಿನಾಂಕ :' : '21. Admission Date :', student.admission_date || '-'), field(isKn ? '22. ಶುಲ್ಕ ಬಾಕಿ ಪಾವತಿಸಿರುವರೇ? :' : '22. Fees Dues Paid? :', tc.whether_fees_paid));
  rows += row(field(isKn ? '23. ಶುಲ್ಕ ವಿನಾಯಿತಿ :' : '23. Fee Concession :', tc.fee_discount || '-'), field(isKn ? '24. ವಿದ್ಯಾರ್ಥಿವೇತನ :' : '24. Scholarship :', tc.scholarship || '-'));
  rows += row(field(isKn ? '25. ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆ ಮಾಡಲಾಗಿದೆಯೇ? :' : '25. Medical Examined? :', tc.medical_test_info || 'Normal / Fit'), field(isKn ? '26. ಕೊನೆಯ ಹಾಜರಾತಿ ದಿನಾಂಕ :' : '26. Last Attendance Date :', tc.last_attendance_date || '-'));
  rows += row(field(isKn ? '27. ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ :' : '27. TC Application Date :', tc.tc_application_date || tc.tc_issue_date), field(isKn ? '28. ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರ ನೀಡಿದ ದಿನಾಂಕ :' : '28. TC Issue Date :', tc.tc_issue_date));
  rows += row(field(isKn ? '29. ಶಾಲೆ ನಡೆದ ಒಟ್ಟು ದಿನಗಳ ಸಂಖ್ಯೆ :' : '29. Total Working Days :', tc.total_working_days), field(isKn ? '30. ವಿದ್ಯಾರ್ಥಿಯು ಹಾಜರಾದ ಒಟ್ಟು ದಿನಗಳ ಸಂಖ್ಯೆ :' : '30. Days Attended :', tc.days_attended));
  rows += full(field(isKn ? '31. ಶೀಲ ಮತ್ತು ಚಾರಿತ್ರ್ಯ :' : '31. Character & Conduct :', tc.behaviour || (isKn ? 'ಉತ್ತಮವಾಗಿದೆ' : 'Good')));
  rows += row(field(isKn ? '32. SATS ಸಂಖ್ಯೆ :' : '32. SATS No. :', student.sats_no || '-'), field(isKn ? '33. PEN ID ಸಂಖ್ಯೆ :' : '33. PEN ID Number :', student.pen_no || '-'));
  rows += row(field(isKn ? '34. APAAR ID ಸಂಖ್ಯೆ :' : '34. APAAR ID Number :', student.apaar_id || '-'), field(isKn ? '35. ವಿದ್ಯಾರ್ಥಿ ಆಧಾರ್ :' : '35. Student Aadhaar :', student.aadhaar_no ? `XXXX-XXXX-${student.aadhaar_no.slice(-4)}` : '-'));

  const onlineNote = isKn
    ? 'ಗಮನಿಸಿ: ಈ ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರದಲ್ಲಿರುವ ಎಲ್ಲಾ ಮಾಹಿತಿಗಳು ಪಕ್ಕದಲ್ಲಿರುವ QR ಕೋಡಿನಲ್ಲಿಯೂ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ. ಅಧಿಕೃತ ಪರಿಶೀಲನೆಗೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಬಹುದು.'
    : 'Note: All details contained in this transfer certificate are also stored in the QR code shown here for verification.';

  const bodyInner = `
  <div class="sheet">
    <div class="top">
      <div>
        ${isKn ? 'ಶಿಕ್ಷಣ - 80' : 'Education - 80'}<br>
        ${isKn ? 'ಟಿ.ಸಿ. ಸಂಖ್ಯೆ' : 'T.C. No.'}: <span class="dots">${esc(tc.tc_no)}</span><br>
        ${isKn ? 'ದಿನಾಂಕ' : 'Date'}: <span class="dots">${esc(tc.tc_issue_date)}</span>
      </div>
      <div class="center">
        ${isKn ? 'ಶಿಕ್ಷಣ ಇಲಾಖೆ - ಕರ್ನಾಟಕ ರಾಜ್ಯ' : 'EDUCATION DEPARTMENT - KARNATAKA STATE'}
        <img class="emblem" src="${KARNATAKA_EMBLEM}" alt="Karnataka State Emblem">
      </div>
      <div class="right">
        ${isKn ? 'ಪ್ರವೇಶ ದಾಖಲೆ ಸಂಖ್ಯೆ' : 'Admission Register No.'}: <span class="dots">${esc(student.admission_no)}</span><br>
        ${isKn ? 'ಶಾಲಾ UDISE ಕೋಡ್' : 'School UDISE Code'}: <span class="dots">${esc(school.udise)}</span><br>
        ${isKn ? 'ವಿದ್ಯಾರ್ಥಿ SATS ಸಂಖ್ಯೆ' : 'Student SATS No.'}: <span class="dots">${esc(student.sats_no || '-')}</span>
      </div>
    </div>
    <div class="title"><span>${esc(title)}</span></div>
    <div class="type">${isKn ? '(ಪ್ರಾಥಮಿಕ / ಪ್ರೌಢಶಾಲೆ / ಪದವಿಪೂರ್ವ / ಇತರೆ ಶಾಲೆಗಳು)' : '(Primary / High / Higher Secondary / Other Schools)'}</div>
    <div class="intro">${isKn ? 'ಕರ್ನಾಟಕ ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆಯ ನಿಯಮಾನುಸಾರ ನೀಡಲಾಗುವ ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರ' : 'Transfer Certificate issued in accordance with Karnataka School Education Department rules'}</div>
    <div class="table">${rows}</div>
    <div class="cert">
      <h3>${esc(certTitle)}</h3>
      <p>${esc(certText)}</p>
    </div>
    <div class="bottom">
      <div>
        <div class="note">${esc(onlineNote)}</div>
        <div class="sigonly">
          <div class="sig">${isKn ? 'ಮುಖ್ಯ ಶಿಕ್ಷಕರ ಸಹಿ ಮತ್ತು ಶಾಲಾ ಮೊಹರು' : 'Head Teacher Signature & School Seal'}</div>
        </div>
      </div>
      <div class="qr">
        <img id="qr" src="${qrUrl}" alt="QR">
        <div>${isKn ? 'QR ಪರಿಶೀಲನೆ' : 'QR Verification'}</div>
      </div>
    </div>
  </div>`;

  const css = `
    @page { size: A4 portrait; margin: 5mm !important; }
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0 !important; padding: 0 !important; }
    body { font-family: "Noto Sans Kannada", "Nirmala UI", Arial, sans-serif; color: #111; background: #fff; font-size: 10.35px; line-height: 1.12; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sheet { width: 100%; max-width: 200mm; height: 286mm; margin: auto; overflow: hidden; background: #fff; }
    .top { display: grid; grid-template-columns: 1fr 1.5fr 1.2fr; align-items: start; font-size: 9.4px; min-height: 16mm; }
    .top .center { text-align: center; font-weight: 700; font-size: 11.4px; }
    .top .emblem { display: block; width: 14mm; height: 12mm; object-fit: contain; margin: 2px auto 0; }
    .top .right { text-align: left; }
    .dots { border-bottom: 1px dotted #444; display: inline-block; min-width: 80px; height: 13px; vertical-align: bottom; }
    .title { text-align: center; margin: 0 0 1px; }
    .title span { display: inline-block; border: 1.4px solid #333; border-radius: 8px; padding: 2px 14px; font-size: 19px; font-weight: 800; }
    .type { text-align: center; font-size: 9px; margin: 1px 0; }
    .intro { text-align: center; font-size: 8.8px; margin: 1px 0 3px; }
    .table { border-left: 1.25px solid #333; border-top: 1.25px solid #333; }
    .orow { display: grid; grid-template-columns: 1fr 1fr; }
    .orow.one { grid-template-columns: 1fr; }
    .ocell { min-height: 5.15mm; border-right: 1.25px solid #333; border-bottom: 1.25px solid #333; padding: 2px 4px; display: flex; align-items: center; }
    .fld { display: flex; align-items: flex-end; gap: 5px; width: 100%; }
    .lbl { font-weight: 700; white-space: normal; }
    .ans { flex: 1; min-width: 20px; font-weight: 500; word-break: break-word; }
    .dobword { padding-top: 1px; margin-top: 1px; border-top: 1px dotted #999; width: 100%; }
    .cert { margin-top: 2px; text-align: center; }
    .cert h3 { margin: 0 0 1px; font-size: 11.5px; text-decoration: underline; }
    .cert p { margin: 0; text-align: justify; font-size: 8.8px; line-height: 1.12; }
    .bottom { display: grid; grid-template-columns: 1fr 39mm; gap: 9px; align-items: end; margin-top: 2.5mm; padding-top: 1px; }
    .qr { text-align: center; font-size: 7.8px; }
    .qr img { width: 24mm; height: 24mm; border: 1px solid #555; padding: 2px; display: block; margin: 0 auto 2px; }
    .note { font-size: 7.8px; text-align: justify; line-height: 1.1; }
    .sigonly { display: flex; justify-content: flex-end; margin-top: 4px; font-size: 9px; font-weight: 700; }
    .sig { width: 62mm; text-align: center; border-top: 1px solid #333; padding-top: 3px; }
    @media print {
      body { width: 210mm; height: 297mm; overflow: hidden; }
      .sheet { height: 286mm !important; }
    }
  `;

  if (!forDirectPrint) {
    return `<style>${css}</style>${bodyInner}`;
  }

  return `<!doctype html>
<html lang="${isKn ? 'kn' : 'en'}">
<head>
  <meta charset="utf-8">
  <title>${esc(title)} - ${esc(student.name)}</title>
  <style>${css}</style>
</head>
<body>
  ${bodyInner}
  <script>
    window.onload = function() {
      var q = document.getElementById("qr");
      function p() { setTimeout(function() { window.print(); }, 350); }
      if (q && !q.complete) { q.onload = p; q.onerror = p; setTimeout(p, 1200); } else { p(); }
    };
  </script>
</body>
</html>`;
}

export function printOfficialTransferCertificate(
  tc: TransferCertificate,
  student: Student,
  school: School,
  lang: 'kn' | 'en' = 'kn'
) {
  const html = getOfficialTransferCertificateHTML(tc, student, school, lang, true);
  openPrintWindow(lang === 'kn' ? 'ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರ' : 'Transfer Certificate', html);
}

/**
 * 2. BILINGUAL SCHOOL CONFIRMATION CERTIFICATE (STUDY CERTIFICATE) HTML GENERATOR
 * Stacks Kannada (top) and English (bottom) on single A4 page with individual QR codes.
 * Exact layout from githubversion.html (v105/v289)
 */
export function getOfficialBilingualCertificateHTML(
  student: Student,
  school: School,
  issueDate: string,
  place: string,
  certNo?: string,
  forDirectPrint = false
): string {
  const dateStr = issueDate || new Date().toISOString().split('T')[0];
  const placeStr = place || school.taluk || 'Karnataka';
  const cNo = certNo || `SC/${school.current_academic_year || '2026-27'}/${student.admission_no}`;

  const knDobWord = getDobInWords(student.dob, 'kn');
  const enDobWord = getDobInWords(student.dob, 'en');

  const knSchool = school.name_kannada || school.name;
  const enSchool = school.name;

  const knName = student.name_kannada || student.name;
  const enName = student.name;

  const knFather = student.father_name_kannada || student.father_name;
  const enFather = student.father_name;

  const knCaste = student.caste_kannada || student.caste || 'ಸಾಮಾನ್ಯ';
  const enCaste = student.caste || 'General';

  const knBirthPlace = student.place_of_birth_kannada || student.place_of_birth || school.taluk;
  const enBirthPlace = student.place_of_birth || school.taluk;

  const knPayload = [
    'ಶಾಲಾ ದೃಢೀಕರಣ ಪತ್ರ',
    `ಶಾಲೆ: ${knSchool}`,
    `UDISE: ${school.udise}`,
    `SATS: ${student.sats_no || ''}`,
    `PEN: ${student.pen_no || ''}`,
    `ವಿದ್ಯಾರ್ಥಿ: ${knName}`,
    `ತಂದೆ/ಪೋಷಕರು: ${knFather}`,
    `ಹುಟ್ಟಿದ ದಿನಾಂಕ: ${student.dob}`,
    `ಜನ್ಮಸ್ಥಳ: ${knBirthPlace}`,
    `ಜಾತಿ: ${knCaste}`,
    `ದಾಖಲಾತಿ ಸಂಖ್ಯೆ: ${student.admission_no}`,
    `ಸ್ಥಳ: ${placeStr}`,
    `ದಿನಾಂಕ: ${dateStr}`,
  ].join('\n');

  const enPayload = [
    'SCHOOL CONFIRMATION CERTIFICATE',
    `School: ${enSchool}`,
    `UDISE: ${school.udise}`,
    `SATS: ${student.sats_no || ''}`,
    `PEN: ${student.pen_no || ''}`,
    `Student: ${enName}`,
    `Father/Guardian: ${enFather}`,
    `Date of Birth: ${student.dob}`,
    `Place of Birth: ${enBirthPlace}`,
    `Caste: ${enCaste}`,
    `Admission No: ${student.admission_no}`,
    `Place: ${placeStr}`,
    `Date: ${dateStr}`,
  ].join('\n');

  const qrKn = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(knPayload)}`;
  const qrEn = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(enPayload)}`;

  const panel = (L: 'kn' | 'en', qrUrl: string) => {
    const isKn = L === 'kn';
    const title = isKn ? 'ಶಾಲಾ ದೃಢೀಕರಣ ಪತ್ರ' : 'SCHOOL CONFIRMATION CERTIFICATE';
    const sName = isKn ? knSchool : enSchool;
    const stName = isKn ? knName : enName;
    const fName = isKn ? knFather : enFather;
    const cName = isKn ? knCaste : enCaste;
    const bpName = isKn ? knBirthPlace : enBirthPlace;
    const dWord = isKn ? knDobWord : enDobWord;
    const statusText = isKn ? 'ವ್ಯಾಸಂಗ ಮಾಡುತ್ತಿದ್ದು' : 'currently studying';

    const bodyHtml = isKn
      ? `<p><b>ಶಾಲಾ/ಕಾಲೇಜು DISE/UDISE ಕೋಡ್ :</b> <span class="dots">${esc(school.udise)}</span></p>
         <p><b>ವಿದ್ಯಾರ್ಥಿ SATS ಸಂಖ್ಯೆ :</b> <span class="dots">${esc(student.sats_no || '-')}</span> &nbsp; <b>PEN ID ಸಂಖ್ಯೆ :</b> <span class="dots">${esc(student.pen_no || '-')}</span> &nbsp; <b>ಪ್ರಮಾಣ ಪತ್ರ ಸಂಖ್ಯೆ :</b> <span class="dots">${esc(cNo)}</span></p>
         <p><span class="dots wide">${esc(stName)}</span> ತಂದೆ <span class="dots wide">${esc(fName)}</span></p>
         <p>ಇವರು ಈ ಶಾಲೆಯಲ್ಲಿ <b>${statusText}</b>. ಶಾಲಾ ದಾಖಲಾತಿಯಲ್ಲಿ ಇವರ ಹುಟ್ಟಿದ ದಿನಾಂಕ <span class="dots">${esc(student.dob)}</span> (ಅಕ್ಷರಗಳಲ್ಲಿ <span class="dots wide">${esc(dWord)}</span>), ಜನ್ಮಸ್ಥಳ <span class="dots">${esc(bpName)}</span>, ಜಾತಿ <span class="dots">${esc(cName)}</span> ಹಾಗೂ ದಾಖಲಾತಿ ಸಂಖ್ಯೆ <span class="dots">${esc(student.admission_no)}</span> ಎಂದು ನಮೂದಿಸಲಾಗಿದ್ದು, ಈ ಮಾಹಿತಿಯು ಶಾಲಾ ದಾಖಲೆಗೆ ಅನುಗುಣವಾಗಿದೆ ಎಂದು ದೃಢೀಕರಿಸುತ್ತೇನೆ.</p>`
      : `<p><b>School/College DISE/UDISE Code:</b> <span class="dots">${esc(school.udise)}</span></p>
         <p><b>Student SATS No.:</b> <span class="dots">${esc(student.sats_no || '-')}</span> &nbsp; <b>PEN ID No.:</b> <span class="dots">${esc(student.pen_no || '-')}</span> &nbsp; <b>Certificate No.:</b> <span class="dots">${esc(cNo)}</span></p>
         <p><span class="dots wide">${esc(enName)}</span>, S/o / D/o <span class="dots wide">${esc(fName)}</span></p>
         <p>This is to certify that the above student is <b>${statusText}</b> in this school. As per the school admission records, the date of birth is <span class="dots">${esc(student.dob)}</span> (in words <span class="dots wide">${esc(dWord)}</span>), place of birth is <span class="dots">${esc(bpName)}</span>, caste is <span class="dots">${esc(cName)}</span>, and Admission No. is <span class="dots">${esc(student.admission_no)}</span>.</p>`;

    return `<section class="cert ${L}">
      <div class="school">${esc(sName)}</div>
      <div class="title">${title}</div>
      <div class="content">${bodyHtml}</div>
      <div class="metaAfter">
        <div>${isKn ? 'ಸ್ಥಳ' : 'Place'}: <span class="shortline">${esc(placeStr)}</span></div>
        <div>${isKn ? 'ದಿನಾಂಕ' : 'Date'}: <span class="shortline">${esc(dateStr)}</span></div>
      </div>
      <div class="certBottom">
        <div class="langQr">
          <img class="certQrImg" src="${qrUrl}" alt="QR">
          <div>${isKn ? 'ಕನ್ನಡ QR' : 'English QR'}</div>
        </div>
        <div class="signArea">
          <div class="signBlank"></div>
          <div class="sig">${isKn ? 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಸಹಿ ಮತ್ತು ಶಾಲಾ ಮೊಹರು' : 'Head Teacher Signature & School Seal'}</div>
        </div>
      </div>
    </section>`;
  };

  const bodyInner = `
  <div class="page">
    ${panel('kn', qrKn)}
    ${panel('en', qrEn)}
  </div>`;

  const css = `
    @page { size: A4 portrait; margin: 5mm !important; }
    * { box-sizing: border-box; }
    html, body { margin: 0 !important; padding: 0 !important; background: #fff; color: #111; font-family: "Noto Sans Kannada", "Nirmala UI", Arial, sans-serif; width: 100%; height: 100%; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 200mm; height: 286mm; margin: 0 auto; display: grid; grid-template-rows: 132mm 132mm 15mm; gap: 3mm; overflow: hidden; background: #fff; }
    .cert { border: 1.4px solid #333; border-radius: 7px; padding: 4.5mm 6mm 3.5mm; min-height: 0; overflow: hidden; display: flex; flex-direction: column; background: #fff; }
    .school { text-align: center; font-weight: 800; font-size: 15px; line-height: 1.18; margin: 0 0 1.5mm; }
    .title { text-align: center; font-weight: 800; font-size: 19px; text-decoration: underline; text-underline-offset: 3px; margin: 0 0 1.8mm; }
    .content { font-size: 11.8px; line-height: 1.5; text-align: justify; }
    .content p { margin: 1.2mm 0; }
    .dots { display: inline-block; min-width: 28mm; border-bottom: 1px dotted #333; text-align: center; padding: 0 2px; line-height: 1.15; font-weight: 600; }
    .dots.wide { min-width: 45mm; }
    .metaAfter { font-size: 10.8px; line-height: 1.5; margin-top: 1.5mm; display: flex; justify-content: space-between; }
    .shortline { display: inline-block; min-width: 28mm; border-bottom: 1px dotted #333; text-align: center; font-weight: 600; }
    .certBottom { margin-top: auto; display: grid; grid-template-columns: 24mm 1fr; gap: 4mm; align-items: end; min-height: 20mm; }
    .langQr { text-align: center; font-size: 6.5px; line-height: 1.05; align-self: end; }
    .certQrImg { width: 19mm; height: 19mm; border: 1px solid #777; padding: 1px; background: #fff; display: block; margin: 0 auto .4mm; }
    .signArea { margin-top: 0; display: flex; justify-content: flex-end; align-items: flex-end; height: 16mm; }
    .signBlank { flex: 1; }
    .sig { width: 60mm; font-weight: 700; text-align: center; font-size: 9.5px; border-top: 1px solid #333; padding-top: 3mm; }
    @media print {
      html, body { width: 210mm; height: 297mm; overflow: hidden; }
      .page { page-break-after: avoid !important; break-after: avoid-page !important; }
    }
  `;

  if (!forDirectPrint) {
    return `<style>${css}</style>${bodyInner}`;
  }

  return `<!doctype html>
<html lang="kn">
<head>
  <meta charset="utf-8">
  <title>Confirmation Certificate - ${esc(student.name)}</title>
  <style>${css}</style>
</head>
<body>
  ${bodyInner}
  <script>
    window.onload = function() {
      var imgs = Array.from(document.querySelectorAll(".certQrImg")), done = 0, printed = false;
      function p() { if (printed) return; printed = true; setTimeout(function() { window.print(); }, 400); }
      function one() { done++; if (done >= imgs.length) p(); }
      if (!imgs.length) { p(); return; }
      imgs.forEach(function(q) { if (q.complete) one(); else { q.onload = one; q.onerror = one; } });
      setTimeout(p, 1800);
    };
  </script>
</body>
</html>`;
}

export function printBilingualConfirmationCertificate(
  student: Student,
  school: School,
  issueDate: string,
  place: string,
  certNo?: string
) {
  const html = getOfficialBilingualCertificateHTML(student, school, issueDate, place, certNo, true);
  openPrintWindow('Bilingual Confirmation Certificate', html);
}

/**
 * 3. OFFICIAL CCE MARKS CARD / PROGRESS CARD HTML GENERATOR
 * Exact layout from githubversion.html (v243/v260/v289)
 */
export function getOfficialProgressCardHTML(
  student: Student,
  school: School,
  assessments: AssessmentRecord[],
  coCurricular: CoCurricularGradeRecord | undefined,
  lang: 'kn' | 'en' = 'kn',
  forDirectPrint = false
): string {
  const isKn = lang === 'kn';
  const c = student.class_number;
  const is910 = c >= 9;
  const subjects = getStandardSubjects(c);

  const schoolName = isKn ? (school.name_kannada || school.name) : school.name;
  const studentName = getStudentName(student, lang);
  const dobWords = getDobInWords(student.dob, lang);

  let grandTotal = 0;
  let grandMax = 0;
  let hasMarks = false;

  const rowsHtml = subjects.map((subj) => {
    const getM = (type: string) =>
      assessments.find((a) => a.subject_name === subj && a.assessment_type === type)?.total_marks ?? null;

    const fa1 = getM('FA1');
    const fa2 = getM('FA2');
    const sa1 = getM('SA1');
    const fa3 = getM('FA3');
    const fa4 = getM('FA4');
    const sa2 = getM('SA2');

    if (is910) {
      const isFirst = subj.toLowerCase().includes('first') || subj.toLowerCase().includes('1st') || subj === 'ಪ್ರಥಮ ಭಾಷೆ';
      const iaMax = isFirst ? 25 : 20;
      const saMax = isFirst ? 100 : 80;
      const termMax = isFirst ? 125 : 100;

      const halfReady = fa1 !== null && fa2 !== null && sa1 !== null;
      const annualReady = fa1 !== null && fa2 !== null && fa3 !== null && fa4 !== null && sa2 !== null;

      const ia1 = halfReady ? Number((((fa1! + fa2!) / 100) * iaMax).toFixed(2)) : null;
      const halfTotal = halfReady ? Number((sa1! + ia1!).toFixed(2)) : null;

      const ia2 = annualReady ? Number((((fa1! + fa2! + fa3! + fa4!) / 200) * iaMax).toFixed(2)) : null;
      const annualTotal = annualReady ? Number((sa2! + ia2!).toFixed(2)) : null;

      const fmt = (v: number | null) => (v === null ? '-' : Number(v).toFixed(1));
      const gfa = (v: number | null) => (v === null ? '-' : calculateGrade(v, 50, c));
      const gterm = (v: number | null) => (v === null ? '-' : calculateGrade(v, termMax, c));

      if ([fa1, fa2, sa1, fa3, fa4, sa2].some((v) => v !== null)) hasMarks = true;
      if (annualTotal !== null) {
        grandTotal += annualTotal;
        grandMax += termMax;
      }

      return `<tr>
        <td class="pc-subject">${esc(subj)}</td>
        <td>${fmt(fa1)}</td><td>${gfa(fa1)}</td>
        <td>${fmt(fa2)}</td><td>${gfa(fa2)}</td>
        <td>${sa1 === null ? '-' : `${fmt(sa1)} /${saMax}`}</td>
        <td>${ia1 === null ? '-' : `${fmt(ia1)} /${iaMax}`}</td>
        <td>${halfTotal === null ? '-' : `${fmt(halfTotal)} /${termMax}`}</td>
        <td>${gterm(halfTotal)}</td>
        <td>${fmt(fa3)}</td><td>${gfa(fa3)}</td>
        <td>${fmt(fa4)}</td><td>${gfa(fa4)}</td>
        <td>${sa2 === null ? '-' : `${fmt(sa2)} /${saMax}`}</td>
        <td>${ia2 === null ? '-' : `${fmt(ia2)} /${iaMax}`}</td>
        <td>${annualTotal === null ? '-' : `${fmt(annualTotal)} /${termMax}`}</td>
        <td>${gterm(annualTotal)}</td>
      </tr>`;
    } else {
      const ann = calculateAnnualMarks(c, subj, { fa1, fa2, sa1, fa3, fa4, sa2 });
      const maxSubj = getAnnualMaximumMarks(c, subj);
      if (ann !== null) {
        grandTotal += ann;
        grandMax += maxSubj;
        hasMarks = true;
      }

      const f = (m: number | null) => (m === null ? '-' : String(m));
      const g = (m: number | null, maxVal: number) => (m === null ? '-' : calculateGrade(m, maxVal, c));

      return `<tr>
        <td class="pc-subject">${esc(subj)}</td>
        <td>${f(fa1)}</td><td>${g(fa1, c <= 5 ? 15 : 10)}</td>
        <td>${f(fa2)}</td><td>${g(fa2, c <= 5 ? 15 : 10)}</td>
        <td>${f(sa1)}</td><td>${g(sa1, c <= 5 ? 20 : 30)}</td>
        <td>${f(fa3)}</td><td>${g(fa3, c <= 5 ? 15 : 10)}</td>
        <td>${f(fa4)}</td><td>${g(fa4, c <= 5 ? 15 : 10)}</td>
        <td>${f(sa2)}</td><td>${g(sa2, c <= 5 ? 20 : 30)}</td>
        <td><b>${f(ann)}</b></td><td><b>${g(ann, maxSubj)}</b></td>
      </tr>`;
    }
  }).join('');

  const overallGrade = hasMarks && grandMax > 0 ? calculateGrade(grandTotal, grandMax, c) : '-';
  const pct = grandMax > 0 && hasMarks ? (grandTotal / grandMax) * 100 : null;
  const resultText = pct === null
    ? (isKn ? 'ಅಪೂರ್ಣ' : 'Incomplete')
    : pct >= 35
    ? (isKn ? 'ಉತ್ತೀರ್ಣ (Pass)' : 'Passed')
    : (isKn ? 'ಸುಧಾರಣೆ ಅಗತ್ಯ' : 'Needs Improvement');

  const bodyInner = `
  <div class="pc-card">
    <h2>${esc(schoolName)}</h2>
    <h3>${isKn ? 'ಸಮಗ್ರ ಮತ್ತು ನಿರಂತರ ಮೌಲ್ಯಮಾಪನ — ಪ್ರಗತಿ ಪತ್ರ / MARKS CARD' : 'CONTINUOUS AND COMPREHENSIVE EVALUATION — PROGRESS CARD'}</h3>
    <div class="pc-meta">
      <div><b>UDISE:</b> ${esc(school.udise)}</div>
      <div><b>${isKn ? 'ಶೈಕ್ಷಣಿಕ ವರ್ಷ:' : 'Academic Year:'}</b> ${esc(student.academic_year || school.current_academic_year || '2026-27')}</div>
      <div><b>${isKn ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು:' : 'Student Name:'}</b> ${esc(studentName)}</div>
      <div><b>${isKn ? 'ತರಗತಿ / ವಿಭಾಗ:' : 'Class / Section:'}</b> ${student.class_number} / ${student.section}</div>
      <div><b>SATS No.:</b> ${esc(student.sats_no || '-')}</div>
      <div><b>PEN No.:</b> ${esc(student.pen_no || '-')}</div>
      <div><b>${isKn ? 'ಜನ್ಮ ದಿನಾಂಕ:' : 'Date of Birth:'}</b> ${esc(student.dob)}</div>
      <div><b>${isKn ? 'ಅಕ್ಷರಗಳಲ್ಲಿ:' : 'In Words:'}</b> ${esc(dobWords)}</div>
    </div>
    <div style="overflow-x:auto">
      <table class="pc-table ${is910 ? 'pc-table-910' : ''}">
        <thead>
          ${is910 ? `
            <tr>
              <th rowspan="2">${isKn ? 'ವಿಷಯ' : 'Subject'}</th>
              <th colspan="2">FA1</th>
              <th colspan="2">FA2</th>
              <th colspan="4">${isKn ? 'ಅರ್ಧವಾರ್ಷಿಕ ಪರೀಕ್ಷೆ (Term 1)' : 'Half Yearly Examination'}</th>
              <th colspan="2">FA3</th>
              <th colspan="2">FA4</th>
              <th colspan="4">${isKn ? 'ವಾರ್ಷಿಕ ಪರೀಕ್ಷೆ (Term 2)' : 'Annual Examination'}</th>
            </tr>
            <tr>
              <th>${isKn ? 'ಅಂಕ /50' : 'Marks /50'}</th><th>${isKn ? 'ಗ್ರೇಡ್' : 'Grade'}</th>
              <th>${isKn ? 'ಅಂಕ /50' : 'Marks /50'}</th><th>${isKn ? 'ಗ್ರೇಡ್' : 'Grade'}</th>
              <th>${isKn ? 'ಪರೀಕ್ಷೆ' : 'Exam'}</th><th>${isKn ? 'ಆಂತರಿಕ' : 'Internal'}</th><th>${isKn ? 'ಒಟ್ಟು' : 'Total'}</th><th>${isKn ? 'ಗ್ರೇಡ್' : 'Grade'}</th>
              <th>${isKn ? 'ಅಂಕ /50' : 'Marks /50'}</th><th>${isKn ? 'ಗ್ರೇಡ್' : 'Grade'}</th>
              <th>${isKn ? 'ಅಂಕ /50' : 'Marks /50'}</th><th>${isKn ? 'ಗ್ರೇಡ್' : 'Grade'}</th>
              <th>${isKn ? 'ಪರೀಕ್ಷೆ' : 'Exam'}</th><th>${isKn ? 'ಆಂತರಿಕ' : 'Internal'}</th><th>${isKn ? 'ಒಟ್ಟು' : 'Total'}</th><th>${isKn ? 'ಗ್ರೇಡ್' : 'Grade'}</th>
            </tr>
          ` : `
            <tr>
              <th rowspan="2">${isKn ? 'ವಿಷಯ' : 'Subject'}</th>
              <th colspan="2">FA1</th>
              <th colspan="2">FA2</th>
              <th colspan="2">SA1</th>
              <th colspan="2">FA3</th>
              <th colspan="2">FA4</th>
              <th colspan="2">SA2</th>
              <th colspan="2">${isKn ? 'ವಾರ್ಷಿಕ ಒಟ್ಟು' : 'Annual Total'}</th>
            </tr>
            <tr>
              <th>${isKn ? 'ಅಂಕ' : 'Marks'}</th><th>Grade</th>
              <th>${isKn ? 'ಅಂಕ' : 'Marks'}</th><th>Grade</th>
              <th>${isKn ? 'ಅಂಕ' : 'Marks'}</th><th>Grade</th>
              <th>${isKn ? 'ಅಂಕ' : 'Marks'}</th><th>Grade</th>
              <th>${isKn ? 'ಅಂಕ' : 'Marks'}</th><th>Grade</th>
              <th>${isKn ? 'ಅಂಕ' : 'Marks'}</th><th>Grade</th>
              <th>${isKn ? 'ಅಂಕ' : 'Marks'}</th><th>Grade</th>
            </tr>
          `}
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
    <div class="pc-summary">
      <div><b>${isKn ? 'ಒಟ್ಟು ಅಂಕಗಳು:' : 'Grand Total:'}</b> ${hasMarks ? Number(grandTotal.toFixed(1)) : '-'} / ${grandMax}</div>
      <div><b>${isKn ? 'ಸಮಗ್ರ ಗ್ರೇಡ್:' : 'Overall Grade:'}</b> ${overallGrade}</div>
      <div><b>${isKn ? 'ಶೇಕಡಾವಾರು:' : 'Percentage:'}</b> ${pct !== null ? `${pct.toFixed(1)}%` : '-'}</div>
      <div><b>${isKn ? 'ಫಲಿತಾಂಶ:' : 'Result:'}</b> ${resultText}</div>
    </div>
    <div class="pc-sign">
      <span>${isKn ? 'ತರಗತಿ ಶಿಕ್ಷಕರ ಸಹಿ' : 'Class Teacher Signature'}</span>
      <span>${isKn ? 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಸಹಿ ಮತ್ತು ಮೊಹರು' : 'Head Teacher Signature & School Seal'}</span>
    </div>
  </div>`;

  const css = `
    @page { size: A4 portrait; margin: 7mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #111; font-family: "Noto Sans Kannada", "Nirmala UI", Arial, sans-serif; }
    body { width: 100%; height: 283mm; max-height: 283mm; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pc-card { width: 190mm; max-width: 190mm; min-height: 278mm; height: 278mm; max-height: 278mm; margin: 0 auto; border: 1.2px solid #555; padding: 4.5mm 4.5mm 18mm; display: flex; flex-direction: column; overflow: hidden; position: relative; background: #fff; }
    .pc-card > h2 { text-align: center; width: 100%; margin: 0 0 1mm; font-size: 15px; line-height: 1.1; font-weight: 800; }
    .pc-card > h3 { text-align: center; width: 100%; margin: 0 0 2mm; font-size: 13.5px; font-weight: 700; color: #1e3a8a; }
    .pc-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5mm 6mm; margin: 1mm 0 2.5mm; font-size: 11px; line-height: 1.25; border: 1px solid #94a3b8; padding: 2mm 3mm; border-radius: 4px; background: #f8fafc; }
    .pc-meta b { font-weight: 700; }
    table, .pc-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 10.5px; }
    th, td, .pc-table th, .pc-table td { border: 1px solid #64748b; padding: 3.5mm 0.45mm; text-align: center; vertical-align: middle; line-height: 1.15; word-break: break-word; }
    .pc-table th { background: #f1f5f9; font-weight: 700; }
    .pc-table th:first-child, .pc-table td:first-child { width: 20%; text-align: left; padding-left: 2mm; }
    .pc-subject { font-weight: 700; }
    .pc-table-910 { font-size: 7.2px !important; }
    .pc-table-910 th, .pc-table-910 td { padding: 2.2mm 0.15mm !important; font-size: 7.2px !important; line-height: 1.1 !important; }
    .pc-table-910 th:first-child, .pc-table-910 td:first-child { width: 16% !important; }
    .pc-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5mm 6mm; margin-top: 2.5mm; padding: 2mm 3mm; font-size: 11px; font-weight: 700; border: 1px solid #94a3b8; border-radius: 4px; background: #f8fafc; }
    .pc-sign { display: flex; justify-content: space-between; position: absolute; left: 4.5mm; right: 4.5mm; bottom: 4.5mm; margin: 0; padding-top: 2mm; font-size: 11px; font-weight: 700; background: #fff; border-top: 1px solid #64748b; }
    @media print {
      body { width: 210mm; height: 297mm; overflow: hidden; }
      .pc-card { height: 278mm !important; }
    }
  `;

  if (!forDirectPrint) {
    return `<style>${css}</style>${bodyInner}`;
  }

  return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Marks Card - ${esc(student.name)}</title>
  <style>${css}</style>
</head>
<body>
  ${bodyInner}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`;
}

export function printOfficialProgressCard(
  student: Student,
  school: School,
  assessments: AssessmentRecord[],
  coCurricular: CoCurricularGradeRecord | undefined,
  lang: 'kn' | 'en' = 'kn'
) {
  const html = getOfficialProgressCardHTML(student, school, assessments, coCurricular, lang, true);
  openPrintWindow('CCE Progress Card', html);
}

/**
 * 4. OFFICIAL TEACHER / ASSESSMENT-WISE CONSOLIDATED REPORT
 * Formatted with 18 students per page pagination, A4 landscape print layout,
 * and official Karnataka CCE headers.
 */
export function printConsolidatedReport(
  school: School,
  classNum: number,
  section: string,
  assessment: string,
  academicYear: string,
  students: Student[],
  subjects: string[],
  getStudentSummary: (studentId: string) => {
    subjectMarks: Record<string, { marks: number; grade: string }>;
    totalMarks: number;
    maxPossibleMarks: number;
    percentage: number;
    overallGrade: string;
    result: string;
  },
  lang: 'kn' | 'en' = 'kn'
) {
  const isKn = lang === 'kn';
  const schoolName = isKn ? (school.name_kannada || school.name) : school.name;
  const title = isKn
    ? `${assessment} ಕ್ರೂಡೀಕೃತ ವರದಿ — ತರಗತಿ ${classNum}-${section} (${academicYear})`
    : `${assessment} Consolidated Evaluation Register — Class ${classNum}-${section} (${academicYear})`;

  const PER_PAGE = 18;
  const pages: string[] = [];

  for (let i = 0; i < students.length; i += PER_PAGE) {
    const pageStudents = students.slice(i, i + PER_PAGE);
    const rowsHtml = pageStudents.map((st, idx) => {
      const sIndex = i + idx + 1;
      const sum = getStudentSummary(st.id);
      const stName = getStudentName(st, lang);

      const subjCells = subjects.map((sub) => {
        const m = sum.subjectMarks[sub];
        return `<td>${m ? m.marks : '-'}</td><td>${m ? m.grade : '-'}</td>`;
      }).join('');

      return `<tr>
        <td>${sIndex}</td>
        <td class="name-cell">${esc(stName)}<div class="sats-cell">SATS: ${esc(st.sats_no || '-')}</div></td>
        ${subjCells}
        <td class="bold-cell">${sum.totalMarks}</td>
        <td>${sum.percentage ? `${sum.percentage.toFixed(1)}%` : '-'}</td>
        <td class="bold-cell">${sum.overallGrade}</td>
        <td>${sum.result}</td>
      </tr>`;
    }).join('');

    const subjHeaders = subjects.map((sub) => `<th colspan="2">${esc(sub.split(' ')[0])}</th>`).join('');
    const subSubjHeaders = subjects.map(() => `<th>${isKn ? 'ಅಂಕ' : 'M'}</th><th>${isKn ? 'ಗ್ರೇಡ್' : 'G'}</th>`).join('');

    pages.push(`
      <div class="sheet-landscape">
        <div class="report-header">
          <h2>${esc(schoolName)}</h2>
          <h3>${esc(title)}</h3>
          <div class="meta-row">
            <span>UDISE: <b>${esc(school.udise)}</b></span>
            <span>${isKn ? 'ಹಾಜರಾತಿ' : 'Enrolled'}: <b>${students.length}</b></span>
            <span>${isKn ? 'ಪುಟ' : 'Page'}: <b>${Math.floor(i / PER_PAGE) + 1} / ${Math.ceil(students.length / PER_PAGE) || 1}</b></span>
          </div>
        </div>
        <table class="report-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 28px;">#</th>
              <th rowspan="2" style="width: 140px;">${isKn ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು' : 'Student Name'}</th>
              ${subjHeaders}
              <th rowspan="2">${isKn ? 'ಒಟ್ಟು' : 'Total'}</th>
              <th rowspan="2">%</th>
              <th rowspan="2">${isKn ? 'ಗ್ರೇಡ್' : 'Grade'}</th>
              <th rowspan="2">${isKn ? 'ಫಲಿತಾಂಶ' : 'Result'}</th>
            </tr>
            <tr>
              ${subSubjHeaders}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="report-footer">
          <span>${isKn ? 'ವಿಷಯ ಶಿಕ್ಷಕರ ಸಹಿ' : 'Subject Teacher Signature'}</span>
          <span>${isKn ? 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಸಹಿ' : 'Head Teacher Signature'}</span>
        </div>
      </div>
    `);
  }

  const html = `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${esc(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 6mm; }
    * { box-sizing: border-box; }
    body { font-family: "Noto Sans Kannada", "Nirmala UI", Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #111; }
    .sheet-landscape { width: 285mm; min-height: 195mm; page-break-after: always; padding: 4mm; display: flex; flex-direction: column; justify-content: space-between; }
    .sheet-landscape:last-child { page-break-after: avoid; }
    .report-header { text-align: center; margin-bottom: 3mm; border-bottom: 1.5px solid #333; padding-bottom: 2mm; }
    .report-header h2 { margin: 0 0 1mm; font-size: 15px; font-weight: 800; text-transform: uppercase; }
    .report-header h3 { margin: 0 0 1.5mm; font-size: 13px; font-weight: 700; color: #1e3a8a; }
    .meta-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: 600; padding: 0 4mm; }
    table.report-table { width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed; }
    table.report-table th, table.report-table td { border: 1px solid #555; padding: 2.2mm 1mm; text-align: center; vertical-align: middle; }
    table.report-table th { background: #f1f5f9; font-weight: 700; }
    .name-cell { text-align: left !important; padding-left: 2mm !important; font-weight: 700; }
    .sats-cell { font-size: 7.5px; font-weight: normal; color: #475569; }
    .bold-cell { font-weight: 700; }
    .report-footer { display: flex; justify-content: space-between; margin-top: 4mm; padding-top: 2mm; font-size: 11px; font-weight: 700; border-top: 1px solid #64748b; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${pages.join('')}
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 350); };
  </script>
</body>
</html>`;

  openPrintWindow('Consolidated Report', html);
}

/**
 * 5. MARKS ENTRY REGISTER PRINT / PDF TEMPLATE
 * Matches exportMarksEntryPDF from githubversion.html
 * Renders the full entered marks sheet with component marks, totals, grades, and signatures.
 */
export function printMarksEntryRegister(
  school: School,
  classNum: number,
  section: string,
  subject: string,
  assessment: string,
  academicYear: string,
  students: Student[],
  headers: string[],
  rowsData: (string | number)[][],
  lang: 'kn' | 'en' = 'kn'
) {
  const isKn = lang === 'kn';
  const schoolName = isKn ? (school.name_kannada || school.name) : school.name;
  const title = isKn
    ? `${assessment} ಅಂಕ ನಮೂದು ವಹಿ — ತರಗತಿ ${classNum}-${section} (${subject})`
    : `${assessment} Marks Entry Register — Class ${classNum}-${section} (${subject})`;

  const thHtml = headers.map((h) => `<th>${esc(h)}</th>`).join('');
  const trHtml = rowsData.map((row) => {
    const tdHtml = row.map((cell, idx) => {
      const isName = idx === 1;
      return `<td class="${isName ? 'text-left' : ''}">${esc(cell)}</td>`;
    }).join('');
    return `<tr>${tdHtml}</tr>`;
  }).join('');

  const html = `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${esc(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 6mm; }
    * { box-sizing: border-box; }
    body { font-family: "Noto Sans Kannada", "Nirmala UI", Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #111; }
    .sheet-landscape { width: 285mm; min-height: 195mm; padding: 4mm; display: flex; flex-direction: column; justify-content: space-between; margin: auto; }
    .report-header { text-align: center; margin-bottom: 3mm; border-bottom: 1.5px solid #333; padding-bottom: 2mm; }
    .report-header h2 { margin: 0 0 1mm; font-size: 15px; font-weight: 800; text-transform: uppercase; }
    .report-header h3 { margin: 0 0 1.5mm; font-size: 13px; font-weight: 700; color: #1e3a8a; }
    .meta-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: 600; padding: 0 4mm; }
    table.marks-table { width: 100%; border-collapse: collapse; font-size: 9.5px; table-layout: auto; margin-top: 2mm; }
    table.marks-table th, table.marks-table td { border: 1px solid #555; padding: 2.5mm 1.5mm; text-align: center; vertical-align: middle; }
    table.marks-table th { background: #f1f5f9; font-weight: 700; }
    .text-left { text-align: left !important; padding-left: 3mm !important; font-weight: 700; }
    .report-footer { display: flex; justify-content: space-between; margin-top: 6mm; padding-top: 3mm; font-size: 11px; font-weight: 700; border-top: 1px solid #64748b; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="sheet-landscape">
    <div class="report-header">
      <h2>${esc(schoolName)}</h2>
      <h3>${esc(title)}</h3>
      <div class="meta-row">
        <span>UDISE: <b>${esc(school.udise)}</b></span>
        <span>${isKn ? 'ಶೈಕ್ಷಣಿಕ ವರ್ಷ' : 'Academic Year'}: <b>${esc(academicYear)}</b></span>
        <span>${isKn ? 'ಒಟ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು' : 'Total Students'}: <b>${students.length}</b></span>
      </div>
    </div>
    <table class="marks-table">
      <thead>
        <tr>${thHtml}</tr>
      </thead>
      <tbody>
        ${trHtml}
      </tbody>
    </table>
    <div class="report-footer">
      <span>${isKn ? 'ವಿಷಯ ಶಿಕ್ಷಕರ ಸಹಿ' : 'Subject Teacher Signature'}</span>
      <span>${isKn ? 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಸಹಿ ಮತ್ತು ಮೊಹರು' : 'Head Teacher Signature & Seal'}</span>
    </div>
  </div>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 350); };
  </script>
</body>
</html>`;

  openPrintWindow('Marks Entry Register', html);
}
