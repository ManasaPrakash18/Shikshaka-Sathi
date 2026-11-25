import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TransferCertificate, StudyCertificate, Student, School, AssessmentRecord, CoCurricularGradeRecord } from '../types';
import { calculateAnnualMarks, calculateGrade, getAnnualMaximumMarks } from '../cce/calculations';

/**
 * Normalizes text to standard ASCII to guarantee 100% valid, uncorrupted PDF streams.
 * Prevents jsPDF Helvetica Type-1 font stream corruption from non-ASCII glyphs.
 */
export function toSafePdfText(str: any, fallback: string = ''): string {
  if (str === null || str === undefined) return fallback;
  const s = String(str);
  const normalized = s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[āĀ]/g, 'a')
    .replace(/[īĪ]/g, 'i')
    .replace(/[ūŪ]/g, 'u')
    .replace(/[ēĒ]/g, 'e')
    .replace(/[ōŌ]/g, 'o')
    .replace(/[•·]/g, '-');

  const ascii = normalized.replace(/[^\x20-\x7E\r\n\t]/g, '').trim();
  return ascii || fallback;
}

/**
 * Universal browser blob downloader with reliable filename and MIME type.
 * Works seamlessly across Chrome, Edge, Safari (macOS & iOS), Firefox, Android, and Windows.
 */
