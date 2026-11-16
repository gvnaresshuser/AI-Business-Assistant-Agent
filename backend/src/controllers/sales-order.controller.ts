
import type { Request, Response, NextFunction } from "express";

import {
  fetchAllSalesOrders,
  fetchSalesOrderById
} from "../services/sales-order.service.js";

export const getSalesOrders = async (
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

    const orders = await fetchAllSalesOrders(businessId);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = req.params.id;
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

    const order = await fetchSalesOrderById(orderId, businessId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Sales order not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
