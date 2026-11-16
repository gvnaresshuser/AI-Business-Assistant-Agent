-- =========================================================
-- AI BUSINESS ASSISTANT AGENT
-- Database: PostgreSQL / NeonDB
-- Script: 01_create_tables.sql
-- Table naming convention: *_biz_agent
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 1. BUSINESS
-- =========================================================

CREATE TABLE IF NOT EXISTS biz_businesses_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(150) NOT NULL,
    business_type VARCHAR(100) DEFAULT 'Electronics E-Commerce',
    email VARCHAR(150),
    phone VARCHAR(30),
    address TEXT,
    currency VARCHAR(10) DEFAULT 'INR',
    tax_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id)
);

-- =========================================================
-- 2. ROLES
-- =========================================================

CREATE TABLE IF NOT EXISTS auth_roles_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (business_id, id),
    UNIQUE (business_id, role_name),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id)
);

-- =========================================================
-- 3. USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS auth_users_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    role_id UUID NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (business_id, id),
    UNIQUE (business_id, email),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id),

    FOREIGN KEY (business_id, role_id)
        REFERENCES auth_roles_biz_agent(business_id, id)
);

-- =========================================================
-- 4. CATEGORIES
-- =========================================================

CREATE TABLE IF NOT EXISTS cat_categories_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (business_id, id),
    UNIQUE (business_id, category_name),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id)
);

-- =========================================================
-- 5. PRODUCTS
-- =========================================================

CREATE TABLE IF NOT EXISTS prod_products_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    category_id UUID,
    product_name VARCHAR(200) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model_number VARCHAR(100),
    description TEXT,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (business_id, id),
    UNIQUE (business_id, sku),

    CHECK (unit_price >= 0),
    CHECK (unit_cost >= 0),
    CHECK (reorder_level >= 0),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id),

    FOREIGN KEY (business_id, category_id)
        REFERENCES cat_categories_biz_agent(business_id, id)
);

-- =========================================================
-- 6. CUSTOMERS
-- =========================================================

CREATE TABLE IF NOT EXISTS cust_customers_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(15),
    customer_type VARCHAR(30) DEFAULT 'Regular',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (business_id, id),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id)
);

-- =========================================================
-- 7. SALES ORDERS
-- =========================================================

CREATE TABLE IF NOT EXISTS sales_orders_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    order_status VARCHAR(30) DEFAULT 'Pending',
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    shipping_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (business_id, id),
    UNIQUE (business_id, order_number),

    CHECK (subtotal >= 0),
    CHECK (discount_amount >= 0),
    CHECK (tax_amount >= 0),
    CHECK (shipping_amount >= 0),
    CHECK (total_amount >= 0),
    CHECK (order_status IN
        ('Pending', 'Confirmed', 'Processing', 'Shipped',
         'Delivered', 'Cancelled', 'Partially Refunded', 'Refunded')),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id),

    FOREIGN KEY (business_id, customer_id)
        REFERENCES cust_customers_biz_agent(business_id, id)
);

-- =========================================================
-- 8. SALES ORDER ITEMS
-- =========================================================

CREATE TABLE IF NOT EXISTS sales_order_items_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    unit_cost_snapshot NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    line_total NUMERIC(12,2) NOT NULL,

    CHECK (quantity > 0),
    CHECK (unit_price >= 0),
    CHECK (unit_cost_snapshot >= 0),
    CHECK (discount_amount >= 0),
    CHECK (line_total >= 0),

    FOREIGN KEY (business_id, order_id)
        REFERENCES sales_orders_biz_agent(business_id, id),

    FOREIGN KEY (business_id, product_id)
        REFERENCES prod_products_biz_agent(business_id, id)
);

-- =========================================================
-- 9. VENDORS
-- =========================================================

CREATE TABLE IF NOT EXISTS vend_vendors_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    vendor_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (business_id, id),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id)
);

-- =========================================================
-- 10. PURCHASE ORDERS
-- =========================================================

CREATE TABLE IF NOT EXISTS purch_purchase_orders_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    vendor_id UUID NOT NULL,
    purchase_order_number VARCHAR(50) NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    received_date DATE,
    status VARCHAR(30) DEFAULT 'Pending',
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (business_id, id),
    UNIQUE (business_id, purchase_order_number),

    CHECK (total_amount >= 0),
    CHECK (status IN ('Pending', 'Approved', 'Ordered',
                      'Partially Received', 'Received', 'Cancelled')),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id),

    FOREIGN KEY (business_id, vendor_id)
        REFERENCES vend_vendors_biz_agent(business_id, id)
);

-- =========================================================
-- 11. PURCHASE ORDER ITEMS
-- =========================================================

CREATE TABLE IF NOT EXISTS purch_purchase_items_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    purchase_order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    unit_cost NUMERIC(12,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL,

    CHECK (quantity > 0),
    CHECK (received_quantity >= 0),
    CHECK (received_quantity <= quantity),
    CHECK (unit_cost >= 0),
    CHECK (line_total >= 0),

    FOREIGN KEY (business_id, purchase_order_id)
        REFERENCES purch_purchase_orders_biz_agent(business_id, id),

    FOREIGN KEY (business_id, product_id)
        REFERENCES prod_products_biz_agent(business_id, id)
);

