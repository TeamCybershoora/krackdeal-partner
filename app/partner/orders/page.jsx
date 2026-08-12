"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Package, 
  Truck, 
  Clock, 
  DollarSign, 
  Eye, 
  Check, 
  X, 
  Printer, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  AlertCircle,
  FileText,
  ChevronRight,
  Loader2,
  Tag,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import styles from "./orders.module.css";

export default function PartnerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Drawer & Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [previewScreenshot, setPreviewScreenshot] = useState(null);

  // Reject Modal State
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("Invalid UTR or Payment Screenshot Mismatch");

  // Ship Modal State
  const [shipModalOrder, setShipModalOrder] = useState(null);
  const [courierName, setCourierName] = useState("BlueDart Express");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Action Pending State
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Fetch Partner Orders from MongoDB
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/API/partner/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load partner orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Status Change & Payment Proof Verification Handler (PATCH /API/partner/orders)
  const handleUpdateStatus = async (orderId, newStatus, extraData = {}) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/API/partner/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          ...extraData
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `Order updated successfully!`, "success");
        fetchOrders();
        if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.orderId === orderId)) {
          setSelectedOrder(data.order);
        }
      } else {
        showToast(data.message || "Failed to update order", "error");
      }
    } catch (err) {
      showToast("Error updating status: " + err.message, "error");
    } finally {
      setUpdatingId(null);
      setRejectModalOrder(null);
      setShipModalOrder(null);
    }
  };

  // Export Orders CSV Handler
  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast("No orders available to export", "error");
      return;
    }
    const headers = ["Order ID", "Customer Name", "Customer Phone", "UTR Number", "Items Count", "Total Amount (INR)", "Payment Status", "Status", "Date"];
    const rows = orders.map(o => [
      o.orderId,
      o.shippingAddress?.fullName || o.user?.name || "Customer",
      o.shippingAddress?.phone || o.user?.phone || "N/A",
      o.paymentProof?.utrNumber || "N/A",
      o.items?.length || 1,
      o.total || o.totalAmount || 0,
      o.paymentStatus || "PENDING",
      o.status,
      new Date(o.createdAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KrackDeal_Partner_Orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Orders exported successfully!", "success");
  };

  // Filter Logic
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesId = o.orderId?.toLowerCase().includes(q);
    const matchesName = o.shippingAddress?.fullName?.toLowerCase().includes(q) || o.user?.name?.toLowerCase().includes(q);
    const matchesPhone = o.shippingAddress?.phone?.includes(q) || o.user?.phone?.includes(q);
    const matchesUtr = o.paymentProof?.utrNumber?.toLowerCase().includes(q);
    return matchesStatus && (matchesId || matchesName || matchesPhone || matchesUtr);
  });

  // Calculate Stat Counts
  const countNew = orders.filter(o => o.status === "PENDING").length;
  const countAccepted = orders.filter(o => o.status === "ACCEPTED" || o.status === "PROCESSING").length;
  const countPacked = orders.filter(o => o.status === "PACKED").length;
  const countShipped = orders.filter(o => o.status === "SHIPPED").length;
  const countDelivered = orders.filter(o => o.status === "DELIVERED").length;
  const countRejected = orders.filter(o => o.status === "REJECTED" || o.status === "CANCELLED").length;
  const revenueToday = orders
    .filter(o => o.status !== "REJECTED" && o.status !== "CANCELLED")
    .reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);

  return (
    <div>
      {/* FLOATING TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{
          position: "fixed",
          top: "30px",
          right: "30px",
          zIndex: 10001,
          background: "#0f172a",
          border: "1px solid #4f46e5",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          fontSize: "14px",
          fontWeight: "700"
        }}>
          {toast.type === "success" ? <CheckCircle2 size={18} color="#34d399" /> : <XCircle size={18} color="#f87171" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* UNIFORM PAGE HEADER PRIMITIVE */}
      <PageHeader 
        title="Order Management & Payment Proofs"
        subtitle="Verify customer UPI screenshots, UTR reference IDs, process, and ship orders."
        actions={
          <div style={{ display: "flex", gap: "10px" }}>
            <button className={styles.headerActionBtn} onClick={fetchOrders} title="Refresh Orders">
              <RefreshCw size={15} className={loading ? styles.buttonSpinner : ""} /> Refresh
            </button>
            <button className={`${styles.headerActionBtn} ${styles.primaryHeaderActionBtn}`} onClick={handleExportCSV}>
              <Download size={15} /> Export Orders CSV
            </button>
          </div>
        }
      />

      {/* STRATEGIC 4-CARD OVERVIEW METRICS DECK */}
      {loading ? (
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.skeletonCard} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className={styles.skeletonLine} style={{ width: "100px", height: "14px" }} />
              <div className={styles.skeletonLine} style={{ width: "80px", height: "26px" }} />
              <div className={styles.skeletonLine} style={{ width: "120px", height: "12px" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.statsGrid}>
          {/* CARD 1: TOTAL REVENUE */}
          <div className={`${styles.statCard} ${styles.statCardHero}`}>
            <div className={styles.statHeader} style={{ color: "#34d399" }}>
              <span>Total Revenue</span>
              <DollarSign size={18} color="#34d399" />
            </div>
            <div className={styles.statValHero}>₹{revenueToday.toLocaleString("en-IN")}</div>
            <div className={styles.statFooter}>
              <span style={{ color: "#34d399" }}>● Live Gross Sales</span>
            </div>
          </div>

          {/* CARD 2: NEW ORDERS (ACTION NEEDED) */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>New Orders</span>
              <Clock size={18} color="#fbbf24" />
            </div>
            <div className={styles.statVal} style={{ color: "#fbbf24" }}>{countNew}</div>
            <div className={styles.statFooter}>
              <span>{countNew > 0 ? "⚡ Action needed immediately" : "All orders caught up"}</span>
            </div>
          </div>

          {/* CARD 3: IN FULFILLMENT */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>In Fulfillment</span>
              <Package size={18} color="#818cf8" />
            </div>
            <div className={styles.statVal} style={{ color: "#818cf8" }}>{countAccepted + countPacked + countShipped}</div>
            <div className={styles.statFooter}>
              <span>{countAccepted} Accepted • {countPacked} Packed • {countShipped} Shipped</span>
            </div>
          </div>

          {/* CARD 4: COMPLETED & DELIVERED */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Completed Orders</span>
              <CheckCircle2 size={18} color="#34d399" />
            </div>
            <div className={styles.statVal} style={{ color: "#34d399" }}>{countDelivered}</div>
            <div className={styles.statFooter}>
              <span>{countDelivered} Delivered • {countRejected} Rejected</span>
            </div>
          </div>
        </div>
      )}

      {/* FILTERS & SEARCH BAR */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by Order ID, UTR, Customer Name..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.statusFilterTabs}>
          {[
            { id: "ALL", label: `All Orders (${orders.length})` },
            { id: "PENDING", label: `New (${countNew})` },
            { id: "ACCEPTED", label: `Accepted (${countAccepted})` },
            { id: "PACKED", label: `Packed (${countPacked})` },
            { id: "SHIPPED", label: `Shipped (${countShipped})` },
            { id: "DELIVERED", label: `Delivered (${countDelivered})` },
            { id: "REJECTED", label: `Rejected (${countRejected})` }
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.filterTabBtn} ${statusFilter === tab.id ? styles.filterTabActive : ""}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS TABLE CONTAINER */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>UTR & Payment Proof</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Delivery Address</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <tr key={i}>
                    <td><div className={styles.skeletonLine} style={{ width: "90px", height: "16px", background: "rgba(255,255,255,0.06)" }} /></td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div className={styles.skeletonLine} style={{ width: "110px", height: "14px", background: "rgba(255,255,255,0.06)" }} />
                        <div className={styles.skeletonLine} style={{ width: "80px", height: "10px", background: "rgba(255,255,255,0.04)" }} />
                      </div>
                    </td>
                    <td><div className={styles.skeletonLine} style={{ width: "120px", height: "14px", background: "rgba(255,255,255,0.06)" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "75px", height: "16px", background: "rgba(255,255,255,0.06)" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "65px", height: "20px", borderRadius: "6px", background: "rgba(255,255,255,0.06)" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "100px", height: "12px", background: "rgba(255,255,255,0.04)" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "70px", height: "12px", background: "rgba(255,255,255,0.04)" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "75px", height: "22px", borderRadius: "8px", background: "rgba(255,255,255,0.06)" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "110px", height: "32px", borderRadius: "10px", background: "rgba(255,255,255,0.06)" }} /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No customer orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const customerName = order.shippingAddress?.fullName || order.user?.name || "Customer";
                  const phone = order.shippingAddress?.phone || order.user?.phone || "N/A";
                  const totalAmt = order.total || order.totalAmount || 0;
                  const utr = order.paymentProof?.utrNumber;
                  const proofScreenshot = order.paymentProof?.screenshotUrl;

                  return (
                    <tr key={order._id} className={styles.tableRow}>
                      <td style={{ fontWeight: "800", color: "#818cf8", letterSpacing: "0.5px" }}>{order.orderId}</td>
                      <td>
                        <div style={{ fontWeight: "700", color: "#ffffff" }}>{customerName}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{phone}</div>
                      </td>

                      {/* UTR & PROOF SCREENSHOT PREVIEW */}
                      <td>
                        {order.paymentMethod?.type === "UPI" ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {proofScreenshot ? (
                              <img 
                                src={proofScreenshot} 
                                alt="Proof" 
                                style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", border: "1px solid #34d399", cursor: "pointer" }}
                                onClick={() => setPreviewScreenshot(proofScreenshot)}
                                title="Click to view full screenshot"
                              />
                            ) : (
                              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justify: "center", color: "#94a3b8" }}>
                                <FileText size={16} />
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: "12px", fontWeight: "800", color: "#ffffff" }}>UTR: {utr || "N/A"}</div>
                              <span style={{ fontSize: "10px", fontWeight: "700", color: order.paymentProof?.status === "VERIFIED" ? "#34d399" : order.paymentProof?.status === "REJECTED" ? "#f87171" : "#fbbf24" }}>
                                {order.paymentProof?.status || "Pending Verification"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>{order.paymentMethod?.type || "COD"}</span>
                        )}
                      </td>

                      <td style={{ fontWeight: "800", color: "#34d399" }}>₹{totalAmt.toLocaleString("en-IN")}</td>
                      <td>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: order.paymentStatus === "PAID" ? "#34d399" : "#fbbf24", background: order.paymentStatus === "PAID" ? "rgba(52, 211, 153, 0.15)" : "rgba(251, 191, 36, 0.15)", padding: "4px 8px", borderRadius: "6px", border: `1px solid ${order.paymentStatus === "PAID" ? "rgba(52, 211, 153, 0.3)" : "rgba(251, 191, 36, 0.3)"}` }}>
                          {order.paymentStatus || "PENDING"}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "#cbd5e1", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", textTransform: "capitalize" }}>
                        {order.shippingAddress ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : "Standard Shipping"}
                      </td>
                      <td style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                      <td>
                        <span className={`${styles.statusChip} ${
                          order.status === "PENDING" ? styles.chipPending :
                          order.status === "ACCEPTED" || order.status === "PROCESSING" ? styles.chipAccepted :
                          order.status === "PACKED" ? styles.chipPacked :
                          order.status === "SHIPPED" ? styles.chipShipped :
                          order.status === "DELIVERED" ? styles.chipDelivered : styles.chipRejected
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActionsGroup}>
                          {/* DECORATED ACTION BUTTONS */}
                          {order.paymentStatus !== "PAID" && order.status === "PENDING" && (
                            <button 
                              className={styles.actionBtnVerify} 
                              onClick={() => handleUpdateStatus(order.orderId, null, { actionType: "CONFIRM_PAYMENT" })}
                              title="Confirm Payment Received"
                            >
                              <ShieldCheck size={14} /> Verify Payment
                            </button>
                          )}

                          {order.status === "PENDING" && (
                            <button className={styles.actionBtnReject} onClick={() => setRejectModalOrder(order)} title="Reject Order">
                              <X size={14} /> Reject
                            </button>
                          )}

                          {order.status === "ACCEPTED" && (
                            <button className={styles.actionBtnPack} onClick={() => handleUpdateStatus(order.orderId, "PACKED")} title="Mark Order as Packed">
                              <Package size={14} /> Mark Packed
                            </button>
                          )}

                          {order.status === "PACKED" && (
                            <button className={styles.actionBtnShip} onClick={() => setShipModalOrder(order)} title="Dispatch and Ship Order">
                              <Truck size={14} /> Ship Order
                            </button>
                          )}

                          {order.status === "SHIPPED" && (
                            <button className={styles.actionBtnDeliver} onClick={() => handleUpdateStatus(order.orderId, "DELIVERED")} title="Mark as Delivered">
                              <CheckCircle2 size={14} /> Mark Delivered
                            </button>
                          )}

                          {/* SMART INSPECT BUTTON: Text badge if no primary action, Icon button if action present */}
                          <button 
                            className={`${styles.actionBtnInspect} ${
                              (order.status === "ACCEPTED" || order.status === "PACKED" || order.status === "SHIPPED" || (order.status === "PENDING")) 
                                ? styles.actionBtnIconOnly 
                                : ""
                            }`} 
                            onClick={() => { setSelectedOrder(order); setIsDrawerOpen(true); }} 
                            title="View Order Details & Screenshot"
                          >
                            <Eye size={14} />
                            {!(order.status === "ACCEPTED" || order.status === "PACKED" || order.status === "SHIPPED" || (order.status === "PENDING")) && (
                              <span>View Details</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT SLIDE DRAWER: ORDER DETAILS & PAYMENT SCREENSHOT */}
      <AnimatePresence>
        {isDrawerOpen && selectedOrder && (
          <div className={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)}>
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={styles.drawerContent} 
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.drawerHeader}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>Order #{selectedOrder.orderId}</h2>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <button className={styles.drawerCloseBtn} onClick={() => setIsDrawerOpen(false)}><X size={20} /></button>
              </div>

              {/* PAYMENT VERIFICATION PROOF DRAWER CARD */}
              {selectedOrder.paymentProof && (
                <div className={styles.drawerSectionBox} style={{ border: "1px solid rgba(52, 211, 153, 0.3)", background: "rgba(52, 211, 153, 0.05)" }}>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "800", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
                    <ShieldCheck size={16} /> Customer Payment Verification Proof
                  </h3>
                  
                  <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "12px" }}>
                    {selectedOrder.paymentProof.screenshotUrl ? (
                      <a href={selectedOrder.paymentProof.screenshotUrl} target="_blank" rel="noreferrer">
                        <img 
                          src={selectedOrder.paymentProof.screenshotUrl} 
                          alt="Screenshot" 
                          style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover", border: "2px solid #34d399" }} 
                        />
                      </a>
                    ) : (
                      <div style={{ width: "80px", height: "80px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                        No Screenshot
                      </div>
                    )}

                    <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
                      UTR ID: <strong style={{ color: "#ffffff", fontSize: "15px" }}>{selectedOrder.paymentProof.utrNumber || "N/A"}</strong><br />
                      App: {selectedOrder.paymentProof.upiApp?.toUpperCase() || "UPI"}<br />
                      Status: <strong style={{ color: selectedOrder.paymentProof.status === "VERIFIED" ? "#34d399" : "#fbbf24" }}>{selectedOrder.paymentProof.status}</strong>
                    </div>
                  </div>

                  {selectedOrder.paymentStatus !== "PAID" && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                      <button 
                        className={styles.miniBtnAccept} 
                        style={{ flex: 1, padding: "8px", fontSize: "12px" }}
                        onClick={() => handleUpdateStatus(selectedOrder.orderId, null, { actionType: "CONFIRM_PAYMENT" })}
                      >
                        Confirm Payment Received
                      </button>
                      <button 
                        className={styles.miniBtnReject} 
                        style={{ flex: 1, padding: "8px", fontSize: "12px" }}
                        onClick={() => handleUpdateStatus(selectedOrder.orderId, null, { actionType: "REJECT_PAYMENT_PROOF", rejectionReason: "Invalid UTR ID or screenshot" })}
                      >
                        Reject Payment Proof
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TIMELINE */}
              <div className={styles.drawerSectionBox}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#818cf8" }}>Order Activity Timeline</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedOrder.timeline && selectedOrder.timeline.length > 0 ? (
                    selectedOrder.timeline.map((ev, i) => (
                      <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "12px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", marginTop: "4px" }} />
                        <div>
                          <strong style={{ color: "#ffffff" }}>{ev.title}</strong>
                          <p style={{ margin: 0, color: "#94a3b8" }}>{ev.description}</p>
                          <span style={{ fontSize: "10px", color: "#64748b" }}>{new Date(ev.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Order received and pending seller acceptance.</span>
                  )}
                </div>
              </div>

              {/* CUSTOMER INFORMATION */}
              <div className={styles.drawerSectionBox}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "800" }}>Customer & Shipping Address</h3>
                {selectedOrder.shippingAddress && (
                  <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5" }}>
                    <strong>{selectedOrder.shippingAddress.fullName}</strong><br />
                    <Phone size={12} style={{ display: "inline", marginRight: "4px" }} /> {selectedOrder.shippingAddress.phone}<br />
                    <MapPin size={12} style={{ display: "inline", marginRight: "4px" }} /> {selectedOrder.shippingAddress.houseNo}, {selectedOrder.shippingAddress.area}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                  </div>
                )}
              </div>

              {/* ORDER ITEMS */}
              <div className={styles.drawerSectionBox}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "800" }}>Ordered Items</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={item.thumbnail} alt={item.title} style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }} />
                        <div>
                          <strong style={{ fontSize: "13px", color: "#ffffff" }}>{item.title}</strong>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Variant: {item.variantName || "Standard"} • Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: "800" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAYMENT SUMMARY */}
              <div className={styles.drawerSectionBox}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "800" }}>Payment Summary</h3>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8" }}>
                  <span>Subtotal:</span><span>₹{selectedOrder.subtotal?.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8" }}>
                  <span>GST Tax (5%):</span><span>₹{selectedOrder.tax?.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "800", color: "#ffffff", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <span>Grand Total:</span><span>₹{(selectedOrder.total || selectedOrder.totalAmount)?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* PRINT INVOICE CTA */}
              <button className={`${styles.actionBtn} ${styles.primaryActionBtn}`} onClick={() => window.print()} style={{ justifyContent: "center" }}>
                <Printer size={16} /> Print Order Invoice
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX FOR SCREENSHOT PREVIEW */}
      {previewScreenshot && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", zIndex: 10002, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPreviewScreenshot(null)}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <img src={previewScreenshot} alt="Full Screenshot" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "16px" }} />
            <button onClick={() => setPreviewScreenshot(null)} style={{ position: "absolute", top: "-40px", right: 0, background: "#ffffff", color: "#000", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "800" }}>X</button>
          </div>
        </div>
      )}

      {/* MODAL 1: REJECT ORDER DIALOG */}
      {rejectModalOrder && (
        <div className={styles.modalOverlay} onClick={() => setRejectModalOrder(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "800" }}>Reject Order #{rejectModalOrder.orderId}</h2>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>Select a reason for rejecting this customer order:</p>
            
            <select 
              value={rejectionReason} 
              onChange={e => setRejectionReason(e.target.value)}
              className={styles.modalInput}
            >
              <option value="Invalid UTR or Payment Screenshot Mismatch">Invalid UTR or Payment Screenshot Mismatch</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Wrong Price Listing">Wrong Price Listing</option>
              <option value="Delivery Area Unserviceable">Delivery Area Unserviceable</option>
            </select>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button 
                className={styles.miniBtnReject} 
                style={{ flex: 1, padding: "10px", fontSize: "13px" }}
                onClick={() => handleUpdateStatus(rejectModalOrder.orderId, "REJECTED", { rejectionReason, actionType: "REJECT_PAYMENT_PROOF" })}
              >
                Confirm Reject
              </button>
              <button 
                className={styles.miniBtn} 
                style={{ flex: 1, padding: "10px", fontSize: "13px" }}
                onClick={() => setRejectModalOrder(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SHIP ORDER DIALOG */}
      {shipModalOrder && (
        <div className={styles.modalOverlay} onClick={() => setShipModalOrder(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "800" }}>Ship Order #{shipModalOrder.orderId}</h2>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>Enter shipment courier details for customer tracking:</p>

            <input 
              type="text" 
              placeholder="Courier Name (e.g. BlueDart Express)" 
              value={courierName}
              onChange={e => setCourierName(e.target.value)}
              className={styles.modalInput}
            />

            <input 
              type="text" 
              placeholder="Tracking Number (e.g. BD-89234190)" 
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              className={styles.modalInput}
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button 
                className={`${styles.actionBtn} ${styles.primaryActionBtn}`} 
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => handleUpdateStatus(shipModalOrder.orderId, "SHIPPED", { courierName, trackingNumber })}
              >
                Confirm Shipment
              </button>
              <button 
                className={styles.miniBtn} 
                style={{ flex: 1, padding: "10px" }}
                onClick={() => setShipModalOrder(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
