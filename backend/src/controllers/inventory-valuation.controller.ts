
import type { Request, Response, NextFunction } from "express";

import {
  fetchInventoryValuation
} from "../services/inventory-valuation.service.js";

// GET inventory valuation report
export const getInventoryValuation = async (
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

    const valuation = await fetchInventoryValuation(businessId);

    res.status(200).json({
      success: true,
      data: valuation
    });
  } catch (error) {
    next(error);
  }
};
