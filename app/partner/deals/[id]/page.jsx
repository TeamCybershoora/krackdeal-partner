"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Tag, Calendar, ShoppingBag, Percent, 
  ShieldCheck, Layers, Clipboard, Check, Activity, Sparkles, BarChart2 
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "../../partner.module.css";

export default function ItemDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id;
  const type = searchParams.get("type") || "product";

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchDetails();
  }, [id, type]);

  const fetchDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = type === "product" ? `/API/partner/products?id=${id}` : `/API/partner/deals?id=${id}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.success) {
        setItem(type === "product" ? data.product : data.deal);
      } else {
        throw new Error(data.message || "Failed to load details");
      }
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: "#94a3b8" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(129, 140, 248, 0.1)",
          borderTopColor: "#818cf8",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginRight: "12px"
        }} />
        <span>Loading details...</span>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.glassCard} style={{ textAlign: "center", padding: "60px 20px" }}>
        <h3 style={{ color: "#f87171", fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>Error Loading Item</h3>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>{error || "Item not found or unauthorized access."}</p>
        <button className={styles.btnPrimary} onClick={() => router.push("/partner/deals")}>
          <ArrowLeft size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Back to Listings
        </button>
      </div>
    );
  }

  const statusColor = item.status === "APPROVED" || item.status === "Active" ? "#34d399" : "#f87171";
  const bgStatus = item.status === "APPROVED" || item.status === "Active" ? "rgba(52, 211, 153, 0.08)" : "rgba(248, 113, 113, 0.08)";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ paddingBottom: "60px" }}
    >
      {/* Top Navigation Row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button 
          onClick={() => router.push("/partner/deals")}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#94a3b8",
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <ArrowLeft size={14} />
          Back to Listings
        </button>
        <span style={{ color: "#475569" }}>/</span>
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
          {type === "product" ? "Product Details" : "Coupon Details"}
        </span>
      </div>

      {/* Main Grid View */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: Visual Media & Specifications */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* 1. Main Image Viewport */}
          <div className={styles.glassCard} style={{ padding: "0", overflow: "hidden", position: "relative", height: "380px" }}>
            <img 
              src={type === "product" ? (item.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600") : item.image}
              alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            
            {/* Type & Status Badges Overlay */}
            <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "8px" }}>
              <span style={{ background: "#4f46e5", color: "#fff", fontSize: "11px", fontWeight: "800", padding: "6px 12px", borderRadius: "6px", textTransform: "uppercase" }}>
                {type}
              </span>
              <span style={{ background: bgStatus, color: statusColor, border: `1px solid ${statusColor}40`, fontSize: "11px", fontWeight: "800", padding: "6px 12px", borderRadius: "6px", textTransform: "uppercase" }}>
                {item.status}
              </span>
            </div>
          </div>

          {/* 2. SPECIFICATIONS / ADDITIONAL METADATA */}
          {type === "product" && (
            <div className={styles.glassCard}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "#818cf8" }}>
                <Layers size={16} />
                Technical Specifications
              </h3>
              
              {item.specifications && Object.keys(item.specifications).length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "10px", overflow: "hidden" }}>
                  {Object.entries(item.specifications).map(([key, val], idx) => (
                    <div 
                      key={key} 
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        padding: "12px 16px", 
                        background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.15)",
                        borderBottom: idx < Object.keys(item.specifications).length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none"
                      }}
                    >
                      <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500", textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span style={{ fontSize: "13px", color: "#f8fafc", fontWeight: "600" }}>{String(val)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#64748b", fontSize: "13px", fontStyle: "italic" }}>No product specifications listed.</p>
              )}

              {/* Variants Section */}
              {item.hasVariants && item.variants && item.variants.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "#818cf8" }}>
                    <Sparkles size={16} />
                    Available Product Variants
                  </h3>
                  <div className={styles.adminTableWrapper}>
                    <table className={styles.adminTable}>
                      <thead>
                        <tr>
                          <th>Variant Name</th>
                          <th>SKU</th>
                          <th>Price</th>
                          <th>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.variants.map((v, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: "700" }}>{v.name}</td>
                            <td style={{ color: "#94a3b8" }}>{v.sku}</td>
                            <td style={{ color: "#34d399", fontWeight: "700" }}>₹{v.price}</td>
                            <td>{v.stock} units</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coupon styling mockup if type is deal */}
          {type === "deal" && (
            <div className={styles.glassCard} style={{ display: "flex", flexDirection: "column", gap: "16px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)", border: "1px solid rgba(129, 140, 248, 0.15)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", color: "#34d399" }}>
                <Sparkles size={16} />
                Live Coupon Design mockup
              </h3>
              
              {/* Premium Ticket Card */}
              <div 
                style={{
                  background: "#1e293b",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "2px dashed rgba(129, 140, 248, 0.3)",
                  position: "relative",
                  color: "#f8fafc"
                }}
              >
                {/* Left Cutout */}
                <div style={{ position: "absolute", top: "50%", left: "-12px", width: "24px", height: "24px", borderRadius: "50%", background: "#070a13", transform: "translateY(-50%)", borderRight: "2px dashed rgba(129, 140, 248, 0.3)" }} />
                {/* Right Cutout */}
                <div style={{ position: "absolute", top: "50%", right: "-12px", width: "24px", height: "24px", borderRadius: "50%", background: "#070a13", transform: "translateY(-50%)", borderLeft: "2px dashed rgba(129, 140, 248, 0.3)" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#818cf8", letterSpacing: "1px", textTransform: "uppercase" }}>OFFER VALUE</span>
                    <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#34d399", margin: "2px 0 0 0" }}>{item.discount}</h2>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase" }}>MERCHANT</span>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc", marginTop: "2px" }}>{item.merchant || "Your Store"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700" }}>{item.title}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Applicable on purchase of: <strong style={{ color: "#f8fafc" }}>{item.minPurchase}</strong></div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#94a3b8" }}>
                    <Calendar size={12} />
                    Valid till: {item.expiry}
                  </div>
                  <button 
                    onClick={() => handleCopyCode(item.code)}
                    style={{
                      background: "rgba(129, 140, 248, 0.12)",
                      border: "1px solid rgba(129, 140, 248, 0.3)",
                      color: "#a5b4fc",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                  >
                    {copied ? <Check size={12} style={{ color: "#34d399" }} /> : <Clipboard size={12} />}
                    {copied ? "Copied!" : item.code}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Metadata & Performance Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* 1. Core Listing Properties */}
          <div className={styles.glassCard}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#818cf8", letterSpacing: "1px", textTransform: "uppercase" }}>CORE DETAILS</span>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", marginTop: "6px", marginBottom: "16px", lineHeight: "1.3" }}>
              {item.title}
            </h1>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Category */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Tag size={14} /> Category
                </span>
                <span style={{ fontSize: "13px", color: "#f8fafc", fontWeight: "700" }}>
                  {type === "product" ? (item.category?.name || "Product") : (item.category || "Coupon")}
                </span>
              </div>

              {/* Price Details */}
              {type === "product" ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
                      Price
                    </span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "18px", color: "#34d399", fontWeight: "800" }}>₹{item.basePrice}</span>
                      {item.compareAtPrice > 0 && (
                        <span style={{ fontSize: "13px", color: "#64748b", textDecoration: "line-through", marginLeft: "8px" }}>₹{item.compareAtPrice}</span>
                      )}
                    </div>
                  </div>
                  
                  {item.compareAtPrice > item.basePrice && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>Total Discount</span>
                      <span style={{ fontSize: "13px", color: "#34d399", fontWeight: "800" }}>
                        {Math.round(((item.compareAtPrice - item.basePrice) / item.compareAtPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Percent size={14} /> Coupon Code
                  </span>
                  <span style={{ fontSize: "14px", color: "#818cf8", fontWeight: "800", background: "rgba(129,140,248,0.08)", padding: "4px 10px", borderRadius: "6px", border: "1px dashed rgba(129,140,248,0.2)" }}>
                    {item.code}
                  </span>
                </div>
              )}

              {/* Stock or Minimum Purchase */}
              {type === "product" ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
                    <ShoppingBag size={14} /> Available Stock
                  </span>
                  <span style={{ fontSize: "13px", color: item.totalStock > 5 ? "#34d399" : "#f87171", fontWeight: "700" }}>
                    {item.totalStock > 0 ? `${item.totalStock} units` : "Out of stock"}
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#94a3b8" }}>Min Purchase</span>
                  <span style={{ fontSize: "13px", color: "#ffffff", fontWeight: "700" }}>
                    {item.minPurchase}
                  </span>
                </div>
              )}

              {/* SKU or Expiry */}
              {type === "product" ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#94a3b8" }}>SKU Code</span>
                  <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "600" }}>
                    {item.sku || "N/A"}
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={14} /> Expiration
                  </span>
                  <span style={{ fontSize: "13px", color: "#f87171", fontWeight: "700" }}>
                    {item.expiry}
                  </span>
                </div>
              )}

              {/* Brand (Product only) */}
              {type === "product" && item.brand && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#94a3b8" }}>Brand</span>
                  <span style={{ fontSize: "13px", color: "#ffffff", fontWeight: "700" }}>
                    {item.brand}
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
