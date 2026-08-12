"use client";

import { useState, useEffect } from "react";
import { X, Save, Upload, Plus, Trash2, Cpu, Tag, ShoppingBag, AlertCircle } from "lucide-react";
import DynamicProductForm from "./DynamicProductForm";

export default function EditProductModal({ item, isProduct, allowedCategories, onClose, onRefresh }) {
    // State for Coupon / Deal editing
    const [dealTitle, setDealTitle] = useState("");
    const [dealDiscount, setDealDiscount] = useState("");
    const [dealCode, setDealCode] = useState("");
    const [dealCategory, setDealCategory] = useState("");
    const [dealMinPurchase, setDealMinPurchase] = useState("");
    const [dealExpiry, setDealExpiry] = useState("");
    const [dealImageUrl, setDealImageUrl] = useState("");
    const [uploadingDealImg, setUploadingDealImg] = useState(false);
    
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        if (!isProduct && item) {
            setDealTitle(item.title || "");
            setDealDiscount(item.discount || "");
            setDealCode(item.code || "");
            setDealCategory(item.category || "");
            setDealMinPurchase(item.minPurchase === "None" ? "" : item.minPurchase || "");
            setDealExpiry(item.expiry === "No Expiry" ? "" : item.expiry || "");
            setDealImageUrl(item.image || "");
        }
    }, [item, isProduct]);

    const handleSaveUniversalProduct = async (productData) => {
        setSaving(true);
        setMessage({ text: "", type: "" });
        try {
            const res = await fetch("/API/partner/products", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ text: "Product updated successfully!", type: "success" });
                setTimeout(() => {
                    onRefresh();
                    onClose();
                }, 1000);
            } else {
                throw new Error(data.message || "Failed to update product");
            }
        } catch (err) {
            setMessage({ text: err.message, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCoupon = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: "", type: "" });

        try {
            const res = await fetch("/API/partner/deals", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: item._id || item.id,
                    title: dealTitle,
                    discount: dealDiscount,
                    code: dealCode,
                    category: dealCategory,
                    image: dealImageUrl,
                    minPurchase: dealMinPurchase || "None",
                    expiry: dealExpiry || "No Expiry"
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ text: "Coupon / Deal updated successfully!", type: "success" });
                setTimeout(() => {
                    onRefresh();
                    onClose();
                }, 1000);
            } else {
                throw new Error(data.message || "Failed to update coupon");
            }
        } catch (err) {
            setMessage({ text: err.message, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleDealImageUpload = async (e) => {
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
            }
        } catch (err) {
            console.error("Deal image upload error:", err);
        } finally {
            setUploadingDealImg(false);
        }
    };

    if (!item) return null;

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
            <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", width: "100%", maxWidth: "750px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {isProduct ? <ShoppingBag size={22} style={{ color: "#818cf8" }} /> : <Tag size={22} style={{ color: "#10b981" }} />}
                        <div>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>{isProduct ? "Edit Product Listing" : "Edit Coupon / Offer"}</h3>
                            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>ID: {item._id || item.id}</p>
                        </div>
                    </div>

                    <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Form Body */}
                <div style={{ padding: "24px" }}>
                    {message.text && (
                        <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", background: message.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${message.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: message.type === "success" ? "#34d399" : "#f87171", fontSize: "14px" }}>
                            {message.text}
                        </div>
                    )}

                    {isProduct ? (
                        <DynamicProductForm
                            allowedCategories={allowedCategories}
                            savingProduct={saving}
                            productMessage={message}
                            onSaveProduct={handleSaveUniversalProduct}
                            initialData={item}
                            onCancelEdit={onClose}
                        />
                    ) : (
                        <form onSubmit={handleSaveCoupon} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Promo Code *</label>
                                    <input
                                        type="text"
                                        required
                                        value={dealCode}
                                        onChange={(e) => setDealCode(e.target.value.toUpperCase())}
                                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Discount Badge (e.g. 20% OFF) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={dealDiscount}
                                        onChange={(e) => setDealDiscount(e.target.value)}
                                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Deal Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={dealTitle}
                                    onChange={(e) => setDealTitle(e.target.value)}
                                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Category *</label>
                                    <select
                                        value={dealCategory}
                                        onChange={(e) => setDealCategory(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                                    >
                                        {allowedCategories.map((cat) => (
                                            <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Min Purchase (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ₹499"
                                        value={dealMinPurchase}
                                        onChange={(e) => setDealMinPurchase(e.target.value)}
                                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Expiry Date</label>
                                    <input
                                        type="date"
                                        value={dealExpiry}
                                        onChange={(e) => setDealExpiry(e.target.value)}
                                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Deal Cover Image</label>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                        <label style={{ padding: "8px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "12px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}>
                                            <Upload size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                                            {uploadingDealImg ? "Uploading..." : "Replace Image"}
                                            <input type="file" accept="image/*" onChange={handleDealImageUpload} style={{ display: "none" }} />
                                        </label>
                                        <span style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {dealImageUrl ? dealImageUrl.substring(dealImageUrl.lastIndexOf("/") + 1) : "No image"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "12px", justifyContent: "flex-end" }}>
                                <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", fontWeight: "600", fontSize: "13px" }}>
                                    Cancel
                                </button>

                                <button type="submit" disabled={saving} style={{ padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                                    {saving ? "Saving Changes..." : "Save Coupon Changes"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
