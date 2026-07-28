"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Layers, CheckCircle2, AlertTriangle, Cpu, Upload } from "lucide-react";

export default function DynamicProductForm({
    allowedCategories,
    savingProduct,
    productMessage,
    onSaveProduct,
    initialData = null,
    onCancelEdit
}) {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [dynamicFields, setDynamicFields] = useState([]);
    const [loadingSchema, setLoadingSchema] = useState(false);

    // Basic Product Fields
    const [title, setTitle] = useState("");
    const [brand, setBrand] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [compareAtPrice, setCompareAtPrice] = useState("");
    const [totalStock, setTotalStock] = useState("");
    const [sku, setSku] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [uploadingImg, setUploadingImg] = useState(false);

    // Dynamic Specifications map
    const [specifications, setSpecifications] = useState({});

    // Variants Matrix
    const [hasVariants, setHasVariants] = useState(false);
    const [variantTypes, setVariantTypes] = useState(["Color", "Size"]);
    const [variants, setVariants] = useState([]);

    // Populate initial data when editing
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "");
            setBrand(initialData.brand || "");
            setBasePrice(initialData.basePrice || "");
            setCompareAtPrice(initialData.compareAtPrice || "");
            setTotalStock(initialData.totalStock || "");
            setSku(initialData.sku || "");
            setImageUrl(initialData.images && initialData.images.length > 0 ? initialData.images[0].url : "");
            setSelectedCategory(initialData.category?._id || initialData.category || "");
            setSpecifications(initialData.specifications || {});
            setHasVariants(initialData.hasVariants || false);
            setVariants(initialData.variants || []);
        } else if (allowedCategories && allowedCategories.length > 0 && !selectedCategory) {
            setSelectedCategory(allowedCategories[0]._id || allowedCategories[0].id);
        }
    }, [initialData, allowedCategories]);

    // Fetch dynamic JSON schema when category changes
    useEffect(() => {
        if (!selectedCategory) return;

        async function fetchCategorySchema() {
            setLoadingSchema(true);
            try {
                const res = await fetch(`/API/categories/schema?categoryId=${selectedCategory}`);
                const data = await res.json();
                if (data.success) {
                    setDynamicFields(data.fields || []);
                }
            } catch (err) {
                console.error("Failed to load category schema:", err);
            } finally {
                setLoadingSchema(false);
            }
        }
        fetchCategorySchema();
    }, [selectedCategory]);

    const handleSpecChange = (fieldName, val) => {
        setSpecifications(prev => ({
            ...prev,
            [fieldName]: val
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImg(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "products");

        try {
            const res = await fetch("/API/partner/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setImageUrl(data.url);
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploadingImg(false);
        }
    };

    const addVariant = () => {
        const newVariant = {
            name: "",
            sku: `${sku || "SKU"}-${variants.length + 1}`,
            price: Number(basePrice) || 0,
            stock: Number(totalStock) || 10
        };
        setVariants([...variants, newVariant]);
    };

    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariantField = (index, field, val) => {
        const updated = [...variants];
        updated[index][field] = val;
        setVariants(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSaveProduct({
            id: initialData ? (initialData._id || initialData.id) : undefined,
            title,
            brand,
            category: selectedCategory,
            basePrice: Number(basePrice),
            compareAtPrice: Number(compareAtPrice),
            totalStock: Number(totalStock),
            sku,
            images: imageUrl ? [{ url: imageUrl, isPrimary: true }] : [],
            specifications,
            hasVariants,
            variants
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* 1. Basic Information */}
            <div>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#818cf8", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    1. Basic Information
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Product Title *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Wireless Noise Canceling Headphones"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Brand / Manufacturer</label>
                        <input
                            type="text"
                            placeholder="e.g. Sony / Samsung / Organic India"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Category *</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            required
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                        >
                            {allowedCategories.map((cat) => (
                                <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Product Image</label>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <label style={{ padding: "8px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "12px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}>
                                <Upload size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                                {uploadingImg ? "Uploading..." : "Upload Image"}
                                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                            </label>
                            <span style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {imageUrl ? imageUrl.substring(imageUrl.lastIndexOf("/") + 1) : "No image selected"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Pricing & Stock */}
            <div>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#818cf8", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    2. Pricing & Inventory
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Selling Price (₹) *</label>
                        <input
                            type="number"
                            required
                            placeholder="999"
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Original MRP (₹)</label>
                        <input
                            type="number"
                            placeholder="1499"
                            value={compareAtPrice}
                            onChange={(e) => setCompareAtPrice(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Total Stock *</label>
                        <input
                            type="number"
                            required
                            placeholder="50"
                            value={totalStock}
                            onChange={(e) => setTotalStock(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>SKU Code</label>
                        <input
                            type="text"
                            placeholder="PROD-101"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                        />
                    </div>
                </div>
            </div>

            {/* 3. Category-Specific Dynamic Specifications */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        3. Category Specifications
                    </h4>
                    {loadingSchema && <span style={{ fontSize: "11px", color: "#94a3b8" }}>Loading dynamic schema...</span>}
                </div>

                {dynamicFields.length === 0 ? (
                    <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", color: "#64748b", fontSize: "12px", textAlign: "center" }}>
                        No specific extra attributes configured for this category.
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        {dynamicFields.map((field) => {
                            const val = specifications[field.fieldName] || "";

                            return (
                                <div key={field.fieldName}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                                        {field.label} {field.required && "*"}
                                    </label>

                                    {field.type === "select" ? (
                                        <select
                                            value={val}
                                            onChange={(e) => handleSpecChange(field.fieldName, e.target.value)}
                                            required={field.required}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                                        >
                                            <option value="">Select option...</option>
                                            {field.options?.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : field.type === "checkbox" ? (
                                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "8px", color: "#fff", fontSize: "13px" }}>
                                            <input
                                                type="checkbox"
                                                checked={!!val}
                                                onChange={(e) => handleSpecChange(field.fieldName, e.target.checked)}
                                            />
                                            Yes, enable
                                        </label>
                                    ) : (
                                        <input
                                            type={field.type === "number" ? "number" : "text"}
                                            placeholder={field.placeholder || ""}
                                            value={val}
                                            required={field.required}
                                            onChange={(e) => handleSpecChange(field.fieldName, e.target.value)}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px" }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 4. Product Variants (Color, Size, Storage, Weight, etc.) */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        4. Product Variants (Color, Size, Storage, Weight, etc.)
                    </h4>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#34d399", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={hasVariants}
                            onChange={(e) => setHasVariants(e.target.checked)}
                        />
                        Has Multiple Sizes, Colors, or Options?
                    </label>
                </div>

                {hasVariants && (
                    <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Variant Options ({variants.length})</span>
                            <button
                                type="button"
                                onClick={addVariant}
                                style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.3)", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}
                            >
                                <Plus size={14} /> Add Product Variant
                            </button>
                        </div>

                        {variants.length === 0 ? (
                            <div style={{ padding: "14px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", color: "#64748b", fontSize: "12px", textAlign: "center" }}>
                                Click "+ Add Product Variant" above to add sizes, colors, flavors, or weight options.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 30px", gap: "10px", fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>
                                    <div>Variant Option (e.g. Red / XL)</div>
                                    <div>SKU Code</div>
                                    <div>Price (₹)</div>
                                    <div>Stock</div>
                                    <div></div>
                                </div>
                                {variants.map((v, idx) => (
                                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 30px", gap: "10px", alignItems: "center" }}>
                                        <input
                                            type="text"
                                            placeholder="e.g. Red / XL or 128GB"
                                            value={v.name || ""}
                                            onChange={(e) => updateVariantField(idx, "name", e.target.value)}
                                            style={{ padding: "8px 10px", borderRadius: "8px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px" }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="SKU"
                                            value={v.sku || ""}
                                            onChange={(e) => updateVariantField(idx, "sku", e.target.value)}
                                            style={{ padding: "8px 10px", borderRadius: "8px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px" }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price (₹)"
                                            value={v.price}
                                            onChange={(e) => updateVariantField(idx, "price", Number(e.target.value))}
                                            style={{ padding: "8px 10px", borderRadius: "8px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px" }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            value={v.stock}
                                            onChange={(e) => updateVariantField(idx, "stock", Number(e.target.value))}
                                            style={{ padding: "8px 10px", borderRadius: "8px", background: "#101628", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(idx)}
                                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}
                                            title="Remove Variant"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Submit Action Buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                    type="submit"
                    disabled={savingProduct}
                    style={{
                        padding: "12px 24px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                        color: "#fff",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: savingProduct ? "not-allowed" : "pointer"
                    }}
                >
                    {savingProduct ? "Submitting..." : initialData ? "Update Listing" : "Publish Product"}
                </button>

                {initialData && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        style={{ padding: "12px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", fontWeight: "600", fontSize: "14px" }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
