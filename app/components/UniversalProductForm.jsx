"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Layers, 
  CheckCircle, 
  Upload, 
  Video, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  X, 
  Tag, 
  Percent, 
  CreditCard, 
  Eye, 
  Save, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Star, 
  Truck, 
  MapPin, 
  Heart, 
  Share2, 
  Scale, 
  Minus, 
  ShoppingBag, 
  Zap, 
  HelpCircle,
  Clock,
  Loader2
} from "lucide-react";
import styles from "./universal-form.module.css";

export default function UniversalProductForm({
  initialData = null,
  onPublishSuccess,
  onCancel,
  apiEndpoint = "/API/partner/products"
}) {
  // Categories & Schema State
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [schemaSections, setSchemaSections] = useState([]);
  const [loadingSchema, setLoadingSchema] = useState(false);

  // Stepper State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Form Field State
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    description: "",
    basePrice: "",
    compareAtPrice: "",
    hsnCode: "",
    gstPercentage: "18",
    sku: "",
    barcode: "",
    totalStock: "10",
    trackInventory: true,
    videoUrl: "",
    warrantyInfo: "1 Year Official Brand Warranty",
    returnPolicyInfo: "7 Days Free Replacement Guarantee",
    weight: "",
    dimensions: "",
    requiresShipping: true,
    metaTitle: "",
    metaDescription: "",
    keywords: []
  });

  // Media (Cloudinary Uploads)
  const [images, setImages] = useState([]);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Specifications Map
  const [specifications, setSpecifications] = useState({});

  // Highlights List
  const [highlights, setHighlights] = useState([""]);

  // Offers List
  const [offers, setOffers] = useState([
    { offerType: "Bank Offer", title: "10% Instant Discount", description: "10% instant discount on HDFC & ICICI Cards", couponCode: "" }
  ]);

  // Variant Matrix Generator
  const [hasVariants, setHasVariants] = useState(false);
  const [variantDimensions, setVariantDimensions] = useState([
    { attributeName: "Color", options: ["Space Black", "Natural Titanium"] },
    { attributeName: "Storage", options: ["128GB", "256GB"] }
  ]);
  const [variantMatrix, setVariantMatrix] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Populate Initial Data if editing or duplicating
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        brand: initialData.brand || "",
        description: initialData.description || "",
        basePrice: initialData.basePrice ? String(initialData.basePrice) : "",
        compareAtPrice: initialData.compareAtPrice ? String(initialData.compareAtPrice) : "",
        hsnCode: initialData.hsnCode || "",
        gstPercentage: initialData.gstPercentage ? String(initialData.gstPercentage) : "18",
        sku: initialData.sku || "",
        barcode: initialData.barcode || "",
        totalStock: initialData.totalStock ? String(initialData.totalStock) : "10",
        trackInventory: initialData.trackInventory !== false,
        videoUrl: initialData.videoUrl || "",
        warrantyInfo: initialData.warrantyInfo || "1 Year Official Brand Warranty",
        returnPolicyInfo: initialData.returnPolicyInfo || "7 Days Free Replacement Guarantee",
        weight: initialData.weight?.value ? String(initialData.weight.value) : "",
        dimensions: initialData.dimensions?.length ? `${initialData.dimensions.length}x${initialData.dimensions.width}x${initialData.dimensions.height}` : "",
        requiresShipping: initialData.requiresShipping !== false,
        metaTitle: initialData.seo?.metaTitle || "",
        metaDescription: initialData.seo?.metaDescription || "",
        keywords: initialData.seo?.keywords || []
      });

      if (initialData.images && initialData.images.length > 0) {
        setImages(initialData.images);
      }

      if (initialData.specifications) {
        setSpecifications(initialData.specifications);
      }

      if (initialData.highlights && initialData.highlights.length > 0) {
        setHighlights(initialData.highlights);
      }

      if (initialData.offers && initialData.offers.length > 0) {
        setOffers(initialData.offers);
      }

      if (initialData.hasVariants && initialData.variants && initialData.variants.length > 0) {
        setHasVariants(true);
        setVariantMatrix(initialData.variants);
      }

      if (initialData.category?._id || initialData.category) {
        setSelectedCategoryId(initialData.category._id || initialData.category);
      }
    }
  }, [initialData]);

  // 1. Fetch Available Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/API/admin/categories");
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(data.categories[0]._id || data.categories[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // 2. Fetch Schema when Category Changes
  useEffect(() => {
    if (!selectedCategoryId) return;
    async function fetchSchema() {
      setLoadingSchema(true);
      try {
        const res = await fetch(`/API/categories/schema?categoryId=${selectedCategoryId}`);
        const data = await res.json();
        if (data.success && data.sections) {
          setSchemaSections(data.sections);
        }
      } catch (err) {
        console.error("Failed to load category schema:", err);
      } finally {
        setLoadingSchema(false);
      }
    }
    fetchSchema();
  }, [selectedCategoryId]);

  // 3. Autosave Draft to localStorage
  useEffect(() => {
    const draftTimer = setInterval(() => {
      if (formData.title && !initialData) {
        const draftObj = {
          selectedCategoryId,
          formData,
          images,
          specifications,
          highlights,
          offers,
          hasVariants,
          variantMatrix
        };
        localStorage.setItem("krackdeal_universal_form_draft", JSON.stringify(draftObj));
        setDraftSavedTime(new Date().toLocaleTimeString());
      }
    }, 10000);
    return () => clearInterval(draftTimer);
  }, [selectedCategoryId, formData, images, specifications, highlights, offers, hasVariants, variantMatrix, initialData]);

  // 4. Variant Cartesian Product Matrix Generator
  useEffect(() => {
    if (!hasVariants || variantDimensions.length === 0 || initialData?.variants?.length > 0) return;

    const cartesian = (arrays) => {
      return arrays.reduce((acc, curr) => {
        return acc.flatMap(d => curr.map(e => [...d, e]));
      }, [[]]);
    };

    const validDimensions = variantDimensions.filter(d => d.attributeName.trim() && d.options.length > 0);
    if (validDimensions.length === 0) return;

    const optionArrays = validDimensions.map(d => d.options.map(opt => ({ attribute: d.attributeName, value: opt })));
    const combinations = cartesian(optionArrays);

    const generatedRows = combinations.map((combo, idx) => {
      const name = combo.map(c => c.value).join(" / ");
      const skuCode = `${formData.sku || "SKU"}-${idx + 1}`;
      return {
        name,
        attributes: combo,
        sku: skuCode,
        price: Number(formData.basePrice) || 0,
        compareAtPrice: Number(formData.compareAtPrice) || 0,
        stock: Number(formData.totalStock) || 10,
        image: images[0]?.url || ""
      };
    });

    setVariantMatrix(generatedRows);
  }, [hasVariants, variantDimensions, formData.basePrice, formData.compareAtPrice, formData.totalStock, formData.sku, images, initialData]);

  // --- Handlers ---
  const handleInputChange = (fieldName, val) => {
    setFormData(prev => ({ ...prev, [fieldName]: val }));
  };

  const handleSpecChange = (key, val) => {
    setSpecifications(prev => ({ ...prev, [key]: val }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImg(true);
    const uploadedImages = [];

    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "products");

      try {
        const res = await fetch("/API/partner/upload", {
          method: "POST",
          body: form
        });
        const data = await res.json();
        if (data.success) {
          uploadedImages.push({
            url: data.url,
            isPrimary: images.length === 0 && uploadedImages.length === 0
          });
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setImages(prev => [...prev, ...uploadedImages]);
    setUploadingImg(false);
    showToast("Images uploaded to Cloudinary successfully!", "success");
  };

  const removeImage = (idx) => {
    const filtered = images.filter((_, i) => i !== idx);
    if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    setImages(filtered);
  };

  const setPrimaryImage = (idx) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === idx })));
  };

  const addDimensionOption = (dimIndex, optionVal) => {
    if (!optionVal.trim()) return;
    const updated = [...variantDimensions];
    if (!updated[dimIndex].options.includes(optionVal.trim())) {
      updated[dimIndex].options.push(optionVal.trim());
      setVariantDimensions(updated);
    }
  };

  const removeDimensionOption = (dimIndex, optIndex) => {
    const updated = [...variantDimensions];
    updated[dimIndex].options.splice(optIndex, 1);
    setVariantDimensions(updated);
  };

  const handleHighlightChange = (idx, val) => {
    const updated = [...highlights];
    updated[idx] = val;
    setHighlights(updated);
  };

  const addOffer = () => {
    setOffers(prev => [...prev, { offerType: "Coupon", title: "", description: "", couponCode: "" }]);
  };

  const updateOffer = (idx, field, val) => {
    const updated = [...offers];
    updated[idx][field] = val;
    setOffers(updated);
  };

  const removeOffer = (idx) => {
    setOffers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !selectedCategoryId || !formData.basePrice) {
      showToast("Please complete required fields (Title, Category, Price)", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: initialData ? (initialData._id || initialData.id) : undefined,
        title: formData.title,
        brand: formData.brand,
        description: formData.description,
        category: selectedCategoryId,
        basePrice: Number(formData.basePrice),
        compareAtPrice: Number(formData.compareAtPrice) || 0,
        totalStock: Number(formData.totalStock) || 0,
        sku: formData.sku,
        images: images.length > 0 ? images : [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800", isPrimary: true }],
        videoUrl: formData.videoUrl,
        highlights: highlights.filter(h => h.trim() !== ""),
        offers,
        warrantyInfo: formData.warrantyInfo,
        returnPolicyInfo: formData.returnPolicyInfo,
        specifications,
        hasVariants,
        variants: variantMatrix
      };

      const isEditMode = !!initialData;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(apiEndpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(isEditMode ? "Product updated successfully!" : "Product published successfully to marketplace!", "success");
        if (!isEditMode) localStorage.removeItem("krackdeal_universal_form_draft");
        if (onPublishSuccess) onPublishSuccess(data.product);
      } else {
        showToast(data.message || "Failed to save product", "error");
      }
    } catch (err) {
      showToast("Error saving product: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = schemaSections.map(s => s.title);
  if (steps.length === 0) {
    steps.push("Basic Information", "Media", "Pricing & Inventory", "Specifications", "Variants", "Highlights & Offers", "SEO", "Live Preview");
  } else {
    steps.push("Live Preview");
  }

  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className={styles.universalFormWrapper}>
      
      {/* FLOATING TOAST */}
      {toast.show && (
        <div className={`${styles.toastNotification} ${styles[toast.type]}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <X size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP STEPPER & PROGRESS HEADER */}
      <header className={styles.stepperHeader}>
        <div className={styles.stepperMetaRow}>
          <div className={styles.stepperTitleGroup}>
            <div className={styles.stepperIconWrapper}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className={styles.stepperMainTitle}>{initialData ? "Edit Product Listing" : "Universal Product Listing Studio"}</h2>
              <span className={styles.stepperSub}>Schema-Driven Multivendor Form • 100% Dynamic</span>
            </div>
          </div>

          {draftSavedTime && !initialData && (
            <span className={styles.draftBadge}>
              <Check size={12} /> Draft Saved ({draftSavedTime})
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className={styles.progressBarTrack}>
          <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }}></div>
        </div>

        {/* Step tabs list */}
        <div className={styles.stepsTabsList}>
          {steps.map((stepTitle, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.stepTabBtn} ${currentStepIndex === idx ? styles.stepTabActive : ""}`}
              onClick={() => setCurrentStepIndex(idx)}
            >
              <span className={styles.stepNumberCircle}>{idx + 1}</span>
              <span>{stepTitle}</span>
            </button>
          ))}
        </div>
      </header>

      {/* FORM BODY */}
      <form onSubmit={handleSubmit}>
        
        {/* Category Selection Bar */}
        <div className={styles.sectionCard} style={{ marginBottom: "24px" }}>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <label className={styles.fieldLabel}>Select Category Schema <span className={styles.requiredAsterisk}>*</span></label>
              {loadingSchema && <span style={{ fontSize: "11px", color: "#818cf8" }}>Loading MongoDB schema...</span>}
            </div>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className={styles.formSelect}
            >
              {categories.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP CONTENT SWITCHER */}

        {/* LIVE PREVIEW TAB */}
        {currentStepIndex === steps.length - 1 ? (
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Eye size={20} color="#818cf8" /> Live Customer Product Page Preview
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "24px" }}>
              This preview renders exactly how buyers will experience your product listing live on the marketplace.
            </p>

            <div style={{ background: "#ffffff", color: "#0f172a", borderRadius: "20px", padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <div>
                <div style={{ aspectRatio: "1/1", background: "#f8fafc", borderRadius: "16px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
                  <img src={images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800"} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "16px" }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#2563eb", letterSpacing: "1px" }}>{formData.brand || "Brand"}</span>
                <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>{formData.title || "Product Title Preview"}</h2>
                
                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px" }}>
                  <span style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>₹{Number(formData.basePrice || 0).toLocaleString("en-IN")}</span>
                  {formData.compareAtPrice > formData.basePrice && (
                    <span style={{ fontSize: "14px", color: "#94a3b8", textDecoration: "line-through", marginLeft: "10px" }}>₹{Number(formData.compareAtPrice).toLocaleString("en-IN")}</span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" style={{ flex: 1, padding: "12px", background: "#0f172a", color: "#fff", borderRadius: "10px", fontWeight: "700" }}>Add to Cart</button>
                  <button type="button" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", borderRadius: "10px", fontWeight: "700" }}>Buy Now</button>
                </div>

                {highlights.length > 0 && highlights[0] !== "" && (
                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Highlights</h4>
                    <ul style={{ paddingLeft: "18px", fontSize: "12px", color: "#475569" }}>
                      {highlights.map((h, i) => h && <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* DYNAMIC SCHEMA SECTION RENDERER */
          schemaSections.map((sec, secIdx) => {
            if (secIdx !== currentStepIndex) return null;

            return (
              <div key={secIdx} className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{sec.title}</h3>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Step {currentStepIndex + 1} of {steps.length}</span>
                </div>

                <div className={styles.sectionFieldsGrid}>
                  {sec.fields.map((field, fIdx) => {
                    const val = formData[field.fieldName] !== undefined ? formData[field.fieldName] : (specifications[field.fieldName] || "");

                    if (["text", "email", "url", "phone"].includes(field.type)) {
                      return (
                        <div key={fIdx} className={styles.fieldGroup}>
                          <div className={styles.fieldLabelRow}>
                            <label className={styles.fieldLabel}>{field.label} {field.required && <span className={styles.requiredAsterisk}>*</span>}</label>
                          </div>
                          <input
                            type={field.type === "phone" ? "tel" : field.type}
                            placeholder={field.placeholder || ""}
                            value={val}
                            onChange={(e) => {
                              handleInputChange(field.fieldName, e.target.value);
                              handleSpecChange(field.fieldName, e.target.value);
                            }}
                            className={styles.formInput}
                          />
                        </div>
                      );
                    }

                    if (["textarea", "rich text editor", "rich-text"].includes(field.type)) {
                      return (
                        <div key={fIdx} className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                          <label className={styles.fieldLabel}>{field.label} {field.required && <span className={styles.requiredAsterisk}>*</span>}</label>
                          <textarea
                            rows={4}
                            placeholder={field.placeholder || "Enter text..."}
                            value={val}
                            onChange={(e) => {
                              handleInputChange(field.fieldName, e.target.value);
                              handleSpecChange(field.fieldName, e.target.value);
                            }}
                            className={styles.formTextarea}
                          />
                        </div>
                      );
                    }

                    if (field.type === "number") {
                      return (
                        <div key={fIdx} className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>{field.label} {field.required && <span className={styles.requiredAsterisk}>*</span>}</label>
                          <input
                            type="number"
                            placeholder={field.placeholder || "0"}
                            value={val}
                            onChange={(e) => {
                              handleInputChange(field.fieldName, e.target.value);
                              handleSpecChange(field.fieldName, e.target.value);
                            }}
                            className={styles.formInput}
                          />
                        </div>
                      );
                    }

                    if (["select", "multiselect", "multi-select"].includes(field.type)) {
                      return (
                        <div key={fIdx} className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>{field.label} {field.required && <span className={styles.requiredAsterisk}>*</span>}</label>
                          <select
                            value={val}
                            onChange={(e) => {
                              handleInputChange(field.fieldName, e.target.value);
                              handleSpecChange(field.fieldName, e.target.value);
                            }}
                            className={styles.formSelect}
                          >
                            <option value="">Select option...</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    if (field.type === "size selector") {
                      return (
                        <div key={fIdx} className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                          <label className={styles.fieldLabel}>{field.label}</label>
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {field.options?.map((opt) => {
                              const active = val === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => handleSpecChange(field.fieldName, opt.value)}
                                  style={{
                                    padding: "8px 16px",
                                    borderRadius: "10px",
                                    border: active ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
                                    background: active ? "rgba(99,102,241,0.2)" : "#0f172a",
                                    color: "#fff",
                                    fontWeight: "600",
                                    fontSize: "13px",
                                    cursor: "pointer"
                                  }}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    if (field.type === "color picker") {
                      return (
                        <div key={fIdx} className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                          <label className={styles.fieldLabel}>{field.label}</label>
                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            {field.options?.map((opt) => {
                              const active = val === opt.label;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => handleSpecChange(field.fieldName, opt.label)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 14px",
                                    borderRadius: "20px",
                                    border: active ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
                                    background: "#0f172a",
                                    color: "#fff",
                                    fontSize: "13px",
                                    cursor: "pointer"
                                  }}
                                >
                                  <span style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: opt.value, display: "inline-block" }}></span>
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    if (["multiple image upload", "image"].includes(field.type)) {
                      return (
                        <div key={fIdx} className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                          <label className={styles.fieldLabel}>{field.label} {field.required && <span className={styles.requiredAsterisk}>*</span>}</label>
                          <div className={styles.dropzoneContainer}>
                            <Upload size={32} className={styles.dropzoneIcon} />
                            <h4 className={styles.dropzoneTitle}>Drag & Drop or Click to Upload Photos</h4>
                            <p className={styles.dropzoneSub}>Supports JPG, PNG, WEBP. Uploads directly to Cloudinary.</p>
                            <label style={{ display: "inline-flex", marginTop: "12px", padding: "8px 18px", background: "#6366f1", color: "#fff", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                              {uploadingImg ? "Uploading to Cloudinary..." : "Browse Files"}
                              <input type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: "none" }} />
                            </label>
                          </div>

                          {images.length > 0 && (
                            <div className={styles.mediaThumbGrid}>
                              {images.map((img, idx) => (
                                <div key={idx} className={`${styles.mediaThumbCard} ${img.isPrimary ? styles.mediaThumbCardActive : ""}`}>
                                  <img src={img.url} alt={`Upload ${idx}`} className={styles.mediaThumbImg} onClick={() => setPrimaryImage(idx)} />
                                  {img.isPrimary && <span className={styles.primaryBadge}>Primary</span>}
                                  <button type="button" onClick={() => removeImage(idx)} className={styles.deleteThumbBtn}>
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (field.type === "variant matrix") {
                      return (
                        <div key={fIdx} className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                            <label className={styles.fieldLabel}>Variant Option Dimensions</label>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#34d399", cursor: "pointer" }}>
                              <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
                              Enable Variants Generator
                            </label>
                          </div>

                          {hasVariants && (
                            <div className={styles.variantGeneratorBox}>
                              {variantDimensions.map((dim, dimIdx) => (
                                <div key={dimIdx} className={styles.variantOptionRow}>
                                  <input
                                    type="text"
                                    placeholder="Option Name (e.g. Color / Storage)"
                                    value={dim.attributeName}
                                    onChange={(e) => {
                                      const updated = [...variantDimensions];
                                      updated[dimIdx].attributeName = e.target.value;
                                      setVariantDimensions(updated);
                                    }}
                                    className={styles.formInput}
                                    style={{ maxWidth: "200px" }}
                                  />

                                  <div className={styles.variantTagPills}>
                                    {dim.options.map((opt, optIdx) => (
                                      <span key={optIdx} className={styles.variantTagPill}>
                                        {opt}
                                        <X size={12} style={{ cursor: "pointer" }} onClick={() => removeDimensionOption(dimIdx, optIdx)} />
                                      </span>
                                    ))}
                                    <input
                                      type="text"
                                      placeholder="+ Add Option & Enter"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          addDimensionOption(dimIdx, e.currentTarget.value);
                                          e.currentTarget.value = "";
                                        }
                                      }}
                                      className={styles.formInput}
                                      style={{ width: "160px", padding: "4px 10px", fontSize: "12px" }}
                                    />
                                  </div>
                                </div>
                              ))}

                              {variantMatrix.length > 0 && (
                                <table className={styles.matrixTable}>
                                  <thead>
                                    <tr>
                                      <th>Combination</th>
                                      <th>SKU Code</th>
                                      <th>Price (₹)</th>
                                      <th>Stock</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {variantMatrix.map((row, rIdx) => (
                                      <tr key={rIdx}>
                                        <td style={{ fontWeight: "700", color: "#a5b4fc" }}>{row.name}</td>
                                        <td>
                                          <input
                                            type="text"
                                            value={row.sku}
                                            onChange={(e) => {
                                              const updated = [...variantMatrix];
                                              updated[rIdx].sku = e.target.value;
                                              setVariantMatrix(updated);
                                            }}
                                            className={styles.matrixInput}
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="number"
                                            value={row.price}
                                            onChange={(e) => {
                                              const updated = [...variantMatrix];
                                              updated[rIdx].price = Number(e.target.value);
                                              setVariantMatrix(updated);
                                            }}
                                            className={styles.matrixInput}
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="number"
                                            value={row.stock}
                                            onChange={(e) => {
                                              const updated = [...variantMatrix];
                                              updated[rIdx].stock = Number(e.target.value);
                                              setVariantMatrix(updated);
                                            }}
                                            className={styles.matrixInput}
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (field.type === "highlights") {
                      return (
                        <div key={fIdx} className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                          <label className={styles.fieldLabel}>{field.label}</label>
                          <div className={styles.highlightList}>
                            {highlights.map((hl, idx) => (
                              <div key={idx} className={styles.highlightItemRow}>
                                <Sparkles size={16} className={styles.highlightBulletIcon} />
                                <input
                                  type="text"
                                  placeholder={`Highlight bullet ${idx + 1}...`}
                                  value={hl}
                                  onChange={(e) => handleHighlightChange(idx, e.target.value)}
                                  className={styles.formInput}
                                />
                                {highlights.length > 1 && (
                                  <button type="button" onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                                    <X size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button type="button" onClick={() => setHighlights([...highlights, ""])} className={styles.addBulletBtn}>
                              <Plus size={14} /> Add Bullet Highlight
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (field.type === "offers") {
                      return (
                        <div key={fIdx} className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <label className={styles.fieldLabel}>{field.label}</label>
                            <button type="button" onClick={addOffer} className={styles.addBulletBtn}>
                              <Plus size={14} /> Add Offer
                            </button>
                          </div>

                          <div className={styles.offersGrid}>
                            {offers.map((off, idx) => (
                              <div key={idx} className={styles.offerCardItem}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <select value={off.offerType} onChange={(e) => updateOffer(idx, "offerType", e.target.value)} className={styles.formSelect} style={{ padding: "4px 8px", fontSize: "12px" }}>
                                    <option value="Bank Offer">Bank Offer</option>
                                    <option value="Coupon">Coupon</option>
                                    <option value="Cashback">Cashback</option>
                                    <option value="No Cost EMI">No Cost EMI</option>
                                  </select>
                                  <button type="button" onClick={() => removeOffer(idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                                    <X size={14} />
                                  </button>
                                </div>
                                <input type="text" placeholder="Offer Title" value={off.title} onChange={(e) => updateOffer(idx, "title", e.target.value)} className={styles.formInput} style={{ padding: "6px 10px", fontSize: "12px" }} />
                                <input type="text" placeholder="Offer Description" value={off.description} onChange={(e) => updateOffer(idx, "description", e.target.value)} className={styles.formInput} style={{ padding: "6px 10px", fontSize: "12px" }} />
                                <input type="text" placeholder="Coupon Code (Optional)" value={off.couponCode} onChange={(e) => updateOffer(idx, "couponCode", e.target.value)} className={styles.formInput} style={{ padding: "6px 10px", fontSize: "12px" }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={fIdx} className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{field.label}</label>
                        <input
                          type="text"
                          placeholder={field.placeholder || ""}
                          value={val}
                          onChange={(e) => handleSpecChange(field.fieldName, e.target.value)}
                          className={styles.formInput}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* STICKY FOOTER ACTIONS */}
        <footer className={styles.stickyFooterBar}>
          <div className={styles.footerInner}>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                className={styles.prevStepBtn}
              >
                <ArrowLeft size={16} /> Back
              </button>

              {onCancel && (
                <button type="button" onClick={onCancel} className={styles.prevStepBtn}>
                  Cancel
                </button>
              )}
            </div>

            {currentStepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
                className={styles.nextStepBtn}
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className={styles.publishBtn}
              >
                {submitting ? <Loader2 size={16} className={styles.buttonSpinner} /> : <Zap size={16} />}
                {submitting ? "Saving..." : initialData ? "Update Product Listing" : "Publish Product Listing"}
              </button>
            )}
          </div>
        </footer>

      </form>
    </div>
  );
}
