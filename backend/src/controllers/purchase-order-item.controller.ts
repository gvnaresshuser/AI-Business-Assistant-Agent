
import type { Request, Response, NextFunction } from "express";

import {
  fetchAllPurchaseOrderItems,
  fetchPurchaseOrderItemsByOrderId
} from "../services/purchase-order-item.service.js";

export const getPurchaseOrderItems = async (
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

    const items = await fetchAllPurchaseOrderItems(businessId);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderItemsByOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const purchaseOrderId = req.params.orderId;
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    if (
      typeof purchaseOrderId !== "string" ||
      !purchaseOrderId.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Valid purchase order ID is required"
      });
      return;
    }

    const items = await fetchPurchaseOrderItemsByOrderId(
      purchaseOrderId,
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
