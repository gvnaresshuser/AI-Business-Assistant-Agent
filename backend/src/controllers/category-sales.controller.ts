
import type { Request, Response, NextFunction } from "express";

import {
  fetchCategorySales
} from "../services/category-sales.service.js";

// GET sales by product category
export const getCategorySales = async (
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

    const categories = await fetchCategorySales(businessId);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
