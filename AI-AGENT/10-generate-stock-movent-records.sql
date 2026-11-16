BEGIN;

-- 1. Purchase movements
INSERT INTO inv_stock_movements_biz_agent
(
    business_id, product_id, movement_type,
    quantity, reference_type, reference_id,
    movement_date, notes
)
SELECT
    pi.business_id,
    pi.product_id,
    'Purchase',
    pi.received_quantity,
    'PURCHASE_ORDER',
    pi.purchase_order_id,
    po.order_date,
    'Historical purchase receipt - demo data'
FROM purch_purchase_items_biz_agent pi
JOIN purch_purchase_orders_biz_agent po
    ON po.business_id = pi.business_id
   AND po.id = pi.purchase_order_id
WHERE pi.received_quantity > 0
  AND po.status IN ('Received', 'Partially Received')
  AND NOT EXISTS (
      SELECT 1
      FROM inv_stock_movements_biz_agent sm
      WHERE sm.reference_type = 'PURCHASE_ORDER'
        AND sm.reference_id = pi.purchase_order_id
        AND sm.product_id = pi.product_id
        AND sm.movement_type = 'Purchase'
  );

-- 2. Sales movements
WITH selected_orders AS (
    SELECT id, business_id
    FROM sales_orders_biz_agent
    WHERE order_status = 'Delivered'
    ORDER BY order_date DESC, id
    LIMIT 150
)
INSERT INTO inv_stock_movements_biz_agent
(
    business_id, product_id, movement_type,
    quantity, reference_type, reference_id,
    movement_date, notes
)
SELECT
    oi.business_id,
    oi.product_id,
    'Sale',
    oi.quantity,
    'SALES_ORDER',
    oi.order_id,
    so.order_date,
    'Historical delivered sale - demo data'
FROM sales_order_items_biz_agent oi
JOIN selected_orders selected
    ON selected.business_id = oi.business_id
   AND selected.id = oi.order_id
JOIN sales_orders_biz_agent so
    ON so.business_id = oi.business_id
   AND so.id = oi.order_id
WHERE NOT EXISTS (
    SELECT 1
    FROM inv_stock_movements_biz_agent sm
    WHERE sm.reference_type = 'SALES_ORDER'
      AND sm.reference_id = oi.order_id
      AND sm.product_id = oi.product_id
      AND sm.movement_type = 'Sale'
);

-- 3. Customer return movements (illustrative)
WITH selected_refunds AS (
    SELECT id, business_id, order_id, refund_date
    FROM sales_refunds_biz_agent
    WHERE refund_status = 'Completed'
    ORDER BY refund_date DESC NULLS LAST, id
    LIMIT 20
)
INSERT INTO inv_stock_movements_biz_agent
(
    business_id, product_id, movement_type,
    quantity, reference_type, reference_id,
    movement_date, notes
)
SELECT
    oi.business_id,
    oi.product_id,
    'Return',
    1,
    'SALES_ORDER',
    sr.order_id,
    COALESCE(sr.refund_date, NOW()),
    'Illustrative customer return associated with refund'
FROM selected_refunds sr
JOIN sales_order_items_biz_agent oi
    ON oi.business_id = sr.business_id
   AND oi.order_id = sr.order_id
WHERE NOT EXISTS (
    SELECT 1
    FROM inv_stock_movements_biz_agent sm
    WHERE sm.reference_type = 'SALES_ORDER'
      AND sm.reference_id = sr.order_id
      AND sm.product_id = oi.product_id
      AND sm.movement_type = 'Return'
);

-- 4. Stock adjustments
INSERT INTO inv_stock_movements_biz_agent
(
    business_id, product_id, movement_type,
    quantity, reference_type, movement_date, notes
)
SELECT
    p.business_id,
    p.id,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY p.sku) % 2 = 0
            THEN 'Damage'
        ELSE 'Adjustment'
    END,
    1,
    'STOCK_AUDIT',
    NOW() - INTERVAL '5 days',
    'Illustrative stock audit movement'
FROM prod_products_biz_agent p
WHERE NOT EXISTS (
    SELECT 1
    FROM inv_stock_movements_biz_agent sm
    WHERE sm.product_id = p.id
      AND sm.business_id = p.business_id
      AND sm.reference_type = 'STOCK_AUDIT'
)
ORDER BY p.sku
LIMIT 10;

COMMIT;