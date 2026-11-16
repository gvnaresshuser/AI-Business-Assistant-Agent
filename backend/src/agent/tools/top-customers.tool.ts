
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface TopCustomer {
  customer_id: string;
  customer_name: string;
  email: string | null;
  total_orders: number;
  total_revenue: string;
  average_order_value: string;
}

export const getTopCustomers = async (
  input: { businessId: string }
): Promise<TopCustomer[]> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<TopCustomer>(
    `
    SELECT
      c.id AS customer_id,
      c.customer_name,
      c.email,
      COUNT(so.id)::integer AS total_orders,
      COALESCE(SUM(so.total_amount), 0)::numeric::text
        AS total_revenue,
      COALESCE(AVG(so.total_amount), 0)::numeric::text
        AS average_order_value
    FROM cust_customers_biz_agent c
    INNER JOIN sales_orders_biz_agent so
      ON so.customer_id = c.id
      AND so.business_id = c.business_id
    WHERE c.business_id = $1
    GROUP BY
      c.id,
      c.customer_name,
      c.email
    ORDER BY
      total_revenue DESC,
      total_orders DESC
    LIMIT 5
    `,
    [businessId]
  );

  return result.rows;
};
