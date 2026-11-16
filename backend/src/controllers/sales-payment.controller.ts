
import type { Request, Response, NextFunction } from "express";

import {
  fetchAllSalesPayments,
  fetchSalesPaymentById
} from "../services/sales-payment.service.js";

export const getSalesPayments = async (
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

    const payments = await fetchAllSalesPayments(businessId);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const paymentId = req.params.id;
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    if (typeof paymentId !== "string" || !paymentId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid payment ID is required"
      });
      return;
    }

    const payment = await fetchSalesPaymentById(
      paymentId,
      businessId
    );

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Sales payment not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};
