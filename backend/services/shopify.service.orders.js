const db = require('../db');
const axios = require('axios');
require('dotenv').config();

async function fetchOrders(shop, accessToken){
    const shopFormatted = shop.toLowerCase().trim().replace(/\s+/g, '-');
    const storeDomain = `${shopFormatted}.myshopify.com`;
    try
        {
            const response = await axios(`https://${storeDomain}/admin/api/2026-01/graphql.json`, {
                method: 'POST', // always POST, even for reads
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken,
                },
                data: JSON.stringify({
                    query: `
                        query {
                            orders(first: 10) {
                            edges {
                                node {
                                id
                                name
                                totalPriceSet {
                                    shopMoney { amount currencyCode }
                                }
                                }
                            }
                            }
                        }
                    `
                })

            });
            const orders = response.data.data.orders.edges.map(edge => edge.node);
            console.log("Fetched orders from Shopify >>>", orders);
            return orders;
    }catch (error){
        console.error('Error fetching orders from Shopify:', error);
        throw new Error('Failed to fetch orders');
    }

};
async function fetchDraftOrders(shop, accessToken){
    const shopFormatted = shop.toLowerCase().trim().replace(/\s+/g, '-');
    const storeDomain = `${shopFormatted}.myshopify.com`;
    try
        {
            const response = await axios(`https://${storeDomain}/admin/api/2026-01/graphql.json`, {
                method: 'POST', // always POST, even for reads
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken,
                },
                data: JSON.stringify({
                    query: `
                            query GetDraftOrders {
                                draftOrders(first: 50) {
                                    edges {
                                        node {
                                            id
                                            name
                                            status
                                            createdAt
                                            totalPrice
                                            customer {
                                                firstName
                                                lastName
                                                email
                                            }
                                            lineItems(first: 10) {
                                                edges {
                                                    node {
                                                    title
                                                    quantity
                                                    originalUnitPrice
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
                    `,
                }),
            });
            const draftOrders = response.data.data.draftOrders.edges.map(edge => edge.node);
            console.log("Fetched draft orders from Shopify >>>", draftOrders);
            return draftOrders;
        }catch (error){
            console.error('Error fetching draft orders from Shopify:', error);
            throw new Error('Failed to fetch draft orders');
        }
};

module.exports = {
    fetchOrders,
    fetchDraftOrders
};