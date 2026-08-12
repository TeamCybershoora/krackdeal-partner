"use client";

import { useState } from "react";
import { 
  Bell, 
  ShoppingBag, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Filter,
  Check
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

const initialNotifications = [
  { id: "1", type: "order", title: "New Customer Order Received", desc: "Order #KD-908234 has been placed for ₹18,999. Action required: Accept or Pack.", time: "10 mins ago", read: false },
  { id: "2", type: "order", title: "Order Delivered Successfully", desc: "Order #KD-892341 has been delivered to customer Raviranjan.", time: "1 hour ago", read: false },
  { id: "3", type: "payment", title: "Payout Processed", desc: "Weekly payout of ₹45,200 has been transferred to your registered HDFC bank account.", time: "Yesterday", read: true },
  { id: "4", type: "stock", title: "Low Stock Alert", desc: "Product 'Wireless Noise Cancelling Headphones' has less than 5 units in stock.", time: "2 days ago", read: true },
  { id: "5", type: "system", title: "Store Verified Badge Issued", desc: "Congratulations! Your store profile achieved 98%+ positive buyer ratings.", time: "3 days ago", read: true }
];

export default function PartnerNotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState("ALL");

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === "UNREAD") return !n.read;
    if (activeTab === "ORDERS") return n.type === "order";
    if (activeTab === "PAYMENTS") return n.type === "payment";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      {/* PAGE HEADER */}
      <PageHeader 
        title="Notifications & Activity Hub"
        subtitle="Stay updated on new customer orders, payment transfers, and inventory stock alerts."
        actions={
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#ffffff", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={handleMarkAllRead}
            >
              <Check size={14} /> Mark All as Read
            </button>
            <button 
              style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={handleClearAll}
            >
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        }
      />

      {/* FILTER TABS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        {[
          { id: "ALL", label: `All (${notifications.length})` },
          { id: "UNREAD", label: `Unread (${unreadCount})` },
          { id: "ORDERS", label: "Orders" },
          { id: "PAYMENTS", label: "Payments" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === tab.id ? "#6366f1" : "rgba(255, 255, 255, 0.05)",
              color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS LIST */}
      <Card hoverLift={false}>
        {filteredNotifs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            <Bell size={40} style={{ color: "#64748b", marginBottom: "12px" }} /><br />
            No notifications to display.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredNotifs.map(n => (
              <div 
                key={n.id} 
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  padding: "16px",
                  borderRadius: "16px",
                  background: n.read ? "rgba(255, 255, 255, 0.02)" : "rgba(99, 102, 241, 0.08)",
                  border: n.read ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(99, 102, 241, 0.2)"
                }}
              >
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: n.type === "order" ? "rgba(99, 102, 241, 0.15)" : n.type === "payment" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                  color: n.type === "order" ? "#818cf8" : n.type === "payment" ? "#34d399" : "#fbbf24",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {n.type === "order" ? <ShoppingBag size={20} /> : n.type === "payment" ? <CreditCard size={20} /> : <AlertTriangle size={20} />}
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "14px", color: "#ffffff" }}>{n.title}</strong>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{n.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: "1.4" }}>{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
