
import { dbQuery } from "../utils/dbQuery.js";

export interface StockMovementSummary {
  movement_type: string;
  total_movements: number;
  total_quantity: number;
}

// Fetch stock movement summary grouped by movement type
export const getStockMovementSummary = async (
  businessId: string
): Promise<StockMovementSummary[]> => {
  const result = await dbQuery<StockMovementSummary>(
    `SELECT
      movement_type,
      COUNT(*)::int AS total_movements,
      COALESCE(SUM(quantity), 0)::int AS total_quantity
    FROM inv_stock_movements_biz_agent
    WHERE business_id = $1
    GROUP BY movement_type
    ORDER BY total_movements DESC`,
    [businessId]
  );

  return result.rows;
};
