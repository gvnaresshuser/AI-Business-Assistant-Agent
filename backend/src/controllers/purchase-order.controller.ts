
import type { Request, Response, NextFunction } from "express";

import {
  fetchAllPurchaseOrders,
  fetchPurchaseOrderById
} from "../services/purchase-order.service.js";

export const getPurchaseOrders = async (
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

    const purchaseOrders = await fetchAllPurchaseOrders(businessId);

    res.status(200).json({
      success: true,
      count: purchaseOrders.length,
      data: purchaseOrders
    });
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const purchaseOrderId = req.params.id;
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

    const purchaseOrder = await fetchPurchaseOrderById(
      purchaseOrderId,
      businessId
    );

    if (!purchaseOrder) {
      res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    next(error);
  }
};
