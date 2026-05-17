/** Shared search normalization (mirrors src/lib/search.ts). */

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

export function normalizeArabicSearch(text: string): string {
  let s = text.trim().toLowerCase();
  s = s.replace(DIACRITICS, "");
  s = s.replace(/[أإآٱ]/g, "ا");
  s = s.replace(/ة/g, "ه");
  s = s.replace(/ى/g, "ي");

  s = s
    .split("")
    .map((ch) => {
      const arIdx = ARABIC_DIGITS.indexOf(ch);
      if (arIdx >= 0) return String(arIdx);
      const eastIdx = EASTERN_ARABIC_DIGITS.indexOf(ch);
      if (eastIdx >= 0) return String(eastIdx);
      return ch;
    })
    .join("");

  return s.replace(/\s+/g, " ").trim();
}

export function searchMatches(haystack: string, needle: string): boolean {
  const n = normalizeArabicSearch(needle);
  if (!n) return true;
  return normalizeArabicSearch(haystack).includes(n);
}

type ResidentRow = {
  firstName: string;
  lastName: string;
  nickname: string | null;
  roomNumber: string | null;
  lifeBook?: { bookTitle: string } | null;
};

export function residentMatchesQuery(resident: ResidentRow, query: string): boolean {
  const blob = [
    resident.firstName,
    resident.lastName,
    `${resident.firstName} ${resident.lastName}`.trim(),
    resident.nickname ?? "",
    resident.roomNumber ?? "",
    resident.lifeBook?.bookTitle ?? "",
  ].join(" ");

  return searchMatches(blob, query);
}
