
import { dbQuery } from "../utils/dbQuery.js";

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  total_orders: number;
  total_revenue: string;
  average_order_value: string;
}

// Fetch top 5 customers by sales revenue
export const getTopCustomers = async (
  businessId: string
): Promise<TopCustomer[]> => {
  const result = await dbQuery<TopCustomer>(
    `SELECT
      c.id AS customer_id,
      c.customer_name,
      c.email,
      c.phone,
      COUNT(so.id)::int AS total_orders,
      SUM(so.total_amount)::numeric(14, 2)::text AS total_revenue,
      AVG(so.total_amount)::numeric(14, 2)::text AS average_order_value
    FROM cust_customers_biz_agent c
    INNER JOIN sales_orders_biz_agent so
      ON c.id = so.customer_id
      AND c.business_id = so.business_id
    WHERE c.business_id = $1
    GROUP BY
      c.id,
      c.customer_name,
      c.email,
      c.phone
    ORDER BY
      total_revenue DESC,
      total_orders DESC
    LIMIT 5`,
    [businessId]
  );

  return result.rows;
};
