"use client";

import { useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import UniversalProductForm from "./UniversalProductForm";

export default function ProductFormModal({
  isOpen,
  onClose,
  initialData = null,
  onSuccess
}) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={styles.headerIconWrapper}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={styles.modalTitle}>
                {initialData ? "Edit Product Listing" : "Create New Product"}
              </h3>
              <span style={styles.modalSubtitle}>
                Complete all required information before publishing to the marketplace catalog.
              </span>
            </div>
          </div>

          <button style={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={styles.modalBody}>
          <UniversalProductForm
            initialData={initialData}
            onCancel={onClose}
            onPublishSuccess={(savedProduct) => {
              if (onSuccess) onSuccess(savedProduct);
              onClose();
            }}
          />
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  modalContent: {
    position: "relative",
    width: "100%",
    maxWidth: "1200px",
    maxHeight: "90vh",
    backgroundColor: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)"
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 28px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    backdropFilter: "blur(16px)"
  },
  headerIconWrapper: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)"
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.01em"
  },
  modalSubtitle: {
    fontSize: "12px",
    color: "#94a3b8",
    display: "block"
  },
  closeBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  modalBody: {
    flex: 1,
    overflowY: "auto",
    padding: "10px 0"
  }
};
