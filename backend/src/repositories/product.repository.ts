
import { dbQuery } from "../utils/dbQuery.js";


export interface CreateProductInput {
  category_id?: string | null;
  product_name: string;
  sku: string;
  brand?: string | null;
  model_number?: string | null;
  description?: string | null;
  unit_price: number;
  unit_cost: number;
  reorder_level?: number;
  is_active?: boolean;
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
  created_at: Date | null;
  updated_at: Date | null;
}

export const getAllProducts = async (
  businessId: string
): Promise<Product[]> => {
  const result = await dbQuery<Product>(
    `SELECT
      id,
      business_id,
      category_id,
      product_name,
      sku,
      brand,
      model_number,
      description,
      unit_price,
      unit_cost,
      reorder_level,
      is_active,
      created_at,
      updated_at
    FROM prod_products_biz_agent
    WHERE business_id = $1
    ORDER BY product_name ASC`,
    [businessId]
  );

  return result.rows;
};

export const getProductById = async (
  productId: string,
  businessId: string
): Promise<Product | null> => {
  const result = await dbQuery<Product>(
    `SELECT
      id,
      business_id,
      category_id,
      product_name,
      sku,
      brand,
      model_number,
      description,
      unit_price,
      unit_cost,
      reorder_level,
      is_active,
      created_at,
      updated_at
    FROM prod_products_biz_agent
    WHERE id = $1 AND business_id = $2
    LIMIT 1`,
    [productId, businessId]
  );

  return result.rows[0] ?? null;
};



export interface ProductPaginationResult {
  products: Product[];
  total: number;
}



export const getProductsPaginated = async (
  businessId: string,
  page: number,
  limit: number,
  search: string = "",
  status: "all" | "active" | "inactive" = "all"
): Promise<ProductPaginationResult> => {
  const offset = (page - 1) * limit;
  const searchTerm = search.trim();

  const searchCondition = `
    AND (
      product_name ILIKE '%' || $2 || '%'
      OR sku ILIKE '%' || $2 || '%'
      OR COALESCE(brand, '') ILIKE '%' || $2 || '%'
      OR COALESCE(model_number, '') ILIKE '%' || $2 || '%'
    )
  `;

  const statusCondition = `
    AND (
      $3 = 'all'
      OR ($3 = 'active' AND is_active = true)
      OR ($3 = 'inactive' AND is_active = false)
    )
  `;

  const [productsResult, countResult] = await Promise.all([
    dbQuery<Product>(
      `SELECT id, business_id, category_id, product_name, sku,
              brand, model_number, description, unit_price,
              unit_cost, reorder_level, is_active, created_at, updated_at
       FROM prod_products_biz_agent
       WHERE business_id = $1
       ${searchCondition}
       ${statusCondition}
       ORDER BY product_name ASC
       LIMIT $4 OFFSET $5`,
      [businessId, searchTerm, status, limit, offset]
    ),

    dbQuery<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM prod_products_biz_agent
       WHERE business_id = $1
       ${searchCondition}
       ${statusCondition}`,
      [businessId, searchTerm, status]
    ),
  ]);

  return {
    products: productsResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
  };
};




export const createProduct = async (
  businessId: string,
  product: CreateProductInput
): Promise<Product> => {
  const result = await dbQuery<Product>(
    `INSERT INTO prod_products_biz_agent (
      business_id,
      category_id,
      product_name,
      sku,
      brand,
      model_number,
      description,
      unit_price,
      unit_cost,
      reorder_level,
      is_active
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *`,
    [
      businessId,
      product.category_id ?? null,
      product.product_name,
      product.sku,
      product.brand ?? null,
      product.model_number ?? null,
      product.description ?? null,
      product.unit_price,
      product.unit_cost,
      product.reorder_level ?? 10,
      product.is_active ?? true,
    ]
  );

  return result.rows[0];
};


export const updateProduct = async (
  productId: string,
  businessId: string,
  product: CreateProductInput
): Promise<Product | null> => {
  const result = await dbQuery<Product>(
    `UPDATE prod_products_biz_agent
     SET
       category_id = $1,
       product_name = $2,
       sku = $3,
       brand = $4,
       model_number = $5,
       description = $6,
       unit_price = $7,
       unit_cost = $8,
       reorder_level = $9,
       is_active = $10,
       updated_at = NOW()
     WHERE id = $11 AND business_id = $12
     RETURNING *`,
    [
      product.category_id ?? null,
      product.product_name,
      product.sku,
      product.brand ?? null,
      product.model_number ?? null,
      product.description ?? null,
      product.unit_price,
      product.unit_cost,
      product.reorder_level ?? 10,
      product.is_active ?? true,
      productId,
      businessId,
    ]
  );

  return result.rows[0] ?? null;
};



export const deleteProduct = async (
  productId: string,
  businessId: string
): Promise<boolean> => {
  const result = await dbQuery(
    `UPDATE prod_products_biz_agent
     SET
       is_active = false,
       updated_at = NOW()
     WHERE id = $1
       AND business_id = $2
       AND is_active = true
     RETURNING id`,
    [productId, businessId]
  );

  return result.rowCount !== null && result.rowCount > 0;
};

