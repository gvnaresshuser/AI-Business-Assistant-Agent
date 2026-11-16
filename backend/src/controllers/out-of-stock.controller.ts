
import type { Request, Response, NextFunction } from "express";

import {
  fetchOutOfStockProducts
} from "../services/out-of-stock.service.js";

// GET out of stock products
export const getOutOfStockProducts = async (
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

    const products = await fetchOutOfStockProducts(businessId);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
