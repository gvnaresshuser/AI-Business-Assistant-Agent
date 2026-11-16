
import { dbQuery } from "../utils/dbQuery.js";

export interface SalesPayment {
  id: string;
  business_id: string;
  order_id: string;
  payment_reference: string | null;
  payment_date: Date | null;
  payment_method: string | null;
  payment_status: string | null;
  amount: string;
}

export const getAllSalesPayments = async (
  businessId: string
): Promise<SalesPayment[]> => {
  const result = await dbQuery<SalesPayment>(
    `SELECT
      id,
      business_id,
      order_id,
      payment_reference,
      payment_date,
      payment_method,
      payment_status,
      amount
    FROM sales_payments_biz_agent
    WHERE business_id = $1
    ORDER BY payment_date DESC NULLS LAST`,
    [businessId]
  );

  return result.rows;
};

export const getSalesPaymentById = async (
  paymentId: string,
  businessId: string
): Promise<SalesPayment | null> => {
  const result = await dbQuery<SalesPayment>(
    `SELECT
      id,
      business_id,
      order_id,
      payment_reference,
      payment_date,
      payment_method,
      payment_status,
      amount
    FROM sales_payments_biz_agent
    WHERE id = $1
      AND business_id = $2`,
    [paymentId, businessId]
  );

  return result.rows[0] ?? null;
};
