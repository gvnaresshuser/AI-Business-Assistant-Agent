
import type { Request, Response, NextFunction } from "express";

import {
  fetchRefundSummary
} from "../services/refund-summary.service.js";

// GET refund summary report
export const getRefundSummary = async (
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

    const summary = await fetchRefundSummary(businessId);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
