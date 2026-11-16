
import { dbQuery } from "../utils/dbQuery.js";

export interface LowStockProduct {
  product_id: string;
  product_name: string;
  sku: string;
  brand: string | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  reorder_level: number;
}

// Fetch products that have reached or fallen below reorder level
export const getLowStockProducts = async (
  businessId: string
): Promise<LowStockProduct[]> => {
  const result = await dbQuery<LowStockProduct>(
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
      AND p.reorder_level IS NOT NULL
      AND COALESCE(
        i.quantity_available,
        i.quantity_on_hand - i.quantity_reserved
      ) <= p.reorder_level
    ORDER BY quantity_available ASC`,
    [businessId]
  );

  return result.rows;
};
