//file for metrics panel routes and db querying
const express = require('express');
const db = require('../../db');
const metricsRouter = express.Router();

// Revenue
metricsRouter.get('/revenue', async(req,res)=> {
    const query = `SELECT SUM(total_amount) AS revenue
                    FROM orders
                    WHERE created_at BETWEEN ? AND ?;`;
    try {
        
        const [rows] = await db.query(query);

        res.json({"rows": rows,
                "ok":true
                });

    } catch (err) {

        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });

    }

});

// Ad Spend
metricsRouter.get('/adspend', async(req,res)=> {

    const { startDate, endDate } = req.query;
    const query = `SELECT SUM(ad_spend) AS adspend
                    FROM orders
                    WHERE created_at BETWEEN ? AND ?;`;
    try {
        const [rows] = await db.query(query, [startDate, endDate]);
        res.json({ rows, ok: true });
    } catch (err) {
        console.error('Error fetching ad spend:', err);
        res.status(500).json({ error: 'Failed to fetch ad spend' });
    }

});

// Net Profit = Revenue - COGS - Ad Spend
metricsRouter.get('/net_profit', async(req,res)=> {

    const { startDate, endDate } = req.query;

    const query = `
        SELECT 
        SUM(total_amount) AS revenue,
        SUM(cogs) AS total_cogs,
        SUM(ad_spend) AS total_adspend,
        SUM(total_amount) - SUM(cogs) - SUM(ad_spend) AS net_profit
        FROM orders
        WHERE created_at BETWEEN ? AND ?;
    `;

    try {
        const [rows] = await db.query(query, [startDate, endDate]);
        res.json({ rows, ok: true });
    } catch (err) {
        console.error('Error calculating net profit:', err);
        res.status(500).json({ error: 'Failed to calculate net profit' });
    }

});

// Contribution Margin = (Revenue - COGS) / Revenue
metricsRouter.get('/contribution_margin', async(req,res)=> {
    const { startDate, endDate } = req.query;

    const query = `
    SELECT 
      SUM(total_amount) AS revenue,
      SUM(cogs) AS total_cogs,
      (SUM(total_amount) - SUM(cogs)) / SUM(total_amount) AS contribution_margin
    FROM orders
    WHERE created_at BETWEEN ? AND ?;
  `;

    try {
        const [rows] = await db.query(query, [startDate, endDate]);
        res.json({ rows, ok: true });
    } catch (err) {
        console.error('Error calculating contribution margin:', err);
        res.status(500).json({ error: 'Failed to calculate contribution margin' });
    }

});

// Blended ROAS = Revenue / Ad Spend
metricsRouter.get('/blended_roas', async(req,res)=> {
    const { startDate, endDate } = req.query;

    const query = `
        SELECT 
            SUM(total_amount) / SUM(ad_spend) AS blended_roas
        FROM orders
        WHERE created_at BETWEEN ? AND ?;
    `;

  try {
    const [rows] = await db.query(query, [startDate, endDate]);
    res.json({ rows, ok: true });
  } catch (err) {
    console.error('Error calculating blended ROAS:', err);
    res.status(500).json({ error: 'Failed to calculate blended ROAS' });
  }

});

// Breakeven ROAS = COGS / Revenue (or Ad Spend?) — typically, breakeven ROAS = Revenue / Ad Spend needed to break even
metricsRouter.get('/breakeven_roas', async(req,res)=> {
    const { startDate, endDate } = req.query;

    const query = `
        SELECT 
            SUM(cogs) / SUM(total_amount) AS breakeven_roas
        FROM orders
        WHERE created_at BETWEEN ? AND ?;
    `;

    try {
        const [rows] = await db.query(query, [startDate, endDate]);
        res.json({ rows, ok: true });
    } catch (err) {
        console.error('Error calculating breakeven ROAS:', err);
        res.status(500).json({ error: 'Failed to calculate breakeven ROAS' });
    }

});

module.exports = metricsRouter;