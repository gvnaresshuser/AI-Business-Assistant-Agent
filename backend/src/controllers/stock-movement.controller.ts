
import type { Request, Response, NextFunction } from "express";

import {
  fetchAllStockMovements,
  fetchStockMovementsByProductId
} from "../services/stock-movement.service.js";

export const getStockMovements = async (
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

    const movements = await fetchAllStockMovements(businessId);

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements
    });
  } catch (error) {
    next(error);
  }
};

export const getStockMovementsByProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.productId;
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

    const movements = await fetchStockMovementsByProductId(
      productId,
      businessId
    );

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements
    });
  } catch (error) {
    next(error);
  }
};
