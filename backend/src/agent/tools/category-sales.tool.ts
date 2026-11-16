
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface CategorySales {
  category_id: string;
  category_name: string;
  total_products: number;
  total_quantity_sold: number;
  total_sales: string;
}

export const getCategorySales = async (
  input: { businessId: string }
): Promise<CategorySales[]> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<CategorySales>(
    `
    SELECT
      c.id AS category_id,
      c.category_name,

      COUNT(DISTINCT p.id)::integer
        AS total_products,

      COALESCE(SUM(soi.quantity), 0)::integer
        AS total_quantity_sold,

      COALESCE(SUM(soi.line_total), 0)::numeric::text
        AS total_sales

    FROM cat_categories_biz_agent c

    INNER JOIN prod_products_biz_agent p
      ON p.category_id = c.id
      AND p.business_id = c.business_id

    INNER JOIN sales_order_items_biz_agent soi
      ON soi.product_id = p.id
      AND soi.business_id = p.business_id

    WHERE c.business_id = $1

    GROUP BY
      c.id,
      c.category_name

    ORDER BY
      SUM(soi.line_total) DESC
    `,
    [businessId]
  );

  return result.rows;
};
