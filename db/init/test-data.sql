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
