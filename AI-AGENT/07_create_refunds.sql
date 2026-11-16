
CREATE UNIQUE INDEX IF NOT EXISTS
uq_payments_business_id_id_biz_agent
ON sales_payments_biz_agent(business_id, id);

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

    CHECK (
        refund_status IN ('Pending', 'Completed', 'Failed')
    ),

    FOREIGN KEY (business_id, order_id)
        REFERENCES sales_orders_biz_agent(business_id, id),

    FOREIGN KEY (business_id, payment_id)
        REFERENCES sales_payments_biz_agent(business_id, id)
);

CREATE INDEX IF NOT EXISTS idx_refunds_order_biz_agent
ON sales_refunds_biz_agent(business_id, order_id);

CREATE INDEX IF NOT EXISTS idx_refunds_date_biz_agent
ON sales_refunds_biz_agent(business_id, refund_date);

CREATE INDEX IF NOT EXISTS idx_refunds_status_biz_agent
ON sales_refunds_biz_agent(business_id, refund_status);
