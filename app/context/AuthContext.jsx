"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Helper to set a cookie on the client side
const setClientCookie = (name, value, days = 7) => {
    if (typeof window !== "undefined") {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/; SameSite=Strict`;
    }
};

// Helper to get a cookie on the client side
const getClientCookie = (name) => {
    if (typeof window !== "undefined") {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            try {
                return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
            } catch (e) {
                return null;
            }
        }
    }
    return null;
};

// Helper to delete a cookie on the client side
const deleteClientCookie = (name) => {
    if (typeof window !== "undefined") {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auth Modal Global States
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState("login"); // "login" | "register"
    const [authModalReason, setAuthModalReason] = useState("");

    const openAuthModal = (mode = "login", reason = "") => {
        setAuthModalMode(mode);
        setAuthModalReason(reason);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
        setAuthModalReason("");
    };

    // Validate and fetch current session on mount
    const checkSession = async () => {
        try {
            const cachedUser = getClientCookie("user_data");
            if (cachedUser) {
                setUser(cachedUser);
            }
            const res = await fetch("/API/auth/me");
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                    setClientCookie("user_data", data.user);
                } else {
                    setUser(null);
                    deleteClientCookie("user_data");
                }
            } else {
                setUser(null);
                deleteClientCookie("user_data");
            }
        } catch (err) {
            console.error("Failed to fetch user session", err);
            setUser(null);
            deleteClientCookie("user_data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    // Login action
    const login = async (email, password) => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/API/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setUser(data.user);
                setClientCookie("user_data", data.user);
                setLoading(false);
                return { success: true, user: data.user };
            } else {
                setError(data.message || "Login failed");
                setLoading(false);
                // Return verification details if unverified, so UI can handle redirect
                if (data.isVerified === false) {
                    return { success: false, isVerified: false, email: data.email, message: data.message };
                }
                return { success: false, message: data.message || "Login failed" };
            }
        } catch (err) {
            const errMsg = err.message || "An unexpected error occurred";
            setError(errMsg);
            setLoading(false);
            return { success: false, message: errMsg };
        }
    };

    // Register action (can be used if partners can register themselves)
    const register = async (name, email, password) => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/API/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, role: "seller" }), // Defaults registering role to seller/partner
            });
            const data = await res.json();
            setLoading(false);
            if (res.ok && data.success) {
                return { success: true, email: data.email, message: data.message };
            } else {
                setError(data.message || "Registration failed");
                return { success: false, message: data.message || "Registration failed" };
            }
        } catch (err) {
            const errMsg = err.message || "An unexpected error occurred";
            setError(errMsg);
            setLoading(false);
            return { success: false, message: errMsg };
        }
    };

    // Verify Code action
    const verifyCode = async (email, code) => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/API/auth/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setUser(data.user);
                setClientCookie("user_data", data.user);
                setLoading(false);
                return { success: true, message: data.message };
            } else {
                setError(data.message || "Verification failed");
                setLoading(false);
                return { success: false, message: data.message || "Verification failed" };
            }
        } catch (err) {
            const errMsg = err.message || "An unexpected error occurred";
            setError(errMsg);
            setLoading(false);
            return { success: false, message: errMsg };
        }
    };

    // Resend verification code
    const resendVerifyCode = async (email) => {
        try {
            const res = await fetch("/API/auth/resend-verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || "Failed to resend code" };
            }
        } catch (err) {
            return { success: false, message: err.message || "An unexpected error occurred" };
        }
    };

    // Forgot password request
    const forgotPassword = async (email) => {
        setLoading(true);
        try {
            const res = await fetch("/API/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            setLoading(false);
            if (res.ok && data.success) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || "Failed to send reset link", notRegistered: data.notRegistered };
            }
        } catch (err) {
            setLoading(false);
            return { success: false, message: err.message || "An unexpected error occurred" };
        }
    };

    // Reset password using token
    const resetPassword = async (token, password) => {
        setLoading(true);
        try {
            const res = await fetch("/API/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            setLoading(false);
            if (res.ok && data.success) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || "Failed to reset password" };
            }
        } catch (err) {
            setLoading(false);
            return { success: false, message: err.message || "An unexpected error occurred" };
        }
    };

    // Logout action
    const logout = async () => {
        setLoading(true);
        try {
            await fetch("/API/auth/logout", {
                method: "POST",
            });
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setUser(null);
            deleteClientCookie("user_data");
            setLoading(false);
            window.location.href = "/login";
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            error, 
            login, 
            register, 
            logout, 
            checkSession,
            isAuthModalOpen,
            authModalMode,
            authModalReason,
            openAuthModal,
            closeAuthModal,
            setAuthModalMode,
            verifyCode,
            resendVerifyCode,
            forgotPassword,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
