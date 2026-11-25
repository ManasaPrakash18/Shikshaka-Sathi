import { AcademicCalendarEvent } from '../types';

const provisionalNote =
  'Provisional calendar date. Verify against the Karnataka Government holiday notification before relying on it.';
const provisionalNoteKannada =
  'ತಾತ್ಕಾಲಿಕ ಕ್ಯಾಲೆಂಡರ್ ದಿನಾಂಕ. ಇದನ್ನು ಅನುಸರಿಸುವ ಮೊದಲು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ರಜಾ ಅಧಿಸೂಚನೆಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.';

type HolidayTemplate = {
  key: string;
  title: string;
  titleKannada: string;
  category: AcademicCalendarEvent['category'];
  month: number;
  day: number;
  movable?: boolean;
  durationDays?: number;
};

const holidayTemplates: HolidayTemplate[] = [
  { key: 'bakrid', title: 'Bakrid (Eid-ul-Adha)', titleKannada: 'ಬಕ್ರೀದ್ (ಈದ್-ಉಲ್-ಅದ್ಹಾ)', category: 'GOVT_HOLIDAY', month: 6, day: 17, movable: true },
  { key: 'muharram', title: 'Muharram', titleKannada: 'ಮೊಹರಂ', category: 'GOVT_HOLIDAY', month: 7, day: 7, movable: true },
  { key: 'independence-day', title: 'Independence Day', titleKannada: 'ಸ್ವಾತಂತ್ರ್ಯ ದಿನಾಚರಣೆ', category: 'NATIONAL_HOLIDAY', month: 8, day: 15 },
  { key: 'varamahalakshmi', title: 'Varamahalakshmi Vrata', titleKannada: 'ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ', category: 'GOVT_HOLIDAY', month: 8, day: 28, movable: true },
  { key: 'ganesha-chaturthi', title: 'Ganesha Chaturthi', titleKannada: 'ಗಣೇಶ ಚತುರ್ಥಿ', category: 'GOVT_HOLIDAY', month: 9, day: 14, movable: true },
  { key: 'gandhi-jayanti', title: 'Mahatma Gandhi Jayanti', titleKannada: 'ಮಹಾತ್ಮಾ ಗಾಂಧಿ ಜಯಂತಿ', category: 'NATIONAL_HOLIDAY', month: 10, day: 2 },
  { key: 'mahanavami', title: 'Mahanavami / Ayudha Pooja', titleKannada: 'ಮಹಾನವಮಿ / ಆಯುಧ ಪೂಜೆ', category: 'GOVT_HOLIDAY', month: 10, day: 19, movable: true },
  { key: 'vijayadashami', title: 'Vijayadashami', titleKannada: 'ವಿಜಯದಶಮಿ', category: 'GOVT_HOLIDAY', month: 10, day: 20, movable: true },
  { key: 'valmiki-jayanti', title: 'Maharshi Valmiki Jayanti', titleKannada: 'ಮಹರ್ಷಿ ವಾಲ್ಮೀಕಿ ಜಯಂತಿ', category: 'GOVT_HOLIDAY', month: 10, day: 26, movable: true },
  { key: 'rajyotsava', title: 'Kannada Rajyotsava', titleKannada: 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ', category: 'GOVT_HOLIDAY', month: 11, day: 1 },
  { key: 'deepavali', title: 'Deepavali (Naraka Chaturdashi & Balipadyami)', titleKannada: 'ದೀಪಾವಳಿ (ನರಕ ಚತುರ್ದಶಿ ಮತ್ತು ಬಲಿಪಾಡ್ಯಮಿ)', category: 'GOVT_HOLIDAY', month: 11, day: 8, movable: true, durationDays: 3 },
  { key: 'kanakadasa-jayanti', title: 'Kanakadasa Jayanti', titleKannada: 'ಕನಕದಾಸ ಜಯಂತಿ', category: 'GOVT_HOLIDAY', month: 11, day: 26, movable: true },
  { key: 'eid-milad', title: 'Eid Milad-un-Nabi', titleKannada: 'ಈದ್ ಮಿಲಾದ್', category: 'GOVT_HOLIDAY', month: 9, day: 5, movable: true },
  { key: 'christmas', title: 'Christmas', titleKannada: 'ಕ್ರಿಸ್‌ಮಸ್ ಹಬ್ಬ', category: 'GOVT_HOLIDAY', month: 12, day: 25 },
  { key: 'makara-sankranti', title: 'Makara Sankranti', titleKannada: 'ಮಕರ ಸಂಕ್ರಾಂತಿ', category: 'GOVT_HOLIDAY', month: 1, day: 14 },
  { key: 'republic-day', title: 'Republic Day', titleKannada: 'ಗಣರಾಜ್ಯೋತ್ಸವ', category: 'NATIONAL_HOLIDAY', month: 1, day: 26 },
  { key: 'maha-shivaratri', title: 'Maha Shivaratri', titleKannada: 'ಮಹಾ ಶಿವರಾತ್ರಿ', category: 'GOVT_HOLIDAY', month: 3, day: 6, movable: true },
  { key: 'eid-al-fitr', title: 'Eid al-Fitr (Ramzan)', titleKannada: 'ಈದ್-ಉಲ್-ಫಿತ್ರ್ (ರಮ್ಜಾನ್)', category: 'GOVT_HOLIDAY', month: 3, day: 20, movable: true },
  { key: 'mahavir-jayanti', title: 'Mahavir Jayanti', titleKannada: 'ಮಹಾವೀರ ಜಯಂತಿ', category: 'GOVT_HOLIDAY', month: 4, day: 2, movable: true },
  { key: 'good-friday', title: 'Good Friday', titleKannada: 'ಶುಭ ಶುಕ್ರವಾರ', category: 'GOVT_HOLIDAY', month: 4, day: 3, movable: true },
  { key: 'ugadi', title: 'Chandramana Ugadi', titleKannada: 'ಚಾಂದ್ರಮಾನ ಯುಗಾದಿ', category: 'GOVT_HOLIDAY', month: 4, day: 7, movable: true },
  { key: 'ambedkar-jayanti', title: 'Dr. B. R. Ambedkar Jayanti', titleKannada: 'ಡಾ. ಬಿ. ಆರ್. ಅಂಬೇಡ್ಕರ್ ಜಯಂತಿ', category: 'NATIONAL_HOLIDAY', month: 4, day: 14 },
  { key: 'may-day', title: 'May Day', titleKannada: 'ಮೇ ದಿನ', category: 'GOVT_HOLIDAY', month: 5, day: 1 },
];

function getTemplateDate(template: HolidayTemplate, year: number, anchorYear: number): Date {
  const date = new Date(Date.UTC(year, template.month - 1, template.day));
  if (template.movable) {
    date.setUTCDate(date.getUTCDate() - 11 * (year - anchorYear));
  }
  return date;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function generateKarnatakaProvisionalCalendar(
  schoolId: string,
  academicYear: string
): Omit<AcademicCalendarEvent, 'id'>[] {
  const startYear = Number(academicYear.split('-')[0]);
  if (!Number.isInteger(startYear) || startYear < 1900 || startYear > 9998) {
    throw new Error(`Invalid academic year: ${academicYear}`);
  }

  const anchorYear = 2026;
  return holidayTemplates
    .map((template) => {
      const eventYear = template.month <= 4 ? startYear + 1 : startYear;
      const date = getTemplateDate(template, eventYear, anchorYear);
      const endDate = template.durationDays
        ? new Date(date.getTime() + (template.durationDays - 1) * 24 * 60 * 60 * 1000)
        : undefined;
      const dateString = toDateString(date);
      return {
        school_id: schoolId,
        academic_year: academicYear,
        title: template.title,
        title_kannada: template.titleKannada,
        description: provisionalNote,
        description_kannada: provisionalNoteKannada,
        date: dateString,
        ...(endDate ? { end_date: toDateString(endDate) } : {}),
        category: template.category,
        is_official: false,
        created_by: 'SYSTEM_KARNATAKA_PROVISIONAL',
      };
    });
}
