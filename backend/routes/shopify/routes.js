const express = require('express');
const db = require('../../db');
const shopifyRouter = express.Router();
const axios = require('axios');
require('dotenv').config();

// routes/shopifyRouter.js
const shopify = require('../../lib/shopify.js'); // Import the config you just made


shopifyRouter.post('/oauth', async (req, res) => {
    try {
        // 1. Receive the shopify store name from frontend
        const { shop } = req.body;
        console.log("Received shop name from frontend >>>", shop);

        if (!shop) {
            return res.status(400).json({ message: 'Shop name is required' });
        }

        // 2. Generate the shopify authorization URL
        // The library handles state generation and security parameters for you
        const sanitizedShop = shopify.utils.sanitizeShop(shop)

        if (!sanitizedShop) {
            return res.status(400).json({ message: 'Invalid shop domain' })
        }
        const baseURL = `https://${sanitizedShop}.myshopify.com`

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
	    };

    const params = {
        client_id: process.env.SHOPIFY_API_KEY,
        redirect_uri:"http://localhost:8080/api/shopify/auth/callback"
    }

	const instance = axios.create({
		baseURL: baseURL,
		headers,
		timeout: 30000
	});

        const response = await instance.get('/admin/oauth/authorize',{params});

        

        // const authUrl = await shopify.auth.begin({
        //     shop: sanitizedShop,
        //     callbackPath: '/api/shopify/auth/callback',
        //     isOnline: false, // false = permanent "offline" token for background tasks
        //     rawRequest: req,
        //     rawResponse: res,
        // });

        // Because this is a POST from your frontend, we send the URL 
        // back so the frontend can do: window.location.href = authUrl;
        return res.status(200).json({ ok:true });

    } catch (error) {
        console.error('OAuth Init Error:', error);
        res.status(500).json({ message: 'Failed to initiate OAuth flow' });
    }
});

// 3. Handle the callback (Separate route required for the redirect)
shopifyRouter.get('/auth/callback', async (req, res) => {

async function saveShopSession({ shop, accessToken, scope }) {

  const sql = `
    INSERT INTO shopify_auth_tokens (shop, access_token, scope)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      access_token = VALUES(access_token),
      scope = VALUES(scope)
  `;

  await db.query(sql, [shop, accessToken, scope]);
}
    try {
        // Exchange the temporary code for a permanent access token
        const session = await shopify.auth.validateAuthCallback(req, res, req.query);

        // 4. Store the access token securely
        // 'session.accessToken' is what you need to save in your DB
        await saveShopSession({
            shop: session.shop,
            accessToken: session.accessToken,
            scope: session.scope,
        });

        // 5. Respond/Redirect
        // Usually, you redirect the user back to your App's main UI
        res.redirect(`/dashboard?shop=${session.shop}`)

    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).json({ message: 'Failed to initiate OAuth' });
    }
});

module.exports = shopifyRouter;