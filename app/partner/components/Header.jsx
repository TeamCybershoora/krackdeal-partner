"use client";
import { useAuth } from "@/app/context/AuthContext";
import { Bell, Search } from "lucide-react";
import { motion } from "framer-motion";
import styles from "../partner.module.css";

export default function Header() {
  const { user } = useAuth();
  
  const avatarUrl = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=256&auto=format&fit=crop";

  return (
    <header className={styles.header}>
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search vouchers, deals..." 
          className={styles.searchInput} 
        />
      </div>

      <div className={styles.profileSection}>
        <motion.button 
          className={styles.notificationBtn} 
          aria-label="Notifications"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{
              rotate: [0, -12, 12, -12, 12, 0]
            }}
            transition={{
              repeat: Infinity,
              repeatDelay: 5,
              duration: 0.6,
              ease: "easeInOut"
            }}
          >
            <Bell size={18} />
          </motion.div>
          {/* Notification dot indicator */}
          <span 
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "6px",
              height: "6px",
              background: "#ef4444",
              borderRadius: "50%",
              boxShadow: "0 0 6px #ef4444"
            }}
          />
        </motion.button>

        <motion.div 
          className={styles.userProfile}
          whileHover={{ scale: 1.02 }}
        >
          <img 
            src={avatarUrl} 
            alt={user?.name || "Merchant"} 
            className={styles.profileAvatar} 
          />
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{user?.name || "Merchant Partner"}</span>
            <span className={styles.profileRole}>{user?.role || "Seller"}</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
