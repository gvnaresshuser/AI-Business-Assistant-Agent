
import type { Request, Response, NextFunction } from "express";

import {
  fetchExpenseSummary
} from "../services/expense-summary.service.js";

// GET expense summary report
export const getExpenseSummary = async (
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

    const summary = await fetchExpenseSummary(businessId);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
