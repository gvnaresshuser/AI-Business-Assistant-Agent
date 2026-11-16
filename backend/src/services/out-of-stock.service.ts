
import {
  getOutOfStockProducts,
  OutOfStockProduct
} from "../repositories/out-of-stock.repository.js";

// Fetch out of stock products for a business
export const fetchOutOfStockProducts = async (
  businessId: string
): Promise<OutOfStockProduct[]> => {
  return await getOutOfStockProducts(businessId);
};
