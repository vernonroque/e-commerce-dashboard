const db = require('../db');
const axios = require('axios');
const moment = require('moment');
require('dotenv').config();

async function fetchOrders(shop, accessToken){
    const shopFormatted = shop.toLowerCase().trim().replace(/\s+/g, '-');
    const storeDomain = `${shopFormatted}.myshopify.com`;
    console.log("Fetching orders for store >>>", storeDomain);
        try {
        const response = await axios(`https://${storeDomain}/admin/api/2026-01/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            data: JSON.stringify({
                query: `
                        query {
                            orders(first: 250) {
                                edges {
                                    node {
                                            id
                                            number
                                            createdAt
                                            displayFinancialStatus
                                            currentTotalPriceSet { shopMoney { amount currencyCode } }
                                            currentSubtotalPriceSet { shopMoney { amount currencyCode } }
                                            currentShippingPriceSet { shopMoney { amount currencyCode } }
                                            currentTotalTaxSet { shopMoney { amount currencyCode } }
                                            currentTotalDiscountsSet { shopMoney { amount currencyCode } }
                                            refunds {
                                                transactions(first: 50) {
                                                    edges {
                                                        node {
                                                            kind
                                                            status
                                                            amountSet { shopMoney { amount currencyCode } }
                                                        }
                                                    }
                                                }
                                            }
                                            lineItems(first: 250) {
                                                edges {
                                                    node {
                                                        quantity
                                                        originalUnitPriceSet { shopMoney { amount } }
                                                        originalTotalSet { shopMoney { amount } }
                                                        variant { id }
                                                    }
                                                }
                                            }
                                }
                            }
                            pageInfo { hasNextPage endCursor }
                        }
                    }
                    `
            })
        });

        // Add this temporarily to debug any future issues
        if (response.data.errors) {
            console.error('GraphQL errors:', response.data.errors);
            throw new Error('GraphQL query failed');
        }

        const orders = response.data.data.orders.edges.map(edge => edge.node);
        //console.log("Fetched orders from Shopify >>>", orders);
        return orders;
    } catch (error) {
        console.error('Error fetching orders from Shopify:', error);
        throw new Error('Failed to fetch orders');
    }

};
async function fetchPaymentProcessingFee(orderId, accessToken, shop){
    const shopFormatted = shop.toLowerCase().trim().replace(/\s+/g, '-');
    const storeDomain = `${shopFormatted}.myshopify.com`;
    console.log(`Fetching payment processing fee for order ${orderId} from Shopify...`);
    // here i will make a GraphQL query to fetch the transactions for the order and sum up the fees from successful transactions of kind 'SALE'
    const response = await axios(`https://${storeDomain}/admin/api/2026-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
        },
        data: JSON.stringify({
            query: `
                    query GetOrderTransactions($orderId: ID!) {
                        order(id: $orderId) {
                            transactions(first: 250) {
                                id
                                kind
                                status
                                amountSet { shopMoney { amount currencyCode } }
                                fees { amount { amount currencyCode } }
                            }
                        }
                    }
                `,
            variables: { orderId }
        })
    });

    if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        throw new Error('GraphQL query for transactions failed');
    }

    const transactions = response.data.data.order.transactions;
    const processingFee = transactions
        .filter(t => t.kind === 'SALE' && t.status === 'SUCCESS')
        .reduce((sum, t) => sum + t.fees.reduce((s, f) => s + parseFloat(f.amount.amount), 0), 0);

    console.log(`Calculated payment processing fee for order ${orderId} is >>>`, processingFee);
    return processingFee;
};
async function saveOrdersToDb(ordersPayload){
    // here i will save the orders to the db using a bulk upsert operation
        const { 
            id, 
            storeId, 
            orderNumber, 
            totalPrice, 
            subTotalPrice, 
            shippingPrice, 
            totalTax, 
            orderCreatedAt, 
            totalRefunds, 
            paymentProcessingFee 
        } = ordersPayload;

       const idOnly = id.split('/').pop(); // Extract the numeric ID from the Shopify format
       const createdAtFormatted = moment(orderCreatedAt).format('YYYY-MM-DD HH:mm:ss');

    
        console.log("Saving order to DB with payload >>>", ordersPayload);
    
    const sql = `  INSERT INTO orders (store_id, shopify_order_id, order_number, total_price, subtotal_price, shipping_price, total_tax, order_created_at, total_refunds, payment_processing_fee)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id),
        total_price = VALUES(total_price),
        subtotal_price = VALUES(subtotal_price),
        shipping_price = VALUES(shipping_price),
        total_tax = VALUES(total_tax),
        order_created_at = VALUES(order_created_at),
        total_refunds = VALUES(total_refunds),
        payment_processing_fee = VALUES(payment_processing_fee)
    `;

    try{
        const [result] = await db.query(sql, [storeId, idOnly, orderNumber, totalPrice, subTotalPrice, shippingPrice, totalTax, createdAtFormatted, totalRefunds, paymentProcessingFee]);
        return result.insertId;
    } catch (error) {
        console.error('Database Error when saving orders:', error);
        throw new Error('Failed to save orders');
    }

}

async function saveOrderItemsToDb(orderId, storeId, lineItems) {
    for (const lineItem of lineItems) {
        const variantGid = lineItem.variant?.id;
        if (!variantGid) {
            console.warn(`Skipping line item with no variant for order ${orderId}`);
            continue;
        }

        const shopifyVariantId = variantGid.split('/').pop();

        const [rows] = await db.query(
            'SELECT id, cogs, shipping_cost FROM products WHERE store_id = ? AND shopify_variant_id = ?',
            [storeId, shopifyVariantId]
        );

        if (!rows.length) {
            console.warn(`No product found for variant ${shopifyVariantId} in store ${storeId}, skipping line item`);
            continue;
        }

        const product = rows[0];
        const quantity = lineItem.quantity;
        const price = parseFloat(lineItem.originalUnitPriceSet.shopMoney.amount);
        const lineRevenue = parseFloat(lineItem.originalTotalSet.shopMoney.amount);
        const unitCogs = parseFloat(product.cogs) || 0;
        const unitShippingCost = parseFloat(product.shipping_cost) || 0;

        const sql = `
            INSERT INTO order_items (order_id, product_id, quantity, price, line_revenue, unit_cogs, unit_shipping_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            quantity = VALUES(quantity),
            price = VALUES(price),
            line_revenue = VALUES(line_revenue),
            unit_cogs = VALUES(unit_cogs),
            unit_shipping_cost = VALUES(unit_shipping_cost)
        `;

        try {
            await db.query(sql, [orderId, product.id, quantity, price, lineRevenue, unitCogs, unitShippingCost]);
        } catch (error) {
            console.error(`Database Error saving order item for order ${orderId}, product ${product.id}:`, error);
            throw new Error('Failed to save order item');
        }
    }
}

module.exports = {
    fetchOrders,
    fetchPaymentProcessingFee,
    saveOrdersToDb,
    saveOrderItemsToDb
};