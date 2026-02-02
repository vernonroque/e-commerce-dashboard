import '../stylesheets/PayoutsTable.css'

function PayoutsTable() {

    const payouts = [
        { platform: "Shopify", amount: 2100, date: "Jan 31" },
        { platform: "Stripe", amount: 1450, date: "Feb 2" },
        { platform: "PayPal", amount: 980, date: "Feb 5" }
    ];
  
  return (
    <div className="table-card">
        <h3 className="table-title">Upcoming Payouts</h3>

        <table className="payouts-table">
        <thead>
            <tr>
            <th>Platform</th>
            <th>Amount</th>
            <th>Expected Date</th>
            </tr>
        </thead>

        <tbody>
            {payouts.map((payout, index) => (
            <tr key={index}>
                <td>{payout.platform}</td>
                <td>${payout.amount.toLocaleString()}</td>
                <td>{payout.date}</td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
  );
}

export default PayoutsTable;