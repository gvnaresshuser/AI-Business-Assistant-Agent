
import type { Request, Response, NextFunction } from "express";

import {
  fetchTopSellingProducts
} from "../services/top-products.service.js";

// GET top 5 selling products
export const getTopSellingProducts = async (
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

    const products = await fetchTopSellingProducts(businessId);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
