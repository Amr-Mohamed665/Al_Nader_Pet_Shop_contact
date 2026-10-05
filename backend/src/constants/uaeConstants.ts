export const UAE_EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
] as const;

export type UAEEmirate = typeof UAE_EMIRATES[number];

// Matches UAE phone numbers in various formats:
//   05x xxx xxxx   (local mobile)
//   +971 5x xxx xxxx
//   00971 5x xxx xxxx
//   02/03/04/06/07/09 xxx xxxx  (landlines)
export const UAE_PHONE_RE = /^(\+971|00971|971|0)?(5[0-9]\d{7}|[2-4679]\d{7})$/;

/** Normalize any accepted phone input to +971XXXXXXXXX */
export function normalizePhone(raw: string): string | null {
  const digits = String(raw).replace(/[\s\-()"]/g, '');
  const match = digits.match(UAE_PHONE_RE);
  if (!match) return null;
  const local = match[2]; // the 8- or 9-digit local part
  return `+971${local}`;
}
