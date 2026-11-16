
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import {
  fetchSalesSummary,
  fetchCustomerCount,
  fetchProductCount,
} from "../services/analytics.service.js";

const dateFilterSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
}).refine(
  (data) =>
    !data.startDate ||
    !data.endDate ||
    data.startDate <= data.endDate,
  {
    message: "Start date cannot be later than end date.",
  }
);

// GET sales summary
export const getSalesSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
      return;
    }

    const validation = dateFilterSchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid date filter.",
        errors: validation.error.issues,
      });
      return;
    }

    const { startDate, endDate } = validation.data;

    const summary = await fetchSalesSummary(
      businessId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};


// GET total customer count
export const getCustomerCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
      return;
    }

    const totalCustomers = await fetchCustomerCount(businessId);

    res.status(200).json({
      success: true,
      data: { total_customers: totalCustomers },
    });
  } catch (error) {
    next(error);
  }
};

// GET total product count
export const getProductCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
      return;
    }

    const totalProducts = await fetchProductCount(businessId);

    res.status(200).json({
      success: true,
      data: { total_products: totalProducts },
    });
  } catch (error) {
    next(error);
  }
};