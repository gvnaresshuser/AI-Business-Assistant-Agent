
import {
  getLowStockProducts,
  LowStockProduct
} from "../repositories/low-stock.repository.js";

// Fetch low stock products for a business
export const fetchLowStockProducts = async (
  businessId: string
): Promise<LowStockProduct[]> => {
  return await getLowStockProducts(businessId);
};
