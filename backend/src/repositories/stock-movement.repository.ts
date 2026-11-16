
import { dbQuery } from "../utils/dbQuery.js";

export interface StockMovement {
  id: string;
  business_id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  movement_date: Date | null;
  notes: string | null;
  created_at: Date | null;
}

export const getAllStockMovements = async (
  businessId: string
): Promise<StockMovement[]> => {
  const result = await dbQuery<StockMovement>(
    `SELECT
      id,
      business_id,
      product_id,
      movement_type,
      quantity,
      reference_type,
      reference_id,
      movement_date,
      notes,
      created_at
    FROM inv_stock_movements_biz_agent
    WHERE business_id = $1
    ORDER BY movement_date DESC NULLS LAST`,
    [businessId]
  );

  return result.rows;
};

export const getStockMovementsByProductId = async (
  productId: string,
  businessId: string
): Promise<StockMovement[]> => {
  const result = await dbQuery<StockMovement>(
    `SELECT
      id,
      business_id,
      product_id,
      movement_type,
      quantity,
      reference_type,
      reference_id,
      movement_date,
      notes,
      created_at
    FROM inv_stock_movements_biz_agent
    WHERE product_id = $1
      AND business_id = $2
    ORDER BY movement_date DESC NULLS LAST`,
    [productId, businessId]
  );

  return result.rows;
};
