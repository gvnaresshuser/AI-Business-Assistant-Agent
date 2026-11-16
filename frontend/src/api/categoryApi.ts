
import api from "./axios";

export interface Category {
  id: string;
  business_id: string;
  category_name: string;
  description: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

interface CategoriesResponse {
  success: boolean;
  count: number;
  data: Category[];
}

export const getCategoriesApi = async (): Promise<Category[]> => {
  const response = await api.get<CategoriesResponse>("/categories");

  return response.data.data;
};
