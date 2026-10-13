/** Strips spaces, dashes, +91 and a leading 0. Returns digits only. */
export function normalizeMobile(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/** Indian mobile numbers: 10 digits, starting with 6-9. */
export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

/**
 * Initial password rule:
 * first 3 letters of the first name (lowercase) + first 4 digits of the mobile number.
 * Example: "Rajesh Kumar", "9876543210" -> "raj9876"
 */
export function generateInitialPassword(name: string, mobile: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  const letters = firstName.toLowerCase().replace(/[^a-z]/g, "").slice(0, 3);
  const digits = normalizeMobile(mobile).slice(0, 4);
  return `${letters}${digits}`;
}

export function parseAmount(input: string): number {
  const n = Number(input.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
}
