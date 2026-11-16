-- =========================================================
-- AI BUSINESS ASSISTANT AGENT
-- STEP 4: INSERT 200 CUSTOMERS
-- =========================================================

INSERT INTO cust_customers_biz_agent
(
    business_id,
    customer_name,
    email,
    phone,
    address,
    city,
    state,
    pincode,
    customer_type
)
SELECT
    b.id,
    'Customer ' || LPAD(n::TEXT, 3, '0'),
    'customer' || n || '@example.com',
    '+91' || LPAD((9000000000 + n)::TEXT, 10, '0'),
    'House No. ' || n || ', Main Road',
    (
        ARRAY[
            'Visakhapatnam',
            'Hyderabad',
            'Vijayawada',
            'Bengaluru',
            'Chennai',
            'Mumbai',
            'Pune',
            'Delhi',
            'Kolkata',
            'Guntur'
        ]
    )[1 + ((n - 1) % 10)],
    (
        ARRAY[
            'Andhra Pradesh',
            'Telangana',
            'Andhra Pradesh',
            'Karnataka',
            'Tamil Nadu',
            'Maharashtra',
            'Maharashtra',
            'Delhi',
            'West Bengal',
            'Andhra Pradesh'
        ]
    )[1 + ((n - 1) % 10)],
    LPAD((530000 + n)::TEXT, 6, '0'),
    CASE
        WHEN n % 10 IN (0, 1) THEN 'Premium'
        WHEN n % 10 IN (2, 3, 4) THEN 'Regular'
        ELSE 'New'
    END
FROM biz_businesses_biz_agent b
CROSS JOIN GENERATE_SERIES(1, 200) AS n
WHERE b.business_name = 'Demo Electronics Store'
AND NOT EXISTS (
    SELECT 1
    FROM cust_customers_biz_agent c
    WHERE c.business_id = b.id
      AND c.email = 'customer' || n || '@example.com'
);