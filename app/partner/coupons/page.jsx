"use client";

import { useState } from "react";
import { 
  Ticket, 
  Plus, 
  Search, 
  CheckCircle2, 
  Trash2, 
  DollarSign, 
  Percent, 
  Calendar,
  X
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";

const initialCoupons = [
  { id: "1", code: "KRACK50", discount: "₹150 OFF", minSpend: "₹999", totalRedeemed: 348, status: "ACTIVE", expiry: "31 Dec 2026" },
  { id: "2", code: "WELCOME20", discount: "20% OFF", minSpend: "₹499", totalRedeemed: 192, status: "ACTIVE", expiry: "31 Dec 2026" },
  { id: "3", code: "SUPERDEAL", discount: "₹300 OFF", minSpend: "₹1,999", totalRedeemed: 84, status: "EXPIRED", expiry: "01 Jan 2026" }
];

export default function PartnerCouponsPage() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "", minSpend: "" });

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;

    setCoupons(prev => [
      {
        id: Date.now().toString(),
        code: newCoupon.code.toUpperCase(),
        discount: newCoupon.discount,
        minSpend: newCoupon.minSpend || "₹0",
        totalRedeemed: 0,
        status: "ACTIVE",
        expiry: "31 Dec 2026"
      },
      ...prev
    ]);

    setShowModal(false);
    setNewCoupon({ code: "", discount: "", minSpend: "" });
  };

  const handleDelete = (id) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      {/* PAGE HEADER */}
      <PageHeader 
        title="Coupons & Promotional Offers"
        subtitle="Create and manage store promo codes, discount vouchers, and special sales offers."
        actions={
          <button 
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#ffffff",
              border: "none",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)"
            }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Create New Coupon
          </button>
        }
      />

      {/* STATS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <StatCard 
          label="Active Store Coupons" 
          value={coupons.filter(c => c.status === "ACTIVE").length} 
          trend="+ Live Promotions"
          icon={Ticket}
          iconColor="#818cf8"
        />

        <StatCard 
          label="Total Voucher Claims" 
          value={coupons.reduce((sum, c) => sum + c.totalRedeemed, 0)} 
          trend="+ Buyer Redemptions"
          icon={CheckCircle2}
          iconColor="#34d399"
        />

        <StatCard 
          label="Total Savings Given" 
          value="₹52,400" 
          trend="+ Discount Savings"
          icon={DollarSign}
          iconColor="#eab308"
        />
      </div>

      {/* COUPONS TABLE */}
      <Card hoverLift={false}>
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Coupon Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Discount</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Min Spend</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Redemptions</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Expiry</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontWeight: "800", background: "rgba(129, 140, 248, 0.12)", color: "#818cf8", border: "1px dashed rgba(129, 140, 248, 0.3)", padding: "4px 10px", borderRadius: "8px", fontSize: "13px" }}>
                      {coupon.code}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "800", color: "#34d399" }}>
                    {coupon.discount}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#cbd5e1" }}>
                    {coupon.minSpend}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "700", color: "#ffffff" }}>
                    {coupon.totalRedeemed} Claims
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "12px", color: "#94a3b8" }}>
                    {coupon.expiry}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <button 
                      onClick={() => handleDelete(coupon.id)}
                      style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "24px", padding: "32px", width: "420px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Create Store Promo Code</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateCoupon}>
              <input 
                type="text" 
                placeholder="Coupon Code (e.g. KRACK50)" 
                required
                value={newCoupon.code}
                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", marginBottom: "12px", outline: "none", textTransform: "uppercase" }}
              />

              <input 
                type="text" 
                placeholder="Discount Amount (e.g. ₹200 OFF or 15% OFF)" 
                required
                value={newCoupon.discount}
                onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", marginBottom: "12px", outline: "none" }}
              />

              <input 
                type="text" 
                placeholder="Min Spend Requirement (e.g. ₹999)" 
                value={newCoupon.minSpend}
                onChange={e => setNewCoupon({ ...newCoupon, minSpend: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", marginBottom: "20px", outline: "none" }}
              />

              <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#6366f1", color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer" }}>
                Create Coupon Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
