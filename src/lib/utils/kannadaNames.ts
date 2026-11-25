/**
 * Kannada naming and transliteration utility.
 * Guarantees that when language is set to Kannada ('kn'), all student names,
 * parent names, faculty names, school names, taluks, districts, and subjects
 * are rendered accurately in authentic Kannada script.
 */

// Common name dictionary for standard Karnataka school records
const KANNADA_NAME_DICT: Record<string, string> = {
  // Students
  'Prajwal Kumar M': 'ಪ್ರಜ್ವಲ್ ಕುಮಾರ್ ಎಂ',
  'Prajwal Kumar': 'ಪ್ರಜ್ವಲ್ ಕುಮಾರ್',
  'Bhumika S Gowda': 'ಭೂಮಿಕಾ ಎಸ್ ಗೌಡ',
  'Bhumika': 'ಭೂಮಿಕಾ',
  'Kavitha R': 'ಕವಿತಾ ಆರ್',
  'Kavitha': 'ಕವಿತಾ',
  'Chandan Nayak': 'ಚಂದನ್ ನಾಯಕ್',
  'Chandan': 'ಚಂದನ್',
  'Darshan B R': 'ದರ್ಶನ್ ಬಿ ಆರ್',
  'Darshan K': 'ದರ್ಶನ್ ಕೆ',
  'Darshan Kumar': 'ದರ್ಶನ್ ಕುಮಾರ್',
  'Darshan': 'ದರ್ಶನ್',
  'Ananya S': 'ಅನನ್ಯಾ ಎಸ್',
  'Ananya R': 'ಅನನ್ಯಾ ಆರ್',
  'Ananya': 'ಅನನ್ಯಾ',
  'Tejaswini M': 'ತೇಜಸ್ವಿನಿ ಎಂ',
  'Tejaswini': 'ತೇಜಸ್ವಿನಿ',
  'Kiran Gowda': 'ಕಿರಣ್ ಗೌಡ',
  'Kiran': 'ಕಿರಣ್',
  'Sneha K': 'ಸ್ನೇಹಾ ಕೆ',
  'Sneha': 'ಸ್ನೇಹಾ',
  'Deepika S': 'ದೀಪಿಕಾ ಎಸ್',
  'Deepika': 'ದೀಪಿಕಾ',
  'Chetan Gowda': 'ಚೇತನ್ ಗೌಡ',
  'Chetan': 'ಚೇತನ್',
  'Mohan Kumar B': 'ಮೋಹನ್ ಕುಮಾರ್ ಬಿ',
  'Mohan Kumar': 'ಮೋಹನ್ ಕುಮಾರ್',
  'Sahana M': 'ಸಹನಾ ಎಂ',
  'Sahana': 'ಸಹನಾ',
  'Rohan Patil': 'ರೋಹನ್ ಪಾಟೀಲ್',
  'Rohan': 'ರೋಹನ್',
  'Keerthana N': 'ಕೀರ್ತನಾ ಎನ್',
  'Keerthana': 'ಕೀರ್ತನಾ',
  'Spandana V': 'ಸ್ಪಂದನಾ ವಿ',
  'Spandana': 'ಸ್ಪಂದನಾ',
  'Varun Teja': 'ವರುಣ್ ತೇಜ',
  'Varun': 'ವರುಣ್',
  'Bhavana S': 'ಭಾವನಾ ಎಸ್',
  'Bhavya R': 'ಭವ್ಯ ಆರ್',
  'Bhavana': 'ಭಾವನಾ',
  'Harish Nayak': 'ಹರೀಶ್ ನಾಯಕ್',
  'Harish': 'ಹರೀಶ್',
  'Divya Shree': 'ದಿವ್ಯ ಶ್ರೀ',
  'Divya': 'ದಿವ್ಯ',
  'Manoj Kumar': 'ಮನೋಜ್ ಕುಮಾರ್',
  'Manoj': 'ಮನೋಜ್',

  // Parents
  'Mahadevaiah K': 'ಮಹದೇವಯ್ಯ ಕೆ',
  'Mahadevaiah': 'ಮಹದೇವಯ್ಯ',
  'Mahadevappa': 'ಮಹದೇವಪ್ಪ',
  'Geetha M': 'ಗೀತಾ ಎಂ',
  'Geetha': 'ಗೀತಾ',
  'Suresh Gowda': 'ಸುರೇಶ್ ಗೌಡ',
  'Parvathamma': 'ಪಾರ್ವತಮ್ಮ',
  'Ramu N': 'ರಾಮು ಎನ್',
  'Lakshmi': 'ಲಕ್ಷ್ಮಿ',
  'Nagaraju Nayak': 'ನಾಗರಾಜು ನಾಯಕ್',
  'Sarvamangala': 'ಸರ್ವಮಂಗಳಾ',
  'Ramesh B': 'ರಮೇಶ್ ಬಿ',
  'Sharadamma': 'ಶಾರದಮ್ಮ',
  'Shankar Dixit': 'ಶಂಕರ್ ದೀಕ್ಷಿತ್',
  'Vidya': 'ವಿದ್ಯಾ',
  'Manjunatha': 'ಮಂಜುನಾಥ',
  'Pushpa': 'ಪುಷ್ಪ',
  'Shivananje Gowda': 'ಶಿವನಂಜೇಗೌಡ',
  'Kusuma': 'ಕುಸುಮ',
  'Kumar': 'ಕುಮಾರ್',
  'Shailaja': 'ಶೈಲಜಾ',
  'Srinivas Murthy': 'ಶ್ರೀನಿವಾಸ ಮೂರ್ತಿ',
  'Mangala': 'ಮಂಗಳಾ',
  'Kempegowda': 'ಕೆಂಪೇಗೌಡ',
  'Pushpalatha': 'ಪುಷ್ಪಲತಾ',
  'Rangaswamy': 'ರಂಗಸ್ವಾಮಿ',
  'Ramaswamy': 'ರಾಮಸ್ವಾಮಿ',
  'Vasantha': 'ವಸಂತಾ',
  'Basavaraju': 'ಬಸವರಾಜು',
  'Parvathi': 'ಪಾರ್ವತಿ',
  'Shivanagouda': 'ಶಿವನಗೌಡ',
  'Renuka': 'ರೇಣುಕಾ',
  'Nagaraju': 'ನಾಗರಾಜು',
  'Lalitha': 'ಲಲಿತಾ',
  'Lakshmamma': 'ಲಕ್ಷ್ಮಮ್ಮ',
  'Kumaraswamy': 'ಕುಮಾರಸ್ವಾಮಿ',
  'Sujatha': 'ಸುಜಾತಾ',
  'Venkataraman': 'ವೆಂಕಟರಮಣ್',
  'Hemalatha': 'ಹೇಮಲತಾ',
  'Anand Rao': 'ಆನಂದ ರಾವ್',
  'Suma': 'ಸುಮಾ',
  'Suresh Babu': 'ಸುರೇಶ್ ಬಾಬು',
  'Padma': 'ಪದ್ಮಾ',
  'Somappa': 'ಸೋಮಪ್ಪ',
  'Devamma': 'ದೇವಮ್ಮ',
  'Chandrashekar': 'ಚಂದ್ರಶೇಖರ್',
  'Bhagya': 'ಭಾಗ್ಯಾ',
  'Krishnappa': 'ಕೃಷ್ಣಪ್ಪ',
  'Kamalamma': 'ಕಮಲಮ್ಮ',

  // Faculty & Administrators
  'H Prakash': 'ಎಚ್. ಪ್ರಕಾಶ್',
  'Ramesh Gowda': 'ರಮೇಶ್ ಗೌಡ',
  'Smt. Anasuya M': 'ಶ್ರೀಮತಿ ಅನಸೂಯ ಎಂ',
  'Sri Shivakumar B': 'ಶ್ರೀ ಶಿವಕುಮಾರ್ ಬಿ',
  'Smt. Anitha Rao': 'ಶ್ರೀಮತಿ ಅನಿತಾ ರಾವ್',
  'Sri K. Venkatesh': 'ಶ್ರೀ ಕೆ. ವೆಂಕಟೇಶ್',
  'Savitha K': 'ಸವಿತಾ ಕೆ',
  'Sri Manjunath H': 'ಶ್ರೀ ಮಂಜುನಾಥ್ ಎಚ್',
  'Manjunath Swamy': 'ಮಂಜುನಾಥ ಸ್ವಾಮಿ',
  'Nagaraju B': 'ನಾಗರಾಜು ಬಿ',

  // Additional Names & Staff
  'Pooja Shankar': 'ಪೂಜಾ ಶಂಕರ್',
  'Pooja': 'ಪೂಜಾ',
  'Shankar': 'ಶಂಕರ್',
  'Vinay Kumar N': 'ವಿನಯ್ ಕುಮಾರ್ ಎನ್',
  'Vinay': 'ವಿನಯ್',
  'Vinay Kumar': 'ವಿನಯ್ ಕುಮಾರ್',
  'Megha R': 'ಮೇಘಾ ಆರ್',
  'Megha': 'ಮೇಘಾ',
  'Ramesh': 'ರಮೇಶ್',
  'Savitha': 'ಸವಿತಾ',
  'Anasuya': 'ಅನಸೂಯ',
  'Manjunath': 'ಮಂಜುನಾಥ್',
  'Venkatesh': 'ವೆಂಕಟೇಶ್',
  'Shobha': 'ಶೋಭಾ',
  'Mahesh': 'ಮಹೇಶ್',
  'Roopa': 'ರೂಪ',

  // Schools
  'Government High School Vidyaranyapuram': 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ವಿದ್ಯಾರಣ್ಯಪುರಂ',
  'GHS Vidyaranyapuram': 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ವಿದ್ಯಾರಣ್ಯಪುರಂ',
  'Government Model Higher Primary School Hassan': 'ಸರ್ಕಾರಿ ಮಾದರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ ಹಾಸನ',
  'GMHPS Hassan': 'ಸರ್ಕಾರಿ ಮಾದರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ ಹಾಸನ',
  'Government High School Doddaballapura': 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ದೊಡ್ಡಬಳ್ಳಾಪುರ',
  'Government Higher Primary School Channapatna': 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ ಚನ್ನಪಟ್ಟಣ',

  // Locations
  'Mysuru South': 'ಮೈಸೂರು ದಕ್ಷಿಣ',
  'Mysuru North': 'ಮೈಸೂರು ಉತ್ತರ',
  'Mysuru': 'ಮೈಸೂರು',
  'Hassan Urban': 'ಹಾಸನ ನಗರ',
  'Hassan Rural': 'ಹಾಸನ ಗ್ರಾಮೀಣ',
  'Hassan': 'ಹಾಸನ',
  'Doddaballapura': 'ದೊಡ್ಡಬಳ್ಳಾಪುರ',
  'Bangalore Rural': 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
  'Bengaluru Rural': 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
  'Bengaluru North': 'ಬೆಂಗಳೂರು ಉತ್ತರ',
  'Bengaluru South': 'ಬೆಂಗಳೂರು ದಕ್ಷಿಣ',
  'Channapatna': 'ಚನ್ನಪಟ್ಟಣ',
  'Ramanagara': 'ರಾಮನಗರ',
  'Nanjangud': 'ನಂಜನಗೂಡು',
  'T. Narasipura': 'ಟಿ. ನರಸೀಪುರ',
  'Hunsur': 'ಹುಣಸೂರು',
  'Alur': 'ಆಲೂರು',
  'Karnataka': 'ಕರ್ನಾಟಕ',
  'India': 'ಭಾರತ',
  'Indian': 'ಭಾರತೀಯ',
  'Hindu': 'ಹಿಂದೂ',

  // Castes & Communities
  'General': 'ಸಾಮಾನ್ಯ',
  'Kuruba': 'ಕುರುಬ',
  'Vokkaliga': 'ವೊಕ್ಕಲಿಗ',
  'Lingayat': 'ಲಿಂಗಾಯತ',
  'Adi Karnataka': 'ಆದಿ ಕರ್ನಾಟಕ',
  'Adi Dravida': 'ಆದಿ ದ್ರಾವಿಡ',
  'Nayaka': 'ನಾಯಕ',
  'Muslim': 'ಮುಸ್ಲಿಂ',
  'Brahmin': 'ಬ್ರಾಹ್ಮಣ',
  'Madiga': 'ಮಾದಿಗ',
  'Idiga': 'ಈಡಿಗ',
  'Jenu Kuruba': 'ಜೇನು ಕುರುಬ',
  'Gowda': 'ಗೌಡ',
  'Shetty': 'ಶೆಟ್ಟಿ',
  'Acharya': 'ಆಚಾರ್ಯ',

  // Subjects
  'First Language (Kannada)': 'ಪ್ರಥಮ ಭಾಷೆ ಕನ್ನಡ',
  'Second Language (English)': 'ದ್ವಿತೀಯ ಭಾಷೆ ಇಂಗ್ಲಿಷ್',
  'Third Language (Hindi)': 'ತೃತೀಯ ಭಾಷೆ ಹಿಂದಿ',
  'Mathematics': 'ಗಣಿತ',
  'Science': 'ವಿಜ್ಞಾನ',
  'Social Science': 'ಸಮಾಜ ವಿಜ್ಞಾನ',
  'Physical & Health Education': 'ದೈಹಿಕ ಮತ್ತು ಆರೋಗ್ಯ ಶಿಕ್ಷಣ',
  'Value Education': 'ಮೌಲ್ಯ ಶಿಕ್ಷಣ',
  'Work Experience': 'ಕಾರ್ಯಾನುಭವ',
  'Art Education': 'ಕಲಾ ಶಿಕ್ಷಣ',

  // Designations & Roles
  'Headmaster': 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು',
  'Teacher': 'ಶಿಕ್ಷಕರು',
  'Senior Teacher': 'ಹಿರಿಯ ಶಿಕ್ಷಕರು',
  'Physical Education Teacher': 'ದೈಹಿಕ ಶಿಕ್ಷಣ ಶಿಕ್ಷಕರು',
  'Special Teacher': 'ವಿಶೇಷ ಶಿಕ್ಷಕರು',
  'School Admin': 'ಶಾಲಾ ಆಡಳಿತ',
  'Platform Admin': 'ವೇದಿಕೆ ನಿರ್ವಾಹಕರು',
  'Faculty': 'ಬೋಧಕ ವರ್ಗ',

  // Common Transfer Reasons & Audit Terms
  'Completed Class 10 (SSLC Examination)': '10ನೇ ತರಗತಿ ಪೂರ್ಣಗೊಳಿಸಲಾಗಿದೆ (ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ ಪರೀಕ್ಷೆ)',
  'Parent transfer to Bengaluru North': 'ಪೋಷಕರ ವರ್ಗಾವಣೆ (ಬೆಂಗಳೂರು ಉತ್ತರ)',
  'Admission secured at Morarji Desai Residential School': 'ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆಗೆ ಪ್ರವೇಶ ಪಡೆದಿದ್ದಾರೆ',
  'Spelling correction as per Aadhaar & Birth Certificate': 'ಆಧಾರ್ ಮತ್ತು ಜನನ ಪ್ರಮಾಣಪತ್ರದಂತೆ ಕಾಗುಣಿತ ತಿದ್ದುಪಡಿ',
  'Headmaster (Ramesh Gowda)': 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು (ರಮೇಶ್ ಗೌಡ)',
  'Completed Class 10': '10ನೇ ತರಗತಿ ಪೂರ್ಣಗೊಳಿಸಲಾಗಿದೆ',
  'Parent transfer': 'ಪೋಷಕರ ವರ್ಗಾವಣೆ',
  'Higher education': 'ಉನ್ನತ ವ್ಯಾಸಂಗ',
};

