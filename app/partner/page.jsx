"use client";

import { useEffect, useState } from "react";
import {
  Tag,
  CheckCircle,
  TrendingUp,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag
} from "lucide-react";
import styles from "./partner.module.css";
import { useAuth } from "@/app/context/AuthContext";

const recentClaims = [
  { id: "1", user: "Ravi Ranjan", coupon: "KRACK50", date: "Just now", status: "Redeemed" },
  { id: "2", user: "Sumit Sharma", coupon: "PIZZA20", date: "12 mins ago", status: "Redeemed" },
  { id: "3", user: "Priya Patel", coupon: "ZARA300", date: "45 mins ago", status: "Redeemed" },
  { id: "4", user: "Amit Gupta", coupon: "BURGERBOGO", date: "2 hours ago", status: "Redeemed" },
  { id: "5", user: "Neha Sen", coupon: "KRACK50", date: "Yesterday", status: "Redeemed" }
];

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeDeals: 12,
    totalClaims: 348,
    redeemedCoupons: 312,
    storeRating: 4.8
  });

  return (
    <div className={styles.dashboardGrid}>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>
          Welcome back, {user?.name || "Partner"}!
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>
          Here is how your store is performing today.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>Active Promotions</span>
            <span className={styles.statValue}>{stats.activeDeals}</span>
            <span className={`${styles.statTrend} ${styles.trendUp}`}>
              <ArrowUpRight size={14} /> +2 new this week
            </span>
          </div>
          <div className={styles.statIconContainer} style={{ color: "#818cf8", backgroundColor: "rgba(129, 140, 248, 0.06)", border: "1px solid rgba(129, 140, 248, 0.15)" }}>
            <Tag size={22} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>Total Claims</span>
            <span className={styles.statValue}>{stats.totalClaims}</span>
            <span className={`${styles.statTrend} ${styles.trendUp}`}>
              <ArrowUpRight size={14} /> +18.4% this month
            </span>
          </div>
          <div className={styles.statIconContainer} style={{ color: "#818cf8", backgroundColor: "rgba(129, 140, 248, 0.06)", border: "1px solid rgba(129, 140, 248, 0.15)" }}>
            <ShoppingBag size={22} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>Redeemed Coupons</span>
            <span className={styles.statValue}>{stats.redeemedCoupons}</span>
            <span className={`${styles.statTrend} ${styles.trendUp}`}>
              <ArrowUpRight size={14} /> 89% conversion rate
            </span>
          </div>
          <div className={styles.statIconContainer} style={{ color: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
            <CheckCircle size={22} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>Store Rating</span>
            <span className={styles.statValue}>{stats.storeRating} ★</span>
            <span className={`${styles.statTrend} ${styles.trendUp}`}>
              <ArrowUpRight size={14} /> 124 customer reviews
            </span>
          </div>
          <div className={styles.statIconContainer} style={{ color: "#eab308", backgroundColor: "rgba(234, 179, 8, 0.06)", border: "1px solid rgba(234, 179, 8, 0.15)" }}>
            <Star size={22} />
          </div>
        </div>
      </div>

      {/* Row 2: Recent claims */}
      <div className={styles.glassCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent Coupon Redemptions</h3>
          <span className={styles.cardAction}>Export Log</span>
        </div>

        <div className={styles.adminTableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th style={{ padding: "8px 0" }}>Customer Name</th>
                <th style={{ padding: "8px 0" }}>Voucher Code</th>
                <th style={{ padding: "8px 0" }}>Redeemed At</th>
                <th style={{ padding: "8px 0", textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentClaims.map((claim) => (
                <tr key={claim.id}>
                  <td style={{ padding: "12px 0", fontSize: "13px" }}>{claim.user}</td>
                  <td style={{ padding: "12px 0", fontSize: "13px" }}>
                    <span style={{
                      fontWeight: "700",
                      background: "rgba(129, 140, 248, 0.08)",
                      border: "1px dashed rgba(129, 140, 248, 0.2)",
                      color: "#818cf8",
                      padding: "4px 8px",
                      borderRadius: "6px"
                    }}>
                      {claim.coupon}
                    </span>
                  </td>
                  <td style={{ padding: "12px 0", fontSize: "13px", color: "#94a3b8" }}>{claim.date}</td>
                  <td style={{ padding: "12px 0", textAlign: "right" }}>
                    <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                      {claim.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
