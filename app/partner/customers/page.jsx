"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Download, 
  ShoppingBag, 
  DollarSign, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Calendar,
  ArrowUpRight,
  UserCheck
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import styles from "../partner.module.css";

export default function PartnerCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Customers derived from MongoDB Orders
  useEffect(() => {
    async function fetchCustomersData() {
      try {
        setLoading(true);
        const res = await fetch("/API/partner/orders");
        const data = await res.json();

        if (data.success && Array.isArray(data.orders)) {
          const customerMap = {};
          
          data.orders.forEach(order => {
            const phone = order.shippingAddress?.phone || order.user?.phone || "N/A";
            const name = order.shippingAddress?.fullName || order.user?.name || "Customer";
            const email = order.user?.email || `${phone}@customer.krackdeal.com`;

            if (!customerMap[phone]) {
              customerMap[phone] = {
                id: order._id,
                name,
                email,
                phone,
                totalOrders: 0,
                totalSpent: 0,
                firstOrderDate: order.createdAt,
                lastOrderDate: order.createdAt,
                status: "ACTIVE"
              };
            }

            customerMap[phone].totalOrders += 1;
            customerMap[phone].totalSpent += (order.total || order.totalAmount || 0);
            if (new Date(order.createdAt) > new Date(customerMap[phone].lastOrderDate)) {
              customerMap[phone].lastOrderDate = order.createdAt;
            }
          });

          setCustomers(Object.values(customerMap));
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.error("Failed to load customers:", err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomersData();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
  });

  const totalCustomersCount = customers.length;
  const repeatCustomersCount = customers.filter(c => c.totalOrders > 1).length;
  const totalLifetimeSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = customers.length > 0 ? Math.round(totalLifetimeSpend / customers.reduce((sum, c) => sum + c.totalOrders, 0)) : 0;

  return (
    <div>
      {/* PAGE HEADER */}
      <PageHeader 
        title="Customer Management"
        subtitle="View and analyze all customers who have purchased from your merchant store."
      />

      {/* STATS ROW / SKELETON */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.skeletonCard} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className={styles.skeletonLine} style={{ width: "110px", height: "14px" }} />
              <div className={styles.skeletonLine} style={{ width: "80px", height: "26px" }} />
              <div className={styles.skeletonLine} style={{ width: "100px", height: "12px" }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <StatCard 
            label="Total Store Buyers" 
            value={totalCustomersCount} 
            trend="+ Verified Customers"
            icon={Users}
            iconColor="#818cf8"
          />

          <StatCard 
            label="Repeat Customers" 
            value={repeatCustomersCount} 
            trend={`${totalCustomersCount > 0 ? Math.round((repeatCustomersCount/totalCustomersCount)*100) : 0}% Repeat Rate`}
            icon={UserCheck}
            iconColor="#34d399"
          />

          <StatCard 
            label="Lifetime Spend" 
            value={`₹${totalLifetimeSpend.toLocaleString("en-IN")}`} 
            trend="+ Revenue Generated"
            icon={DollarSign}
            iconColor="#38bdf8"
          />

          <StatCard 
            label="Avg Order Value (AOV)" 
            value={`₹${avgOrderValue.toLocaleString("en-IN")}`} 
            trend="+ Per Basket Spend"
            icon={ShoppingBag}
            iconColor="#eab308"
          />
        </div>
      )}

      {/* SEARCH BAR & CUSTOMERS TABLE */}
      <Card hoverLift={false}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", padding: "8px 14px", width: "320px" }}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by Customer Name, Phone, Email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", color: "#ffffff", fontSize: "13px", width: "100%" }}
            />
          </div>

          <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "700" }}>
            Showing {filteredCustomers.length} Customers
          </span>
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Customer</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Phone</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Total Orders</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Lifetime Spend</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Last Purchase</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div className={styles.skeletonLine} style={{ width: "120px", height: "14px" }} />
                        <div className={styles.skeletonLine} style={{ width: "160px", height: "10px" }} />
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}><div className={styles.skeletonLine} style={{ width: "90px", height: "14px" }} /></td>
                    <td style={{ padding: "14px 16px" }}><div className={styles.skeletonLine} style={{ width: "60px", height: "14px" }} /></td>
                    <td style={{ padding: "14px 16px" }}><div className={styles.skeletonLine} style={{ width: "80px", height: "16px" }} /></td>
                    <td style={{ padding: "14px 16px" }}><div className={styles.skeletonLine} style={{ width: "70px", height: "12px" }} /></td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}><div className={styles.skeletonLine} style={{ width: "60px", height: "22px", borderRadius: "8px", marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No customer records found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.phone} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: "700", color: "#ffffff" }}>{customer.name}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{customer.email}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#cbd5e1" }}>
                      {customer.phone}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "800", color: "#818cf8" }}>
                      {customer.totalOrders} {customer.totalOrders === 1 ? "Order" : "Orders"}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "800", color: "#34d399" }}>
                      ₹{customer.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#94a3b8" }}>
                      {new Date(customer.lastOrderDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.3)"
                      }}>
                        ACTIVE
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
