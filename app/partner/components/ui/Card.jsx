"use client";

import { motion } from "framer-motion";
import styles from "./ui.module.css";

export default function Card({ children, className = "", style = {}, hoverLift = true, onClick }) {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -3, boxShadow: "0 14px 40px rgba(0, 0, 0, 0.4)" } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`${styles.cardContainer} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
