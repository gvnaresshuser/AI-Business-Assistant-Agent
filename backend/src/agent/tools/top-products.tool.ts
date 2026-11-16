
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface TopProduct {
  product_id: string;
  product_name: string;
  brand: string | null;
  total_quantity_sold: number;
  total_revenue: string;
}

export const getTopProducts = async (
  input: { businessId: string }
): Promise<TopProduct[]> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<TopProduct>(
    `
    SELECT
      p.id AS product_id,
      p.product_name,
      p.brand,
      SUM(soi.quantity)::integer AS total_quantity_sold,
      COALESCE(SUM(soi.line_total), 0)::numeric::text
        AS total_revenue
    FROM sales_order_items_biz_agent soi
    INNER JOIN prod_products_biz_agent p
      ON p.id = soi.product_id
      AND p.business_id = soi.business_id
    WHERE soi.business_id = $1
    GROUP BY
      p.id,
      p.product_name,
      p.brand
    ORDER BY
      total_quantity_sold DESC,
      SUM(soi.line_total) DESC
    LIMIT 5
    `,
    [businessId]
  );

  return result.rows;
};
