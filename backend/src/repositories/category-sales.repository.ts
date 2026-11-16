
import { dbQuery } from "../utils/dbQuery.js";

export interface CategorySales {
  category_id: string;
  category_name: string;
  total_products_sold: number;
  total_quantity_sold: number;
  total_revenue: string;
}

// Fetch sales grouped by product category
export const getCategorySales = async (
  businessId: string
): Promise<CategorySales[]> => {
  const result = await dbQuery<CategorySales>(
    `SELECT
      c.id AS category_id,
      c.category_name,
      COUNT(DISTINCT p.id)::int AS total_products_sold,
      SUM(soi.quantity)::int AS total_quantity_sold,
      SUM(soi.line_total)::numeric(14, 2)::text AS total_revenue
    FROM sales_order_items_biz_agent soi
    INNER JOIN prod_products_biz_agent p
      ON soi.product_id = p.id
      AND soi.business_id = p.business_id
    INNER JOIN cat_categories_biz_agent c
      ON p.category_id = c.id
      AND p.business_id = c.business_id
    WHERE soi.business_id = $1
    GROUP BY
      c.id,
      c.category_name
    ORDER BY total_revenue DESC`,
    [businessId]
  );

  return result.rows;
};
