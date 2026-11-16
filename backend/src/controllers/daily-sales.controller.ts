
import type { Request, Response, NextFunction } from "express";

import {
  fetchDailySales
} from "../services/daily-sales.service.js";

// GET daily sales report
export const getDailySales = async (
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

    const dailySales = await fetchDailySales(businessId);

    res.status(200).json({
      success: true,
      count: dailySales.length,
      data: dailySales
    });
  } catch (error) {
    next(error);
  }
};
