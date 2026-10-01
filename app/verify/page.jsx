"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import styles from "../login/login.module.css";
import DynamicData from "../util/Dynamicdata";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { verifyCode, resendVerifyCode } = useAuth();

  useEffect(() => {
    if (!email) {
      setFormError("Email parameter is missing. Please register again.");
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    const cleanCode = code.trim();

    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setFormError("Please enter a valid 6-digit numeric verification code");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyCode(email.trim().toLowerCase(), cleanCode);
      if (result.success) {
        setSuccessMsg("Partner account verified successfully! Redirecting...");
        setTimeout(() => {
          window.location.href = "/partner";
        }, 1500);
      } else {
        setFormError(result.message || "Invalid or expired verification code");
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setFormError("");
    setSuccessMsg("");

    try {
      const result = await resendVerifyCode(email);
      if (result.success) {
        setSuccessMsg("Verification code resent to your email!");
      } else {
        setFormError(result.message || "Failed to resend code");
      }
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.card}>
      {/* Back Link */}
      <a href="/login" className={styles.link} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", marginBottom: "20px", width: "fit-content" }}>
        <ArrowLeft size={14} />
        <span>Back to Partner Login</span>
      </a>

      {/* Brand Header */}
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoIcon}>P</div>
          <span className={styles.logoText}>
            {DynamicData.Logoheading}<span className={styles.logoDot}> Partner</span>
          </span>
        </div>
        <h2 className={styles.title}>Verify Partner Account</h2>
        <p className={styles.subtitle}>Enter the 6-digit code sent to:</p>
        <span style={{ color: "#a5b4fc", fontSize: "13px", fontWeight: "600", wordBreak: "break-all" }}>
          {email || "your email address"}
        </span>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className={styles.errorAlert} style={{ marginBottom: "20px" }}>
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "12px",
          marginBottom: "20px",
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "#34d399",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <Lock size={16} className={styles.inputIcon} />
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              className={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              style={{ letterSpacing: "6px", textAlign: "center", fontSize: "20px", fontWeight: "700" }}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          className={styles.btn}
          disabled={isSubmitting || !email}
        >
          {isSubmitting ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className={styles.footer} style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <button 
          onClick={handleResend} 
          disabled={isResending || !email}
          style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}
        >
          {isResending ? "Resending Code..." : "Resend Code"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.glowBlob1} />
      <div className={styles.glowBlob2} />
      <Suspense fallback={
        <div className={styles.card} style={{ alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading verification form...</p>
        </div>
      }>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
