
import type { Request, Response, NextFunction } from "express";

import {
  fetchMonthlySales
} from "../services/monthly-sales.service.js";

// GET monthly sales report
export const getMonthlySales = async (
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

    const monthlySales = await fetchMonthlySales(businessId);

    res.status(200).json({
      success: true,
      count: monthlySales.length,
      data: monthlySales
    });
  } catch (error) {
    next(error);
  }
};
