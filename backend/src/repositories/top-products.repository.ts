
import { dbQuery } from "../utils/dbQuery.js";

export interface TopProduct {
  product_id: string;
  product_name: string;
  sku: string;
  brand: string | null;
  total_quantity_sold: number;
  total_revenue: string;
}

// Fetch top 5 selling products for a business
export const getTopSellingProducts = async (
  businessId: string
): Promise<TopProduct[]> => {
  const result = await dbQuery<TopProduct>(
    `SELECT
      p.id AS product_id,
      p.product_name,
      p.sku,
      p.brand,
      SUM(soi.quantity)::int AS total_quantity_sold,
      SUM(soi.line_total)::numeric(14, 2)::text AS total_revenue
    FROM sales_order_items_biz_agent soi
    INNER JOIN prod_products_biz_agent p
      ON soi.product_id = p.id
      AND soi.business_id = p.business_id
    WHERE soi.business_id = $1
    GROUP BY
      p.id,
      p.product_name,
      p.sku,
      p.brand
    ORDER BY
      total_quantity_sold DESC,
      total_revenue DESC
    LIMIT 5`,
    [businessId]
  );

  return result.rows;
};
