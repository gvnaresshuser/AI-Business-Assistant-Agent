
import { dbQuery } from "../utils/dbQuery.js";

export interface Category {
  id: string;
  business_id: string;
  category_name: string;
  description: string | null;
  is_active: boolean | null;
  created_at: Date | null;
}

export const getAllCategories = async (
  businessId: string
): Promise<Category[]> => {
  const result = await dbQuery<Category>(
    `SELECT
      id,
      business_id,
      category_name,
      description,
      is_active,
      created_at
    FROM cat_categories_biz_agent
    WHERE business_id = $1
    ORDER BY category_name ASC`,
    [businessId]
  );

  return result.rows;
};

export const getCategoryById = async (
  categoryId: string,
  businessId: string
): Promise<Category | null> => {
  const result = await dbQuery<Category>(
    `SELECT
      id,
      business_id,
      category_name,
      description,
      is_active,
      created_at
    FROM cat_categories_biz_agent
    WHERE id = $1 AND business_id = $2
    LIMIT 1`,
    [categoryId, businessId]
  );

  return result.rows[0] ?? null;
};
