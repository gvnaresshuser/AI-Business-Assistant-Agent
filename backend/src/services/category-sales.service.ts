
import {
  getCategorySales,
  CategorySales
} from "../repositories/category-sales.repository.js";

// Fetch sales grouped by product category
export const fetchCategorySales = async (
  businessId: string
): Promise<CategorySales[]> => {
  return await getCategorySales(businessId);
};
