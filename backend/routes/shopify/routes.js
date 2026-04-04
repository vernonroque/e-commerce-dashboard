const express = require('express');
const db = require('../../db');
const shopifyRouter = express.Router();
const axios = require('axios');
const shopifyProductService = require('../../services/shopify.service.product.js');
const shopifyOrdersService = require('../../services/shopify.service.orders.js');
const { fetchShopifyToken } = require('../../utils/fetchShopifyToken.js');
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
    try {
        // 1. Receive the shopify store name from frontend
        const shop = req.body.shop;

        if (!shop) {
            return res.status(400).json({ message: 'Shop name is required' });
        }

        const shopFormatted = shop.toLowerCase().trim().replace(/\s+/g, '-');
        const baseURL = `https://${shopFormatted}.myshopify.com`
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
        const storeData = await shopifyProductService.fetchShopifyShop(shop, accessToken);
        //const storeId = storeData.id;
        const storeName = storeData.name;
        const currency = storeData.currencyCode;
        const timezone = storeData.ianaTimezone;

        await shopifyProductService.saveStore(userId, storeName, currency, timezone);
        const products = await shopifyProductService.fetchProducts(shop, accessToken);
        console.log("The products returned are >>>", products);
        const variantsPayload = {};

        for (let productId in products){
            const product = products[productId];
            const productTitle = product.title;
            for (let variant of product.variants){
                const cogs = await shopifyProductService.fetchCostOfGoodsSold(variant.inventoryItemId, accessToken, shop);
                variant.cogs = cogs;
                variantsPayload[variant.id] = {
                    //here also include the product title as a key value pair
                    id: variant.id,
                    productId: variant.productId,
                    productTitle: productTitle,
                    title: variant.title,
                    price: variant.price,
                    inventoryItemId: variant.inventoryItemId,
                    cogs: cogs,
                    shippingCost:5 
                }
            }
        };
        // i need to fetch the database for tables stores to get that store id
        const response = await shopifyProductService.fetchDbStores(userId, storeName);
        const dbStores =response[0];
        const storeRecord = dbStores.find(store => store.name === storeName);
        const storeIdFromDb = storeRecord ? storeRecord.id : null;

        console.log("the variants payload is >>>", variantsPayload);

        for (let variantId in variantsPayload){
            const variant = variantsPayload[variantId];
            const shopifyProductId = variant.productId;
            const shopifyVariantId = variant.id;
            const shippingCost = variant.shippingCost;
            const combinedTitle = `${variant.productTitle} - ${variant.title}`;
            const saveProductPayload ={
                storeId: storeIdFromDb,
                shopifyProductId: shopifyProductId,
                shopifyVariantId: shopifyVariantId,
                title: combinedTitle,
                cogs: variant.cogs,
                shippingCost: shippingCost
            }
            await shopifyProductService.saveProduct(saveProductPayload);
        };

        // const session = await shopify.auth.validateAuthCallback(req, res, req.query);
        //const frontendUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        const backendUrl = process.env.BACKEND_ORIGIN || 'http://localhost:8080';
        // 3. Hand off to the orders route, forwarding what it needs

        res.redirect(`${backendUrl}/api/shopify/auth/orders?shop=${storeName}`);
        // res.redirect(`${frontendUrl}/dashboard`);

    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).json({ message: 'Failed to initiate OAuth' });
    }    
});

shopifyRouter.get('/auth/orders', async (req, res) => {
    try {
        const shop = req.query.shop;
        const userId = req.user.id;
        console.log("Received shop name in orders route >>>", shop);

        // here i need to fetch the db to get the shopify access token 
        const accessToken = await fetchShopifyToken(userId, shop);
        console.log("Fetched access token in orders route >>>", accessToken);

        // need to fetch draft orders 

        // need to convert draft orders into real (test) orders
        
        const orders = await shopifyOrdersService.fetchOrders(shop, accessToken);
        //console.log("Orders fetched in orders route >>>", orders);

        // for(const order of orders){

        //     console.log("The currentTotalPriceSet in the order is >>>", order.currentTotalPriceSet);
        //     console.log("The currentShippingPriceSet in the order is >>>", order.currentShippingPriceSet);
        //     console.log("The currentTotalTaxSet in the order is >>>", order.currentTotalTaxSet);
        //     console.log("The currentTotalDiscountsSet in the order is >>>", order.currentTotalDiscountsSet);

        // };

        // 1. Extract amount from each shopMoney object before writing to your DECIMAL columns
        // 2. Sum refunds[].totalRefundedSet.shopMoney.amount to populate total_refunds
        // 3. payment_processing_fee will need a separate source (e.g. Shopify Payments transaction fees via the REST API's transactions endpoint)

        // const totalRefunds = order.refunds
        // .flatMap(r => r.transactions.edges.map(e => e.node))
        // .filter(t => t.kind === 'REFUND' && t.status === 'SUCCESS')
        // .reduce((sum, t) => sum + parseFloat(t.amountSet.shopMoney.amount), 0);

        const frontendUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/dashboard`);

    } catch (error) {
        console.error('Orders Route Error:', error);
        res.status(500).json({ message: 'Failed to load orders' });
    }

});

module.exports = shopifyRouter;