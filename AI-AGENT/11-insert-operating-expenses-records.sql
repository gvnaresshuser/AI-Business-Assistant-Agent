BEGIN;

WITH months AS (
    SELECT
        generate_series(
            DATE '2025-11-01',
            DATE '2026-10-01',
            INTERVAL '1 month'
        )::DATE AS month_start
),
expense_templates AS (
    SELECT *
    FROM (
        VALUES
        (1, 'Rent', 'Monthly store rent', 35000::NUMERIC),
        (2, 'Salaries', 'Staff salary expenses', 85000::NUMERIC),
        (3, 'Electricity', 'Monthly electricity bill', 8500::NUMERIC),
        (4, 'Internet', 'Internet and connectivity', 1500::NUMERIC),
        (5, 'Marketing', 'Digital marketing and promotions', 12000::NUMERIC),
        (6, 'Transportation', 'Delivery and logistics expenses', 6000::NUMERIC),
        (7, 'Software', 'Software and SaaS subscriptions', 3000::NUMERIC),
        (8, 'Maintenance', 'Store and equipment maintenance', 4000::NUMERIC)
    ) AS t(category_no, category, description, base_amount)
),
business AS (
    SELECT id
    FROM biz_businesses_biz_agent
    LIMIT 1
)
INSERT INTO fin_expenses_biz_agent
(
    business_id,
    expense_category,
    description,
    amount,
    expense_date,
    payment_method,
    reference_number
)
SELECT
    b.id,
    e.category,
    e.description,
    ROUND(
        e.base_amount *
        (0.90 + (MOD(EXTRACT(MONTH FROM m.month_start)::INTEGER
                    + e.category_no, 5) * 0.05)),
        2
    ),
    m.month_start + ((e.category_no * 3) % 20 + 1)::INTEGER,
    CASE
        WHEN e.category_no % 3 = 0 THEN 'Bank Transfer'
        WHEN e.category_no % 3 = 1 THEN 'UPI'
        ELSE 'Credit Card'
    END,
    'EXP-DEMO-' ||
    TO_CHAR(m.month_start, 'YYYYMM') ||
    '-' || e.category_no
FROM months m
CROSS JOIN expense_templates e
CROSS JOIN business b
WHERE e.category_no <= 5
AND NOT EXISTS (
    SELECT 1
    FROM fin_expenses_biz_agent existing
    WHERE existing.business_id = b.id
      AND existing.reference_number =
          'EXP-DEMO-' ||
          TO_CHAR(m.month_start, 'YYYYMM') ||
          '-' || e.category_no
);

COMMIT;