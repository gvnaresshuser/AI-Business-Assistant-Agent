
import type { Request, Response, NextFunction } from "express";

import {
  fetchBusinessById
} from "../services/business.service.js";

// GET authenticated user's business
export const getBusinesses = async (
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

    const business = await fetchBusinessById(businessId);

    if (!business) {
      res.status(404).json({
        success: false,
        message: "Business not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: 1,
      data: [business]
    });
  } catch (error) {
    next(error);
  }
};

// GET business by ID – authenticated business only
export const getBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authenticatedBusinessId = req.user?.businessId;

    if (!authenticatedBusinessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    const businessId = req.params.id;

    if (typeof businessId !== "string" || businessId !== authenticatedBusinessId) {
      res.status(404).json({
        success: false,
        message: "Business not found"
      });
      return;
    }

    const business = await fetchBusinessById(authenticatedBusinessId);

    if (!business) {
      res.status(404).json({
        success: false,
        message: "Business not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    next(error);
  }
};
