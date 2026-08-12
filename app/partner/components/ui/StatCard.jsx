"use client";

import Card from "./Card";
import styles from "./ui.module.css";

export default function StatCard({ label, value, trend, icon: Icon, iconColor = "#818cf8", iconBg = "rgba(129, 140, 248, 0.08)" }) {
  return (
    <Card className={styles.statCardContainer}>
      <div className={styles.statCardContent}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        {trend && <span className={styles.statTrend}>{trend}</span>}
      </div>
      {Icon && (
        <div className={styles.statIconBadge} style={{ color: iconColor, backgroundColor: iconBg, border: `1px solid ${iconColor}25` }}>
          <Icon size={22} />
        </div>
      )}
    </Card>
  );
}
