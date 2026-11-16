
import { dbQuery } from "../utils/dbQuery.js";

export interface OutOfStockProduct {
  product_id: string;
  product_name: string;
  sku: string;
  brand: string | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  reorder_level: number | null;
}

// Fetch products with zero available stock
export const getOutOfStockProducts = async (
  businessId: string
): Promise<OutOfStockProduct[]> => {
  const result = await dbQuery<OutOfStockProduct>(
    `SELECT
      p.id AS product_id,
      p.product_name,
      p.sku,
      p.brand,
      i.quantity_on_hand,
      i.quantity_reserved,
      COALESCE(
        i.quantity_available,
        i.quantity_on_hand - i.quantity_reserved
      ) AS quantity_available,
      p.reorder_level
    FROM inv_inventory_biz_agent i
    INNER JOIN prod_products_biz_agent p
      ON i.product_id = p.id
      AND i.business_id = p.business_id
    WHERE
      i.business_id = $1
      AND p.is_active = TRUE
      AND COALESCE(
        i.quantity_available,
        i.quantity_on_hand - i.quantity_reserved
      ) <= 0
    ORDER BY p.product_name ASC`,
    [businessId]
  );

  return result.rows;
};
