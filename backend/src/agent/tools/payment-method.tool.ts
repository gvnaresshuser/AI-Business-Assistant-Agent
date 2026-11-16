
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface PaymentMethodSummary {
  payment_method: string;
  total_payments: number;
  total_amount: string;
}

export const getPaymentMethodSummary = async (
  input: { businessId: string }
): Promise<PaymentMethodSummary[]> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<PaymentMethodSummary>(
    `
    SELECT
      payment_method,

      COUNT(id)::integer
        AS total_payments,

      COALESCE(SUM(amount), 0)::numeric::text
        AS total_amount

    FROM sales_payments_biz_agent

    WHERE business_id = $1
      AND payment_status = 'Completed'

    GROUP BY payment_method

    ORDER BY SUM(amount) DESC
    `,
    [businessId]
  );

  return result.rows;
};
