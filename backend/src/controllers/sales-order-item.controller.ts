
import type { Request, Response, NextFunction } from "express";

import {
  fetchAllSalesOrderItems,
  fetchSalesOrderItemsByOrderId
} from "../services/sales-order-item.service.js";

export const getSalesOrderItems = async (
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

    const items = await fetchAllSalesOrderItems(businessId);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesOrderItemsByOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    if (typeof orderId !== "string" || !orderId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid order ID is required"
      });
      return;
    }

    const items = await fetchSalesOrderItemsByOrderId(
      orderId,
      businessId
    );

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};
