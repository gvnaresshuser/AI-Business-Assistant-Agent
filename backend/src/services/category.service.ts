
import {
  getAllCategories,
  getCategoryById,
  Category
} from "../repositories/category.repository.js";

export const fetchAllCategories = async (
  businessId: string
): Promise<Category[]> => {
  return await getAllCategories(businessId);
};

export const fetchCategoryById = async (
  categoryId: string,
  businessId: string
): Promise<Category | null> => {
  return await getCategoryById(categoryId, businessId);
};
