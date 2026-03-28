const express = require('express');
const db = require('../../db');
const shopifyRouter = express.Router();
const axios = require('axios');
const shopifyProductService = require('../../services/shopify.service.product.js');
require('dotenv').config();
/**
 * Imports the `encrypt` utility from the crypto helper module.
 *
 * Correct relative path from `/backend/routes/shopify/routes.js`
 * to `/backend/utils/crypto.js` is:
 * `../../utils/crypto.js`
 */
const { encrypt } = require('../../utils/crypto.js');

shopifyRouter.post('/oauth', async (req, res) => {
    console.log("I am in the shopify oauth route >>>");
    try {
        // 1. Receive the shopify store name from frontend
        const shop = req.body.shop;
        console.log("Received shop name from frontend >>>", shop);

        if (!shop) {
            return res.status(400).json({ message: 'Shop name is required' });
        }

        const shopFormatted = shop.toLowerCase().trim().replace(/\s+/g, '-');
        const baseURL = `https://${shopFormatted}.myshopify.com`

        console.log("The client id is >>>", process.env.SHOPIFY_API_KEY);
        console.log("The redirect uri is >>>", process.env.REDIRECT_URI);
        const redirectUrl = `${baseURL}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&redirect_uri=${process.env.REDIRECT_URI}`;
    
        // Send the URL as JSON instead of redirecting
        return res.json({ authUrl: redirectUrl });

    } catch (error) {
        console.error('OAuth Init Error:', error);
        res.status(500).json({ message: 'Failed to initiate OAuth flow' });
    }
});

// 3. Handle the callback (Separate route required for the redirect)
shopifyRouter.get('/auth/callback', async (req, res) => {

    try {
        // Exchange the temporary code for a permanent access token
        console.log("Received callback query parameters >>>", req.query);

        // with the code i have to make a POST request to Shopify's access token endpoint to get the access token
        const code = req.query.code;
        const shop = req.query.shop;

        const { accessToken, scope } = await shopifyProductService.exchangeCodeForToken(code, shop);

        // here is where i encrypt the access token
        const encryptedToken = encrypt(accessToken);

        const userId = req.user.id;
        console.log("The user id in the shopify callback is >>>", userId);
        
        // next i have to store the access token and scope in database
        await shopifyProductService.saveShopSession({
            userId: userId,
            shop: shop,
            accessToken: encryptedToken,
            scope: scope
        });

        // here make a shopify api call to get the currency and timezone for store
        const storeResponse = await shopifyProductService.fetchShopifyShop(shop, accessToken);
      
        //console.log("Store response from Shopify >>>", storeResponse.data);
        const storeData = storeResponse.data.shop;
        //const storeId = storeData.id;
        const storeName = storeData.name;
        const currency = storeData.currency;
        const timezone = storeData.iana_timezone;

        await shopifyProductService.saveStore(userId, storeName, currency, timezone);
        const products = await shopifyProductService.fetchProducts(shop, accessToken);
        //console.log("The products returned are >>>", products);
        const variantsPayload = {};

        for (let productId in products){
            const product = products[productId];
            for (let variant of product.variants){
                const cogs = await shopifyProductService.fetchCostOfGoodsSold(variant.inventoryItemId, accessToken, shop);
                variant.cogs = cogs;
                variantsPayload[variant.id] = {
                    //here also include the product title as a key value pair
                    id: variant.id,
                    productId: variant.productId,
                    title: variant.title,
                    price: variant.price,
                    inventoryItemId: variant.inventoryItemId,
                    cogs: cogs,
                    shippingCost:5 
                }
            }
        };
        // i need to fetch the database for tables stores to get that store id
        console.log("The store name is >>>", storeName);
        const response = await shopifyProductService.fetchDbStores(userId, storeName);
        const dbStores =response[0];
        console.log("The stores from the database for the user are >>>", dbStores);
        console.log("the datatype of dbStores is >>>", typeof dbStores);
        const storeRecord = dbStores.find(store => store.name === storeName);
        const storeIdFromDb = storeRecord ? storeRecord.id : null;
        console.log("The store id from the database is >>>", storeIdFromDb);

        for (let variantId in variantsPayload){
            const variant = variantsPayload[variantId];
            const shopifyProductId = variant.productId;
            const shopifyVariantId = variant.id;
            const title = variant.title;
            const shippingCost = variant.shippingCost;
            const saveProductPayload ={
                storeId: storeIdFromDb,
                shopifyProductId: shopifyProductId,
                shopifyVariantId: shopifyVariantId,
                title: title,
                cogs: variant.cogs,
                shippingCost: shippingCost
            }
            await shopifyProductService.saveProduct(saveProductPayload);
        };

        //console.log("The variants payload with cogs is >>>", variantsPayload);

        // const session = await shopify.auth.validateAuthCallback(req, res, req.query);
        const frontendUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/dashboard`);

    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).json({ message: 'Failed to initiate OAuth' });
    }
});

module.exports = shopifyRouter;