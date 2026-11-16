-- =========================================================
-- AI BUSINESS ASSISTANT AGENT
-- Script: 02_create_indexes.sql
-- =========================================================

-- BUSINESS
CREATE INDEX IF NOT EXISTS idx_business_active_biz_agent
ON biz_businesses_biz_agent(is_active);

-- USERS
CREATE INDEX IF NOT EXISTS idx_users_business_role_biz_agent
ON auth_users_biz_agent(business_id, role_id);

CREATE INDEX IF NOT EXISTS idx_users_email_biz_agent
ON auth_users_biz_agent(email);

-- CATEGORIES
CREATE INDEX IF NOT EXISTS idx_categories_business_biz_agent
ON cat_categories_biz_agent(business_id, is_active);

-- PRODUCTS
CREATE INDEX IF NOT EXISTS idx_products_category_biz_agent
ON prod_products_biz_agent(business_id, category_id);

CREATE INDEX IF NOT EXISTS idx_products_name_biz_agent
ON prod_products_biz_agent(business_id, product_name);

CREATE INDEX IF NOT EXISTS idx_products_brand_biz_agent
ON prod_products_biz_agent(business_id, brand);

CREATE INDEX IF NOT EXISTS idx_products_active_biz_agent
ON prod_products_biz_agent(business_id, is_active);

-- CUSTOMERS
CREATE INDEX IF NOT EXISTS idx_customers_name_biz_agent
ON cust_customers_biz_agent(business_id, customer_name);

CREATE INDEX IF NOT EXISTS idx_customers_email_biz_agent
ON cust_customers_biz_agent(business_id, email);

CREATE INDEX IF NOT EXISTS idx_customers_phone_biz_agent
ON cust_customers_biz_agent(business_id, phone);

-- SALES ORDERS
CREATE INDEX IF NOT EXISTS idx_sales_customer_biz_agent
ON sales_orders_biz_agent(business_id, customer_id);

CREATE INDEX IF NOT EXISTS idx_sales_order_date_biz_agent
ON sales_orders_biz_agent(business_id, order_date);

CREATE INDEX IF NOT EXISTS idx_sales_status_biz_agent
ON sales_orders_biz_agent(business_id, order_status);

-- SALES ORDER ITEMS
CREATE INDEX IF NOT EXISTS idx_order_items_order_biz_agent
ON sales_order_items_biz_agent(business_id, order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_biz_agent
ON sales_order_items_biz_agent(business_id, product_id);

-- VENDORS
CREATE INDEX IF NOT EXISTS idx_vendors_name_biz_agent
ON vend_vendors_biz_agent(business_id, vendor_name);

-- PURCHASE ORDERS
CREATE INDEX IF NOT EXISTS idx_purchase_vendor_biz_agent
ON purch_purchase_orders_biz_agent(business_id, vendor_id);

CREATE INDEX IF NOT EXISTS idx_purchase_date_biz_agent
ON purch_purchase_orders_biz_agent(business_id, order_date);

CREATE INDEX IF NOT EXISTS idx_purchase_status_biz_agent
ON purch_purchase_orders_biz_agent(business_id, status);

-- PURCHASE ITEMS
CREATE INDEX IF NOT EXISTS idx_purchase_items_order_biz_agent
ON purch_purchase_items_biz_agent(business_id, purchase_order_id);

CREATE INDEX IF NOT EXISTS idx_purchase_items_product_biz_agent
ON purch_purchase_items_biz_agent(business_id, product_id);

-- INVENTORY
CREATE INDEX IF NOT EXISTS idx_inventory_quantity_biz_agent
ON inv_inventory_biz_agent(business_id, quantity_available);

-- STOCK MOVEMENTS
CREATE INDEX IF NOT EXISTS idx_stock_product_biz_agent
ON inv_stock_movements_biz_agent(business_id, product_id);

CREATE INDEX IF NOT EXISTS idx_stock_date_biz_agent
ON inv_stock_movements_biz_agent(business_id, movement_date);

CREATE INDEX IF NOT EXISTS idx_stock_type_biz_agent
ON inv_stock_movements_biz_agent(business_id, movement_type);

-- EXPENSES
CREATE INDEX IF NOT EXISTS idx_expenses_date_biz_agent
ON fin_expenses_biz_agent(business_id, expense_date);

CREATE INDEX IF NOT EXISTS idx_expenses_category_biz_agent
ON fin_expenses_biz_agent(business_id, expense_category);

-- PAYMENTS
CREATE INDEX IF NOT EXISTS idx_payments_order_biz_agent
ON sales_payments_biz_agent(business_id, order_id);

CREATE INDEX IF NOT EXISTS idx_payments_date_biz_agent
ON sales_payments_biz_agent(business_id, payment_date);

CREATE INDEX IF NOT EXISTS idx_payments_status_biz_agent
ON sales_payments_biz_agent(business_id, payment_status);

-- REFUNDS
CREATE INDEX IF NOT EXISTS idx_refunds_order_biz_agent
ON sales_refunds_biz_agent(business_id, order_id);

CREATE INDEX IF NOT EXISTS idx_refunds_date_biz_agent
ON sales_refunds_biz_agent(business_id, refund_date);

CREATE INDEX IF NOT EXISTS idx_refunds_status_biz_agent
ON sales_refunds_biz_agent(business_id, refund_status);

-- AGENT SESSIONS
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_biz_agent
ON agent_sessions_biz_agent(business_id, user_id);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_started_biz_agent
ON agent_sessions_biz_agent(business_id, started_at);

-- AGENT MESSAGES
CREATE INDEX IF NOT EXISTS idx_agent_messages_session_biz_agent
ON agent_messages_biz_agent(business_id, session_id, created_at);

-- AGENT TOOL LOGS
CREATE INDEX IF NOT EXISTS idx_agent_logs_session_biz_agent
ON agent_tool_logs_biz_agent(business_id, session_id);

CREATE INDEX IF NOT EXISTS idx_agent_logs_tool_biz_agent
ON agent_tool_logs_biz_agent(business_id, tool_name);

CREATE INDEX IF NOT EXISTS idx_agent_logs_date_biz_agent
ON agent_tool_logs_biz_agent(business_id, created_at);

-- AGENT REPORTS
CREATE INDEX IF NOT EXISTS idx_agent_reports_date_biz_agent
ON agent_reports_biz_agent(business_id, generated_at);

-- AUDIT LOGS
CREATE INDEX IF NOT EXISTS idx_audit_user_biz_agent
ON audit_logs_biz_agent(business_id, user_id);

CREATE INDEX IF NOT EXISTS idx_audit_date_biz_agent
ON audit_logs_biz_agent(business_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_entity_biz_agent
ON audit_logs_biz_agent(business_id, entity_name, entity_id);

-- =========================================================
-- END OF INDEX CREATION
-- =========================================================