"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Store, Shield, Upload, Sparkles, Check, Search, ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../partner.module.css";

export default function PartnerSettings() {
  // Merchant details states
  const [storeName, setStoreName] = useState("Loading...");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bannerUrl, setBannerUrl] = useState("https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop");
  const [logoUrl, setLogoUrl] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [gst, setGst] = useState("");
  const [pan, setPan] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState({ text: "", type: "" });
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Fetch all active categories from backend
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch("/API/admin/categories?active=true&limit=100");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to fetch active categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch partner profile and active categories on mount
  useEffect(() => {
    fetchPartnerProfile();
    fetchCategories();
  }, []);

  const fetchPartnerProfile = async () => {
    try {
      const res = await fetch("/API/partner/settings");
      const data = await res.json();
      if (data.success && data.partner) {
        setStoreName(data.partner.storeName || "");
        setEmail(data.partner.businessEmail || "");
        setPhone(data.partner.phone || "");
        setAddress(data.partner.address || "");
        setBannerUrl(data.partner.bannerUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop");
        setLogoUrl(data.partner.logoUrl || "");
        setOwnerName(data.partner.ownerName || "");
        setGst(data.partner.gst || "");
        setPan(data.partner.pan || "");
        setStatus(data.partner.status || "PENDING");
        setSelectedCategories(data.partner.categories || []);
      }
    } catch (err) {
      console.error("Failed to load partner profile settings:", err);
    }
  };

  // Image Upload handler for Banner
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBanner(true);
    setSettingsMessage({ text: "", type: "" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "partner");

    try {
      const res = await fetch("/API/partner/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setBannerUrl(data.url);
        setSettingsMessage({ text: "Banner image uploaded successfully! Save settings to apply.", type: "success" });
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setSettingsMessage({ text: "Banner upload failed: " + err.message, type: "error" });
    } finally {
      setUploadingBanner(false);
    }
  };

  // Image Upload handler for Store Logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    setSettingsMessage({ text: "", type: "" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "partner_logo");

    try {
      const res = await fetch("/API/partner/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setLogoUrl(data.url);
        setSettingsMessage({ text: "Logo uploaded successfully! Save settings to apply.", type: "success" });
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setSettingsMessage({ text: "Logo upload failed: " + err.message, type: "error" });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Toggle Category selection
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage({ text: "", type: "" });

    try {
      const res = await fetch("/API/partner/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          storeName, 
          businessEmail: email, 
          phone, 
          address, 
          bannerUrl,
          logoUrl,
          ownerName,
          gst,
          pan,
          categories: selectedCategories 
        })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMessage({ text: "Merchant settings saved successfully!", type: "success" });
        fetchPartnerProfile();
      } else {
        throw new Error(data.message || "Failed to save");
      }
    } catch (err) {
      setSettingsMessage({ text: err.message || "Failed to update store settings.", type: "error" });
    } finally {
      setSavingSettings(false);
    }
  };

  const initials = storeName
    ? storeName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "DP";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={styles.dashboardGrid} 
      style={{ paddingBottom: "60px" }}
    >
      {/* Banner / Message Notification */}
      {settingsMessage.text && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "14px",
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: settingsMessage.type === "success" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
            border: `1px solid ${settingsMessage.type === "success" ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
            color: settingsMessage.type === "success" ? "#34d399" : "#f87171",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "100%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          <span>{settingsMessage.text}</span>
          <button
            onClick={() => setSettingsMessage({ text: "", type: "" })}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "18px", fontWeight: "bold" }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", background: "linear-gradient(90deg, #ffffff 0%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Store Profile Settings
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Decorate your store page, add business categories, and configure public settings.
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "32px", alignItems: "start" }}>
        
        {/* Settings Form Card */}
        <div className={styles.glassCard} style={{ marginTop: "0", border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <Store size={22} style={{ color: "#818cf8" }} />
            <h3 className={styles.cardTitle} style={{ fontSize: "18px", fontWeight: "700" }}>Merchant Details</h3>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Store / Brand Name</label>
              <input
                type="text"
                className={styles.formInput}
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                disabled={savingSettings}
                style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Business Email</label>
                <input
                  type="email"
                  className={styles.formInput}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={savingSettings}
                  style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Helpline Number</label>
                <input
                  type="text"
                  className={styles.formInput}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={savingSettings}
                  style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Owner / Contact Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Rahul Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  disabled={savingSettings}
                  style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Store Location Address</label>
                <input
                  type="text"
                  className={styles.formInput}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={savingSettings}
                  style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>GSTIN Number (Optional)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="22AAAAA0000A1Z5"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  disabled={savingSettings}
                  style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>PAN Number (Optional)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="ABCDE1234F"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  disabled={savingSettings}
                  style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}
                />
              </div>
            </div>

            {/* Store Logo & Banner Upload Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "16px" }}>
              {/* Store Logo Upload */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Store Logo</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <label
                    className={styles.btnPrimary}
                    style={{
                      cursor: "pointer",
                      fontSize: "13px",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "none",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <Upload size={14} />
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: "none" }}
                      disabled={uploadingLogo || savingSettings}
                    />
                  </label>
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt="Store Logo"
                      style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.15)" }}
                    />
                  )}
                </div>
              </div>

              {/* Cover Image Banner Upload */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Store Banner</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <label
                    className={styles.btnPrimary}
                    style={{
                      cursor: "pointer",
                      fontSize: "13px",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "none",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <Upload size={14} />
                    {uploadingBanner ? "Uploading..." : "Upload Banner"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      style={{ display: "none" }}
                      disabled={uploadingBanner || savingSettings}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Premium Category Selector Multi-Select Component */}
            <div className={styles.formGroup} style={{ marginTop: "24px" }} ref={dropdownRef}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <label className={styles.formLabel} style={{ marginBottom: "0" }}>Business Categories (Select active categories)</label>
                <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "700" }}>
                  {selectedCategories.length} Selected
                </span>
              </div>
              
              <div style={{ position: "relative" }}>
                {/* Dropdown Header Trigger */}
                <div 
                  onClick={() => !savingSettings && setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    minHeight: "48px",
                    padding: "10px 16px",
                    background: "rgba(10, 16, 28, 0.5)",
                    border: isDropdownOpen ? "1px solid rgba(99, 102, 241, 0.6)" : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    boxShadow: isDropdownOpen ? "0 0 0 4px rgba(99, 102, 241, 0.1), 0 0 12px rgba(99, 102, 241, 0.1)" : "none",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "90%" }}>
                    {selectedCategories.length === 0 ? (
                      <span style={{ color: "#475569", fontSize: "14px" }}>Select Store Categories...</span>
                    ) : (
                      selectedCategories.map(catId => {
                        const cat = categories.find(c => (c._id === catId || c.id === catId));
                        return (
                          <div 
                            key={catId}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "rgba(99, 102, 241, 0.15)",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              color: "#a5b4fc",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            <span>{cat ? cat.name : catId}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(catId);
                              }}
                              style={{
                                border: "none",
                                background: "none",
                                color: "rgba(165, 180, 252, 0.6)",
                                display: "inline-flex",
                                cursor: "pointer",
                                padding: "2px",
                                transition: "color 0.2s",
                              }}
                              onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                              onMouseLeave={(e) => e.target.style.color = "rgba(165, 180, 252, 0.6)"}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div style={{ color: "#94a3b8", flexShrink: 0, paddingLeft: "8px" }}>
                    {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        marginTop: "8px",
                        background: "rgba(15, 23, 42, 0.95)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "16px",
                        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6)",
                        zIndex: 50,
                        padding: "12px",
                        maxHeight: "300px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {/* Search input inside dropdown */}
                      <div 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "8px", 
                          background: "rgba(0, 0, 0, 0.2)", 
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: "10px",
                          padding: "6px 12px",
                        }}
                      >
                        <Search size={14} style={{ color: "#475569" }} />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "#ffffff",
                            fontSize: "12px",
                            width: "100%",
                          }}
                        />
                        {searchQuery && (
                          <button 
                            type="button" 
                            onClick={() => setSearchQuery("")} 
                            style={{ color: "#475569", cursor: "pointer" }}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Items List */}
                      <div 
                        style={{ 
                          overflowY: "auto", 
                          flexGrow: 1, 
                          display: "flex", 
                          flexDirection: "column",
                          gap: "4px",
                          paddingRight: "4px"
                        }}
                      >
                        {loadingCategories ? (
                          <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: "12px" }}>
                            Loading categories...
                          </div>
                        ) : categories.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: "12px" }}>
                            No active categories found.
                          </div>
                        ) : categories.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                          <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: "12px" }}>
                            No matching categories found.
                          </div>
                        ) : (
                          categories
                            .filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(cat => {
                              const catId = cat._id || cat.id;
                              const isChecked = selectedCategories.includes(catId);
                              return (
                                <div 
                                  key={catId}
                                  onClick={() => toggleCategory(catId)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    background: isChecked ? "rgba(99, 102, 241, 0.08)" : "transparent",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = isChecked ? "rgba(99, 102, 241, 0.12)" : "rgba(255, 255, 255, 0.02)"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = isChecked ? "rgba(99, 102, 241, 0.08)" : "transparent"}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    {cat.image ? (
                                      <img 
                                        src={cat.image} 
                                        alt={cat.name} 
                                        style={{ width: "24px", height: "24px", borderRadius: "4px", objectFit: "cover" }} 
                                      />
                                    ) : (
                                      <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.05)" }} />
                                    )}
                                    <span style={{ fontSize: "13px", color: isChecked ? "#ffffff" : "#94a3b8", fontWeight: isChecked ? "600" : "500" }}>
                                      {cat.name}
                                    </span>
                                  </div>
                                  <div 
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      border: isChecked ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.2)",
                                      background: isChecked ? "#4f46e5" : "transparent",
                                      borderRadius: "4px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition: "all 0.15s",
                                    }}
                                  >
                                    {isChecked && <Check size={10} style={{ color: "#ffffff" }} />}
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              type="submit"
              className={styles.btnPrimary}
              style={{ width: "fit-content", marginTop: "24px", padding: "12px 24px", borderRadius: "12px", boxShadow: "0 4px 14px rgba(129, 140, 248, 0.3)" }}
              disabled={savingSettings}
            >
              <Save size={16} style={{ marginRight: "8px" }} />
              {savingSettings ? "Saving Changes..." : "Save Store Details"}
            </button>
          </form>
        </div>

        {/* Live Preview & Tips */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Visual Preview Card Mockup */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#818cf8", letterSpacing: "1px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={13} /> Live Profile Preview
            </span>
            <div className={styles.glassCard} style={{ marginTop: "0", padding: "0", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.4)" }}>
              <div style={{ position: "relative", height: "140px", width: "100%", background: "#1e293b", overflow: "hidden" }}>
                <img 
                  src={bannerUrl} 
                  alt="Store Banner" 
                  style={{ width: "100%", height: "140px", objectFit: "cover" }} 
                />
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "20px",
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      border: "2px solid #0f172a",
                      objectFit: "cover",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "20px",
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      border: "2px solid #0f172a",
                      background: "#4f46e5",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "16px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px" }}>
                  <div>
                    <h4 style={{ color: "#ffffff", fontSize: "18px", fontWeight: "800", marginBottom: "4px" }}>{storeName || "Your Store"}</h4>
                    {ownerName && <p style={{ color: "#818cf8", fontSize: "12px", fontWeight: "600" }}>Owned by: {ownerName}</p>}
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>{address || "No location address set"}</p>
                  </div>
                  <div 
                    className={(status === "ACTIVE" || status === "Active") ? styles.statusActive : styles.statusPending} 
                    style={{ padding: "4px 10px", borderRadius: "99px", fontSize: "10px", fontWeight: "800", letterSpacing: "0.5px" }}
                  >
                    {status.toUpperCase()}
                  </div>
                </div>

                {(gst || pan) && (
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px", fontSize: "11px", color: "#64748b" }}>
                    {gst && <span>GST: <strong style={{ color: "#cbd5e1" }}>{gst}</strong></span>}
                    {pan && <span>PAN: <strong style={{ color: "#cbd5e1" }}>{pan}</strong></span>}
                  </div>
                )}

                {/* Selected categories tags list preview */}
                {selectedCategories.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "14px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                    {selectedCategories.map(catId => {
                      const catName = categories.find(c => (c._id === catId || c.id === catId))?.name || catId;
                      return (
                        <span 
                          key={catId} 
                          style={{ 
                            fontSize: "10px", 
                            fontWeight: "700", 
                            background: "rgba(129, 140, 248, 0.08)", 
                            color: "#818cf8", 
                            padding: "3px 8px", 
                            borderRadius: "6px",
                            border: "1px solid rgba(129, 140, 248, 0.15)"
                          }}
                        >
                          {catName}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security & Helper Cards */}
          <div className={styles.glassCard} style={{ marginTop: "0", border: "1px solid rgba(129, 140, 248, 0.15)", borderRadius: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <Shield size={20} style={{ color: "#818cf8" }} />
              <h4 style={{ color: "#ffffff", fontWeight: "700", fontSize: "14px" }}>Security & Access</h4>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: "1.7" }}>
              Your partner credentials allow access to promotion listings and redemption logs. Change passwords periodically inside the main login portal.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
