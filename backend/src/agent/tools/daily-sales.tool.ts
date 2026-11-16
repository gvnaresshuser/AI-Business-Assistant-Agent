
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface DailySales {
  sale_date: string;
  total_orders: number;
  total_sales: string;
  average_order_value: string;
}

export const getDailySales = async (
  input: { businessId: string }
): Promise<DailySales[]> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<DailySales>(
    `
    SELECT
      TO_CHAR(order_date::date, 'YYYY-MM-DD')
        AS sale_date,

      COUNT(id)::integer
        AS total_orders,

      COALESCE(SUM(total_amount), 0)::numeric::text
        AS total_sales,

      COALESCE(AVG(total_amount), 0)::numeric::text
        AS average_order_value

    FROM sales_orders_biz_agent

    WHERE business_id = $1

    GROUP BY order_date::date

    ORDER BY order_date::date DESC
    `,
    [businessId]
  );

  return result.rows;
};
