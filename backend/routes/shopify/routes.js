const express = require('express');
const db = require('../../db');
const shopifyRouter = express.Router();
const axios = require('axios');
require('dotenv').config();
/**
 * Imports the `encrypt` utility from the crypto helper module.
 *
 * Correct relative path from `/backend/routes/shopify/routes.js`
 * to `/backend/utils/crypto.js` is:
 * `../../utils/crypto.js`
 */
const { encrypt } = require('../../utils/crypto.js');

// routes/shopifyRouter.js
//const shopify = require('../../lib/shopify.js'); // Import the config you just made


shopifyRouter.post('/oauth', async (req, res) => {
    console.log("I am in the shopify oauth route >>>");
    try {
        // 1. Receive the shopify store name from frontend
        const shop = req.body.shop;
        console.log("Received shop name from frontend >>>", shop);

        if (!shop) {
            return res.status(400).json({ message: 'Shop name is required' });
        }

        // 2. Generate the shopify authorization URL
        // The library handles state generation and security parameters for you
        // const sanitizedShop = shopify.utils.sanitizeShop(shop)
        // console.log("Sanitized shop name >>>", sanitizedShop);


        // if (!sanitizedShop) {
        //     return res.status(400).json({ message: 'Invalid shop domain' })
        // }
        const shopFormatted = shop.toLowerCase().trim().replace(/\s+/g, '-');
        const baseURL = `https://${shopFormatted}.myshopify.com`

        // const headers = {
        //     Accept: 'application/json',
        //     'Content-Type': 'application/json',
	    // };

        // const params = {
        //     client_id: process.env.SHOPIFY_API_KEY,
        //     redirect_uri:"http://localhost:8080/api/shopify/auth/callback"
        // }

        // const instance = axios.create({
        //     baseURL: baseURL,
        //     headers,
        //     timeout: 30000
        // });

        // const response = await instance.get('/admin/oauth/authorize',{params});
        // console.log("The response from Shopify >>>", response.data);

        // const authUrl = await shopify.auth.begin({
        //     shop: sanitizedShop,
        //     callbackPath: '/api/shopify/auth/callback',
        //     isOnline: false, // false = permanent "offline" token for background tasks
        //     rawRequest: req,
        //     rawResponse: res,
        // });
        console.log("The client id is >>>", process.env.SHOPIFY_API_KEY);
        console.log("The redirect uri is >>>", process.env.REDIRECT_URI);
        const redirectUrl = `${baseURL}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&redirect_uri=${process.env.REDIRECT_URI}`;
    
        // Send the URL as JSON instead of redirecting
        return res.json({ authUrl: redirectUrl });

        // Because this is a POST from your frontend, we send the URL 
        // back so the frontend can do: window.location.href = authUrl;
        // return res.status(200).json({ ok:true });

    } catch (error) {
        console.error('OAuth Init Error:', error);
        res.status(500).json({ message: 'Failed to initiate OAuth flow' });
    }
});

// 3. Handle the callback (Separate route required for the redirect)
shopifyRouter.get('/auth/callback', async (req, res) => {

    async function saveShopSession({ userId, shop, accessToken, scope }) {

        const sql = `
            INSERT INTO shopify_auth_tokens (user_id, shop_domain, access_token, scope)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            access_token = VALUES(access_token),
            scope = VALUES(scope)
        `;

        await db.query(sql, [userId, shop, accessToken, scope]);
    }
    async function saveStore(userId, store, currency, timezone) {
            const sql = `
                INSERT INTO stores (user_id, name, platform, currency, timezone)
                VALUES (?, ?, 'shopify', ?, ?)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                platform = 'shopify',
                currency = VALUES(currency),
                timezone = VALUES(timezone)
            `;

            await db.query(sql, [userId, store, currency, timezone]);

    }
    try {
        // Exchange the temporary code for a permanent access token
        console.log("Received callback query parameters >>>", req.query);

        // with the code i have to make a POST request to Shopify's access token endpoint to get the access token
        const code = req.query.code;
        const shop = req.query.shop;

        const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
            client_id: process.env.SHOPIFY_API_KEY,
            client_secret: process.env.SHOPIFY_API_SECRET,
            code: code
        });

        console.log("Token response from Shopify >>>", tokenResponse.data);

        const accessToken = tokenResponse.data.access_token;
        const scope = tokenResponse.data.scope;

        // here is where i encrypt the access token
        const encryptedToken = encrypt(accessToken);

        const userId = req.user.id;
        console.log("The user id in the shopify callback is >>>", userId);
        
        // next i have to store the access token and scope in database
        await saveShopSession({
            userId: userId,
            shop: shop,
            accessToken: encryptedToken,
            scope: scope
        });
        // here make a shopify api call to get the currency and timezone for store
        const storeResponse = await axios.get(`https://${shop}/admin/api/2023-04/shop.json`, {
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        });
        console.log("Store response from Shopify >>>", storeResponse.data);
        const storeData = storeResponse.data.shop;
        const storeName = storeData.name;
        const currency = storeData.currency;
        const timezone = storeData.iana_timezone;

        await saveStore(userId, storeName, currency, timezone);

        console.log("Shopify session saved successfully in the database");
        // const session = await shopify.auth.validateAuthCallback(req, res, req.query);
        const frontendUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/dashboard`);

        // 4. Store the access token securely
        // 'session.accessToken' is what you need to save in your DB
        // await saveShopSession({
        //     shop: session.shop,
        //     accessToken: session.accessToken,
        //     scope: session.scope,
        // });

        // 5. Respond/Redirect
        // Usually, you redirect the user back to your App's main UI
        // res.redirect(`/dashboard?shop=${session.shop}`)

    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).json({ message: 'Failed to initiate OAuth' });
    }
});

module.exports = shopifyRouter;