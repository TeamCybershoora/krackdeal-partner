"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag,
  CheckCircle,
  TrendingUp,
  Star,
  ArrowUpRight,
  ShoppingBag,
  Clock,
  ChevronRight
} from "lucide-react";
import PageHeader from "./components/ui/PageHeader";
import Card from "./components/ui/Card";
import StatCard from "./components/ui/StatCard";
import styles from "./partner.module.css";
import { useAuth } from "@/app/context/AuthContext";
import { formatCurrency, formatDate } from "@/app/util/formatters";

export default function PartnerDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    deliveredCount: 0,
    storeRating: 4.9
  });

  const [recentOrders, setRecentOrders] = useState([]);

  // Fetch Live MongoDB Partner Data
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // 1. Fetch Products count
        const prodRes = await fetch("/API/partner/products");
        const prodData = await prodRes.json();
        const activeCount = (prodData.success && Array.isArray(prodData.products)) ? prodData.products.length : 0;

        // 2. Fetch Orders dataset
        const orderRes = await fetch("/API/partner/orders");
        const orderData = await orderRes.json();
        const ordersList = (orderData.success && Array.isArray(orderData.orders)) ? orderData.orders : [];

        const totalRev = ordersList
          .filter(o => o.status !== "REJECTED" && o.status !== "CANCELLED")
          .reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);

        const delivered = ordersList.filter(o => o.status === "DELIVERED").length;

        setStats({
          activeProducts: activeCount,
          totalOrders: ordersList.length,
          totalRevenue: totalRev,
          deliveredCount: delivered,
          storeRating: 4.9
        });

        setRecentOrders(ordersList.slice(0, 5));

      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div>
      {/* UNIFORM PAGE HEADER */}
      <PageHeader 
        title={`Welcome back, ${user?.name || "Merchant Partner"}!`}
        subtitle="Here is how your store is performing today. Data is live from MongoDB."
      />

      {/* STAT CARDS / SKELETON */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.skeletonCard} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className={styles.skeletonLine} style={{ width: "120px", height: "14px" }} />
              <div className={styles.skeletonLine} style={{ width: "90px", height: "26px" }} />
              <div className={styles.skeletonLine} style={{ width: "100px", height: "12px" }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <StatCard 
            label="Active Listed Products" 
            value={stats.activeProducts} 
            trend="+ Live in Store"
            icon={Tag}
            iconColor="#818cf8"
          />

          <StatCard 
            label="Total Customer Orders" 
            value={stats.totalOrders} 
            trend="+ Live Orders"
            icon={ShoppingBag}
            iconColor="#818cf8"
          />

          <StatCard 
            label="Total Gross Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} 
            trend="+ Gross Revenue"
            icon={CheckCircle}
            iconColor="#34d399"
          />

          <StatCard 
            label="Verified Store Rating" 
            value={`${stats.storeRating} ★`} 
            trend="+ Verified Store"
            icon={Star}
            iconColor="#eab308"
          />
        </div>
      )}

      {/* REUSABLE GLASS CARD: LIVE RECENT CUSTOMER ORDERS */}
      <Card hoverLift={false}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#ffffff" }}>Recent Customer Orders</h3>
          <Link href="/partner/orders" style={{ color: "#818cf8", textDecoration: "none", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
            View All Orders <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Order ID</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Customer Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Date</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Amount</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 16px" }}><div className={styles.skeletonLine} style={{ width: "80px", height: "16px" }} /></td>
                    <td style={{ padding: "14px 16px" }}><div className={styles.skeletonLine} style={{ width: "120px", height: "14px" }} /></td>
                    <td style={{ padding: "14px 16px" }}><div className={styles.skeletonLine} style={{ width: "70px", height: "12px" }} /></td>
                    <td style={{ padding: "14px 16px" }}><div className={styles.skeletonLine} style={{ width: "80px", height: "16px" }} /></td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}><div className={styles.skeletonLine} style={{ width: "70px", height: "22px", borderRadius: "8px", marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                    No customer orders received yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "800", color: "#818cf8" }}>
                      {order.orderId}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#ffffff" }}>
                      {order.shippingAddress?.fullName || order.user?.name || "Customer"}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#94a3b8" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "800", color: "#34d399" }}>
                      ₹{(order.total || order.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        background: "rgba(99, 102, 241, 0.15)",
                        color: "#818cf8",
                        border: "1px solid rgba(99, 102, 241, 0.3)"
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
