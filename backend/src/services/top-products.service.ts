
import {
  getTopSellingProducts,
  TopProduct
} from "../repositories/top-products.repository.js";

// Fetch top 5 selling products for a business
export const fetchTopSellingProducts = async (
  businessId: string
): Promise<TopProduct[]> => {
  return await getTopSellingProducts(businessId);
};