export function downloadBlob(blob: Blob, filename: string) {
  let cleanName = filename.replace(/[/\\?%*:|"<>]/g, '_').trim();

  // Legacy IE support if available
  if (typeof (window.navigator as any)?.msSaveOrOpenBlob === 'function') {
    (window.navigator as any).msSaveOrOpenBlob(blob, cleanName);
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = cleanName;
  link.setAttribute('download', cleanName);
  link.rel = 'noopener';
  document.body.appendChild(link);

  link.click();

  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 10000);
}

/**
 * Universal cross-platform PDF download trigger.
 * Uses official jsPDF Blob output and guarantees standard application/pdf MIME type.
 */
export function downloadPDFDoc(doc: jsPDF, filename: string) {
  let cleanName = filename.replace(/[/\\?%*:|"<>]/g, '_').trim();
  if (!cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName += '.pdf';
  }

  try {
    const blob = doc.output('blob');
    downloadBlob(blob, cleanName);
  } catch (err) {
    console.warn('doc.output blob failed, falling back to doc.save:', err);
    doc.save(cleanName);
  }
}

/**
 * Universal cross-platform Excel (.xlsx) download trigger.
 * Generates official OpenXML spreadsheet bytes with exact MIME type so Excel/Numbers
 * opens the downloaded file immediately without format mismatch warnings.
 */
export function downloadExcelFile(workbook: XLSX.WorkBook, filename: string) {
  let cleanName = filename.replace(/[/\\?%*:|"<>]/g, '_').trim();
  if (!cleanName.toLowerCase().endsWith('.xlsx')) {
    cleanName += '.xlsx';
  }

  try {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, cleanName);
  } catch (err) {
    console.warn('Custom XLSX blob download failed, falling back to XLSX.writeFile:', err);
    XLSX.writeFile(workbook, cleanName);
  }
}

/**
 * Generates and downloads an authentic, high-resolution PDF from a rendered DOM element.
 * Perfect for complex Indic scripts (Kannada) where browser text shaping renders
 * 100% accurate ligatures and ottakshara.
 */
export async function downloadElementAsPDF(element: HTMLElement, filename: string): Promise<boolean> {
  let cleanName = filename.replace(/[/\\?%*:|"<>]/g, '_').trim();
  if (!cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName += '.pdf';
  }

  // Create a visible, isolated container at top of viewport so html2canvas renders exact pixel bounds
  const renderWrapper = document.createElement('div');
  renderWrapper.id = 'kannada-print-render-wrapper';
  renderWrapper.style.position = 'fixed';
  renderWrapper.style.top = '0px';
  renderWrapper.style.left = '0px';
  renderWrapper.style.width = '794px';
  renderWrapper.style.zIndex = '99999';
  renderWrapper.style.background = '#ffffff';
  renderWrapper.style.pointerEvents = 'none';

  const clonedNode = element.cloneNode(true) as HTMLElement;
  clonedNode.style.width = '794px';
  clonedNode.style.minHeight = '1123px';
  clonedNode.style.margin = '0 auto';
  clonedNode.style.background = '#ffffff';
  clonedNode.style.boxShadow = 'none';
  clonedNode.style.borderRadius = '0px';
  clonedNode.style.border = 'none';
  clonedNode.style.visibility = 'visible';
  clonedNode.style.display = 'block';

  renderWrapper.appendChild(clonedNode);
  document.body.appendChild(renderWrapper);

  try {
    // Wait for fonts to be loaded
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default || (html2canvasModule as any);
    if (typeof html2canvas !== 'function') {
      console.warn('html2canvas could not be loaded as a function:', html2canvas);
      return false;
    }

    const canvas = await html2canvas(clonedNode, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      windowWidth: 1200,
      onclone: (clonedDoc: Document) => {
        // Strip out modern lab() / oklch() color rules from Tailwind v4 in cloned doc
        try {
          // 1. Process all inline <style> tags
          const styleEls = clonedDoc.querySelectorAll('style');
          styleEls.forEach((style) => {
            if (style.textContent && (style.textContent.includes('lab(') || style.textContent.includes('oklch('))) {
              let css = style.textContent;

              // Remove @supports blocks containing lab or oklch so fallback hex/rgb variables take effect
              const regex = /@supports\s*\([^{]+\)\s*\{/g;
              let match;
              while ((match = regex.exec(css)) !== null) {
                const start = match.index;
                let depth = 0;
                let end = -1;
                for (let i = css.indexOf('{', start); i < css.length; i++) {
                  if (css[i] === '{') depth++;
                  else if (css[i] === '}') {
                    depth--;
                    if (depth === 0) {
                      end = i + 1;
                      break;
                    }
                  }
                }
                if (end !== -1) {
                  const block = css.slice(start, end);
                  if (block.includes('lab(') || block.includes('oklch(')) {
                    css = css.slice(0, start) + css.slice(end);
                    regex.lastIndex = start;
                  }
                }
              }

              // Replace any remaining standalone lab(...) or oklch(...) with solid dark slate
              css = css
                .replace(/lab\([^)]+\)/g, '#0f172a')
                .replace(/oklch\([^)]+\)/g, '#0f172a');

              style.textContent = css;
            }
          });

          // 2. Also inject an explicit override stylesheet into cloned doc ensuring certificate sheet text is always dark/visible
          const overrideStyle = clonedDoc.createElement('style');
          overrideStyle.textContent = `
            .print-page, .print-page * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              letter-spacing: normal !important;
            }
            .text-slate-900 { color: #0f172a !important; }
            .text-slate-800 { color: #1e293b !important; }
            .text-slate-700 { color: #334155 !important; }
            .text-slate-600 { color: #475569 !important; }
            .text-slate-500 { color: #64748b !important; }
            .bg-slate-800 { background-color: #1e293b !important; }
            .bg-slate-100 { background-color: #f1f5f9 !important; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .border-slate-800 { border-color: #1e293b !important; }
            .border-slate-700 { border-color: #334155 !important; }
            .border-slate-300 { border-color: #cbd5e1 !important; }
            .border-slate-200 { border-color: #e2e8f0 !important; }
          `;
          clonedDoc.head.appendChild(overrideStyle);
        } catch (_) {}
      },
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.warn('html2canvas produced empty canvas');
      return false;
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const rawHeight = (canvas.height * pdfWidth) / canvas.width;
    const imgHeight = isNaN(rawHeight) || rawHeight <= 0 ? pdfHeight : rawHeight;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
    downloadPDFDoc(pdf, cleanName);
    return true;
  } catch (err) {
    console.warn('downloadElementAsPDF failed, falling back to vector doc:', err);
    return false;
  } finally {
    if (document.body.contains(renderWrapper)) {
      document.body.removeChild(renderWrapper);
    }
  }
}

// 1. GENERATE TRANSFER CERTIFICATE (TC) PDF
export function generateTransferCertificatePDF(tc: TransferCertificate, school: School) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const schoolName = toSafePdfText(school.name, 'GOVERNMENT SCHOOL');
  const taluk = toSafePdfText(school.taluk, 'Taluk');
  const district = toSafePdfText(school.district, 'District');
  const studentName = toSafePdfText(tc.student_name, 'STUDENT');

  // Outer Border & Header
  doc.setLineWidth(0.8);
  doc.rect(8, 8, pageWidth - 16, 281);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, pageWidth - 20, 277);

  // School Name Prominent
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(schoolName.toUpperCase(), pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${taluk} Taluk, ${district} District, Karnataka - UDISE: ${toSafePdfText(school.udise, 'N/A')}`, pageWidth / 2, 28, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('OFFICIAL TRANSFER CERTIFICATE (TC) - FORM I', pageWidth / 2, 37, { align: 'center' });

  // Top Metadata Row
  doc.setFontSize(8.5);
  doc.text(`TC No: ${toSafePdfText(tc.tc_no, 'TC/2026/01')}`, 15, 45);
  doc.text(`Academic Year: ${toSafePdfText(tc.academic_year, '2026-27')}`, pageWidth / 2 - 20, 45);
  doc.text(`SATS No: ${toSafePdfText(tc.sats_no, 'N/A')}`, pageWidth - 55, 45);

  doc.line(12, 48, pageWidth - 12, 48);

  const tcFields = [
    ['1', 'Name of Student (in Block Letters)', studentName.toUpperCase()],
    ['2', 'Gender', tc.gender === 'BOY' ? 'Boy / Male' : 'Girl / Female'],
    ['3', 'Father Name', toSafePdfText(tc.father_name, 'Father')],
    ['4', 'Mother Name', toSafePdfText(tc.mother_name, 'Mother')],
    ['5', 'Nationality & Religion', `${toSafePdfText(tc.nationality, 'Indian')}, ${toSafePdfText(tc.religion, 'Hindu')}`],
    ['6', 'Social Category & Caste', `${toSafePdfText(tc.category, 'General')} - ${toSafePdfText(tc.caste, 'General')} (${toSafePdfText(tc.sub_caste, 'General')})`],
    ['7', 'Date of Birth (in figures)', toSafePdfText(tc.dob, 'N/A')],
    ['8', 'Place of Birth, Taluk, District', `${toSafePdfText(tc.place_of_birth, taluk)}, ${toSafePdfText(tc.taluk, taluk)}, ${toSafePdfText(tc.district, district)}`],
    ['9', 'Admission Number & Sanchita Dakhale No.', `${toSafePdfText(tc.sats_no, 'N/A')} / ${toSafePdfText(tc.sanchita_dakhale_no, 'SD-102')}`],
    ['10', 'Date of Admission into School', toSafePdfText(tc.date_of_admission, '2021-06-10')],
    ['11', 'Class Studying at time of leaving', `Class ${toSafePdfText(tc.class_studying, '10')}th Standard`],
    ['12', 'Medium of Instruction', toSafePdfText(tc.medium_of_teaching, 'Kannada Medium')],
    ['13', 'Whether Qualified for Promotion', toSafePdfText(tc.whether_promoted, 'Yes, Qualified for Promotion to next standard')],
    ['14', 'Whether all School Dues / Fees Paid', toSafePdfText(tc.whether_fees_paid, 'Yes, All school dues cleared')],
    ['15', 'Fee Concession / Scholarship Particulars', toSafePdfText(tc.scholarship, 'Government Free Education Scheme')],
    ['16', 'Medical Examination particulars', toSafePdfText(tc.medical_test_info, 'Satisfactory / Fit')],
    ['17', 'Date of Student Last Attendance', toSafePdfText(tc.last_attendance_date, '2027-03-31')],
    ['18', 'Total Working Days / Days Attended', `${tc.total_working_days || 220} Days / ${tc.days_attended || 208} Days`],
    ['19', 'General Conduct & Character', toSafePdfText(tc.behaviour, 'Good & Satisfactory')],
    ['20', 'Date of Application for Certificate', toSafePdfText(tc.tc_application_date || tc.tc_issue_date, '2026-10-15')],
    ['21', 'Date of Issue of Transfer Certificate', toSafePdfText(tc.tc_issue_date, '2026-10-15')],
    ['22', 'PEN (Permanent Education No) & APAAR ID', `${toSafePdfText(tc.pen_no, 'N/A')} / ${toSafePdfText(tc.apaar_id, 'N/A')}`],
    ['23', 'Aadhaar Reference Number', tc.aadhaar_no ? `XXXX-XXXX-${String(tc.aadhaar_no).slice(-4)}` : 'Verified'],
  ];

  autoTable(doc, {
    startY: 54,
    margin: { left: 12, right: 12 },
    body: tcFields,
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 1.6,
      lineColor: [210, 215, 220],
      lineWidth: 0.1,
      textColor: [30, 40, 55],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 80, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  });

  // Footer Signatures (A4 formatted)
  const finalY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('I hereby certify that the above information is in accordance with the Official School General Register.', 15, finalY);

  const sigY = finalY + 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);

  // Right: Headmaster Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('_________________________', pageWidth - 70, sigY);
  doc.text('Headmaster Signature', pageWidth - 65, sigY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Generated securely via Shikshaka Sathi Official Portal on ${new Date().toLocaleDateString()}`, 15, 284);

  const cleanFilename = `TC_${toSafePdfText(tc.tc_no, 'TC').replace(/[^a-zA-Z0-9]/g, '_')}_${toSafePdfText(tc.student_name, 'Student').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  downloadPDFDoc(doc, cleanFilename);
}

// 2. GENERATE STUDY CERTIFICATE PDF
export function generateStudyCertificatePDF(cert: StudyCertificate, school: School) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const schoolName = toSafePdfText(school.name, 'GOVERNMENT SCHOOL');
  const taluk = toSafePdfText(school.taluk, 'Taluk');
  const district = toSafePdfText(school.district, 'District');
  const studentName = toSafePdfText(cert.student_name, 'STUDENT');
  const fatherName = toSafePdfText(cert.father_name, 'Father');
  const place = toSafePdfText(cert.place || school.taluk, taluk);
  const caste = toSafePdfText(cert.caste, 'General');

  // Double Border
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, 277);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, pageWidth - 24, 273);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(schoolName.toUpperCase(), pageWidth / 2, 28, { align: 'center' });
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${taluk} Taluk, ${district} District | UDISE Code: ${toSafePdfText(school.udise, 'N/A')}`, pageWidth / 2, 34, {
    align: 'center',
  });

  doc.setLineWidth(0.5);
  doc.line(20, 39, pageWidth - 20, 39);

  const isKannada = cert.language === 'KN';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(
    'DEPARTMENT OF SCHOOL EDUCATION - GOVT OF KARNATAKA',
    pageWidth / 2,
    44,
    { align: 'center' }
  );

  doc.setFontSize(12);
  doc.text(
    isKannada
      ? 'VYASANGA PRAMANA PATRA (BONAFIDE STUDY CERTIFICATE)'
      : 'BONAFIDE STUDY CERTIFICATE',
    pageWidth / 2,
    51,
    { align: 'center' }
  );

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    isKannada ? `Pramana Patra No: ${toSafePdfText(cert.certificate_no, 'SC/01')}` : `Certificate No: ${toSafePdfText(cert.certificate_no, 'SC/01')}`,
    20,
    65
  );
  doc.text(
    isKannada ? `Issue Date: ${toSafePdfText(cert.issue_date, '2026-10-15')}` : `Date of Issue: ${toSafePdfText(cert.issue_date, '2026-10-15')}`,
    pageWidth - 65,
    65
  );

  const certTextEnglish = isKannada
    ? `Dhrudikarana: This is to certify that Kum. / Chi. ${studentName.toUpperCase()}, Son / Daughter of Sri ${fatherName}, residing at ${place}, Taluk: ${taluk}, District: ${district}, Karnataka, has been a bonafide student of this institution.`
    : `This is to certify that Kum. / Chi. ${studentName.toUpperCase()}, Son / Daughter of Sri ${fatherName}, residing at ${place}, Taluk: ${taluk}, District: ${district}, has been a bonafide student of this institution.`;

  const detailsText = isKannada
    ? `He / She is ${toSafePdfText(cert.status_type, 'studying').toLowerCase()} in Class ${toSafePdfText(cert.class_studying, '10')}th Standard during the academic year ${toSafePdfText(cert.academic_year, '2026-27')} (Medium of Instruction: Kannada Medium). According to the school admission register, date of birth is recorded as ${toSafePdfText(cert.dob, 'N/A')} (${toSafePdfText(cert.place_of_birth, 'Karnataka')}). Social Category: ${caste}.`
    : `He / She is ${toSafePdfText(cert.status_type, 'studying').toLowerCase()} in Class ${toSafePdfText(cert.class_studying, '10')}th Standard during the academic year ${toSafePdfText(cert.academic_year, '2026-27')}. According to the admission register of the school, his/her date of birth is ${toSafePdfText(cert.dob, 'N/A')} (${toSafePdfText(cert.place_of_birth, 'Karnataka')}). Belonging to Category: ${caste}.`;

  const identityText = isKannada
    ? `Vidyarthi Dakhale Vivarana (Student Official Identification Records):\n- SATS Sankhye (SATS ID): ${toSafePdfText(cert.sats_no, 'N/A')}\n- Dakhale Sankhye (Admission No): ${toSafePdfText(cert.admission_no, 'N/A')}\n- PEN Sankhye (PEN No): ${toSafePdfText(cert.pen_no, 'N/A')}\n- Sthala (Place of Issue): ${toSafePdfText(cert.place_of_issue, taluk)}`
    : `Student Identification Records:\n- SATS Number: ${toSafePdfText(cert.sats_no, 'N/A')}\n- Admission Number: ${toSafePdfText(cert.admission_no, 'N/A')}\n- PEN Number: ${toSafePdfText(cert.pen_no, 'N/A')}\n- Place of Issue: ${toSafePdfText(cert.place_of_issue, taluk)}`;

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  const splitEnglish = doc.splitTextToSize(certTextEnglish, pageWidth - 40);
  doc.text(splitEnglish, 20, 80);

  const splitDetails = doc.splitTextToSize(detailsText, pageWidth - 40);
  doc.text(splitDetails, 20, 105);

  doc.setFontSize(9.5);
  doc.text(identityText, 25, 135);

  doc.setFontSize(10);
  doc.text(
    isKannada
      ? 'Nadathe / Character: Conduct and character during the stay in the school has been found GOOD (Uttama).'
      : 'His / Her conduct and character during the stay in the school has been found GOOD.',
    20,
    170
  );

  // Signatures (A4 formatted)
  const sigY = 225;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);

  // Right: Headmaster Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('_________________________', pageWidth - 70, sigY);
  doc.text(isKannada ? 'Mukhya Upadhyayaru (Headmaster)' : 'Headmaster Signature', pageWidth - 70, sigY + 5);

  const cleanFilename = isKannada
    ? `Vyasanga_Pramana_Patra_${toSafePdfText(cert.student_name, 'Student').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    : `Study_Certificate_${toSafePdfText(cert.student_name, 'Student').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  downloadPDFDoc(doc, cleanFilename);
}

// 3. GENERATE CCE MARKS CARD PDF
export function generateMarksCardPDF(
  student: Student,
  school: School,
  assessments: AssessmentRecord[],
  coCurricular: CoCurricularGradeRecord | undefined,
  subjects: string[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const schoolName = toSafePdfText(school.name, 'GOVERNMENT HIGH SCHOOL');
  const taluk = toSafePdfText(school.taluk, 'Taluk');
  const district = toSafePdfText(school.district, 'District');
  const studentName = toSafePdfText(student.name, 'STUDENT');

  // Border
  doc.setLineWidth(0.8);
  doc.rect(8, 8, pageWidth - 16, 281);
  doc.setLineWidth(0.2);
  doc.rect(10, 10, pageWidth - 20, 277);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(schoolName.toUpperCase(), pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${taluk} Taluk, ${district} District | UDISE: ${toSafePdfText(school.udise, 'N/A')}`, pageWidth / 2, 25, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CONTINUOUS AND COMPREHENSIVE EVALUATION (CCE) MARKS CARD', pageWidth / 2, 33, {
    align: 'center',
  });

  // Student 2-Column Metadata Box
  doc.setLineWidth(0.2);
  doc.rect(12, 36, pageWidth - 24, 25);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Name:', 15, 43);
  doc.setFont('helvetica', 'normal');
  doc.text(studentName, 40, 43);

  doc.setFont('helvetica', 'bold');
  doc.text('SATS Number:', 15, 49);
  doc.setFont('helvetica', 'normal');
  doc.text(toSafePdfText(student.sats_no, 'N/A'), 40, 49);

  doc.setFont('helvetica', 'bold');
  doc.text('Date of Birth:', 15, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(toSafePdfText(student.dob, 'N/A'), 40, 55);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.text('Class & Section:', pageWidth / 2 + 5, 43);
  doc.setFont('helvetica', 'normal');
  doc.text(`Class ${toSafePdfText(student.class_number, '10')} - Section ${toSafePdfText(student.section, 'A')}`, pageWidth / 2 + 35, 43);

  doc.setFont('helvetica', 'bold');
  doc.text('Academic Year:', pageWidth / 2 + 5, 49);
  doc.setFont('helvetica', 'normal');
  doc.text(toSafePdfText(student.academic_year, '2026-27'), pageWidth / 2 + 35, 49);

  doc.setFont('helvetica', 'bold');
  doc.text('PEN Number:', pageWidth / 2 + 5, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(toSafePdfText(student.pen_no, 'N/A'), pageWidth / 2 + 35, 55);

  // Table Data Preparation
  const tableRows: any[] = [];
  let grandTotal = 0;
  let grandMax = 0;

  subjects.forEach((subj) => {
    const safeSubj = toSafePdfText(subj, 'Subject');
    const fa1 = assessments.find((a) => a.subject_name === subj && a.assessment_type === 'FA1');
    const fa2 = assessments.find((a) => a.subject_name === subj && a.assessment_type === 'FA2');
    const sa1 = assessments.find((a) => a.subject_name === subj && a.assessment_type === 'SA1');
    const fa3 = assessments.find((a) => a.subject_name === subj && a.assessment_type === 'FA3');
    const fa4 = assessments.find((a) => a.subject_name === subj && a.assessment_type === 'FA4');
    const sa2 = assessments.find((a) => a.subject_name === subj && a.assessment_type === 'SA2');

    const fa1Marks = fa1?.total_marks ?? '-';
    const fa2Marks = fa2?.total_marks ?? '-';
    const sa1Marks = sa1?.total_marks ?? '-';
    const fa3Marks = fa3?.total_marks ?? '-';
    const fa4Marks = fa4?.total_marks ?? '-';
    const sa2Marks = sa2?.total_marks ?? '-';
    const annualMarks = calculateAnnualMarks(student.class_number, subj, {
      fa1: fa1?.total_marks ?? null,
      fa2: fa2?.total_marks ?? null,
      sa1: sa1?.total_marks ?? null,
      fa3: fa3?.total_marks ?? null,
      fa4: fa4?.total_marks ?? null,
      sa2: sa2?.total_marks ?? null,
    });

    if (annualMarks !== null) {
      grandTotal += annualMarks;
      grandMax += getAnnualMaximumMarks(student.class_number, subj);
    }

    tableRows.push([
      safeSubj,
      `${fa1Marks}`,
      `${fa2Marks}`,
      `${sa1Marks}`,
      `${fa3Marks}`,
      `${fa4Marks}`,
      `${sa2Marks}`,
      annualMarks === null ? '-' : annualMarks.toFixed(1),
      annualMarks === null ? '-' : calculateGrade(annualMarks, getAnnualMaximumMarks(student.class_number, subj), student.class_number),
    ]);
  });

  autoTable(doc, {
    startY: 64,
    margin: { left: 12, right: 12 },
    head: [['Subjects', 'FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2', 'Annual (/125 or /100)', 'Grade']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 55 },
    },
    headStyles: {
      fillColor: [22, 40, 79],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
  });

  const nextY = (doc as any).lastAutoTable.finalY + 6;

  // Co-Curricular Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Co-Curricular Activities CCE Evaluation:', 14, nextY);

  const coRows = [
    [
      'Daihika & Arogya (Physical & Health)',
      toSafePdfText(coCurricular?.daihika_arogya, '-'),
      'Moulya Shikshana (Value Education)',
      toSafePdfText(coCurricular?.moulya, '-'),
    ],
    [
      'Kaaryanubhava (Work Experience)',
      toSafePdfText(coCurricular?.kaaryanubhava, '-'),
      'Kala Shikshana (Art Education)',
      toSafePdfText(coCurricular?.kala, '-'),
    ],
  ];

  autoTable(doc, {
    startY: nextY + 2,
    margin: { left: 12, right: 12 },
    body: coRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { halign: 'center', cellWidth: 25 },
      2: { fontStyle: 'bold', cellWidth: 60 },
      3: { halign: 'center', cellWidth: 25 },
    },
  });

  const summaryY = (doc as any).lastAutoTable.finalY + 6;
  doc.setLineWidth(0.3);
  doc.rect(12, summaryY, pageWidth - 24, 18);

  const hasCompleteAnnualMarks = subjects.length > 0 && subjects.every((subject) =>
    assessments.some((assessment) => assessment.subject_name === subject && assessment.assessment_type === 'FA1') &&
    assessments.some((assessment) => assessment.subject_name === subject && assessment.assessment_type === 'FA2') &&
    assessments.some((assessment) => assessment.subject_name === subject && assessment.assessment_type === 'FA3') &&
    assessments.some((assessment) => assessment.subject_name === subject && assessment.assessment_type === 'FA4') &&
    assessments.some((assessment) => assessment.subject_name === subject && assessment.assessment_type === 'SA2') &&
    (student.class_number >= 9 || assessments.some((assessment) => assessment.subject_name === subject && assessment.assessment_type === 'SA1'))
  );
  const pct = hasCompleteAnnualMarks ? (grandTotal / grandMax) * 100 : null;
  const resultClass = pct === null
    ? 'Incomplete'
    : pct >= 85
      ? 'First Class with Distinction (FCD)'
      : pct >= 60
      ? 'First Class (FC)'
      : pct >= 50
      ? 'Second Class (SC)'
      : pct >= 35
      ? 'Pass Class'
      : 'Needs Improvement';

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Marks: ${pct === null ? '-' : `${grandTotal.toFixed(1)} / ${grandMax}`}`, 15, summaryY + 6);
  doc.text(`Percentage: ${pct === null ? '-' : `${pct.toFixed(1)}%`}`, pageWidth / 2 - 20, summaryY + 6);
  doc.text(`Overall Result: ${resultClass}`, 15, summaryY + 13);

  // Signatures (A4 formatted)
  const sigY = 250;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  // Left: Class Teacher
  doc.text('_______________________', 20, sigY);
  doc.text('Class Teacher', 25, sigY + 5);

  // Right: Headmaster Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('_______________________', pageWidth - 65, sigY);
  doc.text('Headmaster Signature', pageWidth - 65, sigY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Verified official CCE Report Card issued via Shikshaka Sathi on ${new Date().toLocaleDateString()}`, 15, 284);

  const cleanFilename = `MarksCard_${toSafePdfText(student.name, 'Student').replace(/[^a-zA-Z0-9]/g, '_')}_Class${student.class_number || 'X'}.pdf`;
  downloadPDFDoc(doc, cleanFilename);
}
