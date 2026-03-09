//file for metrics panel routes and db querying
const express = require('express');
const db = require('../../db');
const metricsRouter = express.Router();

// Revenue
metricsRouter.get('/revenue', async(req,res)=> {
    const { id, start, end } = req.query;
    console.log("In the revenue backend endpoint")
    console.log("The query is >>>", req.query);
    const query = `SELECT SUM(total_price) AS revenue
                    FROM orders
                    WHERE created_at BETWEEN ? AND ?
                    AND store_id = ?`;
    try {
        
        const [rows] = await db.query(query,[start, end, id]);

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

    const { id, start, end } = req.query;
    const startDateOnly = start.split("T")[0];
    const endDateOnly = end.split("T")[0];

    const query = `SELECT SUM(spend) AS adspend
                    FROM ad_spend_daily
                    WHERE date BETWEEN ? AND ?
                    AND store_id = ?;`;
    try {
        const [rows] = await db.query(query, [startDateOnly, endDateOnly, id]);
        res.json({ rows, ok: true });
    } catch (err) {
        console.error('Error fetching ad spend:', err);
        res.status(500).json({ error: 'Failed to fetch ad spend' });
    }

});

// Net Profit = Revenue - COGS - Ad Spend
metricsRouter.get('/net_profit', async(req,res)=> {

    const { id, start, end } = req.query;

    // const query = `
    //     SELECT 
    //     SUM(o.total_price) AS revenue,
    //     SUM(cogs) AS total_cogs,
    //     SUM(ads.spend) AS total_adspend,
    //     SUM(o.total_price) - SUM(cogs) - SUM(ad_spend) AS net_profit
    //     FROM orders o
    //     JOIN ad_spend_daily ads where o.store_id = ads.store_id
    //     WHERE o.created_at BETWEEN ? AND ?
    //     AND o.store_id = ?;
    // `;

    const query = `
        SELECT
            rev.revenue,
            rev.total_cogs,
            ads.total_adspend,
            rev.revenue - rev.total_cogs - ads.total_adspend AS net_profit
        FROM
        (
            SELECT
                SUM(o.total_price) AS revenue,
                SUM(oi.quantity * oi.unit_cogs) AS total_cogs
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.created_at BETWEEN ? AND ?
            AND o.store_id = ?
        ) rev
        JOIN
        (
            SELECT
                SUM(spend) AS total_adspend
            FROM ad_spend_daily
            WHERE date BETWEEN ? AND ?
            AND store_id = ?
        ) ads;
    `;

    try {
        const [rows] = await db.query(query, [
            start,
            end,
            id,
            start,
            end,
            id
        ]);
        res.json({ rows, ok: true });
    } catch (err) {
        console.error('Error calculating net profit:', err);
        res.status(500).json({ error: 'Failed to calculate net profit' });
    }

});

// Contribution Margin = (Revenue - COGS) / Revenue
metricsRouter.get('/contribution_margin', async(req,res)=> {
    const { id, start, end } = req.query;

    const query = `
    SELECT
            rev.revenue,
            rev.total_cogs,
            (rev.revenue - rev.total_cogs) / rev.revenue AS contr_margin
        FROM
        (
            SELECT
                SUM(o.total_price) AS revenue,
                SUM(oi.quantity * oi.unit_cogs) AS total_cogs
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.created_at BETWEEN ? AND ?
            AND o.store_id = ?
        ) rev;
  `;

    try {
        const [rows] = await db.query(query, [start, end, id]);
        res.json({ rows, ok: true });
    } catch (err) {
        console.error('Error calculating contribution margin:', err);
        res.status(500).json({ error: 'Failed to calculate contribution margin' });
    }

});

// Blended ROAS = Revenue / Ad Spend
metricsRouter.get('/blended_roas', async(req,res)=> {
    const { id, start, end } = req.query;

    const query = `
        SELECT 
            SUM(total_amount) / SUM(ad_spend) AS blended_roas
        FROM orders
        WHERE created_at BETWEEN ? AND ?;
    `;

  try {
    const [rows] = await db.query(query, [start, end, id]);
    res.json({ rows, ok: true });
  } catch (err) {
    console.error('Error calculating blended ROAS:', err);
    res.status(500).json({ error: 'Failed to calculate blended ROAS' });
  }

});

// Breakeven ROAS = COGS / Revenue (or Ad Spend?) — typically, breakeven ROAS = Revenue / Ad Spend needed to break even
metricsRouter.get('/breakeven_roas', async(req,res)=> {
    const { id, start, end } = req.query;

    const query = `
        SELECT 
            SUM(cogs) / SUM(total_amount) AS breakeven_roas
        FROM orders
        WHERE created_at BETWEEN ? AND ?;
    `;

    try {
        const [rows] = await db.query(query, [start, end, id]);
        res.json({ rows, ok: true });
    } catch (err) {
        console.error('Error calculating breakeven ROAS:', err);
        res.status(500).json({ error: 'Failed to calculate breakeven ROAS' });
    }

});

module.exports = metricsRouter;