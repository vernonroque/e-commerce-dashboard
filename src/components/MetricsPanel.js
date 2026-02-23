import React from "react";
import '../stylesheets/MetricsPanel.css';

const metricsData = [
  { name: "NET PROFIT", value: "$25,000" },
  { name: "REVENUE", value: "$120,000" },
  { name: "AD SPEND", value: "$30,000" },
  { name: "CONTR MARGIN", value: "70%" },
  { name: "BLENDED ROAS", value: "4.0" },
  { name: "BREAKEVEN ROAS", value: "2.5" },
];

function MetricsPanel() {
  return (
    <div className="metrics-grid">
      {metricsData.map((m) => (
        <div key={m.name} className="metric-card">
          <div>{m.name}</div>
          <div className="value">{m.value}</div>
        </div>
      ))}
    </div>
  );
}

export default MetricsPanel;