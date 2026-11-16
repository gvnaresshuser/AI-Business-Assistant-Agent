
import type { Request, Response, NextFunction } from "express";

import {
  fetchPurchaseSummary
} from "../services/purchase-summary.service.js";

// GET purchase summary report
export const getPurchaseSummary = async (
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

    const summary = await fetchPurchaseSummary(businessId);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
