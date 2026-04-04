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
                                    legacyResourceId
                                    name
                                    
                                    totalPriceSet {
                                        shopMoney { amount currencyCode }
                                    }
                                    subtotalPriceSet {
                                        shopMoney { amount currencyCode }
                                    }
                                    totalShippingPriceSet {
                                        shopMoney { amount currencyCode }
                                    }
                                    totalTaxSet {
                                        shopMoney { amount currencyCode }
                                    }
                                    totalDiscountsSet {
                                        shopMoney { amount currencyCode }
                                    }
                                    
                                    refunds {
                                        transactions {
                                            amountSet {
                                                shopMoney { amount currencyCode }
                                            }
                                            kind
                                            status
                                        }
                                    }
                                    
                                    transactions {
                                        fees {
                                            flatFee { amount currencyCode }
                                            percentageFee { amount currencyCode }
                                            rate
                                            type
                                        }
                                    }
                                    
                                    displayFinancialStatus
                                    currencyCode
                                    createdAt
                                }
                            }
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                        }
                    }
                `
            })
        });
}

## graphQL query to fetch orders and its necessary info:

```
 data: JSON.stringify({
                query: `
                        query {
                            orders(first: 250) {
                                edges {
                                    node {
                                            id
                                            name
                                            number
                                            createdAt
                                            updatedAt
                                            displayFinancialStatus
                                            currentTotalPriceSet { shopMoney { amount currencyCode } }
                                            currentSubtotalPriceSet { shopMoney { amount currencyCode } }
                                            currentShippingPriceSet { shopMoney { amount currencyCode } }
                                            currentTotalTaxSet { shopMoney { amount currencyCode } }
                                            currentTotalDiscountsSet { shopMoney { amount currencyCode } }
                                            refunds {
                                            totalRefundedSet { shopMoney { amount currencyCode } }
                                    }
                                }
                            }
                            pageInfo { hasNextPage endCursor }
                        }
                    }
                    `
            })
```

## and the follwoing data structure response is:

```
Fetched orders from Shopify >>> [
backend-api  |   {
backend-api  |     id: 'gid://shopify/Order/7971200008354',
backend-api  |     name: '#1001',
backend-api  |     number: 1001,
backend-api  |     createdAt: '2026-03-30T03:10:02Z',
backend-api  |     updatedAt: '2026-03-30T03:10:03Z',
backend-api  |     displayFinancialStatus: 'PAID',
backend-api  |     currentTotalPriceSet: { shopMoney: [Object] },
backend-api  |     currentSubtotalPriceSet: { shopMoney: [Object] },
backend-api  |     currentShippingPriceSet: { shopMoney: [Object] },
backend-api  |     currentTotalTaxSet: { shopMoney: [Object] },
backend-api  |     currentTotalDiscountsSet: { shopMoney: [Object] },
backend-api  |     refunds: []
backend-api  |   }, 

...

]

```