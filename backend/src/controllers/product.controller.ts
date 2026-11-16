
import { Request, Response, NextFunction } from "express";
import {
  fetchAllProducts,
  fetchProductById,
  fetchProductsPaginated,
  addProduct,
  editProduct,
  removeProduct,
} from "../services/product.service.js";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    const products = await fetchAllProducts(businessId);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.id;
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    if (typeof productId !== "string" || !productId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid product ID is required"
      });
      return;
    }

    const product = await fetchProductById(productId, businessId);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};



export const getProductsPaginated = async (
  req: Request,
  res: Response
) => {
  try {
    const businessId = req.user?.businessId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    if (!businessId) {
      return res.status(401).json({
        success: false,
        message: "Business authentication required.",
      });
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : "";

        const status =
  typeof req.query.status === "string"
    ? req.query.status
    : "all";

if (!["all", "active", "inactive"].includes(status)) {
  return res.status(400).json({
    success: false,
    message: "Invalid product status filter.",
  });
}

    const result = await fetchProductsPaginated(
  businessId,
  page,
  limit,
  search,
  status as "all" | "active" | "inactive"
);

    return res.status(200).json({
      success: true,
      data: result.products,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("Get paginated products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
};


export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const {
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
    } = req.body;

    if (
      typeof product_name !== "string" ||
      !product_name.trim() ||
      typeof sku !== "string" ||
      !sku.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Product name and SKU are required.",
      });
      return;
    }

    if (
      typeof unit_price !== "number" ||
      !Number.isFinite(unit_price) ||
      unit_price < 0 ||
      typeof unit_cost !== "number" ||
      !Number.isFinite(unit_cost) ||
      unit_cost < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Unit price and unit cost must be valid non-negative numbers.",
      });
      return;
    }

    if (
      reorder_level !== undefined &&
      (!Number.isInteger(reorder_level) || reorder_level < 0)
    ) {
      res.status(400).json({
        success: false,
        message: "Reorder level must be a non-negative integer.",
      });
      return;
    }

    if (
      is_active !== undefined &&
      typeof is_active !== "boolean"
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid product status.",
      });
      return;
    }

    const product = await addProduct(businessId, {
      category_id,
      product_name: product_name.trim(),
      sku: sku.trim(),
      brand,
      model_number,
      description,
      unit_price,
      unit_cost,
      reorder_level,
      is_active,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};


export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const productId = req.params.id;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (typeof productId !== "string" || !productId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid product ID is required.",
      });
      return;
    }

    const {
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
    } = req.body;

    if (
      typeof product_name !== "string" ||
      !product_name.trim() ||
      typeof sku !== "string" ||
      !sku.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Product name and SKU are required.",
      });
      return;
    }

    if (
      typeof unit_price !== "number" ||
      !Number.isFinite(unit_price) ||
      unit_price < 0 ||
      typeof unit_cost !== "number" ||
      !Number.isFinite(unit_cost) ||
      unit_cost < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Unit price and unit cost must be valid non-negative numbers.",
      });
      return;
    }

    if (
      reorder_level !== undefined &&
      (!Number.isInteger(reorder_level) || reorder_level < 0)
    ) {
      res.status(400).json({
        success: false,
        message: "Reorder level must be a non-negative integer.",
      });
      return;
    }

    if (
      is_active !== undefined &&
      typeof is_active !== "boolean"
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid product status.",
      });
      return;
    }

    const product = await editProduct(productId, businessId, {
      category_id,
      product_name: product_name.trim(),
      sku: sku.trim(),
      brand,
      model_number,
      description,
      unit_price,
      unit_cost,
      reorder_level,
      is_active,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const productId = req.params.id;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (typeof productId !== "string" || !productId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid product ID is required.",
      });
      return;
    }

    const deleted = await removeProduct(productId, businessId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