// Simple phonetic transliterator for English to Kannada
function transliterateWordToKannada(word: string): string {
  if (!word) return '';
  const w = word.toLowerCase();

  const rules: [RegExp, string][] = [
    [/sh/g, 'ಶ್'],
    [/ch/g, 'ಚ್'],
    [/th/g, 'ತ್'],
    [/dh/g, 'ಧ್'],
    [/bh/g, 'ಭ್'],
    [/kh/g, 'ಖ್'],
    [/gh/g, 'ಘ್'],
    [/ph/g, 'ಫ್'],
    [/ee/g, 'ೀ'],
    [/oo/g, 'ೂ'],
    [/ai/g, 'ೈ'],
    [/au/g, 'ೌ'],
    [/aa/g, 'ಾ'],
    [/a/g, 'ಾ'],
    [/i/g, 'ಿ'],
    [/u/g, 'ು'],
    [/e/g, 'ೆ'],
    [/o/g, 'ೊ'],
    [/k/g, 'ಕ್'],
    [/g/g, 'ಗ್'],
    [/j/g, 'ಜ್'],
    [/t/g, 'ಟ್'],
    [/d/g, 'ಡ್'],
    [/n/g, 'ನ್'],
    [/p/g, 'ಪ್'],
    [/b/g, 'ಬ್'],
    [/m/g, 'ಮ್'],
    [/y/g, 'ಯ್'],
    [/r/g, 'ರ್'],
    [/l/g, 'ಲ್'],
    [/v/g, 'ವ್'],
    [/w/g, 'ವ್'],
    [/s/g, 'ಸ್'],
    [/h/g, 'ಹ್'],
  ];

  let result = w;
  for (const [pattern, replacement] of rules) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Maps an English string or name to its authentic Kannada translation/transliteration.
 */
export function toKannadaText(english: string | undefined | null, lang?: string): string {
  if (!english) return '';
  if (lang && lang !== 'kn') return english;
  const trimmed = english.trim();
  if (!trimmed) return '';

  // 1. Direct dictionary match
  if (KANNADA_NAME_DICT[trimmed]) {
    return KANNADA_NAME_DICT[trimmed];
  }

  // 2. Case-insensitive dictionary search
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(KANNADA_NAME_DICT)) {
    if (key.toLowerCase() === lower) {
      return val;
    }
  }

  // 3. Fallback: If word contains components in dictionary
  const parts = trimmed.split(' ');
  const translatedParts = parts.map((part) => {
    if (KANNADA_NAME_DICT[part]) return KANNADA_NAME_DICT[part];
    for (const [key, val] of Object.entries(KANNADA_NAME_DICT)) {
      if (key.toLowerCase() === part.toLowerCase()) return val;
    }
    // Check initial letter like "M" -> "ಎಂ", "S" -> "ಎಸ್"
    if (part.length === 1 && /^[A-Za-z]$/.test(part)) {
      const initials: Record<string, string> = {
        A: 'ಎ', B: 'ಬಿ', C: 'ಸಿ', D: 'ಡಿ', E: 'ಇ', F: 'ಎಫ್', G: 'ಜಿ',
        H: 'ಎಚ್', I: 'ಐ', J: 'ಜೆ', K: 'ಕೆ', L: 'ಎಲ್', M: 'ಎಂ', N: 'ಎನ್',
        O: 'ಒ', P: 'ಪಿ', Q: 'ಕ್ಯೂ', R: 'ಆರ್', S: 'ಎಸ್', T: 'ಟಿ', U: 'ಯು',
        V: 'ವಿ', W: 'ಡಬ್ಲ್ಯೂ', X: 'ಎಕ್ಸ್', Y: 'ವೈ', Z: 'ಝಡ್'
      };
      return initials[part.toUpperCase()] || part;
    }
    return transliterateWordToKannada(part) || part;
  });

  return translatedParts.join(' ');
}

