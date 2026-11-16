
import type { Request, Response, NextFunction } from "express";

import {
  fetchLowStockProducts
} from "../services/low-stock.service.js";

// GET low stock products
export const getLowStockProducts = async (
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

    const products = await fetchLowStockProducts(businessId);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
