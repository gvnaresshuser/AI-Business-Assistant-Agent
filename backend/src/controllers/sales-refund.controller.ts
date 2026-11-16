
import type { Request, Response, NextFunction } from "express";

import {
  fetchAllSalesRefunds,
  fetchSalesRefundById
} from "../services/sales-refund.service.js";

// GET all sales refunds
export const getSalesRefunds = async (
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

    const refunds = await fetchAllSalesRefunds(businessId);

    res.status(200).json({
      success: true,
      count: refunds.length,
      data: refunds
    });
  } catch (error) {
    next(error);
  }
};

// GET a sales refund by ID
export const getSalesRefund = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refundId = req.params.id;
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    if (typeof refundId !== "string" || !refundId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid refund ID is required"
      });
      return;
    }

    const refund = await fetchSalesRefundById(
      refundId,
      businessId
    );

    if (!refund) {
      res.status(404).json({
        success: false,
        message: "Sales refund not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: refund
    });
  } catch (error) {
    next(error);
  }
};
