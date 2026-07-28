"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, Store, Shield, Plus, Trash2, Edit2, Upload, Ticket, Tag,AlertCircle} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../partner.module.css";
import { useAuth } from "@/app/context/AuthContext";
import DynamicProductForm from "./DynamicProductForm";
import EditProductModal from "./EditProductModal";
function DealsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "deals";
  const [editingItem, setEditingItem] = useState(null);
  const [editingIsProduct, setEditingIsProduct] = useState(false);
  const { user } = useAuth();
  const setTab = (tabName) => {
    router.push(`/partner/deals?tab=${tabName}`);
  };

  // --- STORE SETTINGS STATE (READ-ONLY FOR CARD PREVIEW) ---
  const [storeName, setStoreName] = useState("Loading...");
  const [address, setAddress] = useState("");
  const [partnerCategories, setPartnerCategories] = useState([]); // Store category IDs from store settings

  // --- PRODUCTS/OFFERS STATE ---
  const [listingType, setListingType] = useState("universal"); // "universal" or "coupon"
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [savingDeal, setSavingDeal] = useState(false);
  const [dealMessage, setDealMessage] = useState({ text: "", type: "" });
  
  const [dealId, setDealId] = useState(null); // null for new, ID for editing
  const [dealTitle, setDealTitle] = useState("");
  const [dealDiscount, setDealDiscount] = useState("");
  const [dealCode, setDealCode] = useState("");
  const [dealCategory, setDealCategory] = useState("");
  const [dealMinPurchase, setDealMinPurchase] = useState("");
  const [dealExpiry, setDealExpiry] = useState("");
  const [dealImageUrl, setDealImageUrl] = useState("");
  const [uploadingDealImg, setUploadingDealImg] = useState(false);

  const handleSaveUniversalProduct = async (productData) => {
    setSavingDeal(true);
    setDealMessage({ text: "", type: "" });
    try {
      const isEdit = !!productData.id;
      const res = await fetch("/API/partner/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (data.success) {
        setDealMessage({ text: data.message || "Universal product published successfully!", type: "success" });
        fetchProducts();
      } else {
        throw new Error(data.message || "Failed to save product");
      }
    } catch (err) {
      setDealMessage({ text: err.message, type: "error" });
    } finally {
      setSavingDeal(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/API/partner/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  // --- PROMO CODES STATE ---
  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [savingPromo, setSavingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ text: "", type: "" });

  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [promoMinPurchase, setPromoMinPurchase] = useState("");
  const [promoExpiry, setPromoExpiry] = useState("");
  const [showPromoForm, setShowPromoForm] = useState(false);

  // Dynamic Categories from database
  const [allCategories, setAllCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const fetchAllCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch("/API/admin/categories?active=true");
      const data = await res.json();
      if (data.success) {
        setAllCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load active categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Filter allowed categories (those selected by partner in settings)
  const allowedCategories = allCategories.filter(cat => 
    partnerCategories.includes(cat._id) || partnerCategories.includes(cat.id)
  );

  // Automatically select the category if only 1 exists, or auto-fallback if selected is invalid
  useEffect(() => {
    if (allowedCategories.length === 1) {
      const singleCat = allowedCategories[0];
      const singleCatId = singleCat._id || singleCat.id;
      if (dealCategory !== singleCatId) {
        setDealCategory(singleCatId);
      }
    } else if (allowedCategories.length > 1) {
      const isAllowed = allowedCategories.some(cat => (cat._id === dealCategory || cat.id === dealCategory));
      if (!isAllowed) {
        const firstCat = allowedCategories[0];
        setDealCategory(firstCat._id || firstCat.id);
      }
    }
  }, [allowedCategories, dealCategory]);

  // Fetch all data on mount
  useEffect(() => {
    fetchPartnerProfile();
    fetchDeals();
    fetchProducts();
    fetchPromos();
    fetchAllCategories();
  }, []);

  // --- FETCH FUNCTIONS ---
  const fetchPartnerProfile = async () => {
    try {
      const res = await fetch("/API/partner/settings");
      const data = await res.json();
      if (data.success && data.partner) {
        setStoreName(data.partner.storeName || "");
        setAddress(data.partner.address || "");
        setPartnerCategories(data.partner.categories || []);
      }
    } catch (err) {
      console.error("Failed to load partner profile settings:", err);
    }
  };

  const fetchDeals = async () => {
    try {
      setLoadingDeals(true);
      const res = await fetch("/API/partner/deals");
      const data = await res.json();
      if (data.success) {
        setDeals(data.deals || []);
      }
    } catch (err) {
      console.error("Failed to fetch deals:", err);
    } finally {
      setLoadingDeals(false);
    }
  };

  const fetchPromos = async () => {
    try {
      setLoadingPromos(true);
      setPromoMessage({ text: "", type: "" });
      const res = await fetch("/API/admin/coupons");
      const data = await res.json();
      if (data.success) {
        setPromos(data.coupons || []);
      } else {
        setPromoMessage({ text: data.message || "Failed to load promotions.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setPromoMessage({ text: "Network error. Failed to load promotions.", type: "error" });
    } finally {
      setLoadingPromos(false);
    }
  };

  // --- HANDLER FUNCTIONS ---
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDealImg(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "deals");

    try {
      const res = await fetch("/API/partner/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setDealImageUrl(data.url);
        setDealMessage({ text: "Deal image uploaded successfully!", type: "success" });
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setDealMessage({ text: "Deal image upload failed: " + err.message, type: "error" });
    } finally {
      setUploadingDealImg(false);
    }
  };

  const handleSaveDeal = async (e) => {
    e.preventDefault();
    if (!dealImageUrl) {
      setDealMessage({ text: "Please upload an image for the deal.", type: "error" });
      return;
    }

    setSavingDeal(true);
    setDealMessage({ text: "", type: "" });

    const isEdit = !!dealId;
    const url = "/API/partner/deals";
    const method = isEdit ? "PUT" : "POST";
    const body = { title: dealTitle, discount: dealDiscount, code: dealCode, category: dealCategory, image: dealImageUrl, minPurchase: dealMinPurchase || "None", expiry: dealExpiry || "No Expiry"};
    if (isEdit) body.id = dealId;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setDealMessage({
          text: isEdit ? "Deal updated successfully!" : "New product/deal listed successfully!",
          type: "success"
        });
        resetDealForm();
        fetchDeals();
      } else {
        throw new Error(data.message || "Failed to save deal");
      }
    } catch (err) {
      setDealMessage({ text: err.message, type: "error" });
    } finally {
      setSavingDeal(false);
    }
  };

  const handleDeleteDeal = async (id) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDealMessage({ text: "", type: "" });
    try {
      const res = await fetch(`/API/partner/deals?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setDealMessage({ text: "Listing and Cloudinary media deleted successfully!", type: "success" });
        fetchDeals();
      } else {
        throw new Error(data.message || "Failed to delete");
      }
    } catch (err) {
      setDealMessage({ text: err.message, type: "error" });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product listing? This will also remove the image from Cloudinary.")) return;
    setDealMessage({ text: "", type: "" });
    try {
      const res = await fetch(`/API/partner/products?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setDealMessage({ text: "Universal product and Cloudinary image deleted successfully!", type: "success" });
        fetchProducts();
      } else {
        throw new Error(data.message || "Failed to delete product");
      }
    } catch (err) {
      setDealMessage({ text: err.message, type: "error" });
    }
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    setSavingPromo(true);
    setPromoMessage({ text: "", type: "" });
    try {
      const res = await fetch("/API/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCode,
          discount: promoDiscount,
          minPurchase: promoMinPurchase,
          expiry: promoExpiry,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPromos([data.coupon, ...promos]);
        setPromoCode("");
        setPromoDiscount("");
        setPromoMinPurchase("");
        setPromoExpiry("");
        setShowPromoForm(false);
        setPromoMessage({ text: data.message || "Promotion created successfully!", type: "success" });
      } else {
        setPromoMessage({ text: data.message || "Failed to create promotion.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setPromoMessage({ text: "Network error. Failed to save promotion.", type: "error" });
    } finally {
      setSavingPromo(false);
    }
  };

  const handleDeletePromo = async (id) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    setPromoMessage({ text: "", type: "" });
    try {
      const res = await fetch(`/API/admin/coupons?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setPromos(promos.filter((d) => (d._id || d.id) !== id));
        setPromoMessage({ text: "Promotion deleted successfully!", type: "success" });
      } else {
        setPromoMessage({ text: data.message || "Failed to delete promotion.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setPromoMessage({ text: "Network error. Failed to delete promotion.", type: "error" });
    }
  };

  const startEditDeal = (deal) => {
    setDealId(deal._id || deal.id);
    setDealTitle(deal.title);
    setDealDiscount(deal.discount);
    setDealCode(deal.code);
    setDealCategory(deal.category);
    setDealMinPurchase(deal.minPurchase === "None" ? "" : deal.minPurchase);
    setDealExpiry(deal.expiry === "No Expiry" ? "" : deal.expiry);
    setDealImageUrl(deal.image);
    
    const formElement = document.getElementById("deal-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const resetDealForm = () => {
    setDealId(null);
    setDealTitle("");
    setDealDiscount("");
    setDealCode("");
    setDealCategory(allowedCategories.length > 0 ? (allowedCategories[0]._id || allowedCategories[0].id) : "");
    setDealMinPurchase("");
    setDealExpiry("");
    setDealImageUrl("");
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
      {/* Header Title Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800" }}>
            {activeTab === "deals" && "Listed Products & Offers"}
            {activeTab === "promos" && "Promotion Codes"}
            {activeTab === "settings" && "Store Profile Settings"}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            {activeTab === "deals" && "Add, update, and manage products and premium deals active at your store."}
            {activeTab === "promos" && "Manage checkout discount codes active at your store locations."}
            {activeTab === "settings" && "Update your public merchant profile, business description, and helpline details."}
          </p>
        </div>
        {activeTab === "promos" && (
          <button className={styles.btnPrimary} onClick={() => setShowPromoForm(!showPromoForm)}>
            <Plus size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
            Create Deal Code
          </button>
        )}
      </div>

      {/* Tabs Header */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "24px", gap: "8px" }}>
        <button
          onClick={() => setTab("deals")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "deals" ? "2px solid #818cf8" : "2px solid transparent",
            color: activeTab === "deals" ? "#ffffff" : "#94a3b8",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <Tag size={16} />
          Offers & Listings
        </button>

        <button
          onClick={() => setTab("promos")}
          style={{ background: "none", border: "none", borderBottom: activeTab === "promos" ? "2px solid #818cf8" : "2px solid transparent", color: activeTab === "promos" ? "#ffffff" : "#94a3b8", padding: "12px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"}}>
          <Ticket size={16} style={{ transform: "rotate(-45deg)" }} />
          Promo Codes
        </button>
      </div>

      {/* --- TAB CONTENT: OFFERS & LISTINGS (DEALS) --- */}
      {activeTab === "deals" && (
        <>
          {/* SECTION 2: Add / Edit Product (Deal) with Interactive Card Preview */}
          <div id="deal-form-section" className={styles.glassCard} style={{ marginTop: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Plus size={20} style={{ color: "#818cf8" }} />
                <h3 className={styles.cardTitle}>{dealId ? "Edit Listing" : "List New Item / Offer"}</h3>
              </div>

              {/* Mode Switcher */}
              <div style={{ display: "flex", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "10px" }}>
                <button
                  type="button"
                  onClick={() => setListingType("universal")}
                  style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: listingType === "universal" ? "#4f46e5" : "transparent", color: listingType === "universal" ? "#fff" : "#94a3b8", fontSize: "12px", fontWeight: "600", cursor: "pointer"}}
                >
                  Universal Product Listing
                </button>
                <button
                  type="button"
                  onClick={() => setListingType("coupon")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: listingType === "coupon" ? "#4f46e5" : "transparent",
                    color: listingType === "coupon" ? "#fff" : "#94a3b8",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Quick Coupon / Deal
                </button>
              </div>
            </div>

            {dealMessage.text && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  backgroundColor: dealMessage.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${dealMessage.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                  color: dealMessage.type === "success" ? "#34d399" : "#f87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <span>{dealMessage.text}</span>
                <button
                  onClick={() => setDealMessage({ text: "", type: "" })}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "18px", fontWeight: "bold" }}
                >
                  &times;
                </button>
              </div>
            )}

            {listingType === "universal" ? (
              <DynamicProductForm
                allowedCategories={allowedCategories}
                savingProduct={savingDeal}
                productMessage={dealMessage}
                onSaveProduct={handleSaveUniversalProduct}
                initialData={dealId ? products.find(p => (p._id || p.id) === dealId) : null}
                onCancelEdit={resetDealForm}
              />
            ) : (
              <>
                {/* Validation Banner when no category is configured */}
            {partnerCategories.length === 0 && (
              <div 
                style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: "12px", 
                  padding: "16px 20px", 
                  background: "rgba(239, 68, 68, 0.08)", 
                  border: "1px solid rgba(239, 68, 68, 0.2)", 
                  borderRadius: "14px",
                  color: "#f87171",
                  fontSize: "14px",
                  marginBottom: "24px",
                  lineHeight: "1.5"
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontWeight: "700" }}>Store Categories Required</span>
                  <span>Please select at least one Store Category before creating Deals.</span>
                  <a href="/partner/settings" style={{ color: "#818cf8", fontWeight: "600", textDecoration: "underline" }}>
                    Go to Store Settings to select categories &rarr;
                  </a>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px", alignItems: "start" }}>
              {/* Product Form */}
              <form onSubmit={handleSaveDeal}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Promo Code (e.g. FLAT20)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      required
                      placeholder="e.g. FLAT20"
                      value={dealCode}
                      onChange={(e) => setDealCode(e.target.value.toUpperCase())}
                      disabled={savingDeal || partnerCategories.length === 0}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Discount Badge (e.g. 20% OFF)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      required
                      placeholder="e.g. 20% OFF"
                      value={dealDiscount}
                      onChange={(e) => setDealDiscount(e.target.value)}
                      disabled={savingDeal || partnerCategories.length === 0}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Deal / Product Title</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    required
                    placeholder="e.g. Flat 20% Discount Coupon"
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    disabled={savingDeal || partnerCategories.length === 0}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category</label>
                    <select
                      className={styles.formInput}
                      value={dealCategory}
                      onChange={(e) => setDealCategory(e.target.value)}
                      disabled={savingDeal || partnerCategories.length === 0 || allowedCategories.length === 1}
                      style={{ 
                        background: "#101628", 
                        cursor: (partnerCategories.length === 0 || allowedCategories.length === 1) ? "not-allowed" : "pointer" 
                      }}
                    >
                      {allowedCategories.map((cat) => (
                        <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Min Purchase (Optional)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. ₹499"
                      value={dealMinPurchase}
                      onChange={(e) => setDealMinPurchase(e.target.value)}
                      disabled={savingDeal || partnerCategories.length === 0}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Expiry Date (Optional)</label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={dealExpiry}
                      onChange={(e) => setDealExpiry(e.target.value)}
                      disabled={savingDeal || partnerCategories.length === 0}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Product / Deal Image</label>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", height: "100%" }}>
                      <label
                        className={styles.btnPrimary}
                        style={{
                          cursor: (savingDeal || partnerCategories.length === 0) ? "not-allowed" : "pointer",
                          fontSize: "13px",
                          padding: "10px 16px",
                          background: (savingDeal || partnerCategories.length === 0) ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          boxShadow: "none",
                          whiteSpace: "nowrap",
                          opacity: (savingDeal || partnerCategories.length === 0) ? 0.5 : 1
                        }}
                      >
                        <Upload size={14} style={{ marginRight: "6px" }} />
                        {uploadingDealImg ? "Uploading..." : "Upload Image"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "deal")}
                          style={{ display: "none" }}
                          disabled={uploadingDealImg || savingDeal || partnerCategories.length === 0}
                        />
                      </label>
                      <span style={{ fontSize: "12px", color: "#64748b", wordBreak: "break-all" }}>
                        {dealImageUrl ? dealImageUrl.substring(dealImageUrl.lastIndexOf("/") + 1) : "No image uploaded"}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={savingDeal || partnerCategories.length === 0}
                  >
                    {savingDeal ? "Saving..." : dealId ? "Update Product" : "List Product"}
                  </button>
                  
                  {dealId && (
                    <button
                      type="button"
                      className={styles.btnIcon}
                      onClick={resetDealForm}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        color: "#94a3b8",
                        borderColor: "rgba(255,255,255,0.05)",
                        padding: "10px 16px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "14px"
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Interactive Live Card Preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#818cf8", letterSpacing: "1px", textTransform: "uppercase" }}>Live Premium Preview</span>
                
                {/* The visual card mockup */}
                <div 
                  style={{
                    width: "280px",
                    borderRadius: "18px",
                    overflow: "hidden",
                    background: "#f8fafc",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#1e293b",
                    fontFamily: "Outfit, sans-serif"
                  }}
                >
                  {/* Image & Discount Badge */}
                  <div style={{ position: "relative", height: "180px", background: "#e2e8f0" }}>
                    {dealImageUrl ? (
                      <img 
                        src={dealImageUrl} 
                        alt="Preview" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "13px" }}>
                        No Image Uploaded
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    <div 
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background: "#10b981",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                      }}
                    >
                      {dealDiscount || "20% OFF"}
                    </div>
                  </div>

                  {/* Details Section */}
                  <div style={{ padding: "16px", display: "flex", gap: "12px", alignItems: "center", minHeight: "75px" }}>
                    <div 
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "800",
                        color: "#4f46e5",
                        flexShrink: 0
                      }}
                    >
                      {initials}
                    </div>
                    
                    <div style={{ overflow: "hidden" }}>
                      <h4 
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontWeight: "800",
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {dealTitle || "Flat 20% Discount Coupon"}
                      </h4>
                      <p 
                        style={{
                          margin: "2px 0 0 0",
                          fontSize: "11px",
                          color: "#64748b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {storeName || "Store Name"}, {address ? address.split(",")[0] : "Location"}
                      </p>
                    </div>
                  </div>

                  {/* Claim Coupon Button bar */}
                  <div 
                    style={{
                      background: "#f1f5f9",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      borderTop: "1px solid #e2e8f0",
                      cursor: "pointer",
                      color: "#334155",
                      fontWeight: "700",
                      fontSize: "13px"
                    }}
                  >
                    <Ticket size={14} style={{ transform: "rotate(-45deg)" }} />
                    Claim Coupon
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

          {/* SECTION 3: Live Active Listings grid */}
          <div className={styles.glassCard} style={{ marginTop: "16px" }}>
            <h3 className={styles.cardTitle} style={{ marginBottom: "20px" }}>Listed Products & Coupons</h3>
            
            {loadingDeals ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Loading listed items...</div>
            ) : (products.length === 0 && deals.length === 0) ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                No products or deals listed yet. Fill the form above to add your first item!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
                {/* 1. Universal Products */}
                {products.map((prod) => {
                  const prodImg = prod.images && prod.images.length > 0 ? prod.images[0].url : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600";
                  return (
                    <div 
                      key={prod._id || prod.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        borderRadius: "18px",
                        background: "rgba(20, 30, 48, 0.4)",
                        border: "1px solid rgba(129, 140, 248, 0.2)",
                        overflow: "hidden",
                        position: "relative"
                      }}
                    >
                      {/* Clickable Card Content */}
                      <div 
                        onClick={() => router.push(`/partner/deals/${prod._id || prod.id}?type=product`)}
                        style={{ cursor: "pointer", flexGrow: 1, display: "flex", flexDirection: "column" }}
                      >
                         {/* Image & Category Badge */}
                        <div style={{ position: "relative", height: "150px" }}>
                          <img 
                            src={prodImg} 
                            alt={prod.title} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                          <div 
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              background: "#4f46e5",
                              color: "#ffffff",
                              fontSize: "10px",
                              fontWeight: "800",
                              padding: "4px 8px",
                              borderRadius: "4px"
                            }}
                          >
                            {prod.category?.name || "Product"}
                          </div>
                        </div>

                        {/* Body Info */}
                        <div style={{ padding: "16px", flexGrow: 1 }}>
                          <h4 
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#ffffff",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {prod.title}
                          </h4>
                          <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#818cf8" }}>
                            Brand: {prod.brand || "N/A"}
                          </p>
                          
                          <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", fontWeight: "800", color: "#34d399" }}>₹{prod.basePrice}</span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>Stock: {prod.totalStock}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions buttons */}
                      <div 
                        style={{ 
                          padding: "10px 16px", 
                          borderTop: "1px solid rgba(255, 255, 255, 0.04)", 
                          background: "rgba(0, 0, 0, 0.15)",
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "10px"
                        }}
                      >
                        <button 
                          className={styles.btnIcon}
                          onClick={() => { setEditingItem(prod); setEditingIsProduct(true); }}
                          style={{ padding: "6px", borderRadius: "8px", color: "#818cf8" }}
                          title="Edit Product Details"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button 
                          className={styles.btnIcon}
                          onClick={(e) => { e.stopPropagation(); handleDeleteProduct(prod._id || prod.id); }}
                          style={{ padding: "6px", borderRadius: "8px", color: "#f87171" }}
                          title="Delete Product & Destroy Cloudinary Image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Deals & Coupons */}
                {deals.map((deal) => {
                  const dealInitials = deal.merchant
                    ? deal.merchant.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                    : "DP";
                    
                  return (
                    <div 
                      key={deal._id || deal.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        borderRadius: "18px",
                        background: "rgba(20, 30, 48, 0.4)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        overflow: "hidden",
                        position: "relative"
                      }}
                    >
                      {/* Clickable Card Content */}
                      <div 
                        onClick={() => router.push(`/partner/deals/${deal._id || deal.id}?type=deal`)}
                        style={{ cursor: "pointer", flexGrow: 1, display: "flex", flexDirection: "column" }}
                      >
                        {/* Image & Discount Badge */}
                        <div style={{ position: "relative", height: "150px" }}>
                          <img 
                            src={deal.image} 
                            alt={deal.title} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                          <div 
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              background: "#10b981",
                              color: "#ffffff",
                              fontSize: "10px",
                              fontWeight: "800",
                              padding: "4px 8px",
                              borderRadius: "4px"
                            }}
                          >
                            {deal.discount}
                          </div>
                          
                          {/* Status Badge */}
                          <div 
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              background: deal.status === "Active" ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)",
                              color: "#ffffff",
                              fontSize: "9px",
                              fontWeight: "700",
                              padding: "2px 6px",
                              borderRadius: "4px"
                            }}
                          >
                            {deal.status.toUpperCase()}
                          </div>
                        </div>

                        {/* Body Info */}
                        <div style={{ padding: "16px", flexGrow: 1 }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <div 
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: "800",
                                color: "#818cf8",
                                flexShrink: 0
                              }}
                            >
                              {dealInitials}
                            </div>
                            <div style={{ overflow: "hidden" }}>
                              <h4 
                                style={{
                                  margin: 0,
                                  fontSize: "13px",
                                  fontWeight: "700",
                                  color: "#ffffff",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}
                              >
                                {deal.title}
                              </h4>
                              <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#94a3b8" }}>
                                Code: <strong style={{ color: "#818cf8" }}>{deal.code}</strong>
                              </p>
                            </div>
                          </div>
                          
                          <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "10px", color: "#64748b" }}>
                            <div>Min Pur: <span style={{ color: "#94a3b8" }}>{deal.minPurchase}</span></div>
                            <div>Expiry: <span style={{ color: "#94a3b8" }}>{deal.expiry}</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Actions buttons */}
                      <div 
                        style={{ 
                          padding: "12px 16px", 
                          borderTop: "1px solid rgba(255, 255, 255, 0.04)", 
                          background: "rgba(0, 0, 0, 0.15)",
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "10px"
                        }}
                      >
                        <button 
                          className={styles.btnIcon}
                          onClick={() => { setEditingItem(deal); setEditingIsProduct(false); }}
                          style={{ padding: "6px", borderRadius: "8px", color: "#94a3b8" }}
                          title="Edit Deal"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          className={styles.btnIcon}
                          onClick={() => handleDeleteDeal(deal._id || deal.id)}
                          style={{ padding: "6px", borderRadius: "8px" }}
                          title="Delete Deal & Destroy Cloudinary Image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* --- TAB CONTENT: PROMO CODES --- */}
      {activeTab === "promos" && (
        <>
          {/* Message Notifications Banner */}
          {promoMessage.text && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "20px",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: promoMessage.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${promoMessage.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                color: promoMessage.type === "success" ? "#34d399" : "#f87171",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{promoMessage.text}</span>
              <button
                onClick={() => setPromoMessage({ text: "", type: "" })}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  padding: "0 4px",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>
          )}

          {showPromoForm && (
            <div className={styles.glassCard} style={{ maxWidth: "500px", marginTop: "0", marginBottom: "30px" }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: "20px" }}>
                Create Store Deal
              </h3>
              <form onSubmit={handleSavePromo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Promo Code (Uppercase)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    required
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. FLAT30"
                    disabled={savingPromo}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Discount Value</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      required
                      value={promoDiscount}
                      onChange={(e) => setPromoDiscount(e.target.value)}
                      placeholder="e.g. 30% Off"
                      disabled={savingPromo}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Min Purchase</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      required
                      value={promoMinPurchase}
                      onChange={(e) => setPromoMinPurchase(e.target.value)}
                      placeholder="e.g. ₹499"
                      disabled={savingPromo}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expiry Date</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    required
                    value={promoExpiry}
                    onChange={(e) => setPromoExpiry(e.target.value)}
                    disabled={savingPromo}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.btnPrimary}
                  style={{ width: "100%", marginTop: "10px" }}
                  disabled={savingPromo}
                >
                  {savingPromo ? "Saving..." : "Create Deal"}
                </button>
              </form>
            </div>
          )}

          {loadingPromos ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Loading promotions...</div>
          ) : (
            <div className={styles.glassCard} style={{ marginTop: "0" }}>
              <div className={styles.adminTableWrapper}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Min Purchase</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promos.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
                          No deals found. Click "Create Deal Code" to add one.
                        </td>
                      </tr>
                    ) : (
                      promos.map((deal) => (
                        <tr key={deal._id || deal.id}>
                          <td>
                            <span
                              style={{ fontWeight: "800", color: "#818cf8", background: "rgba(129, 140, 248, 0.08)", padding: "6px 12px", borderRadius: "8px", border: "1px dashed rgba(129, 140, 248, 0.2)",}}
                            >
                              {deal.code}
                            </span>
                          </td>
                          <td style={{ fontWeight: "700" }}>{deal.discount}</td>
                          <td>{deal.minPurchase}</td>
                          <td>{deal.expiry}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${deal.status === "Active" ? styles.statusActive : styles.statusInactive}`}>
                              {deal.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button className={styles.btnIcon} onClick={() => handleDeletePromo(deal._id || deal.id)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dedicated Edit Product / Coupon Modal Drawer */}
      {editingItem && (
        <EditProductModal
          item={editingItem}
          isProduct={editingIsProduct}
          allowedCategories={allowedCategories}
          onClose={() => setEditingItem(null)}
          onRefresh={() => { fetchProducts(); fetchDeals(); }}
        />
      )}
    </motion.div>
  );
}

export default function PartnerDeals() {
  return (
    <Suspense fallback={<div style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>Loading portal...</div>}>
      <DealsContent />
    </Suspense>
  );
}
