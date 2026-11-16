
import type { Request, Response, NextFunction } from "express";

import {
  fetchPaymentMethodSummary
} from "../services/payment-method.service.js";

// GET payment summary grouped by payment method
export const getPaymentMethodSummary = async (
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

    const summary = await fetchPaymentMethodSummary(businessId);

    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
