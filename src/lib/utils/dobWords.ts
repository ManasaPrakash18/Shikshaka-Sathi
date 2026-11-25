/**
 * Automatic Date of Birth to Words Generator for Kannada and English
 * Ported from official Karnataka CCE format (githubversion.html v93/v100/v105)
 */

const kn1: Record<number, string> = {
  0: 'ಸೊನ್ನೆ',
  1: 'ಒಂದು',
  2: 'ಎರಡು',
  3: 'ಮೂರು',
  4: 'ನಾಲ್ಕು',
  5: 'ಐದು',
  6: 'ಆರು',
  7: 'ಏಳು',
  8: 'ಎಂಟು',
  9: 'ಒಂಬತ್ತು',
  10: 'ಹತ್ತು',
  11: 'ಹನ್ನೊಂದು',
  12: 'ಹನ್ನೆರಡು',
  13: 'ಹದಿಮೂರು',
  14: 'ಹದಿನಾಲ್ಕು',
  15: 'ಹದಿನೈದು',
  16: 'ಹದಿನಾರು',
  17: 'ಹದಿನೇಳು',
  18: 'ಹದಿನೆಂಟು',
  19: 'ಹತ್ತೊಂಬತ್ತು',
  20: 'ಇಪ್ಪತ್ತು',
  21: 'ಇಪ್ಪತ್ತೊಂದು',
  22: 'ಇಪ್ಪತ್ತೆರಡು',
  23: 'ಇಪ್ಪತ್ತಮೂರು',
  24: 'ಇಪ್ಪತ್ತನಾಲ್ಕು',
  25: 'ಇಪ್ಪತ್ತೈದು',
  26: 'ಇಪ್ಪತ್ತಾರು',
  27: 'ಇಪ್ಪತ್ತೇಳು',
  28: 'ಇಪ್ಪತ್ತೆಂಟು',
  29: 'ಇಪ್ಪತ್ತೊಂಬತ್ತು',
  30: 'ಮೂವತ್ತು',
  31: 'ಮೂವತ್ತೊಂದು',
  40: 'ನಲವತ್ತು',
  50: 'ಐವತ್ತು',
  60: 'ಅರವತ್ತು',
  70: 'ಎಪ್ಪತ್ತು',
  80: 'ಎಂಬತ್ತು',
  90: 'ತೊಂಬತ್ತು',
};

const knT: Record<number, string> = {
  2: 'ಇಪ್ಪತ್ತು',
  3: 'ಮೂವತ್ತು',
  4: 'ನಲವತ್ತು',
  5: 'ಐವತ್ತು',
  6: 'ಅರವತ್ತು',
  7: 'ಎಪ್ಪತ್ತು',
  8: 'ಎಂಬತ್ತು',
  9: 'ತೊಂಬತ್ತು',
};

const knHund: Record<number, string> = {
  1: 'ನೂರು',
  2: 'ಇನ್ನೂರು',
  3: 'ಮುನ್ನೂರು',
  4: 'ನಾಲ್ಕುನೂರು',
  5: 'ಐನೂರು',
  6: 'ಆರುನೂರು',
  7: 'ಏಳುನೂರು',
  8: 'ಎಂಟುನೂರು',
  9: 'ಒಂಬೈನೂರು',
};

function knUnder100(n: number): string {
  if (kn1[n]) return kn1[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return (knT[t] || '') + (u ? ' ' + kn1[u] : '');
}

export function knNum(n: number): string {
  n = Number(n) || 0;
  if (n < 100) return knUnder100(n);
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return (knHund[h] || '') + (r ? ' ' + knUnder100(r) : '');
  }
  if (n < 10000) {
    const th = Math.floor(n / 1000);
    const r = n % 1000;
    let out = (th === 1 ? 'ಒಂದು' : knUnder100(th)) + ' ಸಾವಿರ';
    if (r) {
      out += 'ದ ' + knNum(r);
    }
    return out;
  }
  return String(n);
}

const knMonths = [
  '',
  'ಜನವರಿ',
  'ಫೆಬ್ರವರಿ',
  'ಮಾರ್ಚ್',
  'ಏಪ್ರಿಲ್',
  'ಮೇ',
  'ಜೂನ್',
  'ಜುಲೈ',
  'ಆಗಸ್ಟ್',
  'ಸೆಪ್ಟೆಂಬರ್',
  'ಅಕ್ಟೋಬರ್',
  'ನವೆಂಬರ್',
  'ಡಿಸೆಂಬರ್',
];

const enOnes = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const enTens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

const enOrd = [
  '',
  'First',
  'Second',
  'Third',
  'Fourth',
  'Fifth',
  'Sixth',
  'Seventh',
  'Eighth',
  'Ninth',
  'Tenth',
  'Eleventh',
  'Twelfth',
  'Thirteenth',
  'Fourteenth',
  'Fifteenth',
  'Sixteenth',
  'Seventeenth',
  'Eighteenth',
  'Nineteenth',
  'Twentieth',
  'Twenty First',
  'Twenty Second',
  'Twenty Third',
  'Twenty Fourth',
  'Twenty Fifth',
  'Twenty Sixth',
  'Twenty Seventh',
  'Twenty Eighth',
  'Twenty Ninth',
  'Thirtieth',
  'Thirty First',
];

const enMonths = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function enUnder100(n: number): string {
  if (n < 20) return enOnes[n];
  return enTens[Math.floor(n / 10)] + (n % 10 ? ' ' + enOnes[n % 10] : '');
}

export function enNum(n: number): string {
  n = Number(n) || 0;
  if (n < 100) return enUnder100(n);
  if (n < 1000) {
    return enOnes[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + enUnder100(n % 100) : '');
  }
  if (n < 10000) {
    return enUnder100(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + enNum(n % 1000) : '');
  }
  return String(n);
}

/**
 * Converts YYYY-MM-DD to full official spoken words in Kannada or English
 * E.g., '2012-05-18' ->
 *  kn: 'ಹದಿನೆಂಟು ಮೇ ಎರಡು ಸಾವಿರದ ಹನ್ನೆರಡು'
 *  en: 'Eighteenth May Two Thousand Twelve'
 */
export function getDobInWords(dateStr: string, lang: 'kn' | 'en'): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (lang === 'kn') {
    return `${knNum(d)} ${knMonths[m] || ''} ${knNum(y)}`.trim();
  }
  return `${enOrd[d] || enNum(d)} ${enMonths[m] || ''} ${enNum(y)}`.trim();
}
