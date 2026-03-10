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
        console.log("The rows in the revenue route >>>", rows);
        const payload = {
            'revenue': ''
        }
        const revenue = Number(rows[0].revenue);
        const revenueFormatted = (Math.round(revenue * 100) / 100).toFixed(2);
        payload['revenue'] = revenueFormatted;

        res.json({"payload": payload,
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
        const payload ={
            'adspend':''
        }
        const adSpend = Number(rows[0].adspend);
        const adSpendFormatted = (Math.round(adSpend * 100) / 100).toFixed(2);
        payload['adspend'] = adSpendFormatted;

        res.json({ 'payload': payload, ok: true });
    } catch (err) {
        console.error('Error fetching ad spend:', err);
        res.status(500).json({ error: 'Failed to fetch ad spend' });
    }

});

// Net Profit = Revenue - COGS - Ad Spend
metricsRouter.get('/net_profit', async(req,res)=> {

    const { id, start, end } = req.query;

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
        const payload = {
            'net_profit': ''
            
        }
        const netProfit = Number(rows[0].net_profit);
        const netProfitFormatted = (Math.round(netProfit * 100) / 100).toFixed(2);
        payload['net_profit'] = netProfitFormatted;
        
        res.json({ payload:payload, ok: true });
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

        const payload = {
            'contr_margin': ''
            
        }
        const contrMargin = Number(rows[0].contr_margin);
        const contrMarginFormatted = (Math.round(contrMargin * 100) / 100).toFixed(2);
        payload['contr_margin'] = Number(contrMarginFormatted) * 100;
        
        res.json({ payload:payload, ok: true });
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
            rev.revenue,
            ads.total_adspend,
            rev.revenue / NULLIF(ads.total_adspend, 0) AS blended_roas
        FROM
        (
            SELECT
                SUM(o.total_price) AS revenue
            FROM orders o
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

    const payload = {
        'blended_roas': ''
        
    }
    const blendedROAS = Number(rows[0].blended_roas);
    const blendedROASFormatted = (Math.round(blendedROAS * 100) / 100).toFixed(2);
    payload['blended_roas'] = blendedROASFormatted;
    
    res.json({ payload: payload, ok: true });

  } catch (err) {
    console.error('Error calculating blended ROAS:', err);
    res.status(500).json({ error: 'Failed to calculate blended ROAS' });
  }

});

// Breakeven ROAS = Revenue / (Revenue - total cost of goods)
metricsRouter.get('/breakeven_roas', async(req,res)=> {
    const { id, start, end } = req.query;

    // const query2 = `
    //     SELECT 
    //         SUM(cogs) / SUM(total_amount) AS breakeven_roas
    //     FROM orders
    //     WHERE created_at BETWEEN ? AND ?;
    // `;

    const query = `
        SELECT
            rev.revenue,
            rev.total_cogs,
            rev.revenue / NULLIF(rev.revenue - rev.total_cogs, 0) AS breakeven_roas
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

        const payload = {
            'breakeven_roas': ''
        
        }

        const breakevenROAS = Number(rows[0].breakeven_roas);
        const breakevenROASFormatted = (Math.round(breakevenROAS * 100) / 100).toFixed(2);
        payload['breakeven_roas'] = breakevenROASFormatted;
    
        res.json({ payload: payload, ok: true });

    } catch (err) {
        console.error('Error calculating breakeven ROAS:', err);
        res.status(500).json({ error: 'Failed to calculate breakeven ROAS' });
    }

});

module.exports = metricsRouter;