
import type { Request, Response, NextFunction } from "express";

import {
  fetchStockMovementSummary
} from "../services/stock-movement-summary.service.js";

// GET stock movement summary
export const getStockMovementSummary = async (
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

    const summary = await fetchStockMovementSummary(businessId);

    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
