-- =====================================================
-- COMPLETE SCHEMA FOR PHASES 3 & 4
-- =====================================================
-- This file includes all tables from Phase 3 and Phase 4
-- Run this to create all missing tables and update existing ones

-- =====================================================
-- PHASE 3 TABLES (User Experience & E-commerce Extensions)
-- =====================================================

-- User Preferences Table (Phase 3 - was missing!)
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(3) DEFAULT 'USD',
    theme VARCHAR(20) DEFAULT 'light',
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT true,
    order_updates BOOLEAN DEFAULT true,
    newsletter_subscription BOOLEAN DEFAULT true,
    two_factor_auth BOOLEAN DEFAULT false,
    privacy_level VARCHAR(20) DEFAULT 'standard',
    timezone VARCHAR(50) DEFAULT 'UTC',
    product_recommendations BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Reviews Table (Phase 3)
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title VARCHAR(255),
    comment TEXT,
    helpful_votes INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wishlist Table (Phase 3)
CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Discounts Table (Phase 3 - was missing!)
CREATE TABLE IF NOT EXISTS discounts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
    percentage DECIMAL(5,2) CHECK ((type = 'percentage' AND percentage > 0 AND percentage <= 100) OR (type = 'fixed')),
    fixed_amount DECIMAL(10,2) CHECK ((type = 'fixed' AND fixed_amount >= 0) OR (type = 'percentage')),
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    single_use_per_user BOOLEAN DEFAULT false,
    expiry_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Update order_items table to include price column (fix for analytics)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
UPDATE order_items SET price = price_at_time WHERE price IS NULL;

-- Ensure order_items table has the correct structure
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipping Methods Table (Phase 3)
CREATE TABLE IF NOT EXISTS shipping_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_cost DECIMAL(10,2) NOT NULL,
    cost_per_kg DECIMAL(10,2) DEFAULT 0,
    estimated_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tax Rates Table (Phase 3)
