const axios = require('axios');

const META_API_VERSION = 'v21.0';
const META_GRAPH_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * Fetch daily ad spend data from Meta Ads Insights API.
 *
 * @param {string} accessToken  - Meta user/system access token
 * @param {string} adAccountId  - Meta ad account ID (without "act_" prefix)
 * @param {string} startDate    - YYYY-MM-DD
 * @param {string} endDate      - YYYY-MM-DD
 * @returns {Promise<Array>}    - Array of daily spend rows
 */
async function fetchAdSpend(accessToken, adAccountId, startDate, endDate) {
    const url = `${META_GRAPH_BASE}/act_${adAccountId}/insights`;

    const params = {
        access_token: accessToken,
        fields: 'date_start,spend,impressions,clicks,actions',
        time_increment: 1,
        time_range: JSON.stringify({ since: startDate, until: endDate }),
        limit: 500,
    };

    const rows = [];
    let nextUrl = null;

    do {
        const response = nextUrl
            ? await axios.get(nextUrl)
            : await axios.get(url, { params });

        const { data, paging } = response.data;

        for (const insight of data) {
            const conversions = extractConversions(insight.actions);
            rows.push({
                date: insight.date_start,
                spend: parseFloat(insight.spend) || 0,
                impressions: parseInt(insight.impressions) || 0,
                clicks: parseInt(insight.clicks) || 0,
                conversions,
                revenue_attributed: 0, // Meta doesn't return attributed revenue directly
            });
        }

        nextUrl = paging?.next || null;
    } while (nextUrl);

    return rows;
}

/**
 * Extract purchase conversion count from Meta actions array.
 */
function extractConversions(actions = []) {
    if (!actions) return 0;
    const purchases = actions.find((a) => a.action_type === 'purchase');
    return purchases ? parseInt(purchases.value) || 0 : 0;
}

module.exports = { fetchAdSpend };
