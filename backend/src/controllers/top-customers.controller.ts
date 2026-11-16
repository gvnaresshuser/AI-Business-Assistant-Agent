
import type { Request, Response, NextFunction } from "express";

import {
  fetchTopCustomers
} from "../services/top-customers.service.js";

// GET top 5 customers by sales revenue
export const getTopCustomers = async (
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

    const customers = await fetchTopCustomers(businessId);

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};
