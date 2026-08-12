/**
 * Validation helpers for KrackDeal Partner product and account management.
 */

/**
 * Validates product base price (must be a positive number).
 */
export function isValidPrice(price) {
  const numericValue = Number(price);
  return !isNaN(numericValue) && numericValue > 0;
}

/**
 * Validates available product inventory count (non-negative integer).
 */
export function isValidStock(stock) {
  const numericValue = Number(stock);
  return !isNaN(numericValue) && numericValue >= 0 && Number.isInteger(numericValue);
}

/**
 * Validates a standard Indian UPI ID (VPA handle, e.g. merchant@okhdfcbank or merchant@upi).
 */
export function isValidUpiId(vpa) {
  if (!vpa || typeof vpa !== "string") return false;
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(vpa.trim());
}

/**
 * Validates standard email address format.
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email.trim());
}
