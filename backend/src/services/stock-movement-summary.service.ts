
import {
  getStockMovementSummary,
  StockMovementSummary
} from "../repositories/stock-movement-summary.repository.js";

// Fetch stock movement summary
export const fetchStockMovementSummary = async (
  businessId: string
): Promise<StockMovementSummary[]> => {
  return await getStockMovementSummary(businessId);
};
