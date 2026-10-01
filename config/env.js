/**
 * Centralized Environment Configuration for KrackDeal Partner Portal
 */
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PROD: process.env.NODE_ENV === "production",
  PORT: process.env.PORT || 3002,
  
  // Cross-App Portal URLs
  PARTNER_URL: process.env.NEXT_PUBLIC_PARTNER_URL || "http://localhost:3002",
  STORE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"
};
