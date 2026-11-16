
import api from "./axios";

export interface CreateProductInput {
  category_id: string | null;
  product_name: string;
  sku: string;
  brand: string | null;
  model_number: string | null;
  description: string | null;
  unit_price: number;
  unit_cost: number;
  reorder_level: number;
  is_active: boolean;
}
export interface ProductPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedProductsResponse {
  success: boolean;
  data: Product[];
  pagination: ProductPagination;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string | null;
  product_name: string;
  sku: string;
  brand: string | null;
  model_number: string | null;
  description: string | null;
  unit_price: string;
  unit_cost: string;
  reorder_level: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ProductsResponse {
  success: boolean;
  count: number;
  data: Product[];
}

interface ProductResponse {
  success: boolean;
  data: Product;
}

// Fetch all products
export const getProductsApi = async (): Promise<Product[]> => {
  const response = await api.get<ProductsResponse>("/products");

  return response.data.data;
};

// Fetch product by ID
export const getProductByIdApi = async (
  productId: string
): Promise<Product> => {
  const response = await api.get<ProductResponse>(
    `/products/${productId}`
  );

  return response.data.data;
};

export const getProductsPaginatedApi = async (
  page: number,
  limit: number,
  search: string = "",
  status: "all" | "active" | "inactive" = "all"
): Promise<PaginatedProductsResponse> => {
  const response = await api.get<PaginatedProductsResponse>(
    `/products/pagination?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`
  );

  return response.data;
};
export const createProductApi = async (
  product: CreateProductInput
): Promise<Product> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: Product;
  }>("/products", product);

  return response.data.data;
};
export const updateProductApi = async (
  productId: string,
  product: CreateProductInput
): Promise<Product> => {
  const response = await api.put<ProductResponse>(
    `/products/${productId}`,
    product
  );

  return response.data.data;
};
export const deleteProductApi = async (
  productId: string
): Promise<void> => {
  await api.delete(`/products/${productId}`);
};