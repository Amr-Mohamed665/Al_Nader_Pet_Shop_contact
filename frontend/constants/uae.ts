export const UAE_EMIRATES: string[] = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah'
];

// Matches UAE phone numbers in various formats:
//   05x xxx xxxx (mobile)
//   +971 5x xxx xxxx
//   00971 5x xxx xxxx
//   02/03/04/06/07/09 xxx xxxx (landlines)
export const UAE_PHONE_REGEX: RegExp = /^(\+971|00971|971|0)?(5[0-9]\d{7}|[2-4679]\d{7})$/;
