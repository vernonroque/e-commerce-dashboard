const db = require('../db');
const axios = require('axios');
require('dotenv').config();
    
async function saveShopSession({ userId, shop, accessToken, scope }) {

    const sql = `
        INSERT INTO shopify_auth_tokens (user_id, shop_domain, access_token, scope)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        access_token = VALUES(access_token),
        scope = VALUES(scope)
    `;

    try{
        await db.query(sql, [userId, shop, accessToken, scope]);
        return true;

    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to save shop session');
    }
    
};

async function fetchShopifyShop(shop, accessToken) {
    const storeResponse = await axios.get(`https://${shop}/admin/api/2026-01/shop.json`, {
        headers: {
            'X-Shopify-Access-Token': accessToken
        }
    });

    return storeResponse;

};

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

            try{
                await db.query(sql, [userId, store, currency, timezone]);
                return true;

            } catch (error){
                console.error('Database Error when saving store:', error);
                throw new Error('Failed to save store');
            }
};

async function fetchProducts(shop, accessToken){

    // here make a shopify api call to get the products for store

    const storeResponse = await axios.get(`https://${shop}/admin/api/2026-01/products.json`, {
        headers: {
            'X-Shopify-Access-Token': accessToken
        }
    });
    // console.log("Store response from Shopify in fetchProducts >>>", storeResponse.data);
    const productList = await storeResponse.data.products;
    const productPayload = {};
    for (let product of productList){
        //     if(product.variants.length > 1){
        //     console.log("The product has multiple variants >>>", product.title);
        //     console.log("The product variants are >>>", product.variants);
        //     console.log("------------------------------");
        // }
        //console.log("The product variant is >>>",product.variants.length);
        productPayload[product.id] = {
            id: product.id,
            title: product.title,
            variants: product.variants.map(variant => ({
                id: variant.id,
                productId: variant.product_id,
                title: variant.title,
                price: variant.price,
                inventoryItemId: variant.inventory_item_id,
                cogs:0,
                shippingCost:5
            }))
        }
    };

    return productPayload;
};

async function fetchCostOfGoodsSold(inventoryItemId, accessToken, shop){
    const inventoryResponse = await axios.get(`https://${shop}/admin/api/2026-01/inventory_items/${inventoryItemId}.json`, {
        headers: {
            'X-Shopify-Access-Token': accessToken
        }
    });
    //console.log("Inventory response from Shopify in fetchCostOfGoodsSold >>>", inventoryResponse.data);
    const cogs = inventoryResponse.data.inventory_item.cost;
    return cogs;
};

async function exchangeCodeForToken(code, shop){

    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
            client_id: process.env.SHOPIFY_API_KEY,
            client_secret: process.env.SHOPIFY_API_SECRET,
            code: code
    });

   // console.log("Token response from Shopify >>>", tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;
    const scope = tokenResponse.data.scope;
    
    return { accessToken, scope };

};
async function saveProduct({storeId, shopifyProductId, shopifyVariantId, title, cogs, shippingCost}) {
    
    const sql = `  INSERT INTO products (store_id, shopify_product_id, shopify_variant_id, title, cogs, shipping_cost)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        cogs = VALUES(cogs),
        shipping_cost = VALUES(shipping_cost)
    `;
    //console.log("The SQL query for saving product is >>>", sql);
    try{
        await db.query(sql, [storeId, shopifyProductId, shopifyVariantId, title, cogs, shippingCost]);
        return true;
    } catch (error) {
        console.error('Database Error when saving products:', error);
        throw new Error('Failed to save products');
    }

};

async function fetchDbStores(userId,storeName){
    const sql = `SELECT * FROM stores WHERE user_id = ?
                    AND name  = ?
                    AND deleted_at IS NULL`;
    try {
        const stores = await db.query(sql, [userId, storeName]);
        return stores;
    } catch (error) {
        console.error('Database Error when fetching stores:', error);
        throw new Error('Failed to fetch stores');
    }
}

module.exports = {
    saveShopSession,
    saveStore,
    fetchProducts,
    fetchCostOfGoodsSold,
    exchangeCodeForToken,
    fetchShopifyShop,
    saveProduct,
    fetchDbStores
};