
import { dbQuery } from "../utils/dbQuery.js";

export interface Inventory {
  id: string;
  business_id: string;
  product_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number | null;
  last_stock_update: Date | null;
}

export const getAllInventory = async (
  businessId: string
): Promise<Inventory[]> => {
  const result = await dbQuery<Inventory>(
    `SELECT
      id,
      business_id,
      product_id,
      quantity_on_hand,
      quantity_reserved,
      quantity_available,
      last_stock_update
    FROM inv_inventory_biz_agent
    WHERE business_id = $1
    ORDER BY product_id ASC`,
    [businessId]
  );

  return result.rows;
};

export const getInventoryByProductId = async (
  productId: string,
  businessId: string
): Promise<Inventory | null> => {
  const result = await dbQuery<Inventory>(
    `SELECT
      id,
      business_id,
      product_id,
      quantity_on_hand,
      quantity_reserved,
      quantity_available,
      last_stock_update
    FROM inv_inventory_biz_agent
    WHERE product_id = $1
      AND business_id = $2`,
    [productId, businessId]
  );

  return result.rows[0] ?? null;
};
