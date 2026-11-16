
import { dbQuery } from "../utils/dbQuery.js";

export interface DailySales {
  sales_date: string;
  total_orders: number;
  total_sales: string;
  average_order_value: string;
}

// Fetch daily sales summary
export const getDailySales = async (
  businessId: string
): Promise<DailySales[]> => {
  const result = await dbQuery<DailySales>(
    `SELECT
      TO_CHAR(order_date::date, 'YYYY-MM-DD') AS sales_date,
      COUNT(*)::int AS total_orders,
      SUM(total_amount)::numeric(14, 2)::text AS total_sales,
      AVG(total_amount)::numeric(14, 2)::text AS average_order_value
    FROM sales_orders_biz_agent
    WHERE business_id = $1
    GROUP BY order_date::date
    ORDER BY order_date::date DESC`,
    [businessId]
  );

  return result.rows;
};
