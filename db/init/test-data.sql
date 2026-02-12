USE `ecommerceDashboard`;

INSERT INTO users (email, first_name, last_name, password_hash)
VALUES ('owner@example.com', 'John','Doe', 'hashed_password_here');

INSERT INTO stores (user_id, name, platform, currency, timezone)
VALUES
(1, 'Vinyl Vibes Music Store', 'shopify', 'USD', 'America/New_York'),
(1, 'Urban Threads Clothing', 'woocommerce', 'USD', 'America/Los_Angeles'),
(1, 'Roast House Coffee', 'shopify', 'USD', 'America/Chicago');

INSERT INTO orders (store_id, external_order_id, order_date, gross_revenue, net_revenue, currency, status)
VALUES
-- Music store
(1, 'MUSIC-1001', '2026-02-01 10:15:00', 59.99, 54.99, 'USD', 'completed'),
(1, 'MUSIC-1002', '2026-02-02 14:40:00', 29.99, 27.99, 'USD', 'completed'),

-- Clothing store
(2, 'CLOTH-2001', '2026-02-01 12:05:00', 120.00, 110.00, 'USD', 'completed'),
(2, 'CLOTH-2002', '2026-02-02 16:20:00', 75.00, 68.00, 'USD', 'completed'),

-- Coffee store
(3, 'COFFEE-3001', '2026-02-01 09:30:00', 45.00, 42.00, 'USD', 'completed'),
(3, 'COFFEE-3002', '2026-02-02 11:10:00', 90.00, 85.00, 'USD', 'completed');

INSERT INTO order_items (order_id, product_name, sku, quantity, price)
VALUES
-- Music
(1, 'Vinyl Record - Jazz Classics', 'VINYL-JAZZ', 1, 59.99),
(2, 'Band T-Shirt', 'TEE-BAND', 1, 29.99),

-- Clothing
(3, 'Hoodie - Black', 'HOODIE-BLK', 2, 60.00),
(4, 'Baseball Cap', 'CAP-URBAN', 1, 75.00),

-- Coffee
(5, 'Whole Bean Coffee - Dark Roast', 'COFFEE-DARK', 2, 22.50),
(6, 'Espresso Blend 1lb', 'ESPRESSO-1LB', 3, 30.00);

INSERT INTO payouts (store_id, provider, amount, payout_date, status)
VALUES
-- Music
(1, 'shopify', 82.98, '2026-02-04', 'paid'),

-- Clothing
(2, 'paypal', 178.00, '2026-02-05', 'pending'),

-- Coffee
(3, 'stripe', 127.00, '2026-02-03', 'paid');

INSERT INTO ad_spend (store_id, platform, date, spend)
VALUES
-- Music
(1, 'facebook', '2026-02-01', 15.00),
(1, 'google', '2026-02-02', 20.00),

-- Clothing
(2, 'facebook', '2026-02-01', 50.00),
(2, 'google', '2026-02-02', 40.00),

-- Coffee
(3, 'facebook', '2026-02-01', 25.00),
(3, 'google', '2026-02-02', 30.00);

INSERT INTO inventory (store_id, sku, product_name, stock_on_hand, reorder_threshold, cost_per_unit)
VALUES
-- Music
(1, 'VINYL-JAZZ', 'Vinyl Record - Jazz Classics', 120, 30, 18.00),
(1, 'TEE-BAND', 'Band T-Shirt', 200, 50, 8.00),

-- Clothing
(2, 'HOODIE-BLK', 'Hoodie - Black', 80, 20, 25.00),
(2, 'CAP-URBAN', 'Baseball Cap', 150, 40, 10.00),

-- Coffee
(3, 'COFFEE-DARK', 'Whole Bean Coffee - Dark Roast', 300, 100, 7.50),
(3, 'ESPRESSO-1LB', 'Espresso Blend 1lb', 180, 60, 9.00);

INSERT INTO daily_financials
(store_id, date, revenue, cash_in, cash_out, ad_spend, net_cash_flow)
VALUES
-- Music
(1, '2026-02-01', 59.99, 0.00, 0.00, 15.00, -15.00),
(1, '2026-02-02', 29.99, 82.98, 0.00, 20.00, 62.98),

-- Clothing
(2, '2026-02-01', 120.00, 0.00, 0.00, 50.00, -50.00),
(2, '2026-02-02', 75.00, 0.00, 0.00, 40.00, -40.00),

-- Coffee
(3, '2026-02-01', 45.00, 127.00, 0.00, 25.00, 102.00),
(3, '2026-02-02', 90.00, 0.00, 0.00, 30.00, -30.00);
