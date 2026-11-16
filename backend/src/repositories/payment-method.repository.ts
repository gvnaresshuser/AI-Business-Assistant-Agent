
import { dbQuery } from "../utils/dbQuery.js";

export interface PaymentMethodSummary {
  payment_method: string;
  total_payments: number;
  total_amount: string;
}

// Fetch payment summary grouped by payment method
export const getPaymentMethodSummary = async (
  businessId: string
): Promise<PaymentMethodSummary[]> => {
  const result = await dbQuery<PaymentMethodSummary>(
    `SELECT
      COALESCE(payment_method, 'Unknown') AS payment_method,
      COUNT(*)::int AS total_payments,
      SUM(amount)::numeric(14, 2)::text AS total_amount
    FROM sales_payments_biz_agent
    WHERE business_id = $1
      AND payment_status = 'Completed'
    GROUP BY payment_method
    ORDER BY SUM(amount) DESC`,
    [businessId]
  );

  return result.rows;
};
