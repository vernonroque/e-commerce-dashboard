import React from "react";

function KpiCard({ title, value, meta, trend }) {
  return (
    <div className="kpi-card">
      <span className="kpi-title">{title}</span>
      <h2 className="kpi-value">{value}</h2>
      <span className={`kpi-meta ${trend === "up" ? "positive" : ""}`}>
        {meta}
      </span>
    </div>
  );
}

export default KpiCard;