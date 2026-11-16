
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

// Validate the business ID before accessing the database
const inputSchema = z.object({
  businessId: z.string().uuid()
});

// Sales summary result structure
interface SalesSummary {
  total_orders: number;
  total_sales: string;
  average_order_value: string;
}

// Approved database operation
export const getSalesSummary = async (
  input: { businessId: string }
): Promise<SalesSummary> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<SalesSummary>(
    `
    SELECT
      COUNT(id)::integer AS total_orders,
      COALESCE(SUM(total_amount), 0)::numeric::text AS total_sales,
      COALESCE(AVG(total_amount), 0)::numeric::text
        AS average_order_value
    FROM sales_orders_biz_agent
    WHERE business_id = $1
    `,
    [businessId]
  );

  return result.rows[0];
};
