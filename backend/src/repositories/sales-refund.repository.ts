
import { dbQuery } from "../utils/dbQuery.js";

export interface SalesRefund {
  id: string;
  business_id: string;
  order_id: string;
  payment_id: string | null;
  refund_reference: string | null;
  refund_date: Date | null;
  refund_reason: string | null;
  refund_status: string | null;
  amount: string;
}

// Fetch all refunds for a business
export const getAllSalesRefunds = async (
  businessId: string
): Promise<SalesRefund[]> => {
  const result = await dbQuery<SalesRefund>(
    `SELECT
      id,
      business_id,
      order_id,
      payment_id,
      refund_reference,
      refund_date,
      refund_reason,
      refund_status,
      amount
    FROM sales_refunds_biz_agent
    WHERE business_id = $1
    ORDER BY refund_date DESC NULLS LAST`,
    [businessId]
  );

  return result.rows;
};

// Fetch a specific refund belonging to a business
export const getSalesRefundById = async (
  refundId: string,
  businessId: string
): Promise<SalesRefund | null> => {
  const result = await dbQuery<SalesRefund>(
    `SELECT
      id,
      business_id,
      order_id,
      payment_id,
      refund_reference,
      refund_date,
      refund_reason,
      refund_status,
      amount
    FROM sales_refunds_biz_agent
    WHERE id = $1 AND business_id = $2`,
    [refundId, businessId]
  );

  return result.rows[0] ?? null;
};
