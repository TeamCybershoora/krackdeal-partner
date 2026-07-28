"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Store, Phone, MapPin, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import styles from "../login/login.module.css";
import DynamicData from "../util/Dynamicdata";

export default function PartnerRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name || !email || !password || !storeName || !phone || !address) {
      setFormError("All personal and store fields are required");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setFormError("Please enter a valid email address format (e.g. partner@example.com)");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/API/auth/register-partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          storeName,
          phone,
          address,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRegisteredEmail(email);
        if (data.isVerified) {
          setAlreadyVerified(true);
        }
        setIsRegistered(true);
      } else {
        setFormError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <div className={styles.container}>
        <div className={styles.glowBlob1} />
        <div className={styles.glowBlob2} />
        <div className={styles.card} style={{ textAlign: "center", alignItems: "center" }}>
          {alreadyVerified ? (
            <>
              <CheckCircle size={54} style={{ color: "#10b981", marginBottom: "20px" }} />
              <h2 className={styles.title} style={{ marginBottom: "10px" }}>Account Upgraded</h2>
              <p className={styles.subtitle} style={{ marginBottom: "24px", lineHeight: "1.6" }}>
                Your customer account has been successfully upgraded to a partner account. 
                Since your email is already verified, you can sign in directly!
              </p>
              <a 
                href="http://localhost:3002/login" 
                className={styles.btn}
                style={{ width: "100%", textDecoration: "none" }}
              >
                Sign In Now
              </a>
            </>
          ) : (
            <>
              <CheckCircle size={54} style={{ color: "#10b981", marginBottom: "20px" }} />
              <h2 className={styles.title} style={{ marginBottom: "10px" }}>Verification Required</h2>
              <p className={styles.subtitle} style={{ marginBottom: "24px", lineHeight: "1.6" }}>
                A 6-digit verification code has been sent to <strong>{registeredEmail}</strong>. 
                Please complete the email verification on the main portal to activate your account.
              </p>
              <a 
                href={`http://localhost:3000/verify?email=${encodeURIComponent(registeredEmail)}`} 
                className={styles.btn}
                style={{ width: "100%", textDecoration: "none" }}
              >
                Verify Email Now
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.glowBlob1} />
      <div className={styles.glowBlob2} />
      
      <div className={styles.card} style={{ maxWidth: "550px" }}>
        {/* Back Link */}
        <a href="http://localhost:3002/login" className={styles.link} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", marginBottom: "20px", width: "fit-content" }}>
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </a>

        {/* Brand Header */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoIcon}>P</div>
            <span className={styles.logoText}>
              {DynamicData.Logoheading}<span className={styles.logoDot}> Partner</span>
            </span>
          </div>
          <h2 className={styles.title}>Register Store</h2>
          <p className={styles.subtitle}>Apply for a merchant account and publish your store deals</p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className={styles.errorAlert} style={{ marginBottom: "20px" }}>
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Section: Personal Credentials */}
            <h4 style={{ fontSize: "14px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "6px", color: "var(--primary)" }}>
              Owner Details
            </h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <User size={12} />
                  <span>Full Name</span>
                </label>
                <div className={styles.inputWrapper}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <Mail size={12} />
                  <span>Email Address</span>
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <Lock size={12} />
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
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Section: Store Details */}
            <h4 style={{ fontSize: "14px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "6px", color: "var(--primary)", marginTop: "10px" }}>
              Store Details
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <Store size={12} />
                  <span>Store Name</span>
                </label>
                <div className={styles.inputWrapper}>
                  <Store size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g. Dominos Pizza"
                    className={styles.input}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <Phone size={12} />
                  <span>Helpline Phone</span>
                </label>
                <div className={styles.inputWrapper}>
                  <Phone size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="+91 98765..."
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <MapPin size={12} />
                <span>Shop Address</span>
              </label>
              <div className={styles.inputWrapper}>
                <MapPin size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Street, Block, Sector, City"
                  className={styles.input}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            className={styles.btn}
            style={{ marginTop: "20px" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting Application..." : "Register Store"}
          </button>
        </form>

        <div className={styles.footer}>
          <span>Already registered? </span>
          <a href="http://localhost:3002/login" className={styles.link}>
            Sign In Here
          </a>
        </div>
      </div>
    </div>
  );
}
