
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface MonthlySales {
  month: string;
  total_orders: number;
  total_sales: string;
  average_order_value: string;
}

export const getMonthlySales = async (
  input: { businessId: string }
): Promise<MonthlySales[]> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<MonthlySales>(
    `
    SELECT
      TO_CHAR(
        DATE_TRUNC('month', order_date),
        'YYYY-MM'
      ) AS month,

      COUNT(id)::integer AS total_orders,

      COALESCE(SUM(total_amount), 0)::numeric::text
        AS total_sales,

      COALESCE(AVG(total_amount), 0)::numeric::text
        AS average_order_value

    FROM sales_orders_biz_agent

    WHERE business_id = $1

    GROUP BY DATE_TRUNC('month', order_date)

    ORDER BY DATE_TRUNC('month', order_date) ASC
    `,
    [businessId]
  );

  return result.rows;
};
