
import type { Request, Response, NextFunction } from "express";

import {
  fetchVendorPurchaseSummary
} from "../services/vendor-purchase.service.js";

// GET vendor-wise purchase report
export const getVendorPurchaseSummary = async (
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

    const summary = await fetchVendorPurchaseSummary(businessId);

    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
