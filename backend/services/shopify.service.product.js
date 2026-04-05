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
    const response = await axios(`https://${shop}/admin/api/2026-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
        },
        data: JSON.stringify({
            query: `
                query {
                    shop {
                        name
                        currencyCode
                        ianaTimezone
                    }
                }
            `
        })
    });

    if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        throw new Error('GraphQL shop query failed');
    }

    return response.data.data.shop;

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

    const numericId = (gid) => gid.split('/').pop();

    const query = `
        query GetProducts($first: Int!, $after: String) {
            products(first: $first, after: $after) {
                edges {
                    node {
                        id
                        title
                        variants(first: 250) {
                            edges {
                                node {
                                    id
                                    title
                                    price
                                    inventoryItem {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    `;

    const productPayload = {};
    let hasNextPage = true;
    let cursor = null;

    while (hasNextPage) {
        const response = await axios(`https://${shop}/admin/api/2026-01/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            data: JSON.stringify({
                query,
                variables: { first: 250, after: cursor }
            })
        });

        if (response.data.errors) {
            console.error('GraphQL errors:', response.data.errors);
            throw new Error('GraphQL products query failed');
        }

        const { edges, pageInfo } = response.data.data.products;

        for (let { node: product } of edges) {
            const productNumericId = numericId(product.id);
            productPayload[productNumericId] = {
                id: productNumericId,
                title: product.title,
                variants: product.variants.edges.map(({ node: variant }) => ({
                    id: numericId(variant.id),
                    productId: productNumericId,
                    title: variant.title,
                    price: variant.price,
                    inventoryItemId: numericId(variant.inventoryItem.id),
                    cogs: 0,
                    shippingCost: 5
                }))
            };
        }

        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;
    }

    return productPayload;
};

async function fetchCostOfGoodsSold(inventoryItemId, accessToken, shop){
    const gid = `gid://shopify/InventoryItem/${inventoryItemId}`;
    const response = await axios(`https://${shop}/admin/api/2026-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
        },
        data: JSON.stringify({
            query: `
                query GetInventoryItemCost($id: ID!) {
                    inventoryItem(id: $id) {
                        unitCost {
                            amount
                        }
                    }
                }
            `,
            variables: { id: gid }
        })
    });

    if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        throw new Error('GraphQL inventoryItem query failed');
    }

    console.log("Inventory response from Shopify in fetchCostOfGoodsSold >>>", response.data);
    const cogs = response.data.data.inventoryItem?.unitCost?.amount ?? null;
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