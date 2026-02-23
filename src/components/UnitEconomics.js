import React from "react";
import "../stylesheets/UnitEconomics.css";

const unitData = [
  { name: "CAC", value: "$25" },
  { name: "LTV", value: "$120" },
  { name: "Margin/Unit", value: "$30" },
];

export default function UnitEconomics() {
  return (
    <div className="unit-econ">
      {unitData.map((u) => (
        <div key={u.name} className="unit-card">
          {u.name}: {u.value}
        </div>
      ))}
    </div>
  );
}