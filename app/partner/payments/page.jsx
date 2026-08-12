"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  QrCode, 
  Plus, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  Check, 
  Smartphone, 
  X, 
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import styles from "./payments.module.css";

const RECOMMENDED_FAMOUS_APPS = [
  { name: "Google Pay", key: "gpay", defaultColor: "#4285F4" },
  { name: "PhonePe", key: "phonepe", defaultColor: "#5f259f" },
  { name: "Paytm", key: "paytm", defaultColor: "#00baf2" },
  { name: "BharatPe", key: "bharatpe", defaultColor: "#00d285" },
  { name: "BHIM UPI", key: "bhim", defaultColor: "#00529b" },
  { name: "Cred UPI", key: "cred", defaultColor: "#ffffff" },
  { name: "Amazon Pay", key: "amazonpay", defaultColor: "#ff9900" },
  { name: "Navi UPI", key: "navi", defaultColor: "#00e676" }
];

export default function PartnerPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Dynamic Merchant UPI Apps dataset
  const [dynamicUpiApps, setDynamicUpiApps] = useState([]);

  // Modal State for Adding Custom UPI App
  const [showAddModal, setShowAddModal] = useState(false);
  const [customAppName, setCustomAppName] = useState("");
  const [customUpiId, setCustomUpiId] = useState("");
  const [customQrUrl, setCustomQrUrl] = useState("");
  const [modalUploading, setModalUploading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Fetch Merchant Payment Details from MongoDB
  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch("/API/partner/payments");
      const data = await res.json();

      if (data.success) {
        if (Array.isArray(data.dynamicUpiApps)) {
          setDynamicUpiApps(data.dynamicUpiApps);
        } else if (data.upiScanners) {
          // Pre-populate from old upiScanners if present
          const u = data.upiScanners;
          const initialList = [];
          if (u.gpay) initialList.push({ id: "gpay", appName: "Google Pay", appKey: "gpay", qrUrl: u.gpay, upiId: u.customUpiId || "", isActive: true });
          if (u.phonepe) initialList.push({ id: "phonepe", appName: "PhonePe", appKey: "phonepe", qrUrl: u.phonepe, upiId: u.customUpiId || "", isActive: true });
          if (u.paytm) initialList.push({ id: "paytm", appName: "Paytm", appKey: "paytm", qrUrl: u.paytm, upiId: u.customUpiId || "", isActive: true });
          if (u.bharatpe) initialList.push({ id: "bharatpe", appName: "BharatPe", appKey: "bharatpe", qrUrl: u.bharatpe, upiId: u.customUpiId || "", isActive: true });
          setDynamicUpiApps(initialList);
        } else {
          setDynamicUpiApps([]);
        }
      }
    } catch (err) {
      console.error("Failed to load payment settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  // Add Recommended Famous App to Merchant List
  const handleAddRecommendedApp = (rec) => {
    const exists = dynamicUpiApps.some(app => app.appKey === rec.key || app.appName.toLowerCase() === rec.name.toLowerCase());
    if (exists) {
      showToast(`${rec.name} is already in your payments list!`, "error");
      return;
    }

    const newApp = {
      id: `${rec.key}_${Date.now()}`,
      appName: rec.name,
      appKey: rec.key,
      qrUrl: "",
      upiId: "",
      isActive: true
    };

    setDynamicUpiApps(prev => [...prev, newApp]);
    showToast(`Added ${rec.name} to your payment setup!`, "success");
  };

  // Upload QR Scanner to Cloudinary for a specific app
  const handleUploadQrForApp = async (e, appId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(appId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", `upi_qr_${appId}`);

      const res = await fetch("/API/partner/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setDynamicUpiApps(prev => prev.map(app => {
          if (app.id === appId) {
            return { ...app, qrUrl: data.url };
          }
          return app;
        }));
        showToast("QR Scanner image uploaded to Cloudinary!", "success");
      } else {
        showToast(data.message || "Failed to upload QR image", "error");
      }
    } catch (err) {
      showToast("Upload failed: " + err.message, "error");
    } finally {
      setUploadingId(null);
    }
  };

  // Upload QR for Modal (Custom App)
  const handleModalQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModalUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "custom_qr");

      const res = await fetch("/API/partner/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setCustomQrUrl(data.url);
        showToast("Custom QR Scanner uploaded to Cloudinary!", "success");
      } else {
        showToast("Upload failed", "error");
      }
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      setModalUploading(false);
    }
  };

  // Save Custom App from Modal
  const handleSaveCustomAppModal = (e) => {
    e.preventDefault();
    const cleanName = customAppName.trim();
    const cleanUpi = customUpiId.trim();

    if (!cleanName || cleanName.length < 2) {
      showToast("Please enter a valid App Name (at least 2 characters)", "error");
      return;
    }

    if (cleanUpi && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(cleanUpi)) {
      showToast("Please enter a valid UPI ID format (e.g. merchant@okhdfcbank)", "error");
      return;
    }

    const cleanKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");

    const newApp = {
      id: `custom_${Date.now()}`,
      appName: cleanName,
      appKey: cleanKey,
      qrUrl: customQrUrl,
      upiId: cleanUpi,
      isActive: true
    };

    setDynamicUpiApps(prev => [...prev, newApp]);
    setShowAddModal(false);
    setCustomAppName("");
    setCustomUpiId("");
    setCustomQrUrl("");
    showToast(`Added custom app ${cleanName}! Click 'Save All Settings' to commit.`, "success");
  };

  // Toggle App Active/Inactive Status
  const handleToggleAppActive = (appId) => {
    setDynamicUpiApps(prev => prev.map(app => {
      if (app.id === appId) {
        const nextState = !app.isActive;
        showToast(`${app.appName} set to ${nextState ? "ACTIVE" : "INACTIVE"}. Save settings to commit.`, "info");
        return { ...app, isActive: nextState };
      }
      return app;
    }));
  };

  // Delete App from List
  const handleDeleteApp = (appId) => {
    setDynamicUpiApps(prev => prev.filter(app => app.id !== appId));
    showToast("App removed from list.", "info");
  };

  // Save ALL Settings to MongoDB (POST /API/partner/payments)
  const handleSaveAllSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/API/partner/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dynamicUpiApps })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("All UPI QR Scanners & payment settings saved to MongoDB!", "success");
      } else {
        showToast(data.message || "Failed to save payment apps", "error");
      }
    } catch (err) {
      showToast("Error saving: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const activeCount = dynamicUpiApps.filter(a => a.isActive && a.qrUrl).length;

  return (
    <div className={styles.pageWrapper}>

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

      {/* UNIFORM PAGE HEADER */}
      <PageHeader 
        title="Merchant Payments & Dynamic UPI QR Setup"
        subtitle="Manage custom payment QR scanners for Google Pay, PhonePe, Paytm, BharatPe, Cred, Amazon Pay, and custom apps."
        actions={
          <button 
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#ffffff",
              border: "none",
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)"
            }}
            onClick={handleSaveAllSettings}
            disabled={saving}
          >
            {saving ? <Loader2 size={16} className={styles.buttonSpinner} /> : <Save size={16} />}
            {saving ? "Saving to MongoDB..." : "Save Payment Settings"}
          </button>
        }
      />

      {/* STATS ROW / SKELETON */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "8px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonCard} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className={styles.skeletonLine} style={{ width: "120px", height: "14px" }} />
              <div className={styles.skeletonLine} style={{ width: "70px", height: "26px" }} />
              <div className={styles.skeletonLine} style={{ width: "100px", height: "12px" }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "8px" }}>
          <StatCard 
            label="Active QR Scanners" 
            value={activeCount} 
            trend="Live at Checkout"
            icon={QrCode}
            iconColor="#34d399"
          />

          <StatCard 
            label="Configured UPI Apps" 
            value={dynamicUpiApps.length} 
            trend="Dynamic Payment Methods"
            icon={Smartphone}
            iconColor="#818cf8"
          />

          <StatCard 
            label="Cloudinary Hosting" 
            value="SECURE" 
            trend="256-bit Encrypted"
            icon={ShieldCheck}
            iconColor="#38bdf8"
          />
        </div>
      )}

      {/* SECTION 1: RECOMMENDED FAMOUS UPI APPS BAR */}
      <div className={styles.recommendedSection}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={18} color="#818cf8" />
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#ffffff" }}>Recommended Famous UPI Apps</h3>
        </div>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0" }}>
          Click any famous app below to instantly add it to your merchant store payment setup:
        </p>

        <div className={styles.recommendedGrid}>
          {RECOMMENDED_FAMOUS_APPS.map(rec => {
            const isAdded = dynamicUpiApps.some(a => a.appKey === rec.key || a.appName.toLowerCase() === rec.name.toLowerCase());
            return (
              <button 
                key={rec.key} 
                className={`${styles.recommendedChip} ${isAdded ? styles.recommendedChipAdded : ""}`}
                onClick={() => handleAddRecommendedApp(rec)}
              >
                {isAdded ? <Check size={14} /> : <Plus size={14} />}
                <span>{rec.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: DYNAMIC UPI QR SCANNER CARDS GRID */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#ffffff" }}>
            Configured Merchant QR Scanners ({dynamicUpiApps.length})
          </h3>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Only active apps with uploaded QR images will be shown to buyers during checkout</span>
        </div>

        {loading ? (
          <div className={styles.upiGrid}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={styles.upiCard} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div className={styles.skeletonLine} style={{ width: "100px", height: "18px" }} />
                  <div className={styles.skeletonLine} style={{ width: "40px", height: "20px", borderRadius: "99px" }} />
                </div>
                <div className={styles.skeletonLine} style={{ width: "100%", height: "180px", borderRadius: "14px" }} />
                <div className={styles.skeletonLine} style={{ width: "100%", height: "36px", borderRadius: "10px" }} />
              </div>
            ))}
          </div>
        ) : dynamicUpiApps.length === 0 ? (
          <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "40px", textAlign: "center" }}>
            <QrCode size={40} style={{ color: "#64748b", marginBottom: "12px" }} /><br />
            <strong style={{ color: "#ffffff", fontSize: "16px" }}>No UPI Scanners Configured Yet</strong>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "6px 0 20px 0" }}>Select a recommended app above or add a custom app below to start accepting buyer payments.</p>
          </div>
        ) : (
          <div className={styles.qrGrid}>
            {dynamicUpiApps.map((app, index) => {
              const isUploading = uploadingId === app.id;

              return (
                <div key={app.id || index} className={styles.qrCard}>
                  
                  {/* CARD HEADER */}
                  <div className={styles.qrHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Smartphone size={18} color="#818cf8" />
                      <strong style={{ fontSize: "15px", color: "#ffffff" }}>{app.appName}</strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button 
                        type="button"
                        onClick={() => handleToggleAppActive(app.id)}
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          border: app.isActive ? "1px solid #34d399" : "1px solid #64748b",
                          cursor: "pointer",
                          background: app.isActive ? "rgba(52, 211, 153, 0.2)" : "rgba(100, 116, 139, 0.2)",
                          color: app.isActive ? "#34d399" : "#94a3b8",
                          transition: "all 0.2s ease"
                        }}
                        title="Click to toggle Active / Inactive state"
                      >
                        {app.isActive ? "● ACTIVE" : "○ INACTIVE"}
                      </button>

                      <button onClick={() => handleDeleteApp(app.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }} title="Delete App">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* QR SCANNER PREVIEW BOX */}
                  <div className={styles.qrPreviewBox}>
                    {app.qrUrl ? (
                      <img src={app.qrUrl} alt={app.appName} className={styles.qrImage} />
                    ) : (
                      <div style={{ textAlign: "center", color: "#64748b", fontSize: "12px", padding: "16px" }}>
                        <QrCode size={36} style={{ marginBottom: "6px", opacity: 0.5 }} /><br />
                        No Scanner Image Uploaded
                      </div>
                    )}
                  </div>

                  {/* UPI VPA ID INPUT */}
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px", display: "block" }}>UPI VPA ID (e.g. merchant@upi)</label>
                    <input 
                      type="text" 
                      placeholder="Enter UPI VPA ID..." 
                      value={app.upiId || ""}
                      onChange={e => {
                        const val = e.target.value;
                        setDynamicUpiApps(prev => prev.map(a => a.id === app.id ? { ...a, upiId: val } : a));
                      }}
                      className={styles.vpaInput}
                    />
                  </div>

                  {/* UPLOAD CLOUDINARY BUTTON */}
                  <label className={styles.uploadLabelBtn}>
                    {isUploading ? <Loader2 size={14} className={styles.buttonSpinner} /> : <Upload size={14} />}
                    {isUploading ? "Uploading to Cloudinary..." : app.qrUrl ? "Change QR Image" : "Upload QR Scanner to Cloudinary"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUploadQrForApp(e, app.id)} disabled={isUploading} />
                  </label>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: BOTTOM "+ ADD OTHER CUSTOM UPI APP" BUTTON */}
      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "14px 28px",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px dashed rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <Plus size={18} color="#818cf8" /> Add Other Custom UPI App / QR Scanner
        </button>
      </div>

      {/* MODAL DIALOG: ADD CUSTOM UPI APP */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#ffffff" }}>Add Custom UPI App</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveCustomAppModal}>
              <label style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: "700", marginBottom: "4px", display: "block" }}>Custom App Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Cred UPI, Navi UPI, Amazon Pay, Jupiter" 
                required
                value={customAppName}
                onChange={e => setCustomAppName(e.target.value)}
                className={styles.modalInput}
              />

              <label style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: "700", marginBottom: "4px", display: "block" }}>Merchant UPI VPA ID</label>
              <input 
                type="text" 
                placeholder="e.g. 9876543210@upi or store@hdfcbank" 
                value={customUpiId}
                onChange={e => setCustomUpiId(e.target.value)}
                className={styles.modalInput}
              />

              <label style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: "700", marginBottom: "6px", display: "block" }}>QR Scanner Image (Cloudinary)</label>
              <label className={styles.uploadLabelBtn} style={{ marginBottom: "20px" }}>
                {modalUploading ? <Loader2 size={14} className={styles.buttonSpinner} /> : <Upload size={14} />}
                {modalUploading ? "Uploading to Cloudinary..." : customQrUrl ? "QR Screenshot Uploaded!" : "Upload QR Scanner File"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleModalQrUpload} disabled={modalUploading} />
              </label>

              <button 
                type="submit" 
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "14px",
                  background: "#6366f1",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "800",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Add App to List
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
