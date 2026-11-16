
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface PurchaseStatusSummary {
  status: string;
  total_orders: number;
  total_amount: string;
}

interface PurchaseSummary {
  total_purchase_orders: number;
  total_purchase_value: string;
  average_purchase_order_value: string;
  status_breakdown: PurchaseStatusSummary[];
}

export const getPurchaseSummary = async (
  input: { businessId: string }
): Promise<PurchaseSummary> => {

  const { businessId } = inputSchema.parse(input);

  const summaryResult = await dbQuery<{
    total_purchase_orders: number;
    total_purchase_value: string;
    average_purchase_order_value: string;
  }>(
    `
    SELECT
      COUNT(id)::integer
        AS total_purchase_orders,

      COALESCE(SUM(total_amount), 0)::numeric::text
        AS total_purchase_value,

      COALESCE(AVG(total_amount), 0)::numeric::text
        AS average_purchase_order_value

    FROM purch_purchase_orders_biz_agent

    WHERE business_id = $1
    `,
    [businessId]
  );

  const statusResult = await dbQuery<PurchaseStatusSummary>(
    `
    SELECT
      status,

      COUNT(id)::integer
        AS total_orders,

      COALESCE(SUM(total_amount), 0)::numeric::text
        AS total_amount

    FROM purch_purchase_orders_biz_agent

    WHERE business_id = $1

    GROUP BY status

    ORDER BY SUM(total_amount) DESC
    `,
    [businessId]
  );

  return {
    ...summaryResult.rows[0],
    status_breakdown: statusResult.rows
  };
};
