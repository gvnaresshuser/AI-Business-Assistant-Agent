
import { dbQuery } from "../utils/dbQuery.js";

export interface PurchaseSummary {
  total_purchase_orders: number;
  total_purchase_value: string;
  average_purchase_order_value: string;
}

export interface PurchaseStatusSummary {
  status: string;
  total_orders: number;
  total_amount: string;
}

export interface PurchaseSummaryReport {
  summary: PurchaseSummary;
  status_breakdown: PurchaseStatusSummary[];
}

// Fetch overall purchase summary
export const getPurchaseSummary = async (
  businessId: string
): Promise<PurchaseSummaryReport> => {
  const summaryResult = await dbQuery<PurchaseSummary>(
    `SELECT
      COUNT(*)::int AS total_purchase_orders,
      COALESCE(SUM(total_amount), 0)::numeric(14, 2)::text
        AS total_purchase_value,
      COALESCE(AVG(total_amount), 0)::numeric(14, 2)::text
        AS average_purchase_order_value
    FROM purch_purchase_orders_biz_agent
    WHERE business_id = $1`,
    [businessId]
  );

  const statusResult = await dbQuery<PurchaseStatusSummary>(
    `SELECT
      COALESCE(status, 'Unknown') AS status,
      COUNT(*)::int AS total_orders,
      COALESCE(SUM(total_amount), 0)::numeric(14, 2)::text
        AS total_amount
    FROM purch_purchase_orders_biz_agent
    WHERE business_id = $1
    GROUP BY status
    ORDER BY total_orders DESC`,
    [businessId]
  );

  return {
    summary: summaryResult.rows[0],
    status_breakdown: statusResult.rows
  };
};
