/** Arabic-Indic and Eastern Arabic digits → Western */
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_ARABIC_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

const DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/** Normalize text for library search (Arabic-friendly, case-insensitive). */
export function normalizeArabicSearch(text: string): string {
  let s = text.trim().toLowerCase();
  s = s.replace(DIACRITICS, '');
  s = s.replace(/[أإآٱ]/g, 'ا');
  s = s.replace(/ة/g, 'ه');
  s = s.replace(/ى/g, 'ي');

  s = s
    .split('')
    .map((ch) => {
      const arIdx = ARABIC_DIGITS.indexOf(ch);
      if (arIdx >= 0) return String(arIdx);
      const eastIdx = EASTERN_ARABIC_DIGITS.indexOf(ch);
      if (eastIdx >= 0) return String(eastIdx);
      return ch;
    })
    .join('');

  return s.replace(/\s+/g, ' ').trim();
}

export function searchMatches(haystack: string, needle: string): boolean {
  const n = normalizeArabicSearch(needle);
  if (!n) return true;
  return normalizeArabicSearch(haystack).includes(n);
}

/** Fields to scan when filtering residents on the client (fallback). */
export function residentSearchBlob(resident: {
  name: string;
  nickname: string;
  roomNumber: string;
  coverTitle: string;
  age?: number;
}): string {
  return [
    resident.name,
    resident.nickname,
    resident.roomNumber,
    resident.coverTitle,
    resident.age != null ? String(resident.age) : '',
  ].join(' ');
}
