
import {
  getAllStockMovements,
  getStockMovementsByProductId
} from "../repositories/stock-movement.repository.js";

import type {
  StockMovement
} from "../repositories/stock-movement.repository.js";

export const fetchAllStockMovements = async (
  businessId: string
): Promise<StockMovement[]> => {
  return await getAllStockMovements(businessId);
};

export const fetchStockMovementsByProductId = async (
  productId: string,
  businessId: string
): Promise<StockMovement[]> => {
  return await getStockMovementsByProductId(
    productId,
    businessId
  );
};
