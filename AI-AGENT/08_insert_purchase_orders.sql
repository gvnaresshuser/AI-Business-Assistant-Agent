-- =========================================================
-- AI BUSINESS ASSISTANT AGENT
-- STEP 8: PURCHASE ORDERS AND PURCHASE ITEMS
-- =========================================================

BEGIN;

-- Generate 100 purchase orders

CREATE TEMP TABLE tmp_purchase_orders
ON COMMIT DROP AS
SELECT
    b.id AS business_id,
    v.id AS vendor_id,
    n AS purchase_seq,

    'DEMO-PO-' || LPAD(n::TEXT, 4, '0')
        AS purchase_order_number,

    DATE '2025-11-01'
        + MOD(n * 137, 365) AS order_date,

    CASE
        WHEN MOD(n, 10) = 0 THEN 'Pending'
        WHEN MOD(n, 10) = 1 THEN 'Approved'
        WHEN MOD(n, 10) = 2 THEN 'Ordered'
        WHEN MOD(n, 10) = 3 THEN 'Partially Received'
        ELSE 'Received'
    END AS status

FROM biz_businesses_biz_agent b

CROSS JOIN GENERATE_SERIES(1, 100) AS n

JOIN (
    SELECT
        id,
        business_id,
        ROW_NUMBER() OVER (ORDER BY vendor_name) AS rn
    FROM vend_vendors_biz_agent
) v
    ON v.business_id = b.id
   AND v.rn = MOD(n - 1, 15) + 1

WHERE b.business_name = 'Demo Electronics Store';


-- Generate 250 purchase items

CREATE TEMP TABLE tmp_purchase_items
ON COMMIT DROP AS
SELECT
    po.business_id,
    po.purchase_seq,
    po.purchase_order_number,
    po.order_date,
    po.vendor_id,
    po.status,

    p.product_id,

    5 + MOD(po.purchase_seq + g.item_no, 16)
        AS quantity,

    p.unit_cost,

    CASE
        WHEN po.status = 'Received'
            THEN 5 + MOD(po.purchase_seq + g.item_no, 16)

        WHEN po.status = 'Partially Received'
            THEN FLOOR(
                (5 + MOD(po.purchase_seq + g.item_no, 16)) / 2.0
            )::INTEGER

        ELSE 0
    END AS received_quantity,

    (5 + MOD(po.purchase_seq + g.item_no, 16))
        * p.unit_cost AS line_total

FROM tmp_purchase_orders po

CROSS JOIN GENERATE_SERIES(1, 2) AS g(item_no)

JOIN (
    SELECT
        id AS product_id,
        business_id,
        unit_cost,
        ROW_NUMBER() OVER (ORDER BY sku) AS rn
    FROM prod_products_biz_agent
) p
    ON p.business_id = po.business_id
   AND p.rn = MOD(po.purchase_seq * 7 + g.item_no * 13 - 1, 50) + 1

UNION ALL

SELECT
    po.business_id,
    po.purchase_seq,
    po.purchase_order_number,
    po.order_date,
    po.vendor_id,
    po.status,
    p.product_id,
    5 + MOD(po.purchase_seq, 16),
    p.unit_cost,
    CASE
        WHEN po.status = 'Received'
            THEN 5 + MOD(po.purchase_seq, 16)
        WHEN po.status = 'Partially Received'
            THEN FLOOR((5 + MOD(po.purchase_seq, 16)) / 2.0)::INTEGER
        ELSE 0
    END,
    (5 + MOD(po.purchase_seq, 16)) * p.unit_cost
FROM tmp_purchase_orders po
JOIN (
    SELECT
        id AS product_id,
        business_id,
        unit_cost,
        ROW_NUMBER() OVER (ORDER BY sku) AS rn
    FROM prod_products_biz_agent
) p
    ON p.business_id = po.business_id
   AND p.rn = MOD(po.purchase_seq * 11 - 1, 50) + 1
WHERE MOD(po.purchase_seq, 2) = 0;


-- Insert purchase orders with calculated totals

INSERT INTO purch_purchase_orders_biz_agent
(
    business_id,
    vendor_id,
    purchase_order_number,
    order_date,
    expected_delivery_date,
    received_date,
    status,
    total_amount,
    notes
)
SELECT
    business_id,
    vendor_id,
    purchase_order_number,
    order_date,
    order_date + 7,
    CASE
        WHEN status = 'Received'
            THEN order_date + 5
        WHEN status = 'Partially Received'
            THEN order_date + 6
        ELSE NULL
    END,
    status,
    SUM(line_total),
    'Generated sample purchase transaction'
FROM tmp_purchase_items
GROUP BY
    business_id,
    vendor_id,
    purchase_order_number,
    order_date,
    status
ON CONFLICT (business_id, purchase_order_number) DO NOTHING;


-- Insert purchase items

INSERT INTO purch_purchase_items_biz_agent
(
    business_id,
    purchase_order_id,
    product_id,
    quantity,
    received_quantity,
    unit_cost,
    line_total
)
SELECT
    i.business_id,
    po.id,
    i.product_id,
    i.quantity,
    i.received_quantity,
    i.unit_cost,
    i.line_total
FROM tmp_purchase_items i
JOIN purch_purchase_orders_biz_agent po
    ON po.business_id = i.business_id
   AND po.purchase_order_number = i.purchase_order_number
WHERE NOT EXISTS (
    SELECT 1
    FROM purch_purchase_items_biz_agent existing
    WHERE existing.business_id = i.business_id
      AND existing.purchase_order_id = po.id
      AND existing.product_id = i.product_id
);

COMMIT;