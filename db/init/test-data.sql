USE `ecommerceDashboard`;

INSERT INTO users (first_name, last_name, email, password_hash)
VALUES 
('Jim', 'Beam', 'owner@example.com', '$2b$10$bdo.YC5VcQ/2boyZksO9XuIkqmwpoeEsYLjCNTsJUla0yohLhC7Gy'),
('John', 'Doe', 'john.doe@example.com', '$2b$10$zbwUmqZ/ChlWYO969TCbBuQYuWGs9tBjM8QflKcHbdV/ZlL7xc4EW'),
('Jane', 'Smith', 'jane.smith@example.com', '$2b$10$r8GelXYlMFUMkF0kkl.QqOZUNRd5epr2KCawkW7f7A6vr.ATRwKVO'),
('Mike', 'Jordan', 'mike.jordan@example.com', '$2b$10$Ayl3giqp4LfJmOcOCF8vd.DBgAkeh.atKyQXECrPHodr7lFpQp9zK'),
('Sarah', 'Connor', 'sarah.connor@example.com', '$2b$10$zRS.ux/5of.FFxNikxfGcu1q6IlqMBYrHy.QtVoW7nFsveDFRqUMm'),
('Tony', 'Stark', 'tony.stark@example.com', '$2b$10$PSAJw11RVtCbny/0jeeFt.w1ench5H3sJLRWnT/INIa9ztn.5p6Zm'),
('Bruce', 'Wayne', 'bruce.wayne@example.com', '$2b$10$99Vuyutf6RjtIJnZ8U42YuZXh9KOge.kPHZaayPed.YusVaOcB9bW'),
('Peter', 'Parker', 'peter.parker@example.com', '$2b$10$r7SS.5oWkFJWV/AaYhtTDuM6zFo.jjtFxUTGCwZ6BX/x6vN6yepAC'),
('Clark', 'Kent', 'clark.kent@example.com', '$2b$10$44nUYIg205TuCxXiFircWePxsBtu0N5vBgdmJPVC8v/2WOYPPZue2'),
('Diana', 'Prince', 'diana.prince@example.com', '$2b$10$33FEfRLEZJMnqGtRTZvMse8t9ylDNLZm0hzf.51C7dOqC/dKBUsrW'),
('Steve', 'Rogers', 'steve.rogers@example.com', '$2b$10$18Yoe.L5W.ACtKNXLfMLyeInsSRtEDHTTkN5luTrdMRJuQeGo2r4i');

INSERT INTO stores (user_id, name, platform, currency, timezone)
VALUES
(1, 'Beam Fitness', 'shopify', 'USD', 'America/New_York'),
(2, 'Doe Supplements', 'shopify', 'USD', 'America/Los_Angeles'),
(3, 'Smith Apparel', 'shopify', 'USD', 'America/Chicago');

INSERT INTO products 
(store_id, shopify_product_id, shopify_variant_id, title, sku, cogs, shipping_cost)
VALUES
(1, 100001, 1000011, 'Adjustable Dumbbell Set', 'DB-SET-01', 45.00, 8.00),
(1, 100002, 1000021, 'Resistance Bands Pack', 'RB-PACK-01', 8.00, 2.00),

(2, 200001, 2000011, 'Whey Protein 2lb', 'WP-2LB-01', 18.00, 4.00),
(2, 200002, 2000021, 'Pre-Workout Mix', 'PW-01', 12.00, 3.00),

(3, 300001, 3000011, 'Performance Hoodie', 'HOOD-01', 22.00, 5.00),
(3, 300002, 3000021, 'Athletic Shorts', 'SHORT-01', 14.00, 4.00);

INSERT INTO orders
(store_id, shopify_order_id, order_number, total_price, subtotal_price, shipping_price,
 total_tax, total_discounts, total_refunds, payment_processing_fee,
 financial_status, currency, order_created_at)
VALUES
(1, 500001, 'BF-1001', 120.00, 110.00, 10.00, 0.00, 0.00, 0.00, 3.50, 'paid', 'USD', '2026-02-15 10:00:00'),
(2, 600001, 'DS-2001', 75.00, 70.00, 5.00, 0.00, 0.00, 0.00, 2.20, 'paid', 'USD', '2026-02-15 12:00:00'),
(3, 700001, 'SA-3001', 95.00, 90.00, 5.00, 0.00, 5.00, 0.00, 2.80, 'paid', 'USD', '2026-02-15 14:00:00');

INSERT INTO order_items
(order_id, product_id, quantity, price, line_revenue, unit_cogs, unit_shipping_cost)
VALUES
-- Beam Fitness order
(1, 1, 1, 110.00, 110.00, 45.00, 8.00),

-- Doe Supplements order
(2, 3, 2, 35.00, 70.00, 18.00, 4.00),

-- Smith Apparel order
(3, 5, 1, 90.00, 90.00, 22.00, 5.00);

INSERT INTO ad_platforms (name)
VALUES
('facebook'),
('google'),
('instagram');

INSERT INTO ad_accounts
(store_id, ad_platform_id, external_account_id, account_name)
VALUES
(1, 1, 'fb_acc_001', 'Beam FB Account'),
(2, 2, 'gg_acc_002', 'Doe Google Ads'),
(3, 1, 'fb_acc_003', 'Smith FB Account');

INSERT INTO ad_spend_daily
(store_id, ad_platform_id, date, spend, impressions, clicks, conversions, revenue_attributed)
VALUES
(1, 1, '2026-02-15', 50.00, 10000, 400, 10, 150.00),
(2, 2, '2026-02-15', 30.00, 8000, 300, 8, 90.00),
(3, 1, '2026-02-15', 40.00, 9000, 350, 9, 120.00);

INSERT INTO payouts
(store_id, provider, amount, payout_date, status)
VALUES
(1, 'stripe', 500.00, '2026-02-16', 'paid'),
(2, 'shopify', 300.00, '2026-02-16', 'paid'),
(3, 'paypal', 400.00, '2026-02-16', 'pending');

INSERT INTO daily_profit_metrics
(store_id, date, total_revenue, total_cogs, total_shipping,
 total_processing_fees, total_refunds, total_ad_spend,
 net_profit, blended_roas, breakeven_roas)
VALUES
(1, '2026-02-15', 120.00, 45.00, 8.00, 3.50, 0.00, 50.00, 13.50, 2.40, 1.85),
(2, '2026-02-15', 75.00, 36.00, 8.00, 2.20, 0.00, 30.00, -1.20, 2.50, 2.10),
(3, '2026-02-15', 95.00, 22.00, 5.00, 2.80, 0.00, 40.00, 25.20, 2.38, 1.60);