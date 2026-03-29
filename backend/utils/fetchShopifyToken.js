const db = require('../db');
const { decrypt } = require('../utils/crypto.js');
require('dotenv').config();

async function fetchShopifyToken(userId, shop) {
    const shopFormatted = shop.toLowerCase().trim().replace(/\s+/g, '-');
    const storeDomain = `${shopFormatted}.myshopify.com`;
    try {
        const query = 'SELECT access_token FROM shopify_auth_tokens WHERE user_id = ? AND shop_domain = ?';
        const [rows] = await db.execute(query, [userId, storeDomain]);
        if (rows.length === 0) {
            throw new Error('No access token found for this user and shop');
        }
        const encryptedToken = rows[0].access_token;
        const decryptedToken = decrypt(encryptedToken);
        return decryptedToken;
    } catch (error) {
        console.error('Error fetching Shopify token:', error);
        throw new Error('Failed to fetch Shopify token');
    }
}

module.exports = {
    fetchShopifyToken
};