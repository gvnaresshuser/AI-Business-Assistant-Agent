-- =========================================================
-- AI BUSINESS ASSISTANT AGENT
-- SCRIPT 05: SALES ORDERS AND ORDER ITEMS
-- Period: Nov 2025 - Oct 2026
-- Target: 1,500 orders / 3,000 order items
-- =========================================================

BEGIN;

-- 1. Generate 1,500 sample orders

CREATE TEMP TABLE tmp_biz_orders ON COMMIT DROP AS
SELECT
    b.id AS business_id,
    n AS order_seq,
    'DEMO-ORD-' || LPAD(n::TEXT, 5, '0') AS order_number,

    TIMESTAMPTZ '2025-11-01 10:00:00+05:30'
        + (MOD(n * 137, 365) * INTERVAL '1 day')
        + (MOD(n * 47, 10) * INTERVAL '1 hour') AS order_date,

    c.id AS customer_id,

    CASE
        WHEN MOD(n, 20) = 0 THEN 'Cancelled'
        WHEN MOD(n, 20) = 1 THEN 'Pending'
        WHEN MOD(n, 20) = 2 THEN 'Processing'
        WHEN MOD(n, 20) = 3 THEN 'Shipped'
        ELSE 'Delivered'
    END AS order_status

FROM biz_businesses_biz_agent b

CROSS JOIN GENERATE_SERIES(1, 1500) AS n

JOIN (
    SELECT
        id,
        business_id,
        ROW_NUMBER() OVER (ORDER BY email) AS rn
    FROM cust_customers_biz_agent
) c
    ON c.business_id = b.id
   AND c.rn = MOD((n * 37) - 1, 200) + 1

WHERE b.business_name = 'Demo Electronics Store';


-- 2. Generate product lookup

CREATE TEMP TABLE tmp_biz_products ON COMMIT DROP AS
SELECT
    id AS product_id,
    business_id,
    product_name,
    unit_price,
    unit_cost,
    ROW_NUMBER() OVER (ORDER BY sku) AS rn
FROM prod_products_biz_agent;


-- 3. Generate two items for each order

CREATE TEMP TABLE tmp_biz_items ON COMMIT DROP AS
SELECT
    o.business_id,
    o.order_seq,
    o.order_number,
    o.order_date,
    o.order_status,
    o.customer_id,

    p.product_id,

    MOD(o.order_seq + g.item_no, 3) + 1 AS quantity,

    p.unit_price,
    p.unit_cost AS unit_cost_snapshot,

    ROUND(
        p.unit_price *
        (MOD(o.order_seq + g.item_no, 3) + 1),
        2
    ) AS gross_line_total,

    ROUND(
        p.unit_price *
        (MOD(o.order_seq + g.item_no, 3) + 1) *
        (MOD(o.order_seq, 5)::NUMERIC / 100),
        2
    ) AS discount_amount

FROM tmp_biz_orders o

CROSS JOIN GENERATE_SERIES(1, 2) AS g(item_no)

JOIN tmp_biz_products p
    ON p.business_id = o.business_id
   AND p.rn = MOD(
       o.order_seq * 7 + g.item_no * 13 - 1,
       50
   ) + 1;


-- 4. Calculate tax for each item

CREATE TEMP TABLE tmp_biz_final_items ON COMMIT DROP AS
SELECT
    *,
    ROUND(
        (gross_line_total - discount_amount) * 0.18,
        2
    ) AS tax_amount
FROM tmp_biz_items;


-- 5. Calculate order totals

CREATE TEMP TABLE tmp_biz_order_totals ON COMMIT DROP AS
SELECT
    business_id,
    order_seq,
    order_number,
    order_date,
    order_status,
    customer_id,

    SUM(gross_line_total) AS subtotal,

    SUM(discount_amount) AS discount_amount,

    SUM(tax_amount) AS tax_amount,

    CASE
        WHEN SUM(gross_line_total) >= 50000 THEN 0
        ELSE 99
    END AS shipping_amount,

    SUM(gross_line_total)
      - SUM(discount_amount)
      + SUM(tax_amount)
      + CASE
            WHEN SUM(gross_line_total) >= 50000 THEN 0
            ELSE 99
        END AS total_amount

FROM tmp_biz_final_items

GROUP BY
    business_id,
    order_seq,
    order_number,
    order_date,
    order_status,
    customer_id;


-- 6. Insert sales orders

INSERT INTO sales_orders_biz_agent
(
    business_id,
    customer_id,
    order_number,
    order_date,
    order_status,
    subtotal,
    discount_amount,
    tax_amount,
    shipping_amount,
    total_amount,
    notes
)
SELECT
    business_id,
    customer_id,
    order_number,
    order_date,
    order_status,
    subtotal,
    discount_amount,
    tax_amount,
    shipping_amount,
    total_amount,
    'Generated sample transaction'
FROM tmp_biz_order_totals
ON CONFLICT (business_id, order_number) DO NOTHING;


-- 7. Insert order items

INSERT INTO sales_order_items_biz_agent
(
    business_id,
    order_id,
    product_id,
    quantity,
    unit_price,
    unit_cost_snapshot,
    discount_amount,
    tax_amount,
    line_total
)
SELECT
    i.business_id,
    o.id,
    i.product_id,
    i.quantity,
    i.unit_price,
    i.unit_cost_snapshot,
    i.discount_amount,
    i.tax_amount,
    i.gross_line_total
FROM tmp_biz_final_items i

JOIN sales_orders_biz_agent o
    ON o.business_id = i.business_id
   AND o.order_number = i.order_number

WHERE NOT EXISTS (
    SELECT 1
    FROM sales_order_items_biz_agent existing
    WHERE existing.business_id = i.business_id
      AND existing.order_id = o.id
);

COMMIT;