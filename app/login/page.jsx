"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { isValidEmail } from "@/app/util/validators";
import styles from "./login.module.css";
import DynamicData from "../util/Dynamicdata";
import { ENV } from "@/config/env";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/partner";

  useEffect(() => {
    if (!loading && user) {
      const role = user.role;
      if (role === "seller" || role === "partner") {
        router.push("/partner");
      } else {
        setFormError("Access denied: You are logged in with a non-partner account.");
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setFormError("Please enter your partner email and password.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setFormError("Please enter a valid email address (e.g. partner@store.com).");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(cleanEmail, password);
      if (result.success) {
        const role = result.user?.role;
        if (role === "seller" || role === "partner") {
          router.push("/partner");
          router.refresh();
        } else {
          setFormError("Access denied: Partner account required.");
        }
      } else {
        if (result.isVerified === false) {
          router.push(`/verify?email=${encodeURIComponent(result.email || cleanEmail)}`);
        } else {
          setFormError(result.message || "Invalid email or password");
        }
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      {/* Back Link */}
      <a href={`${ENV.STORE_URL}/`} className={styles.link} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", marginBottom: "20px", width: "fit-content" }}>
        <ArrowLeft size={14} />
        <span>Back to Customer Site</span>
      </a>

      {/* Brand Header */}
      <div className={styles.header}>
        <div className={styles.logoWrapper} onClick={() => router.push("/partner")}>
          <div className={styles.logoIcon}>P</div>
          <span className={styles.logoText}>
            {DynamicData.Logoheading}<span className={styles.logoDot}> Partner</span>
          </span>
        </div>
        <h2 className={styles.title}>Merchant Portal</h2>
        <p className={styles.subtitle}>Sign in with your partner/seller account</p>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className={styles.errorAlert} style={{ marginBottom: "20px" }}>
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <Mail size={14} />
            <span>Email Address</span>
          </label>
          <div className={styles.inputWrapper}>
            <Mail size={16} className={styles.inputIcon} />
            <input
              type="email"
              placeholder="partner@store.com"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <Lock size={14} />
            <span>Password</span>
          </label>
          <div className={styles.inputWrapper}>
            <Lock size={16} className={styles.inputIcon} />
            <input
              type="password"
              placeholder="••••••••"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <a href={`${ENV.STORE_URL}/forgot-password`} className={styles.link} style={{ alignSelf: "flex-end", fontSize: "12px", textDecoration: "none", fontWeight: "600", marginTop: "4.5px" }}>
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          className={styles.btn}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className={styles.footer}>
        <span>Want to register a store? <a href="/register" className={styles.link}>Register Partner Store</a>.</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.glowBlob1} />
      <div className={styles.glowBlob2} />
      <Suspense fallback={
        <div className={styles.card} style={{ alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading login form...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
