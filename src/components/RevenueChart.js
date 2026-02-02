import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import '../stylesheets/RevenueChart.css';


const dataSets = {
  daily: [
    { name: "Mon", revenue: 1200, cashFlow: 600 },
    { name: "Tue", revenue: 2100, cashFlow: 900 },
    { name: "Wed", revenue: 1800, cashFlow: 700 },
    { name: "Thu", revenue: 2500, cashFlow: 1200 },
    { name: "Fri", revenue: 3200, cashFlow: 1800 }
  ],
  weekly: [
    { name: "Week 1", revenue: 12000, cashFlow: 6200 },
    { name: "Week 2", revenue: 14500, cashFlow: 8000 },
    { name: "Week 3", revenue: 16800, cashFlow: 9400 }
  ],
  monthly: [
    { name: "Jan", revenue: 52000, cashFlow: 28000 },
    { name: "Feb", revenue: 61000, cashFlow: 34000 },
    { name: "Mar", revenue: 73000, cashFlow: 41000 }
  ]
};

function RevenueChart() {
  const [range, setRange] = useState("daily");

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Revenue vs Cash Flow</h3>

        <div className="chart-toggle">
          {["daily", "weekly", "monthly"].map(r => (
            <button
              key={r}
              className={range === r ? "active" : ""}
              onClick={() => setRange(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataSets[range]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={3}
            />
            <Line
                type="monotone"
                dataKey="cashFlow"
                stroke="#10b981"
                strokeWidth={3}
            />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;