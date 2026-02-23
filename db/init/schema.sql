CREATE DATABASE IF NOT EXISTS `ecommerceDashboard`;
USE `ecommerceDashboard`;

-- Grant privileges to app_user
GRANT ALL PRIVILEGES ON ecommerceDashboard.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

CREATE TABLE users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE stores (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    platform ENUM('shopify', 'woocommerce', 'other') NOT NULL,
    currency CHAR(3) NOT NULL,
    timezone VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_stores_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  store_id INT UNSIGNED NOT NULL,

  shopify_product_id BIGINT UNSIGNED NOT NULL,
  shopify_variant_id BIGINT UNSIGNED NOT NULL,

  title VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NULL,

  cogs DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_products_store
    FOREIGN KEY (store_id) 
    REFERENCES stores(id)
    ON DELETE CASCADE,

  CONSTRAINT uq_store_variant
    UNIQUE (store_id, shopify_variant_id),

  INDEX idx_store_id (store_id),
  INDEX idx_shopify_product (shopify_product_id),
  INDEX idx_sku (sku)
);

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  store_id INT UNSIGNED NOT NULL,
  shopify_order_id BIGINT UNSIGNED NOT NULL,
  order_number VARCHAR(50),

  -- Revenue fields (from Shopify)
  total_price DECIMAL(10,2) NOT NULL,           -- Shopify total_price
  subtotal_price DECIMAL(10,2),
  shipping_price DECIMAL(10,2) DEFAULT 0.00,
  total_tax DECIMAL(10,2) DEFAULT 0.00,
  total_discounts DECIMAL(10,2) DEFAULT 0.00,
  total_refunds DECIMAL(10,2) DEFAULT 0.00,

  -- Fees
  payment_processing_fee DECIMAL(10,2) DEFAULT 0.00,

  -- Status
  financial_status VARCHAR(50),
  
  -- Metadata
  currency CHAR(3) DEFAULT 'USD',
  order_created_at DATETIME NOT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_orders_store
    FOREIGN KEY (store_id)
    REFERENCES stores(id)
    ON DELETE CASCADE,

  UNIQUE KEY uq_store_shopify_order (store_id, shopify_order_id),
  INDEX idx_store_id (store_id),
  INDEX idx_order_created_at (order_created_at),
  INDEX idx_financial_status (financial_status)
);

CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,

  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  line_revenue DECIMAL(10,2) NOT NULL,
  unit_cogs DECIMAL(10,2) NOT NULL,
  unit_shipping_cost DECIMAL(10,2) DEFAULT 0.00,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,

  INDEX (order_id),
  INDEX (product_id)
);

CREATE TABLE ad_platforms (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE ad_accounts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  store_id INT UNSIGNED NOT NULL,
  ad_platform_id INT UNSIGNED NOT NULL,

  external_account_id VARCHAR(100) NOT NULL,
  account_name VARCHAR(255),

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_ad_account_store
    FOREIGN KEY (store_id)
    REFERENCES stores(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_ad_account_platform
    FOREIGN KEY (ad_platform_id)
    REFERENCES ad_platforms(id)
    ON DELETE CASCADE,

  INDEX (store_id)
);

CREATE TABLE ad_spend_daily (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  store_id INT UNSIGNED NOT NULL,
  ad_platform_id INT UNSIGNED NOT NULL,

  date DATE NOT NULL,
  spend DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  revenue_attributed DECIMAL(10,2) DEFAULT 0.00,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_ad_spend_store
    FOREIGN KEY (store_id)
    REFERENCES stores(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_ad_spend_platform
    FOREIGN KEY (ad_platform_id)
    REFERENCES ad_platforms(id)
    ON DELETE CASCADE,

  UNIQUE (store_id, ad_platform_id, date),
  INDEX (store_id),
  INDEX (date)
);

CREATE TABLE payouts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    store_id INT UNSIGNED NOT NULL,
    provider ENUM('stripe', 'paypal', 'shopify') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payout_date DATE NOT NULL,
    status ENUM('pending', 'paid') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_payouts_store
        FOREIGN KEY (store_id)
        REFERENCES stores(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE daily_profit_metrics (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  store_id INT UNSIGNED NOT NULL,
  date DATE NOT NULL,

  total_revenue DECIMAL(12,2) NOT NULL,
  total_cogs DECIMAL(12,2) NOT NULL,
  total_shipping DECIMAL(12,2) NOT NULL,
  total_processing_fees DECIMAL(12,2) NOT NULL,
  total_refunds DECIMAL(12,2) NOT NULL,
  total_ad_spend DECIMAL(12,2) NOT NULL,

  net_profit DECIMAL(12,2) NOT NULL,
  blended_roas DECIMAL(10,4),
  breakeven_roas DECIMAL(10,4),

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_profit_store
    FOREIGN KEY (store_id)
    REFERENCES stores(id)
    ON DELETE CASCADE,

  UNIQUE (store_id, date),
  INDEX (store_id),
  INDEX (date)
);
