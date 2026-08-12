"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Package, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  ExternalLink,
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import styles from "./dashboard.module.css";
import ProductFormModal from "@/app/components/ProductFormModal";

export default function PartnerDealsPage() {
  // Products dataset from MongoDB
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // Categories list
  const [categories, setCategories] = useState([]);

  // Modal State (Add / Edit / Duplicate)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProductData, setEditProductData] = useState(null);

  // Lightbox Preview Modal State
  const [previewProduct, setPreviewProduct] = useState(null);

  // Delete Confirmation State
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Fetch Partner Products from Backend (MongoDB)
  const fetchPartnerProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/API/partner/products");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load seller products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories list & Products on page load
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/API/admin/categories");
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
    fetchPartnerProducts();
  }, []);

  // Handlers for Modal Triggers
  const handleAddNewProduct = () => {
    setEditProductData(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditProductData(product);
    setIsModalOpen(true);
  };

  const handleDuplicateProduct = (product) => {
    const copyData = {
      ...product,
      _id: undefined,
      id: undefined,
      title: `${product.title} (Copy)`,
      sku: `${product.sku}-COPY`
    };
    setEditProductData(copyData);
    setIsModalOpen(true);
  };

  // Delete Handler
  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/API/partner/products?id=${deleteProductId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Product listing deleted successfully", "success");
        setDeleteProductId(null);
        fetchPartnerProducts(); // Refresh Grid
      } else {
        showToast(data.message || "Failed to delete product", "error");
      }
    } catch (err) {
      showToast("Error deleting product: " + err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Search Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    const catId = p.category?._id || p.category;
    const matchesCategory = categoryFilter === "all" || catId === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "in_stock") matchesStock = p.totalStock > 5;
    else if (stockFilter === "low_stock") matchesStock = p.totalStock > 0 && p.totalStock <= 5;
    else if (stockFilter === "out_of_stock") matchesStock = p.totalStock <= 0;

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    if (sortOption === "price_low") return a.basePrice - b.basePrice;
    if (sortOption === "price_high") return b.basePrice - a.basePrice;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // Newest
  });

  return (
    <div className={styles.dashboardWrapper}>
      
      {/* FLOATING TOAST */}
      {toast.show && (
        <div className={`${styles.toastNotification} ${styles[toast.type]}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Products</h1>
          <p className={styles.pageSubtitle}>Manage all your published marketplace products from one place.</p>
        </div>

        <button className={styles.addProductBtn} onClick={handleAddNewProduct}>
          <Plus size={18} /> Add New Product
        </button>
      </header>

      {/* CONTROLS & FILTERS BAR */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBoxGroup}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by Title, Brand, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          {/* Category Filter */}
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select 
            value={stockFilter} 
            onChange={(e) => setStockFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock (&gt; 5)</option>
            <option value="low_stock">Low Stock (1-5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {/* Sort Option */}
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* MAIN CONTENT AREA WITH SKELETON LOADING */}
      {loading ? (
        <div className={styles.productsGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonLine} style={{ width: "35%" }}></div>
                <div className={styles.skeletonLine} style={{ width: "85%" }}></div>
                <div className={styles.skeletonLine} style={{ width: "50%" }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* PREMIUM EMPTY STATE */
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIllustrationWrapper}>
            <Package size={36} />
          </div>
          <h2 className={styles.emptyTitle}>No Products Found</h2>
          <p className={styles.emptyDesc}>
            {searchQuery || categoryFilter !== "all" || stockFilter !== "all"
              ? "No products match your search or filter criteria."
              : "Start selling by creating your first product listing."}
          </p>
          <button className={styles.addProductBtn} onClick={handleAddNewProduct}>
            <Plus size={18} /> Add First Product
          </button>
        </div>
      ) : (
        /* PRODUCTS CARDS GRID */
        <div className={styles.productsGrid}>
          {filteredProducts.map((p) => {
            const hasDiscount = p.compareAtPrice > p.basePrice;
            const discountPercent = hasDiscount 
              ? Math.round(((p.compareAtPrice - p.basePrice) / p.compareAtPrice) * 100)
              : 0;

            const isLowStock = p.totalStock > 0 && p.totalStock <= 5;
            const isOutStock = p.totalStock <= 0;

            const primaryImg = p.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600";

            return (
              <div key={p._id || p.id} className={styles.productCard}>
                <div className={styles.cardImageContainer}>
                  <img src={primaryImg} alt={p.title} className={styles.cardImg} />
                  
                  {hasDiscount && (
                    <span className={styles.cardDiscountBadge}>{discountPercent}% OFF</span>
                  )}

                  <span className={`${styles.cardStatusPill} ${p.status === "APPROVED" ? styles.statusApproved : styles.statusPending}`}>
                    {p.status || "APPROVED"}
                  </span>
                </div>

                <div className={styles.cardMetaBody}>
                  <div>
                    <div className={styles.cardBrandCategory}>
                      <span className={styles.cardBrandTag}>{p.brand || "Brand"}</span>
                      <span>•</span>
                      <span>{p.category?.name || "Product"}</span>
                    </div>

                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <span className={styles.cardSku}>SKU: {p.sku || "N/A"}</span>
                  </div>

                  <div>
                    <div className={styles.cardPriceRow}>
                      <span className={styles.cardSellingPrice}>₹{p.basePrice?.toLocaleString("en-IN")}</span>
                      {hasDiscount && (
                        <span className={styles.cardMrp}>₹{p.compareAtPrice?.toLocaleString("en-IN")}</span>
                      )}
                    </div>

                    <div className={styles.cardStockRow}>
                      <span className={`${styles.stockBadge} ${isOutStock ? styles.outOfStock : isLowStock ? styles.lowStock : styles.inStock}`}>
                        {isOutStock ? "Out of Stock" : isLowStock ? `Low Stock (${p.totalStock})` : `In Stock (${p.totalStock})`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QUICK ACTIONS BAR */}
                <div className={styles.cardActionsRow}>
                  <button 
                    className={styles.cardActionBtn} 
                    onClick={() => setPreviewProduct(p)}
                    title="Live Customer Preview"
                  >
                    <Eye size={14} /> View
                  </button>

                  <button 
                    className={styles.cardActionBtn} 
                    onClick={() => handleEditProduct(p)}
                    title="Edit Product Details"
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button 
                    className={styles.cardActionBtn} 
                    onClick={() => handleDuplicateProduct(p)}
                    title="Duplicate Listing"
                  >
                    <Copy size={14} /> Clone
                  </button>

                  <button 
                    className={`${styles.cardActionBtn} ${styles.deleteActionBtn}`} 
                    onClick={() => setDeleteProductId(p._id || p.id)}
                    title="Delete Listing"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: UNIVERSAL PRODUCT UPLOAD / EDIT FORM MODAL */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editProductData}
        onSuccess={() => {
          showToast("Product saved successfully!", "success");
          fetchPartnerProducts(); // Auto-refresh grid
        }}
      />

      {/* MODAL 2: LIVE CUSTOMER PREVIEW LIGHTBOX */}
      {previewProduct && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setPreviewProduct(null)}>
          <div style={{ position: "relative", background: "#ffffff", color: "#0f172a", borderRadius: "24px", padding: "32px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <button style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#64748b" }} onClick={() => setPreviewProduct(null)}>
              <XCircle size={24} />
            </button>
            <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "16px" }}>Live Customer Page View</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <img src={previewProduct.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600"} alt={previewProduct.title} style={{ width: "100%", borderRadius: "16px", border: "1px solid #e2e8f0" }} />
              <div>
                <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700" }}>{previewProduct.brand}</span>
                <h3 style={{ fontSize: "20px", fontWeight: "800" }}>{previewProduct.title}</h3>
                <p style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "12px" }}>₹{previewProduct.basePrice?.toLocaleString("en-IN")}</p>
                <p style={{ fontSize: "13px", color: "#475569", marginTop: "12px" }}>{previewProduct.description || "Product details stored in MongoDB."}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION DIALOG */}
      {deleteProductId && (
        <div className={styles.deleteDialogOverlay} onClick={() => setDeleteProductId(null)}>
          <div className={styles.deleteDialogBox} onClick={(e) => e.stopPropagation()}>
            <AlertTriangle size={36} className={styles.deleteDialogIcon} />
            <h3 className={styles.deleteDialogTitle}>Delete Product Listing?</h3>
            <p className={styles.deleteDialogText}>
              Are you sure you want to delete this product? This action will permanently destroy all associated images on Cloudinary and remove the product from MongoDB.
            </p>
            <div className={styles.deleteDialogActions}>
              <button className={styles.cancelDeleteBtn} onClick={() => setDeleteProductId(null)}>
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={confirmDeleteProduct} disabled={deleting}>
                {deleting ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
