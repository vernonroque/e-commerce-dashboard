CREATE DATABASE IF NOT EXISTS `ecommerceDashboard`;
USE `ecommerceDashboard`;

-- Grant privileges to app_user
GRANT ALL PRIVILEGES ON ecommerceDashboard.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

CREATE TABLE users (
    id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE stores (
    id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id MEDIUMINT UNSIGNED NOT NULL,
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

CREATE TABLE orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    store_id MEDIUMINT UNSIGNED NOT NULL,
    external_order_id VARCHAR(128) NOT NULL,
    order_date DATETIME NOT NULL,
    gross_revenue DECIMAL(10,2) NOT NULL,
    net_revenue DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    status ENUM('pending', 'completed', 'refunded', 'cancelled') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_orders_store
        FOREIGN KEY (store_id)
        REFERENCES stores(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE order_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(128) NULL,
    quantity INT UNSIGNED NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE payouts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    store_id MEDIUMINT UNSIGNED NOT NULL,
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

CREATE TABLE ad_spend (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    store_id MEDIUMINT UNSIGNED NOT NULL,
    platform ENUM('facebook', 'google', 'other') NOT NULL,
    date DATE NOT NULL,
    spend DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_ad_spend_store
        FOREIGN KEY (store_id)
        REFERENCES stores(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE inventory (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    store_id MEDIUMINT UNSIGNED NOT NULL,
    sku VARCHAR(128) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    stock_on_hand INT UNSIGNED NOT NULL DEFAULT 0,
    reorder_threshold INT UNSIGNED NOT NULL DEFAULT 0,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_inventory_store
        FOREIGN KEY (store_id)
        REFERENCES stores(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

);

CREATE INDEX idx_inventory_store_sku
    ON inventory (store_id, sku);

CREATE TABLE daily_financials (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    store_id MEDIUMINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cash_in DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cash_out DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ad_spend DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    net_cash_flow DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_daily_financials_store
        FOREIGN KEY (store_id)
        REFERENCES stores(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- Indexes for performance
    INDEX `idx_store_date` (`store_id`, `date`),
    INDEX `idx_deleted_at` (`deleted_at`),

    UNIQUE KEY unique_store_date (store_id, date)
);