CREATE TABLE IF NOT EXISTS tax_rates (
    id SERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    zip_code_pattern VARCHAR(20),
    tax_rate DECIMAL(5,4) NOT NULL, -- 0.0825 for 8.25%
    tax_name VARCHAR(100) DEFAULT 'Sales Tax',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Tracking Table (Phase 3)
CREATE TABLE IF NOT EXISTS inventory_tracking (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL, -- Positive for additions, negative for reductions
    change_type VARCHAR(50) NOT NULL, -- 'purchase', 'sale', 'return', 'adjustment', 'damage'
    reference_id INTEGER, -- Order ID, purchase order ID, etc.
    reference_type VARCHAR(50), -- 'order', 'purchase_order', 'manual', etc.
    notes TEXT,
    tracked_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PHASE 4 TABLES (Advanced Business Intelligence, B2B, Performance)
-- =====================================================

-- Customer Segmentation Table
CREATE TABLE IF NOT EXISTS customer_segments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    segment_type VARCHAR(50) NOT NULL, -- 'VIP', 'High Value', 'Medium Value', 'Low Value'
    rfm_score VARCHAR(3), -- '555', '444', '333', '222', '111'
    recency_score INTEGER CHECK (recency_score BETWEEN 1 AND 5),
    frequency_score INTEGER CHECK (frequency_score BETWEEN 1 AND 5),
    monetary_score INTEGER CHECK (monetary_score BETWEEN 1 AND 5),
    total_spent DECIMAL(10,2) DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    last_order_date TIMESTAMP,
    predicted_lifetime_value DECIMAL(10,2),
    churn_probability DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer Behavior Tracking
CREATE TABLE IF NOT EXISTS customer_behavior (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    page_visited VARCHAR(255),
    time_spent INTEGER, -- seconds
    products_viewed INTEGER[],
    cart_additions INTEGER,
    wishlist_additions INTEGER,
    search_queries TEXT[],
    device_type VARCHAR(50),
    browser VARCHAR(100),
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Predictive Analytics Models
CREATE TABLE IF NOT EXISTS predictive_models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'sales_forecast', 'churn_prediction', 'inventory_prediction'
    model_version VARCHAR(20),
    accuracy_score DECIMAL(5,4),
    training_data_size INTEGER,
    last_trained TIMESTAMP,
    model_parameters JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sales Forecasts
CREATE TABLE IF NOT EXISTS sales_forecasts (
    id SERIAL PRIMARY KEY,
    forecast_date DATE NOT NULL,
    predicted_sales DECIMAL(12,2),
    predicted_orders INTEGER,
    confidence_interval_lower DECIMAL(12,2),
    confidence_interval_upper DECIMAL(12,2),
    model_id INTEGER REFERENCES predictive_models(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Corporate Accounts
CREATE TABLE IF NOT EXISTS corporate_accounts (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    account_type VARCHAR(50) NOT NULL, -- 'Enterprise', 'Wholesale', 'Startup', 'Reseller'
    credit_limit DECIMAL(12,2) DEFAULT 0,
    payment_terms VARCHAR(50) DEFAULT 'Net 30',
    tax_id VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'US',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'cancelled'
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    products TEXT[], -- Array of product categories
    lead_time VARCHAR(50), -- '7 days', '14 days', etc.
    payment_terms VARCHAR(50),
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'confirmed', 'shipped', 'received'
    total_amount DECIMAL(12,2),
    expected_delivery DATE,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase Order Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bulk Operations Log
CREATE TABLE IF NOT EXISTS bulk_operations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    operation_type VARCHAR(50) NOT NULL, -- 'import', 'export'
    records_processed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    error_count INTEGER DEFAULT 0,
    error_details JSONB,
    export_type VARCHAR(50), -- For export operations
    processed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- System Performance Metrics
CREATE TABLE IF NOT EXISTS system_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL, -- 'cpu', 'memory', 'disk', 'network'
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(20),
    timestamp TIMESTAMP DEFAULT NOW(),
    additional_data JSONB
);

-- Database Performance Metrics
CREATE TABLE IF NOT EXISTS database_metrics (
    id SERIAL PRIMARY KEY,
    query_type VARCHAR(100),
    execution_time_ms DECIMAL(10,2),
    rows_returned INTEGER,
    connection_pool_usage DECIMAL(5,2),
    slow_query_count INTEGER,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- API Performance Metrics
CREATE TABLE IF NOT EXISTS api_metrics (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    response_time_ms DECIMAL(10,2),
    status_code INTEGER,
    user_id INTEGER REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Cache Performance Metrics
CREATE TABLE IF NOT EXISTS cache_metrics (
    id SERIAL PRIMARY KEY,
    cache_type VARCHAR(50), -- 'redis', 'memory', 'cdn'
    hit_rate DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    eviction_count INTEGER,
    key_count INTEGER,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Performance Alerts
CREATE TABLE IF NOT EXISTS performance_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL, -- 'cpu_high', 'memory_high', 'slow_query', 'cache_miss'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    message TEXT NOT NULL,
    metric_value DECIMAL(10,4),
    threshold_value DECIMAL(10,4),
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by INTEGER REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Activity Log
CREATE TABLE IF NOT EXISTS user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    activity_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ALTER EXISTING TABLES
-- =====================================================

-- Add B2B columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_wholesale BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS bulk_discounts JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS minimum_order_quantity INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);

-- Add B2B columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_bulk_order BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS corporate_account_id INTEGER REFERENCES corporate_accounts(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expected_delivery DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS po_number VARCHAR(100);

-- Enhanced User Preferences
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS data_export_preferences JSONB;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS privacy_settings JSONB;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS accessibility_options JSONB;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS business_account_type VARCHAR(50);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Phase 3 Indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_tracking_product_id ON inventory_tracking(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_tracking_created_at ON inventory_tracking(created_at);

-- Phase 4 Indexes
CREATE INDEX IF NOT EXISTS idx_customer_segments_user_id ON customer_segments(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_segment_type ON customer_segments(segment_type);
CREATE INDEX IF NOT EXISTS idx_customer_segments_rfm_score ON customer_segments(rfm_score);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_user_id ON customer_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_created_at ON customer_behavior(created_at);

-- B2B Indexes
CREATE INDEX IF NOT EXISTS idx_corporate_accounts_email ON corporate_accounts(email);
CREATE INDEX IF NOT EXISTS idx_corporate_accounts_status ON corporate_accounts(status);
CREATE INDEX IF NOT EXISTS idx_orders_corporate_account_id ON orders(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_orders_bulk_order ON orders(is_bulk_order);
CREATE INDEX IF NOT EXISTS idx_products_wholesale ON products(is_wholesale);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);

-- Performance Monitoring Indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_database_metrics_timestamp ON database_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_metrics_timestamp ON api_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_cache_metrics_timestamp ON cache_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON performance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_acknowledged ON performance_alerts(acknowledged);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample shipping methods
INSERT INTO shipping_methods (name, description, base_cost, cost_per_kg, estimated_days) VALUES
('Standard Shipping', 'Standard ground shipping', 5.99, 1.50, 5),
('Express Shipping', '2-3 day delivery', 12.99, 2.50, 3),
('Overnight', 'Next day delivery', 24.99, 5.00, 1)
ON CONFLICT DO NOTHING;

-- Insert sample tax rates
INSERT INTO tax_rates (country, state, tax_rate, tax_name) VALUES
('US', 'CA', 0.0825, 'California Sales Tax'),
('US', 'NY', 0.0850, 'New York Sales Tax'),
('US', 'TX', 0.0625, 'Texas Sales Tax')
ON CONFLICT DO NOTHING;

-- Insert sample discount codes
INSERT INTO discounts (code, type, percentage, fixed_amount, min_order_amount, max_uses) VALUES
('WELCOME10', 'percentage', 10.00, NULL, 25.00, 1000),
('SAVE20', 'percentage', 20.00, NULL, 50.00, 500),
('FREESHIP', 'fixed', NULL, 0.00, 75.00, 200)
ON CONFLICT (code) DO NOTHING;

-- Insert sample corporate accounts
INSERT INTO corporate_accounts (company_name, contact_person, email, account_type, credit_limit, status) VALUES
('TechCorp Solutions', 'John Smith', 'john@techcorp.com', 'Enterprise', 50000, 'active'),
('Global Retail Inc', 'Sarah Johnson', 'sarah@globalretail.com', 'Wholesale', 25000, 'active'),
('Startup Innovations', 'Mike Chen', 'mike@startupinnov.com', 'Startup', 10000, 'pending')
ON CONFLICT (email) DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, email, products, lead_time, payment_terms, rating) VALUES
('TechParts Manufacturing', 'David Wilson', 'david@techparts.com', ARRAY['Laptops', 'Components'], '14 days', 'Net 45', 4.8),
('AudioTech Solutions', 'Lisa Brown', 'lisa@audiotech.com', ARRAY['Headphones', 'Speakers'], '7 days', 'Net 30', 4.6)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update customer segments
CREATE OR REPLACE FUNCTION update_customer_segments()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would contain complex logic to recalculate customer segments
    -- based on RFM analysis, spending patterns, etc.
    -- For now, it's a placeholder
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log performance metrics
CREATE OR REPLACE FUNCTION log_performance_metric(
    p_metric_type VARCHAR(50),
    p_metric_value DECIMAL(10,4),
    p_metric_unit VARCHAR(20) DEFAULT NULL,
    p_additional_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO system_metrics (metric_type, metric_value, metric_unit, additional_data)
    VALUES (p_metric_type, p_metric_value, p_metric_unit, p_additional_data);
END;
$$ LANGUAGE plpgsql;

-- Function to check and create performance alerts
CREATE OR REPLACE FUNCTION check_performance_alerts()
RETURNS VOID AS $$
DECLARE
    cpu_usage DECIMAL(10,4);
    memory_usage DECIMAL(10,4);
BEGIN
    -- Get latest CPU and memory metrics
    SELECT metric_value INTO cpu_usage 
    FROM system_metrics 
    WHERE metric_type = 'cpu' 
    ORDER BY timestamp DESC 
    LIMIT 1;
    
    SELECT metric_value INTO memory_usage 
    FROM system_metrics 
    WHERE metric_type = 'memory' 
    ORDER BY timestamp DESC 
    LIMIT 1;
    
    -- Create alerts if thresholds are exceeded
    IF cpu_usage > 90 THEN
        INSERT INTO performance_alerts (alert_type, severity, message, metric_value, threshold_value)
        VALUES ('cpu_high', 'critical', 'CPU usage is critically high', cpu_usage, 90)
        ON CONFLICT DO NOTHING;
    ELSIF cpu_usage > 80 THEN
        INSERT INTO performance_alerts (alert_type, severity, message, metric_value, threshold_value)
        VALUES ('cpu_high', 'warning', 'CPU usage is high', cpu_usage, 80)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF memory_usage > 90 THEN
        INSERT INTO performance_alerts (alert_type, severity, message, metric_value, threshold_value)
        VALUES ('memory_high', 'critical', 'Memory usage is critically high', memory_usage, 90)
        ON CONFLICT DO NOTHING;
    ELSIF memory_usage > 85 THEN
        INSERT INTO performance_alerts (alert_type, severity, message, metric_value, threshold_value)
        VALUES ('memory_high', 'warning', 'Memory usage is high', memory_usage, 85)
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Customer Lifetime Value View
CREATE OR REPLACE VIEW customer_lifetime_value AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    AVG(o.total_amount) as avg_order_value,
    MAX(o.created_at) as last_order_date,
    CASE 
        WHEN COUNT(o.id) > 5 THEN 'VIP'
        WHEN COUNT(o.id) > 2 THEN 'High Value'
        WHEN COUNT(o.id) > 0 THEN 'Medium Value'
        ELSE 'Low Value'
    END as customer_tier,
    CASE 
        WHEN MAX(o.created_at) > NOW() - INTERVAL '30 days' THEN 'Active'
        WHEN MAX(o.created_at) > NOW() - INTERVAL '90 days' THEN 'At Risk'
        ELSE 'Inactive'
    END as customer_status
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
WHERE u.is_admin = false
GROUP BY u.id, u.first_name, u.last_name, u.email;

-- B2B Revenue Analytics View
CREATE OR REPLACE VIEW b2b_revenue_analytics AS
SELECT 
    ca.company_name,
    ca.account_type,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    AVG(o.total_amount) as avg_order_value,
    MAX(o.created_at) as last_order_date,
    ca.credit_limit,
    (COALESCE(SUM(o.total_amount), 0) / NULLIF(ca.credit_limit, 0)) * 100 as credit_utilization
FROM corporate_accounts ca
LEFT JOIN orders o ON ca.id = o.corporate_account_id AND o.status != 'cancelled'
GROUP BY ca.id, ca.company_name, ca.account_type, ca.credit_limit;

-- Performance Metrics Summary View
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    metric_type,
    AVG(metric_value) as avg_value,
    MAX(metric_value) as max_value,
    MIN(metric_value) as min_value
FROM system_metrics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), metric_type
ORDER BY hour DESC, metric_type;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE user_preferences IS 'Stores user preferences and settings for personalization';
COMMENT ON TABLE product_reviews IS 'Product reviews and ratings from customers';
COMMENT ON TABLE wishlists IS 'User wishlists for products they want to buy later';
COMMENT ON TABLE discounts IS 'Discount codes and coupons for promotions';
COMMENT ON TABLE shipping_methods IS 'Available shipping methods and their costs';
COMMENT ON TABLE tax_rates IS 'Tax rates for different locations';
COMMENT ON TABLE inventory_tracking IS 'Tracks inventory changes and movements';
COMMENT ON TABLE customer_segments IS 'Stores customer segmentation data for advanced analytics and marketing';
COMMENT ON TABLE corporate_accounts IS 'Manages B2B corporate accounts with credit limits and payment terms';
COMMENT ON TABLE suppliers IS 'Tracks supplier information for inventory management and procurement';
COMMENT ON TABLE system_metrics IS 'Stores real-time system performance metrics for monitoring';
COMMENT ON TABLE performance_alerts IS 'Tracks performance alerts and their acknowledgment status';

COMMENT ON COLUMN products.is_wholesale IS 'Flag indicating if product is available for wholesale purchase';
COMMENT ON COLUMN products.wholesale_price IS 'Special pricing for bulk/wholesale customers';
COMMENT ON COLUMN products.bulk_discounts IS 'JSON array of quantity-based discount tiers';
COMMENT ON COLUMN orders.is_bulk_order IS 'Flag indicating if order is a bulk/wholesale order';

-- =====================================================
-- END OF COMPLETE SCHEMA
-- =====================================================
