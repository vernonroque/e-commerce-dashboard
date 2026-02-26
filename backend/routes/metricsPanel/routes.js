//file for metrics panel routes and db querying
const express = require('express');
const db = require('../../db');
const metricsRouter = express.Router();

metricsRouter.get('/revenue', async(req,res)=> {
    const query = `SELECT SUM(total_amount) AS revenue
                    FROM orders
                    WHERE created_at BETWEEN ? AND ?;`
    try {
        
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

metricsRouter.get('/adspend', async(req,res)=> {

});

metricsRouter.get('/net_profit', async(req,res)=> {

});

metricsRouter.get('/contribution_margin', async(req,res)=> {

});

metricsRouter.get('/blended_roas', async(req,res)=> {

});

metricsRouter.get('/breakeven_roas', async(req,res)=> {

});

module.exports = metricsRouter;