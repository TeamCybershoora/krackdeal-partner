/**
 * Formatting utilities for KrackDeal Partner Portal.
 */

/**
 * Formats a numeric value into INR currency display.
 * Example: formatCurrency(1500) -> "₹1,500"
 */
export function formatCurrency(amount, includeSymbol = true) {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return includeSymbol ? "₹0" : "0";

  const formatted = numericAmount.toLocaleString("en-IN");
  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Formats a date into a clean, readable string.
 * Example: formatDate("2026-08-11") -> "11 Aug 2026"
 */
export function formatDate(date, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!date) return "";
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";
    return parsedDate.toLocaleDateString("en-IN", options);
  } catch (error) {
    return "";
  }
}

/**
 * Formats a date with 12-hour time.
 * Example: formatDateTime("2026-08-11T17:30:00") -> "11 Aug 2026, 05:30 PM"
 */
export function formatDateTime(date) {
  if (!date) return "";
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";
    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (error) {
    return "";
  }
}

/**
 * Converts large analytics values into compact notation (e.g. 1.2k, 50k, 1.5L).
 */
export function formatCompactNumber(num) {
  const value = Number(num);
  if (isNaN(value)) return "0";

  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  }
  if (value >= 100000) {
    return `${(value / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return String(value);
}
