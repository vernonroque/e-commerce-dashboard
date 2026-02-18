//file for dashboard routes and db querying
const express = require('express');
const db = require('../../db');
const dashboardRouter = express.Router();

dashboardRouter.get('/', async (req,res) => {
  if(res.status === 401) return;
  
  const query = `
    SELECT *
    FROM orders
  `;

  try {

    // const result = await db.query(query);
    // console.log("The result of the query is >>>", result);

    const [rows] = await db.query(query);
    // console.log("The row data type is >>", typeof rows);

    res.json({"rows": rows,
              "ok":true
            });

  } catch (err) {

    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });

  }

});

dashboardRouter.get('/summary', async (req, res) => {
  // try {
  //   // Get revenue summary
  //   const revenueQuery = `
  //     SELECT 
  //       SUM(net_revenue) as total_revenue,
  //       COUNT(*) as order_count,
  //       AVG(net_revenue) as average_order_value
  //     FROM orders
  //     WHERE deleted_at IS NULL
  //   `;

  //   db.query(revenueQuery, (err, results) => {
  //     if (err) {
  //       console.error('Error fetching summary:', err);
  //       return res.status(500).json({ error: 'Failed to fetch summary' });
  //     }

  //     const summary = results[0];
  //     res.json({
  //       revenue: {
  //         total: summary.total_revenue || 0,
  //         averageOrderValue: summary.average_order_value || 0
  //       },
  //       orders: {
  //         total: summary.order_count || 0
  //       },
  //       status: 200,
  //       ok: true
  //     });
  //   });
  // } catch (error) {
  //   res.status(500).json({ error: error.message });
  // }
});

module.exports = dashboardRouter;