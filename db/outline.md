High Level Overview and File structure

Users
 └── Stores
      ├── Orders
      │     └── Order_Items
      ├── Payouts
      ├── Ad_Spend
      ├── Inventory
      └── Daily_Financials (pre-aggregated)

--Outlines for database tables

users
------
id (PK)
email (unique)
password_hash
created_at
updated_at
deleted_at

stores
------
id (PK)
user_id (FK → users.id)
name
platform            -- 'shopify', 'woocommerce', etc
currency
timezone
created_at
updated_at
deleted_at


orders (this is for revenue , not cash)
------
id (PK)
store_id (FK)
external_order_id
order_date
gross_revenue        -- before fees
net_revenue          -- after refunds/discounts
currency
status               -- completed, refunded, etc
created_at
updated_at
deleted_at

order_items
-----------
id (PK)
order_id (FK)
product_name
sku
quantity
price
created_at
updated_at
deleted_at

payouts
-------
id (PK)
store_id (FK)
provider             -- stripe, paypal, shopify
amount
payout_date
status               -- pending, paid
created_at
updated_at
deleted_at


ad_spend
--------
id (PK)
store_id (FK)
platform             -- facebook, google
date
spend
created_at
updated_at
deleted_at

inventory
---------
id (PK)
store_id (FK)
sku
product_name
stock_on_hand
reorder_threshold
cost_per_unit
created_at
updated_at
deleted_at

daily_financials
----------------
id (PK)
store_id (FK)
date
revenue
cash_in
cash_out
ad_spend
net_cash_flow
created_at
updated_at
deleted_at


