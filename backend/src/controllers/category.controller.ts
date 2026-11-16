
import { Request, Response, NextFunction } from "express";
import {
  fetchAllCategories,
  fetchCategoryById
} from "../services/category.service.js";

export const getCategories = async (
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

    const categories = await fetchAllCategories(businessId);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryId = req.params.id;
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    if (typeof categoryId !== "string" || !categoryId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid category ID is required"
      });
      return;
    }

    const category = await fetchCategoryById(categoryId, businessId);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};
