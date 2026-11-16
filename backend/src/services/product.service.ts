import {
  getAllProducts,
  getProductById,
  getProductsPaginated,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type ProductPaginationResult,
  type CreateProductInput,
} from "../repositories/product.repository.js";

export const fetchAllProducts = async (
  businessId: string
): Promise<Product[]> => {
  return await getAllProducts(businessId);
};

export const fetchProductById = async (
  productId: string,
  businessId: string
): Promise<Product | null> => {
  return await getProductById(productId, businessId);
};

export const fetchProductsPaginated = async (
  businessId: string,
  page: number,
  limit: number,
  search: string = "",
  status: "all" | "active" | "inactive" = "all"
): Promise<ProductPaginationResult> => {
  return getProductsPaginated(
    businessId,
    page,
    limit,
    search,
    status
  );
};
export const addProduct = async (
  businessId: string,
  product: CreateProductInput
): Promise<Product> => {
  return createProduct(businessId, product);
};
export const editProduct = async (
  productId: string,
  businessId: string,
  product: CreateProductInput
): Promise<Product | null> => {
  return updateProduct(productId, businessId, product);
};
export const removeProduct = async (
  productId: string,
  businessId: string
): Promise<boolean> => {
  return deleteProduct(productId, businessId);
};