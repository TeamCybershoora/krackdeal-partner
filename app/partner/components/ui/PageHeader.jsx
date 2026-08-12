"use client";

import styles from "./ui.module.css";

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleGroup}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.headerActions}>{actions}</div>}
    </div>
  );
}
