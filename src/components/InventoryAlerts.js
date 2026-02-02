import React from 'react'
import '../stylesheets/InventoryAlerts.css'

function InventoryAlerts() {
  const products = [
    { name: "Hoodie Black", inStock: 120, dailyAvg: 15 },
    { name: "Hat Blue", inStock: 340, dailyAvg: 5 }
  ];

  const reorderThreshold = 10; // days

  return (
    <div className="table-card">
        <h3 className="table-title">Inventory Watch</h3>

        <table className="inventory-table">
            <thead>
                <tr>
                <th>Product</th>
                <th>In Stock</th>
                <th>Daily Avg</th>
                <th>Reorder In</th>
                </tr>
            </thead>

            <tbody>
                {products.map((product, index) => {
                const daysLeft = Math.floor(
                    product.inStock / product.dailyAvg
                );
                const isLow = daysLeft <= reorderThreshold;

                return (
                    <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.inStock}</td>
                    <td>{product.dailyAvg}</td>
                    <td className={isLow ? "warning" : ""}>
                        {daysLeft} days {isLow && "⚠️"}
                    </td>
                    </tr>
                );
                })}
            </tbody>
        </table>
    </div>
  );
}

export default InventoryAlerts;