-- =========================================================
-- 12. INVENTORY
-- =========================================================

CREATE TABLE IF NOT EXISTS inv_inventory_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS
        (quantity_on_hand - quantity_reserved) STORED,
    last_stock_update TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (business_id, id),
    UNIQUE (business_id, product_id),

    CHECK (quantity_on_hand >= 0),
    CHECK (quantity_reserved >= 0),
    CHECK (quantity_reserved <= quantity_on_hand),

    FOREIGN KEY (business_id, product_id)
        REFERENCES prod_products_biz_agent(business_id, id)
);

-- =========================================================
-- 13. STOCK MOVEMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS inv_stock_movements_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    product_id UUID NOT NULL,
    movement_type VARCHAR(30) NOT NULL,
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    movement_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (quantity > 0),
    CHECK (movement_type IN
        ('Purchase', 'Sale', 'Return', 'Adjustment', 'Damage')),

    FOREIGN KEY (business_id, product_id)
        REFERENCES prod_products_biz_agent(business_id, id)
);

-- =========================================================
-- 14. EXPENSES
-- =========================================================

CREATE TABLE IF NOT EXISTS fin_expenses_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    expense_category VARCHAR(100) NOT NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (amount >= 0),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id)
);

-- =========================================================
-- 15. SALES PAYMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS sales_payments_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    order_id UUID NOT NULL,
    payment_reference VARCHAR(100),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) DEFAULT 'Pending',
    amount NUMERIC(12,2) NOT NULL,

    CHECK (amount >= 0),
    CHECK (payment_status IN
        ('Pending', 'Completed', 'Failed', 'Refunded', 'Partially Refunded')),

    FOREIGN KEY (business_id, order_id)
        REFERENCES sales_orders_biz_agent(business_id, id)
);

-- =========================================================
-- 16. SALES REFUNDS
-- =========================================================

CREATE TABLE IF NOT EXISTS sales_refunds_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    order_id UUID NOT NULL,
    payment_id UUID,
    refund_reference VARCHAR(100),
    refund_date TIMESTAMPTZ DEFAULT NOW(),
    refund_reason TEXT,
    refund_status VARCHAR(30) DEFAULT 'Pending',
    amount NUMERIC(12,2) NOT NULL,

    CHECK (amount > 0),
    CHECK (refund_status IN ('Pending', 'Completed', 'Failed')),

    FOREIGN KEY (business_id, order_id)
        REFERENCES sales_orders_biz_agent(business_id, id),

    FOREIGN KEY (business_id, payment_id)
        REFERENCES sales_payments_biz_agent(business_id, id)
);

-- =========================================================
-- 17. AGENT SESSIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS agent_sessions_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    user_id UUID NOT NULL,
    session_title VARCHAR(200),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    session_status VARCHAR(30) DEFAULT 'Active',

    UNIQUE (business_id, id),

    CHECK (session_status IN ('Active', 'Completed', 'Archived')),

    FOREIGN KEY (business_id, user_id)
        REFERENCES auth_users_biz_agent(business_id, id)
);

-- =========================================================
-- 18. AGENT MESSAGES
-- =========================================================

CREATE TABLE IF NOT EXISTS agent_messages_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    session_id UUID NOT NULL,
    message_role VARCHAR(30) NOT NULL,
    message_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (message_role IN ('User', 'Assistant', 'System', 'Tool')),

    FOREIGN KEY (business_id, session_id)
        REFERENCES agent_sessions_biz_agent(business_id, id)
);

-- =========================================================
-- 19. AGENT TOOL LOGS
-- =========================================================

CREATE TABLE IF NOT EXISTS agent_tool_logs_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    session_id UUID,
    tool_name VARCHAR(150) NOT NULL,
    tool_arguments JSONB,
    tool_result JSONB,
    execution_status VARCHAR(30) DEFAULT 'Success',
    execution_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (execution_status IN ('Success', 'Failed')),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id),

    FOREIGN KEY (business_id, session_id)
        REFERENCES agent_sessions_biz_agent(business_id, id)
);

-- =========================================================
-- 20. AGENT REPORTS
-- =========================================================

CREATE TABLE IF NOT EXISTS agent_reports_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    user_id UUID,
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(100),
    report_parameters JSONB,
    report_data JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id),

    FOREIGN KEY (business_id, user_id)
        REFERENCES auth_users_biz_agent(business_id, id)
);

-- =========================================================
-- 21. AUDIT LOGS
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (business_id)
        REFERENCES biz_businesses_biz_agent(id),

    FOREIGN KEY (business_id, user_id)
        REFERENCES auth_users_biz_agent(business_id, id)
);

-- =========================================================
-- END OF TABLE CREATION
-- =========================================================