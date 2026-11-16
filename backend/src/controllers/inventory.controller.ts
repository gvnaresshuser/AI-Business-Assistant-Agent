
import type { Request, Response, NextFunction } from "express";

import {
  fetchAllInventory,
  fetchInventoryByProductId
} from "../services/inventory.service.js";

export const getInventory = async (
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

    const inventory = await fetchAllInventory(businessId);

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryByProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.productId;
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    if (typeof productId !== "string" || !productId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid product ID is required"
      });
      return;
    }

    const inventory = await fetchInventoryByProductId(
      productId,
      businessId
    );

    if (!inventory) {
      res.status(404).json({
        success: false,
        message: "Inventory record not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};
