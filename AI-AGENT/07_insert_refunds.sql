-- =========================================================
-- AI BUSINESS ASSISTANT AGENT
-- STEP 7: INSERT REFUNDS
-- 20 FULL REFUNDS + 10 PARTIAL REFUNDS
-- =========================================================

WITH selected_orders AS (
    SELECT
        o.id AS order_id,
        o.business_id,
        o.order_number,
        o.order_date,
        o.total_amount,
        p.id AS payment_id,
        ROW_NUMBER() OVER (
            ORDER BY o.order_date, o.order_number
        ) AS rn
    FROM sales_orders_biz_agent o
    JOIN sales_payments_biz_agent p
        ON p.business_id = o.business_id
       AND p.order_id = o.id
    WHERE o.order_status = 'Delivered'
      AND p.payment_status = 'Completed'
    ORDER BY o.order_date, o.order_number
    LIMIT 30
)
INSERT INTO sales_refunds_biz_agent
(
    business_id,
    order_id,
    payment_id,
    refund_reference,
    refund_date,
    refund_reason,
    refund_status,
    amount
)
SELECT
    business_id,
    order_id,
    payment_id,
    'REF-' || order_number,
    order_date + INTERVAL '3 days',
    CASE
        WHEN rn % 3 = 0 THEN 'Product returned by customer'
        WHEN rn % 3 = 1 THEN 'Damaged product'
        ELSE 'Customer requested refund'
    END,
    'Completed',
    CASE
        WHEN rn <= 20 THEN total_amount
        ELSE ROUND(total_amount * 0.50, 2)
    END
FROM selected_orders
ON CONFLICT DO NOTHING;