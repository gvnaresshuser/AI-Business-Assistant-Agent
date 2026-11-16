
import { dbQuery } from "../utils/dbQuery.js";

export interface MonthlySales {
  month: string;
  total_orders: number;
  total_sales: string;
  average_order_value: string;
}

// Fetch monthly sales summary for a business
export const getMonthlySales = async (
  businessId: string
): Promise<MonthlySales[]> => {
  const result = await dbQuery<MonthlySales>(
    `SELECT
      TO_CHAR(DATE_TRUNC('month', order_date), 'YYYY-MM') AS month,
      COUNT(*)::int AS total_orders,
      COALESCE(SUM(total_amount), 0)::numeric(14, 2)::text AS total_sales,
      COALESCE(AVG(total_amount), 0)::numeric(14, 2)::text AS average_order_value
    FROM sales_orders_biz_agent
    WHERE business_id = $1
    GROUP BY DATE_TRUNC('month', order_date)
    ORDER BY DATE_TRUNC('month', order_date)`,
    [businessId]
  );

  return result.rows;
};
