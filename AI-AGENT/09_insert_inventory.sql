-- =========================================================
-- AI BUSINESS ASSISTANT AGENT
-- STEP 9: INSERT INVENTORY
-- =========================================================

BEGIN;

-- 1. Insert inventory for all 50 products

INSERT INTO inv_inventory_biz_agent
(
    business_id,
    product_id,
    quantity_on_hand,
    quantity_reserved
)
SELECT
    p.business_id,
    p.id,

    CASE
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY p.sku)::INTEGER, 10) = 0
            THEN 0

        WHEN MOD(ROW_NUMBER() OVER (ORDER BY p.sku)::INTEGER, 10) <= 2
            THEN GREATEST(p.reorder_level - 2, 0)

        ELSE p.reorder_level + 10
    END,

    0

FROM prod_products_biz_agent p

ON CONFLICT (business_id, product_id) DO NOTHING;

COMMIT;