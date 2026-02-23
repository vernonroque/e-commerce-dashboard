import React from "react";
import "../stylesheets/ProductTable.css";

const products = [
  { name: "Product A", revenue: "$10,000", cost: "$5,000", profit: "$5,000", margin: "50%", units: 100 },
  { name: "Product B", revenue: "$8,000", cost: "$3,500", profit: "$4,500", margin: "56%", units: 80 },
];

function ProductTable() {
    return (
        <table>
        <thead>
            <tr>
            <th>Product Name</th>
            <th>Revenue</th>
            <th>Cost</th>
            <th>Profit</th>
            <th>Margin %</th>
            <th>Units Sold</th>
            </tr>
        </thead>
        <tbody>
            {products.map((p) => (
            <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.revenue}</td>
                <td>{p.cost}</td>
                <td>{p.profit}</td>
                <td>{p.margin}</td>
                <td>{p.units}</td>
            </tr>
            ))}
        </tbody>
        </table>
    );
}

export default ProductTable;