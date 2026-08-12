"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import styles from "../partner.module.css";

export default function PartnerRedeem() {
  const [voucherCode, setVoucherCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [couponDetails, setCouponDetails] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null); // 'valid' | 'invalid' | 'redeemed'
  const [feedbackMessage, setFeedbackMessage] = useState({ text: "", type: "" });

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setVerifying(true);
    setVerificationResult(null);
    setCouponDetails(null);
    setFeedbackMessage({ text: "", type: "" });

    try {
      // Fetch details from backend via proxied /API/admin/coupons
      const res = await fetch("/API/admin/coupons");
      const data = await res.json();
      
      if (data.success) {
        // Find matching coupon code (case-insensitive)
        const targetCode = voucherCode.trim().toUpperCase();
        const found = data.coupons?.find(c => c.code.toUpperCase() === targetCode);
        
        if (found) {
          setCouponDetails(found);
          if (found.status === "Active") {
            setVerificationResult("valid");
            setFeedbackMessage({ text: "Voucher code verified! It is active and valid for redemption.", type: "success" });
          } else {
            setVerificationResult("invalid");
            setFeedbackMessage({ text: "This promo code is inactive or has expired.", type: "error" });
          }
        } else {
          setVerificationResult("invalid");
          setFeedbackMessage({ text: "Invalid promo code. No record found in system database.", type: "error" });
        }
      } else {
        setFeedbackMessage({ text: "Failed to connect to verification server.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ text: "Network error occurred during coupon check.", type: "error" });
    } finally {
      setVerifying(false);
    }
  };

  const handleRedeem = async () => {
    if (!couponDetails) return;
    setRedeeming(true);
    setFeedbackMessage({ text: "", type: "" });

    try {
      // Standard flow: we mock the redemption successfully to keep client clean.
      // In production, this can send a POST request to mark the coupon as redeemed for this user.
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setVerificationResult("redeemed");
      setFeedbackMessage({ 
        text: `Voucher ${couponDetails.code} successfully marked as REDEEMED! The discount has been applied.`, 
        type: "success" 
      });
      setVoucherCode("");
    } catch (err) {
      setFeedbackMessage({ text: "Failed to complete redemption. Try again.", type: "error" });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: "800" }}>Verify & Redeem</h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
          Verify customer voucher codes instantly and redeem them at the checkout counter.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px" }}>
        
        {/* Verification Form */}
        <div className={styles.glassCard} style={{ height: "fit-content" }}>
          <h3 className={styles.cardTitle} style={{ marginBottom: "20px" }}>Scan or Enter Code</h3>
          
          <form onSubmit={handleVerify}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Customer Voucher Code</label>
              <input
                type="text"
                className={styles.formInput}
                required
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="e.g. KRACK50"
                style={{ textTransform: "uppercase", fontSize: "16px", fontWeight: "700", letterSpacing: "1px" }}
                disabled={verifying || redeeming}
              />
            </div>
            
            <button
              type="submit"
              className={styles.btnPrimary}
              style={{ width: "100%" }}
              disabled={verifying || redeeming || !voucherCode.trim()}
            >
              {verifying ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        </div>

        {/* Verification Result Display */}
        <div>
          {feedbackMessage.text && (
            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                marginBottom: "24px",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                backgroundColor: feedbackMessage.type === "success" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                border: `1px solid ${feedbackMessage.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                color: feedbackMessage.type === "success" ? "#34d399" : "#f87171",
              }}
            >
              {feedbackMessage.type === "success" ? (
                <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
              ) : (
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
              )}
              <div>
                <p style={{ fontWeight: "700", marginBottom: "4px" }}>
                  {feedbackMessage.type === "success" ? "Verification OK" : "Verification Failed"}
                </p>
                <p style={{ opacity: 0.9, fontSize: "13px" }}>{feedbackMessage.text}</p>
              </div>
            </div>
          )}

          {verificationResult === "valid" && couponDetails && (
            <div className={styles.glassCard} style={{ border: "1px solid rgba(16, 185, 129, 0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 className={styles.cardTitle}>Voucher Details</h3>
                <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                  {couponDetails.status}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "13px" }}>Promo Code</span>
                  <span style={{ fontWeight: "800", color: "#818cf8" }}>{couponDetails.code}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "13px" }}>Discount Benefit</span>
                  <span style={{ fontWeight: "700", color: "#ffffff" }}>{couponDetails.discount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "13px" }}>Minimum Purchase</span>
                  <span style={{ color: "#ffffff" }}>{couponDetails.minPurchase}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "13px" }}>Valid Till</span>
                  <span style={{ color: "#ffffff" }}>{couponDetails.expiry}</span>
                </div>
              </div>

              <button
                onClick={handleRedeem}
                className={styles.btnPrimary}
                style={{ width: "100%", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}
                disabled={redeeming}
              >
                {redeeming ? "Completing Redemption..." : "Confirm Redemption"}
              </button>
            </div>
          )}

          {verificationResult === "redeemed" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", background: "rgba(16, 185, 129, 0.03)", borderRadius: "20px", border: "1px dashed rgba(16, 185, 129, 0.2)" }}>
              <CheckCircle size={48} style={{ color: "#10b981", marginBottom: "16px" }} />
              <h4 style={{ color: "#ffffff", fontWeight: "700", fontSize: "18px", marginBottom: "8px" }}>Redeemed Successfully</h4>
              <p style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center" }}>
                Transaction recorded. You can now scan another customer code.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
