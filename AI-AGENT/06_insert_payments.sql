-- =========================================================
-- AI BUSINESS ASSISTANT AGENT
-- STEP 6: INSERT PAYMENT RECORDS
-- =========================================================

INSERT INTO sales_payments_biz_agent
(
    business_id,
    order_id,
    payment_reference,
    payment_date,
    payment_method,
    payment_status,
    amount
)
SELECT
    o.business_id,
    o.id,
    'PAY-' || o.order_number,

    o.order_date + INTERVAL '1 hour',

    CASE
        WHEN MOD(ROW_NUMBER() OVER (
            ORDER BY o.order_date, o.order_number
        )::INTEGER, 4) = 0 THEN 'UPI'

        WHEN MOD(ROW_NUMBER() OVER (
            ORDER BY o.order_date, o.order_number
        )::INTEGER, 4) = 1 THEN 'Credit Card'

        WHEN MOD(ROW_NUMBER() OVER (
            ORDER BY o.order_date, o.order_number
        )::INTEGER, 4) = 2 THEN 'Debit Card'

        ELSE 'Net Banking'
    END,

    CASE
        WHEN o.order_status IN ('Delivered', 'Shipped')
            THEN 'Completed'
        ELSE 'Pending'
    END,

    o.total_amount

FROM sales_orders_biz_agent o

WHERE o.order_status <> 'Cancelled'

AND NOT EXISTS (
    SELECT 1
    FROM sales_payments_biz_agent p
    WHERE p.business_id = o.business_id
      AND p.order_id = o.id
);