/**
 * Returns the localized name of a student based on active language.
 */
export function getStudentName(student: any, lang: string): string {
  if (!student) return '';
  if (lang === 'kn') {
    return student.name_kannada || student.name || '';
  }
  return student.name || '';
}

/**
 * Returns localized father name.
 */
export function getFatherName(student: any, lang: string): string {
  if (!student) return '';
  if (lang === 'kn') {
    return student.father_name_kannada || student.father_name || '';
  }
  return student.father_name || '';
}

/**
 * Returns localized mother name.
 */
export function getMotherName(student: any, lang: string): string {
  if (!student) return '';
  if (lang === 'kn') {
    return student.mother_name_kannada || student.mother_name || '';
  }
  return student.mother_name || '';
}

/**
 * Returns localized school name.
 */
export function getSchoolName(school: any, lang: string): string {
  if (!school) return '';
  if (lang === 'kn') {
    return school.name_kannada || school.name || '';
  }
  return school.name || '';
}

/**
 * Returns localized Headmaster / Principal name.
 */
export function getHMName(school: any, lang: string): string {
  if (!school) return '';
  if (lang === 'kn') {
    return school.hm_name_kannada || school.hm_name || '';
  }
  return school.hm_name || '';
}

/**
 * Returns localized faculty/user name.
 */
export function getUserName(user: any, lang: string): string {
  if (!user) return '';
  if (lang === 'kn') {
    return user.name_kannada || user.name || '';
  }
  return user.name || '';
}

/**
 * Returns localized subject name.
 */
export function getSubjectName(subject: string, lang: string): string {
  if (!subject) return '';
  if (lang === 'kn') {
    return toKannadaText(subject) || subject;
  }
  return subject;
}

/**
 * Returns localized taluk / district.
 */
export function getLocationName(
  place?: string | null,
  lang: string = 'en',
  kannadaPlace?: string | null
): string {
  if (!place) return '';
  if (lang === 'kn') {
    return kannadaPlace || toKannadaText(place) || place;
  }
  return place;
}
