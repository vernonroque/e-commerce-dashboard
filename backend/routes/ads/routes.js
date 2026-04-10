const express = require('express');
const db = require('../../db');
const { fetchAdSpend } = require('../../services/meta.service');

const adsRouter = express.Router();

/**
 * POST /api/ads/connect
 * Save a Meta ad account connection for the user's store.
 *
 * Body: { store_id, ad_platform_id, external_account_id, account_name, access_token, token_expires_at }
 */
adsRouter.post('/connect', async (req, res) => {
    const { store_id, ad_platform_id, external_account_id, account_name, access_token, token_expires_at } = req.body;

    if (!store_id || !ad_platform_id || !external_account_id || !access_token) {
        return res.status(400).json({ error: 'store_id, ad_platform_id, external_account_id, and access_token are required' });
    }

    const query = `
        INSERT INTO ad_accounts (store_id, ad_platform_id, external_account_id, account_name, access_token, token_expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            account_name = VALUES(account_name),
            access_token = VALUES(access_token),
            token_expires_at = VALUES(token_expires_at)
    `;

    try {
        await db.query(query, [store_id, ad_platform_id, external_account_id, account_name || null, access_token, token_expires_at || null]);
        res.json({ ok: true, message: 'Ad account connected' });
    } catch (err) {
        console.error('Error connecting ad account:', err);
        res.status(500).json({ error: 'Failed to connect ad account' });
    }
});

/**
 * POST /api/ads/sync
 * Pull spend data from Meta Ads API and upsert into ad_spend_daily.
 *
 * Body: { store_id, ad_account_id, start_date, end_date }
 * ad_account_id is the row id in the ad_accounts table.
 */
adsRouter.post('/sync', async (req, res) => {
    const { store_id, ad_account_id, start_date, end_date } = req.body;

    if (!store_id || !ad_account_id || !start_date || !end_date) {
        return res.status(400).json({ error: 'store_id, ad_account_id, start_date, and end_date are required' });
    }

    try {
        // Fetch the ad account record to get the access token and external account ID
        const [accounts] = await db.query(
            'SELECT * FROM ad_accounts WHERE id = ? AND store_id = ?',
            [ad_account_id, store_id]
        );

        if (!accounts.length) {
            return res.status(404).json({ error: 'Ad account not found' });
        }

        const account = accounts[0];

        if (!account.access_token) {
            return res.status(400).json({ error: 'No access token on file for this ad account' });
        }

        // Fetch daily spend rows from Meta
        const rows = await fetchAdSpend(account.access_token, account.external_account_id, start_date, end_date);

        if (!rows.length) {
            return res.json({ ok: true, inserted: 0, message: 'No data returned from Meta for the given date range' });
        }

        // Upsert each row into ad_spend_daily
        const upsertQuery = `
            INSERT INTO ad_spend_daily (store_id, ad_platform_id, date, spend, impressions, clicks, conversions, revenue_attributed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                spend = VALUES(spend),
                impressions = VALUES(impressions),
                clicks = VALUES(clicks),
                conversions = VALUES(conversions),
                revenue_attributed = VALUES(revenue_attributed)
        `;

        for (const row of rows) {
            await db.query(upsertQuery, [
                store_id,
                account.ad_platform_id,
                row.date,
                row.spend,
                row.impressions,
                row.clicks,
                row.conversions,
                row.revenue_attributed,
            ]);
        }

        res.json({ ok: true, inserted: rows.length });
    } catch (err) {
        console.error('Error syncing ad spend:', err);
        res.status(500).json({ error: 'Failed to sync ad spend' });
    }
});

module.exports = adsRouter;
