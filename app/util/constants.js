/**
 * Constants & Enums for KrackDeal Partner Portal
 */

// ==========================================
// 1. Order Fulfillment Lifecycle Statuses
// ==========================================
export const FULFILLMENT_STATUSES = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PROCESSING: "PROCESSING",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED"
};

// UI Badge Styling for Merchant Fulfillment Views
export const FULFILLMENT_STATUS_CONFIG = {
  PENDING: {
    label: "Pending Verification",
    bg: "#fef3c7",
    color: "#d97706",
    border: "#fde68a"
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "#e0e7ff",
    color: "#4338ca",
    border: "#c7d2fe"
  },
  PROCESSING: {
    label: "Processing",
    bg: "#e0f2fe",
    color: "#0369a1",
    border: "#bae6fd"
  },
  PACKED: {
    label: "Packed & Ready",
    bg: "#ede9fe",
    color: "#6d28d9",
    border: "#ddd6fe"
  },
  SHIPPED: {
    label: "Dispatched / Shipped",
    bg: "#dbeafe",
    color: "#1d4ed8",
    border: "#bfdbfe"
  },
  DELIVERED: {
    label: "Delivered",
    bg: "#dcfce7",
    color: "#15803d",
    border: "#bbf7d0"
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "#fee2e2",
    color: "#b91c1c",
    border: "#fecaca"
  },
  REJECTED: {
    label: "Rejected",
    bg: "#fef2f2",
    color: "#991b1b",
    border: "#fee2e2"
  }
};

// ==========================================
// 2. Supported UPI Apps for Partner Settings
// ==========================================
export const SUPPORTED_UPI_APPS = [
  { id: "gpay", name: "Google Pay", key: "gpay" },
  { id: "phonepe", name: "PhonePe", key: "phonepe" },
  { id: "paytm", name: "Paytm UPI", key: "paytm" },
  { id: "bhim", name: "BHIM UPI", key: "bhim" }
];
