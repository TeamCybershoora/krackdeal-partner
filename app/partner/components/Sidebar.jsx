"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Tag, 
  CheckSquare, 
  Store,
  LogOut,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "../partner.module.css";
import { useAuth } from "@/app/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { label: "Dashboard", href: "/partner", icon: LayoutDashboard },
    { label: "My Deals", href: "/partner/deals", icon: Tag },
    { label: "Verify & Redeem", href: "/partner/redeem", icon: CheckSquare },
    { label: "Store Settings", href: "/partner/settings", icon: Store }
  ];

  const isLinkActive = (href) => {
    if (href === "/partner") {
      return pathname === "/partner";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <Sparkles size={28} className={styles.logoIcon} />
        <span className={styles.logoText}>Partner Portal</span>
      </div>

      <nav className={styles.navigationList}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`${styles.navLink} ${active ? styles.activeNavLink : ""}`}
              style={{ position: "relative", zIndex: 1 }}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className={styles.activeNavLink}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: "12px",
                    zIndex: -1,
                    border: "1px solid rgba(99, 102, 241, 0.35)",
                    background: "rgba(99, 102, 241, 0.12)",
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.08), inset 0 0 8px rgba(99, 102, 241, 0.05)"
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon size={18} style={{ color: active ? "#818cf8" : "#94a3b8" }} />
              <span style={{ color: active ? "#ffffff" : "#94a3b8" }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button 
          onClick={logout} 
          className={styles.navLink} 
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
