"use client";

import { useState, useEffect } from "react";
import { 
  Store, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Image, 
  Palette, 
  Tag, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Lock, 
  Smartphone, 
  Save, 
  RotateCcw, 
  Check, 
  Star, 
  ShoppingBag, 
  Package, 
  Users, 
  AlertCircle,
  Upload,
  Globe,
  Award,
  QrCode,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import styles from "./settings.module.css";

const ALL_CATEGORIES = [
  "Electronics & Accessories",
  "Fashion & Apparel",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Food & Beverages",
  "Fitness & Sports",
  "Books & Stationery",
  "Jewelry & Watches",
  "Automotive & Tools"
];

export default function PartnerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(null); // 'gpay', 'phonepe', 'paytm', 'bharatpe'
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Merchant Information State
  const [form, setForm] = useState({
    storeName: "",
    businessEmail: "",
    phone: "",
    ownerName: "",
    address: "",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    pincode: "110001",
    storeDescription: "",
    themeColor: "#6366f1",
    logoUrl: "",
    bannerUrl: "",
    gst: "",
    pan: "",
    licenseNo: "",
    categories: [],
    acceptOrders: true,
    vacationMode: false,
    autoAccept: true,
    codEnabled: true,
    businessHours: "09:00 AM - 09:00 PM",
    upiScanners: {
      gpay: "",
      phonepe: "",
      paytm: "",
      bharatpe: "",
      customUpiId: ""
    }
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Fetch Store Settings from MongoDB
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/API/partner/settings");
      const data = await res.json();

      if (data.success && data.partner) {
        const p = data.partner;
        setForm({
          storeName: p.storeName || "",
          businessEmail: p.businessEmail || "",
          phone: p.phone || "",
          ownerName: p.ownerName || "",
          address: p.address || "",
          city: p.city || "New Delhi",
          state: p.state || "Delhi",
          country: p.country || "India",
          pincode: p.pincode || "110001",
          storeDescription: p.storeDescription || "Official KrackDeal Verified Seller Store.",
          themeColor: p.themeColor || "#6366f1",
          logoUrl: p.logoUrl || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=256&auto=format&fit=crop",
          bannerUrl: p.bannerUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop",
          gst: p.gst || "",
          pan: p.pan || "",
          licenseNo: p.licenseNo || "",
          categories: Array.isArray(p.categories) ? p.categories : ["Electronics & Accessories"],
          acceptOrders: p.acceptOrders !== undefined ? p.acceptOrders : true,
          vacationMode: p.vacationMode !== undefined ? p.vacationMode : false,
          autoAccept: p.autoAccept !== undefined ? p.autoAccept : true,
          codEnabled: p.codEnabled !== undefined ? p.codEnabled : true,
          businessHours: p.businessHours || "09:00 AM - 09:00 PM",
          upiScanners: p.upiScanners || { gpay: "", phonepe: "", paytm: "", bharatpe: "", customUpiId: "" }
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Upload QR Scanner to Cloudinary Handler
  const handleUploadQrScanner = async (e, appKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(appKey);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", `qr_${appKey}`);

      const res = await fetch("/API/partner/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setForm(prev => ({
          ...prev,
          upiScanners: {
            ...prev.upiScanners,
            [appKey]: data.url
          }
        }));
        showToast(`${appKey.toUpperCase()} QR Scanner uploaded to Cloudinary!`, "success");
      } else {
        showToast(data.message || "Failed to upload QR scanner", "error");
      }
    } catch (err) {
      showToast("Error uploading QR code: " + err.message, "error");
    } finally {
      setUploadingQr(null);
    }
  };

  // Category Toggle Handler
  const toggleCategory = (cat) => {
    setForm(prev => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        return { ...prev, categories: prev.categories.filter(c => c !== cat) };
      } else {
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  // Save Handler (POST /API/partner/settings)
  const handleSaveSettings = async () => {
    if (!form.storeName || !form.businessEmail || !form.phone || !form.address) {
      showToast("Please fill all required store details.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/API/partner/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Store profile & UPI QR Scanners saved to MongoDB!", "success");
      } else {
        showToast(data.message || "Failed to save settings", "error");
      }
    } catch (err) {
      showToast("Error saving settings: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Profile Completion Calculation
  const requiredFields = [form.storeName, form.businessEmail, form.phone, form.address, form.ownerName, form.gst, form.pan];
  const filledCount = requiredFields.filter(f => Boolean(f && f.trim())).length;
  const completionPercent = Math.round((filledCount / requiredFields.length) * 100);

  return (
    <div>

      {/* TOAST NOTIFICATION */}
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
          {toast.type === "success" ? <CheckCircle2 size={18} color="#34d399" /> : <AlertCircle size={18} color="#f87171" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <PageHeader 
        title="Store Profile & Settings"
        subtitle="Manage your merchant branding, business address, tax numbers, and operational preferences."
      />

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Skeleton Hero Banner */}
          <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", overflow: "hidden", padding: "24px" }}>
            <div className={styles.skeletonLine} style={{ width: "100%", height: "160px", borderRadius: "16px", marginBottom: "20px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className={styles.skeletonLine} style={{ width: "70px", height: "70px", borderRadius: "16px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className={styles.skeletonLine} style={{ width: "200px", height: "20px" }} />
                <div className={styles.skeletonLine} style={{ width: "140px", height: "14px" }} />
              </div>
            </div>
          </div>

          {/* Skeleton 2-Column Form */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className={styles.skeletonLine} style={{ width: "140px", height: "18px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className={styles.skeletonLine} style={{ width: "100%", height: "42px", borderRadius: "10px" }} />
                  <div className={styles.skeletonLine} style={{ width: "100%", height: "42px", borderRadius: "10px" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className={styles.skeletonLine} style={{ width: "100%", height: "42px", borderRadius: "10px" }} />
                  <div className={styles.skeletonLine} style={{ width: "100%", height: "42px", borderRadius: "10px" }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className={styles.skeletonLine} style={{ width: "120px", height: "18px" }} />
                <div className={styles.skeletonLine} style={{ width: "100%", height: "100px", borderRadius: "12px" }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* HERO STORE HEADER CARD */}
          <div className={styles.storeHeroCard}>
            <img src={form.bannerUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop"} alt="Store Banner" className={styles.heroBanner} />
            
            <div className={styles.heroContent}>
              <div className={styles.logoWrapper}>
                <img src={form.logoUrl || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=256&auto=format&fit=crop"} alt="Store Logo" className={styles.storeLogo} />
                
                <div className={styles.storeMeta}>
                  <div className={styles.storeTitleRow}>
                    <h2 className={styles.storeTitle}>{form.storeName || "Partner Merchant Store"}</h2>
                    <span className={styles.verifiedPill}>
                      <ShieldCheck size={14} /> Verified Merchant
                    </span>
                  </div>
                  <span style={{ fontSize: "13px", color: "#94a3b8" }}>{form.address ? `${form.address}, ${form.city}` : "New Delhi, India"}</span>
                </div>
              </div>

              <div className={styles.heroStatsRow}>
                <div className={styles.heroStatItem}>
                  <span className={styles.heroStatVal}>4.9 ★</span>
                  <span className={styles.heroStatLabel}>Store Rating</span>
                </div>
                <div className={styles.heroStatItem}>
                  <span className={styles.heroStatVal}>348</span>
                  <span className={styles.heroStatLabel}>Orders</span>
                </div>
                <div className={styles.heroStatItem}>
                  <span className={styles.heroStatVal}>12</span>
                  <span className={styles.heroStatLabel}>Products</span>
                </div>
                <div className={styles.heroStatItem}>
                  <span className={styles.heroStatVal}>1.2K</span>
                  <span className={styles.heroStatLabel}>Followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN 2-COLUMN LAYOUT */}
          <div className={styles.settingsLayout}>

            {/* LEFT COLUMN: MERCHANT FORM SECTIONS */}
            <div>

              {/* SECTION 1: MERCHANT INFORMATION */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}><User size={20} color="#818cf8" /> Merchant Information</h3>
                
                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Store Name *</label>
                    <input type="text" className={styles.formInput} value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} placeholder="e.g. KrackDeal Official Store" />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Business Email *</label>
                    <input type="email" className={styles.formInput} value={form.businessEmail} onChange={e => setForm({...form, businessEmail: e.target.value})} placeholder="merchant@store.com" />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Helpline Phone Number *</label>
                    <input type="text" className={styles.formInput} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 9876543210" />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Owner / Authorized Contact Name</label>
                    <input type="text" className={styles.formInput} value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} placeholder="Full Name" />
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
                    <label className={styles.formLabel}>Full Physical Street Address *</label>
                    <input type="text" className={styles.formInput} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="House / Building / Market Street" />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>City</label>
                    <input type="text" className={styles.formInput} value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>State</label>
                    <input type="text" className={styles.formInput} value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Country</label>
                    <input type="text" className={styles.formInput} value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>PIN / Postal Code</label>
                    <input type="text" className={styles.formInput} value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* SECTION 2: BRANDING & MEDIA */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}><Palette size={20} color="#38bdf8" /> Store Branding & Appearance</h3>

                <div className={styles.formGroup} style={{ marginBottom: "16px" }}>
                  <label className={styles.formLabel}>Store Logo Image URL</label>
                  <input type="text" className={styles.formInput} value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})} placeholder="https://..." />
                </div>

                <div className={styles.formGroup} style={{ marginBottom: "16px" }}>
                  <label className={styles.formLabel}>Store Banner Image URL</label>
                  <input type="text" className={styles.formInput} value={form.bannerUrl} onChange={e => setForm({...form, bannerUrl: e.target.value})} placeholder="https://..." />
                </div>

                <div className={styles.formGroup} style={{ marginBottom: "16px" }}>
                  <label className={styles.formLabel}>Store Description & Tagline</label>
                  <textarea className={styles.formTextarea} value={form.storeDescription} onChange={e => setForm({...form, storeDescription: e.target.value})} placeholder="Tell buyers what makes your merchant store unique..." />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Brand Accent Color</label>
                  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                    {["#6366f1", "#10b981", "#ec4899", "#f59e0b", "#06b6d4"].map(col => (
                      <div 
                        key={col}
                        onClick={() => setForm({...form, themeColor: col})}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: col,
                          cursor: "pointer",
                          border: form.themeColor === col ? "3px solid #ffffff" : "none",
                          boxShadow: form.themeColor === col ? "0 0 12px " + col : "none"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: BUSINESS CATEGORIES */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}><Tag size={20} color="#c084fc" /> Business Categories</h3>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}>Select all categories that apply to your store inventory:</p>
                
                <div className={styles.categoryChipsGrid}>
                  {ALL_CATEGORIES.map(cat => {
                    const isSelected = form.categories.includes(cat);
                    return (
                      <div 
                        key={cat} 
                        className={`${styles.catChip} ${isSelected ? styles.catChipActive : ""}`}
                        onClick={() => toggleCategory(cat)}
                      >
                        {isSelected ? <Check size={14} /> : <Tag size={14} />}
                        <span>{cat}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: TAX & VERIFICATION */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}><ShieldCheck size={20} color="#34d399" /> Verification & Tax Compliance</h3>
                
                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>GST Identification Number (GSTIN)</label>
                    <input type="text" className={styles.formInput} value={form.gst} onChange={e => setForm({...form, gst: e.target.value})} placeholder="07AAAAA0000A1Z5" />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Permanent Account Number (PAN)</label>
                    <input type="text" className={styles.formInput} value={form.pan} onChange={e => setForm({...form, pan: e.target.value})} placeholder="ABCDE1234F" />
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
                    <label className={styles.formLabel}>Trade / FSSAI License Number</label>
                    <input type="text" className={styles.formInput} value={form.licenseNo} onChange={e => setForm({...form, licenseNo: e.target.value})} placeholder="License No..." />
                  </div>
                </div>
              </div>

              {/* SECTION 5: STORE PREFERENCES */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}><Clock size={20} color="#fbbf24" /> Operational Preferences</h3>

                <div className={styles.toggleRow}>
                  <div>
                    <strong style={{ fontSize: "14px", color: "#ffffff" }}>Accept Online Orders</strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Allow buyers to place new orders on KrackDeal marketplace</p>
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.acceptOrders ? styles.toggleSwitchActive : ""}`} onClick={() => setForm({...form, acceptOrders: !form.acceptOrders})}>
                    <div className={styles.toggleKnob} />
                  </div>
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <strong style={{ fontSize: "14px", color: "#ffffff" }}>Vacation Mode</strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Temporarily hide products while your store is closed</p>
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.vacationMode ? styles.toggleSwitchActive : ""}`} onClick={() => setForm({...form, vacationMode: !form.vacationMode})}>
                    <div className={styles.toggleKnob} />
                  </div>
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <strong style={{ fontSize: "14px", color: "#ffffff" }}>Enable Cash on Delivery (COD)</strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Accept doorstep Cash/UPI payments from buyers</p>
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.codEnabled ? styles.toggleSwitchActive : ""}`} onClick={() => setForm({...form, codEnabled: !form.codEnabled})}>
                    <div className={styles.toggleKnob} />
                  </div>
                </div>

                <div className={styles.toggleRow} style={{ borderBottom: "none" }}>
                  <div>
                    <strong style={{ fontSize: "14px", color: "#ffffff" }}>Auto Accept Incoming Orders</strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Automatically confirm orders upon customer payment</p>
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.autoAccept ? styles.toggleSwitchActive : ""}`} onClick={() => setForm({...form, autoAccept: !form.autoAccept})}>
                    <div className={styles.toggleKnob} />
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: LIVE PREVIEW & PROFILE COMPLETION */}
            <div>

              {/* LIVE STORE PREVIEW CARD */}
              <div className={styles.rightColCard}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 14px 0", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Eye size={18} color="#818cf8" /> Live Store Preview
                </h3>
                
                <div className={styles.previewCardBox}>
                  <img src={form.bannerUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop"} style={{ width: "100%", height: "80px", objectFit: "cover" }} />
                  <div style={{ padding: "14px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                      <img src={form.logoUrl || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=256&auto=format&fit=crop"} style={{ width: "40px", height: "40px", borderRadius: "10px", objectFit: "cover" }} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#ffffff" }}>{form.storeName || "Store Name"}</h4>
                        <span style={{ fontSize: "11px", color: "#34d399" }}>★ 4.9 (124 reviews)</span>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 8px 0" }}>{form.storeDescription}</p>
                    <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.06)", color: "#cbd5e1", padding: "4px 8px", borderRadius: "6px" }}>{form.city}, {form.state}</span>
                  </div>
                </div>
              </div>

              {/* PROFILE COMPLETION CARD */}
              <div className={styles.rightColCard}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 8px 0", color: "#ffffff" }}>Store Profile Completion</h3>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "800", color: "#34d399", marginBottom: "6px" }}>
                  <span>Completion Status</span>
                  <span>{completionPercent}%</span>
                </div>

                <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden", marginBottom: "16px" }}>
                  <div style={{ width: `${completionPercent}%`, height: "100%", background: "#34d399", borderRadius: "4px" }} />
                </div>

                {completionPercent < 100 && (
                  <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                    Fill out GST and Owner details to unlock VIP Partner Verification Badge.
                  </p>
                )}
              </div>

              {/* SECURITY & ACCESS CARD */}
              <div className={styles.rightColCard}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 14px 0", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Lock size={18} color="#f59e0b" /> Security & Account
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                    <span>Two-Factor Auth (2FA):</span>
                    <strong style={{ color: "#34d399" }}>ENABLED</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                    <span>Active Merchant Sessions:</span>
                    <strong style={{ color: "#818cf8" }}>1 Active Device</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* BOTTOM STICKY ACTION BAR */}
          <div className={styles.stickyActionBar}>
            <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "700" }}>
              {saving ? "Saving changes to MongoDB..." : "Unsaved store modifications"}
            </span>

            <div className={styles.stickyActionsRight}>
              <button className={styles.btnSecondary} onClick={fetchSettings}>
                Discard
              </button>
              <button className={styles.btnPrimarySave} onClick={handleSaveSettings} disabled={saving}>
                {saving ? "Saving to MongoDB..." : "Save Changes"}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
